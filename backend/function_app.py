# run with: func start --port 5000
# IMPORTANT: file must be called "function_app.py" and route functions must have param "req"
import azure.functions as func #type:ignore
from azure.cosmos import CosmosClient, exceptions #type:ignore 
import os, json, logging
from helper import gpt_req
from helper import image_analyzer
from helper import login_register
from helper import wishlist
from helper import cart
from helper import sendEmail
from helper import products
from helper import groups
from helper import polls
import random
import io
from PIL import Image
from helper.groups import GroupsError
from stream_chat import StreamChat
from helper.polls import PollsError
from google.oauth2 import id_token
from google.auth.transport import requests


app = func.FunctionApp()
client = CosmosClient.from_connection_string(os.getenv("AzureCosmosDBConnectionString"))
database = client.get_database_client(os.getenv("DatabaseName"))
user_container = database.get_container_client(os.getenv("UserContainer"))
suggestion_container = database.get_container_client(os.getenv("SuggestionContainer"))
wishlist_container = database.get_container_client(os.getenv("WishListContainer"))
cart_container = database.get_container_client(os.getenv("CartContainer"))
product_container = database.get_container_client(os.getenv("ProductContainer"))
sendEmail_api_key = os.getenv("SendGrid_API_KEY")

STREAM_KEY = os.getenv("STREAM_KEY", "YOUR_STREAM_KEY")
STREAM_SECRET = os.getenv("STREAM_SECRET", "YOUR_STREAM_SECRET")

chat_client = StreamChat(api_key=STREAM_KEY, api_secret=STREAM_SECRET)

def add_cors_headers(response: func.HttpResponse) -> func.HttpResponse:
    """
    Add CORS headers to the HTTP response.
    
    Parameters
    ----------
    response : func.HttpResponse
        The HTTP response object to which CORS headers will be added.

    Returns
    -------
    func.HttpResponse
        The HTTP response object with added CORS headers.
    """
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.function_name(name="google_login")
@app.route(route="google/login", methods=[func.HttpMethod.GET])
def google_login(req: func.HttpRequest) -> func.HttpResponse:
    """
    Redirect users to Google's OAuth 2.0 authentication page.
    """
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    google_redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")

    # Google OAuth 2.0 URL
    auth_url = (
        f"https://accounts.google.com/o/oauth2/auth"
        f"?response_type=code"
        f"&client_id={google_client_id}"
        f"&redirect_uri={google_redirect_uri}"
        f"&scope=openid email profile"
    )
    return func.HttpResponse(
        status_code=302,
        headers={"Location": auth_url},
    )



@app.function_name(name="google_callback")
@app.route(route="google/callback", methods=[func.HttpMethod.POST])
def google_callback(req: func.HttpRequest) -> func.HttpResponse:
    """
    Endpoint for handling Google login callback.

    Parameters
    ----------
    req : func.HttpRequest
        The HTTP request containing the Google credential.

    Returns
    -------
    func.HttpResponse
        The HTTP response with the user data or error message.
    """
    try:
        data = req.get_json()
        credential = data.get("credential")
        if not credential:
            return func.HttpResponse(
                body=json.dumps({"error": "No credential provided"}),
                mimetype="application/json",
                status_code=400,
            )

        result = login_register.handle_google_login(credential, user_container)
        if "error" in result:
            return func.HttpResponse(
                body=json.dumps(result),
                mimetype="application/json",
                status_code=400,
            )

        return func.HttpResponse(
            body=json.dumps(result),
            mimetype="application/json",
            status_code=200,
        )
    except Exception as e:
        logging.error(f"Google login error: {e}")
        return func.HttpResponse(
            body=json.dumps({"error": str(e)}),
            mimetype="application/json",
            status_code=500,
        )



@app.function_name(name="wishlist_get")
@app.route(route='wishlist_get', methods=[func.HttpMethod.POST])
def wishlist_get(req: func.HttpRequest) -> func.HttpResponse:
    """
    Retrieve the wishlist for a given username.

    Parameters
    ----------
    req : func.HttpRequest
        The HTTP request object containing the JSON payload with the username.

    Returns
    -------
    func.HttpResponse
        The HTTP response object containing the wishlist data in JSON format with CORS headers.
    """
    data = req.get_json()
    username = data['username']
    output = wishlist.get(username, wishlist_container)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )
    return add_cors_headers(response) 

@app.function_name(name="wishlist_update")
@app.route(route='wishlist_update', methods=[func.HttpMethod.POST])
def wishlist_update(req: func.HttpRequest) -> func.HttpResponse:
    """
    Update the wishlist with a new gift for a specific user.
    
    Parameters
    ----------
    req : func.HttpRequest
        The HTTP request object containing the JSON payload with 'username' and 'gift'.
    
    Returns
    -------
    func.HttpResponse
        The HTTP response object with the result of the wishlist update operation, including CORS headers.
    """
    data = req.get_json()
    username = data['username']
    gift = data['gift']
    output = wishlist.add(username, gift, wishlist_container)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )
    return add_cors_headers(response) 

@app.function_name(name="wishlist_remove")
@app.route(route='wishlist_remove', methods=[func.HttpMethod.POST])
def wishlist_remove(req: func.HttpRequest) -> func.HttpResponse:
    """
    Remove a gift from a user's wishlist.
    
    Parameters
    ----------
    req : func.HttpRequest
        The HTTP request object containing the JSON payload with 'username' and 'gift' keys.
    
    Returns
    -------
    func.HttpResponse
        The HTTP response object with the result of the removal operation in JSON format, 
        including CORS headers.
    """
    data = req.get_json()
    username = data['username']
    gift = data['gift']
    output = wishlist.remove(username, gift, wishlist_container)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )
    return add_cors_headers(response) 

@app.function_name(name="save_cart")
@app.route(route="save_cart", methods=[func.HttpMethod.POST])
def save_cart(req: func.HttpRequest) -> func.HttpResponse:
    """
    Save the cart content for a user session.

    Parameters
    ----------
    req : func.HttpRequest
        The HTTP request containing the cart data.

    Returns
    -------
    func.HttpResponse
        The HTTP response with the result of the save operation.
    """
    data = req.get_json()
    session_id = data['session_id']
    cart_content = data['cart_content']
    username = data['username']
    output = cart.save(username, session_id, cart_content, cart_container)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name(name="update_cart")
@app.route(route="update_cart", methods=[func.HttpMethod.POST])
def update_cart_http(req: func.HttpRequest) -> func.HttpResponse:
    """
    Azure Function to handle adding or removing an item from a cart.

    Parameters
    ----------
    req : func.HttpRequest
        The HTTP request containing the cart update data.

    Returns
    -------
    func.HttpResponse
        The HTTP response with the result of the update operation.
    """
    try:
        # Parse the request data
        data = req.get_json()
        username = data.get('username')
        session_id = data.get('session_id')
        item = data.get('item')
        action = data.get('action')  # 'add' or 'remove'

        # Validate input
        if not all([username, session_id, item, action]):
            return func.HttpResponse(
                body=json.dumps({"error": "Missing required fields."}),
                mimetype="application/json",
                status_code=400
            )

        # Update the cart
        output = cart.update(username, session_id, item, action, cart_container)

        # Return response
        response = func.HttpResponse(
            body=json.dumps({"response": output}),
            mimetype="application/json",
            status_code=200
        )
        return add_cors_headers(response)
    except Exception as e:
        logging.info(f"update_cart_http error: {e}")
        return func.HttpResponse(
            body=json.dumps({"error": "An error occurred."}),
            mimetype="application/json",
            status_code=500
        )

@app.function_name(name="load_all_carts")
@app.route(route="load_all_carts", methods=[func.HttpMethod.POST])
def load_all_carts(req: func.HttpRequest) -> func.HttpResponse:
    """
    Load all carts for a user.

    Parameters
    ----------
    req : func.HttpRequest
        The HTTP request object containing the JSON payload with the 'username'.

    Returns
    -------
    func.HttpResponse
        The HTTP response object containing the cart data or an error message.
    """
    data = req.get_json()
    username = data['username']
    output = cart.load_all_carts(username, cart_container)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name(name="load_cart")
@app.route(route="load_cart", methods=[func.HttpMethod.POST])
def load_cart(req: func.HttpRequest) -> func.HttpResponse:
    """
    Load the user's cart based on the provided session ID and username.

    Parameters
    ----------
    req : func.HttpRequest
        The HTTP request object containing the JSON payload with 'session_id' and 'username'.

    Returns
    -------
    func.HttpResponse
        The HTTP response object containing the cart data or an error message.
    """
    data = req.get_json()
    session_id = data['session_id']
    username = data['username']
    output = cart.load(username, session_id, cart_container)
    if output==f"{username} does not have stored cart corresponding to session {session_id}" or output==f"{username} does not have any carts stored" or output==f"{username} does not have stored cart named {session_id}":
        response = func.HttpResponse(
            body=json.dumps({"response": "failed", "message": output}),
            mimetype="application/json",
            status_code=200
        )
    else:
        response = func.HttpResponse(
            body=json.dumps({"response": output}),
            mimetype="application/json",
            status_code=200
        )
    return add_cors_headers(response) 

@app.function_name(name="delete_cart")
@app.route(route="delete_cart", methods=[func.HttpMethod.POST])
def delete_cart(req: func.HttpRequest) -> func.HttpResponse:
    """
    Delete a cart based on session ID and username.

    Parameters
    ----------
    req : func.HttpRequest
        The HTTP request object containing JSON payload with 'session_id' and 'username'.

    Returns
    -------
    func.HttpResponse
        The HTTP response object with the result of the delete operation in JSON format.
    """
    data = req.get_json()
    session_id = data['session_id']
    username = data['username']
    output = cart.delete(username, session_id, cart_container)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )
    return add_cors_headers(response) 

@app.function_name(name="find_user_autocomplete")
@app.route(route="find_user_autocomplete", methods=[func.HttpMethod.POST])
def find_user_autocomplete(req: func.HttpRequest) -> func.HttpResponse:
    """
    Find usernames that match the autocomplete query
    Parameters
    ----------
    req : func.HttpRequest
        The HTTP request object containing the JSON payload with the query parameter
    Returns
    -------
    func.HttpResponse
        The HTTP response object containing a JSON payload with the list of matching usernames or an error message
    """
    try:
        data = req.get_json()
        query = data.get('query', '')
        if not query:
            return func.HttpResponse(json.dumps({"usernames": []}), status_code=200, mimetype="application/json")

        matching_usernames = [
            user['username'] for user in user_container.query_items(
                query="SELECT c.username FROM c WHERE STARTSWITH(c.username, @query)",
                parameters=[{'name': '@query', 'value': query}],
                enable_cross_partition_query=True
            )
        ]

        return func.HttpResponse(
            json.dumps({"usernames": matching_usernames}),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        logging.error(f"Autocomplete error: {e}")
        return func.HttpResponse("Error processing request", status_code=500)
 
@app.function_name(name="email_verification")
@app.route(route='email_verification', methods=[func.HttpMethod.POST])
def email_verification(req: func.HttpRequest) -> func.HttpResponse:
    """
    Verify the email using the provided username and code.
    
    Parameters
    ----------
    req : func.HttpRequest
        The HTTP request containing the JSON payload with 'username' and 'code'.
    
    Returns
    -------
    func.HttpResponse
        The HTTP response containing the verification result in JSON format with CORS headers.
    """
    data = req.get_json()
    username = data['username']
    code = data['code']
    output = login_register.email_verification(username, code, user_container)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
    )
    return add_cors_headers(response) 

    
@app.function_name(name="update_user_details")
@app.route(route='update_user_details', methods=[func.HttpMethod.POST])
def update_user_details(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    field = data['field']
    username = data['username']
    if field == "username":
        details = data['newUsername']
    elif field == "password":
        details = data['newPassword']
    elif field == "email":
        details = data['newEmail']
    elif field == "phone":
        details = data['newPhone']
    else:
        details = data['newNotifications']
    
    print("Got the correct field, details and username", data, field, details, username)
    
    output = login_register.update_user_details(username, field, details, user_container)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
    )
    return add_cors_headers(response)

# BODGE for userID
@app.function_name(name="get_user_id")
@app.route(route='get_user_id', methods=[func.HttpMethod.POST])
def get_user_id(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    username = data['username']
    try:
        user_data = list(user_container.query_items(
            query="SELECT c.id FROM c WHERE c.username=@username",
            parameters=[{'name': '@username', 'value': username}],
            enable_cross_partition_query=True
        ))
        user_id = user_data[0]['id']
        response = func.HttpResponse(
            body=json.dumps({"result": True, "msg": "OK", "userID": user_id}),
            mimetype="application/json",
        )
    except Exception as e:
        response = func.HttpResponse(
            body=json.dumps({"result": False, "msg": str(e)}),
            mimetype="application/json",
        )
    return add_cors_headers(response)

@app.function_name(name="get_username")
@app.route(route='get_username', methods=[func.HttpMethod.POST])
def get_username(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    userID = data['userID']
    try:
        user_data = list(user_container.query_items(
            query="SELECT c.username FROM c WHERE c.id=@userID",
            parameters=[{'name': '@userID', 'value': userID}],
            enable_cross_partition_query=True
        ))
        username = user_data[0]['username']
        response = func.HttpResponse(
            body=json.dumps({"result": True, "msg": "OK", "username": username}),
            mimetype="application/json",
        )
    except Exception as e:
        response = func.HttpResponse(
            body=json.dumps({"result": False, "msg": str(e)}),
            mimetype="application/json",
        )
    return add_cors_headers(response)

@app.function_name(name="get_usernames")
@app.route(route='get_usernames', methods=[func.HttpMethod.POST])
def get_usernames(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    userIDs = data['userIDs']
    usernames = []
    for userID in userIDs:
        try:
            user_data = list(user_container.query_items(
                query="SELECT c.username FROM c WHERE c.id=@userID",
                parameters=[{'name': '@userID', 'value': userID}],
                enable_cross_partition_query=True
            ))
            usernames.append(user_data[0]['username'])
        except Exception as e:
            return func.HttpResponse(
                body=json.dumps({"result": False, "msg": str(e)}),
                mimetype="application/json",
            )
    response = func.HttpResponse(
        body=json.dumps({"result": True, "msg": "OK", "usernames": usernames}),
        mimetype="application/json",
    )
    return add_cors_headers(response)



@app.function_name(name="send_notifications")
@app.route(route='send_notifications', methods=[func.HttpMethod.POST])
def send_notifications(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    username = data['username']
    notification = data['notification']
    output = sendEmail.sendUserNotification(username, notification, user_container, sendEmail_api_key)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
    )
    return add_cors_headers(response) 

@app.function_name(name="login")
@app.route(route='login', methods=[func.HttpMethod.POST])
def login(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    username = data['username']
    password = data['password']
    output = login_register.login_user(username, password, user_container)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )
    return add_cors_headers(response) 

@app.function_name(name="product_text")
@app.route(route='product_text', methods=[func.HttpMethod.POST])
def product_text(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    prompt = data['prompt']
    username = data['username'].strip()
    output = gpt_req.llm_suggestion(prompt, suggestion_container, username)
    fetched_products = products.get_products(output)
    response = func.HttpResponse(
        body=json.dumps({'query': output, 'response': fetched_products}),
        mimetype='application/json',
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name(name="product_types")
@app.route(route='product_types', methods=[func.HttpMethod.POST])
def product_types(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    username = data['Username'].strip()
    occassions = [item.strip() for item in data['Occasions'].split(",")]
    recipient = data['Recipient'].strip()
    themes = [item.strip() for item in data['Themes'].split(",")]
    input = f"I want a gift for my {recipient} that matches ocassions {occassions}, that suits the themes of {themes}."
    output = gpt_req.llm_suggestion(input, suggestion_container, username)
    # fetched_products = products.get_products_with_price_limitation(output, price) no longer active
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )

    return add_cors_headers(response)

#############################GROUP FUNCTIONS#############################

@app.function_name(name="groups_create")
@app.route(route='groups/create', methods=[func.HttpMethod.POST])
def groups_create(req: func.HttpRequest) -> func.HttpResponse:
    '''User Initialises a Group with a Group Name
    
    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID, groupname: groupname}

    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", group: {...}}
        data: {result: False, msg: "User {username} does not exist"}
    '''
    data = req.get_json()
    userID = data['userID']
    groupname = data['groupname']
    try:
        group = groups.create_group(userID, groupname, chat_client)
        body = json.dumps({"result": True, "msg": "OK", "group": groups.group_cleaned(group)})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name(name="groups_delete")
@app.route(route='groups/delete', methods=[func.HttpMethod.POST])
def groups_delete(req: func.HttpRequest) -> func.HttpResponse:
    '''User Deletes a Group that they are an admin for
    
    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID, groupID: groupID}
    
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK"}
        data: {result: False, msg: "{userID} is not the admin of the group"}
        data: {result: False, msg: {groupID} does not exist}'''
    data = req.get_json()
    userID = data['userID']
    groupID = data['groupID']
    try:
        groups.delete_group(userID, groupID)
        body = json.dumps({"result": True, "msg": "OK"})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name(name="groups_add_user")
@app.route(route='groups/add_user', methods=[func.HttpMethod.POST])
def groups_add_user(req:func.HttpRequest) -> func.HttpResponse:
    '''User Adds a Different User to Group
    
    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID, user_to_add: username, groupID: groupID}
        
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", group: {...}}
        data: {result: False, msg: "{groupID} does not exist"}
        data: {result: False, msg: "{userID} does not exist"}
        data: {result: False, msg: "{user_to_add} does not exist"}
        data: {result: False, msg: "{userID} is not the admin of the group"}
        data: {result: False, msg: "{user_to_add} is already in the group"}'''
    data = req.get_json()
    userID = data['userID']
    user_to_add = data['user_to_add']
    groupID = data['groupID']
    try:
        group = groups.add_user(userID, user_to_add, groupID, chat_client)
        body=json.dumps({"result": True, "msg": "OK", "group": groups.group_cleaned(group)})
    except GroupsError as e:
        body=json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)
    

@app.function_name(name="groups_get")
@app.route(route='groups/get', methods=[func.HttpMethod.POST])
def groups_get(req:func.HttpRequest) -> func.HttpResponse:
    '''Get the groups that a user is a part of
    
    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID}
        
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", groups: []}
        data: {result: False, msg: "{userID} does not exist"}'''
    data = req.get_json()
    userID = data['userID']
    try:
        gs = groups.get_groups(userID)
        body = json.dumps({"result": True, "msg": "OK", "groups": groups.groups_cleaned(gs)})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name(name="groups_change_groupname")
@app.route(route='groups/change_groupname', methods=[func.HttpMethod.POST])
def groups_change_groupname(req: func.HttpRequest) -> func.HttpResponse:
    '''Admin can change the name of a group
    
    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID, groupID: groupID, groupname: new_groupname}
        
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", group: {...}}
        data: {result: False, msg: "{groupID} does not exist"}
        data: {result: False, msg: "User is not admin of the group"}'''
    data = req.get_json()
    userID = data['userID']
    groupID = data['groupID']
    groupname = data['groupname']
    try:
        group = groups.change_groupname(userID, groupID, groupname, chat_client)
        body = json.dumps({"result": True, "msg": "OK", "group": groups.group_cleaned(group)})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name(name="groups_kick")
@app.route(route='groups/kick', methods=[func.HttpMethod.POST])
def groups_kick(req: func.HttpRequest) -> func.HttpResponse:
    '''The admin of a group removes a different user from the group
    
    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID, groupID: groupID, user_to_remove: userID}
        
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", group: {...}}
        data: {result: False, msg: "{groupID} does not exist"}
        data: {result: False, msg: "{userID} is not admin"}
        data: {result: False, msg: "{user_to_remove} is not in the group"}
        data: {result: False, msg: "Cannot kick yourself from the group"}'''
    data = req.get_json()
    userID = data['userID']
    groupID = data['groupID']
    user_to_remove = data['user_to_remove']
    try:
        divisions, ocs, group = groups.groups_kick(userID, groupID, user_to_remove, chat_client)
        body=json.dumps({"result": True, "msg": "OK", "divisions": groups.divisions_cleaned(divisions), "occasions": groups.occasions_cleaned(ocs), "group": groups.group_cleaned(group)})
    except GroupsError as e:
        body=json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name(name="groups_leave")
@app.route(route='groups/leave', methods=[func.HttpMethod.POST])
def groups_leave(req: func.HttpRequest) -> func.HttpResponse:
    '''A user of a group leaves the group
    
    Admin cannot leave their own group

    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID, groupID: groupID}
    
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", group: {...}}
        data: {result: False, msg: "{groupID} does not exist"}
        data: {result: False, msg: "{userID} is not in the group}'''
    data = req.get_json()
    userID = data['userID']
    groupID = data['groupID']
    try:
        divisions, ocs, group = groups.groups_leave(userID, groupID, chat_client)
        body = json.dumps({"response": True, "msg": "OK", "divisions": groups.divisions_cleaned(divisions), 
                           "occasions": groups.occasions_cleaned(ocs), "group": groups.group_cleaned(group)})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name(name="groups_occasions_create")
@app.route(route='groups/occasions/create', methods=[func.HttpMethod.POST])
def groups_occasions_create(req: func.HttpRequest) -> func.HttpResponse:
    '''A user of a group can create an occasion
    
    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID, groupID: groupID, users: [], occasionname: occasionname, 
               occasiondate: occasiondate}
               
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", group: {...}, occasion: {...}}
        data: {result: False, msg: "{groupID} does not exist}
        data: {result: False, msg: "{userID} is not in the group"}
        data: {result: False, msg: "Occasion date is not the correct format: YYYY-MM-DD"}
        data: {result: False, msg: "Occasion date is not of a valid date}'''
    data = req.get_json()
    userID = data['userID']
    groupID = data['groupID']
    users = data['users']
    occasionname = data['occasionname']
    occasiondate = data['occasiondate']
    try:
        oc, group = groups.create_occasion(userID, groupID, users, occasionname, occasiondate)
        body=json.dumps({"result": True, "msg": "OK", "group": groups.group_cleaned(group), "occasion": groups.occasion_cleaned(oc)})
    except GroupsError as e:
        body=json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name(name="groups_occasions_datechange")
@app.route(route='groups/occasions/datechange', methods=[func.HttpMethod.POST])
def groups_occasions_datechange(req: func.HttpRequest) -> func.HttpResponse:
    '''Change the date of an occasion via occasionDate
    
    # Parameters
    req: func.HttpRequest
    with
        data: {occasionID: occasionID, occasiondate: occasiondate}
        
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", occasion: {...}}
        data: {result: False, msg: "Occasion does not exist"}
        data: {result: False, msg: "Occasion date is not the correct format: YYYY-MM-DD"}
        data: {result: False, msg: "Occasion date is not of a valid date}'''
    data = req.get_json()
    occasionID = data['occasionID']
    occasiondate = data['occasiondate']
    try:
        oc = groups.occasion_datechange(occasionID, occasiondate)
        body = json.dumps({"result": True, "msg": "OK", "occasion": groups.occasion_cleaned(oc)})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)


@app.function_name(name="groups_occasions_delete")
@app.route(route='groups/occasions/delete', methods=[func.HttpMethod.POST])
def groups_occasions_delete(req: func.HttpRequest) -> func.HttpResponse:
    '''Remove an occasion and all its divisions via its occasionID
    
    # Paramaters
    req: func.HttpRequest
    with
        data: {occasionID: occasionID}
        
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", group: {...}}
        data: {result: False, msg: "Occasion does not exist"}'''
    data = req.get_json()
    occasionID = data['occasionID']
    try:
        group = groups.delete_occasion(occasionID)
        body = json.dumps({"result": True, "msg": "OK", "group": groups.group_cleaned(group)})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name(name="groups_occasions_get")
@app.route(route='groups/occasions/get', methods=[func.HttpMethod.POST])
def groups_occasions_get(req: func.HttpRequest) -> func.HttpResponse:
    '''Get all occasions for a particular group and userID
    
    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID, groupID: groupID}
        
    # Returns
    func.HttpResponse
    with
        data: {response: True, msg: "OK", "occasions": []}
        data: {response: False, msg: "{userID} is not in the group}'''
    data = req.get_json()
    userID = data['userID']
    groupID = data['groupID']
    try:
        ocs = groups.get_occasions(userID, groupID)
        body=json.dumps({"result": True, "msg": "OK", "occasions": groups.occasions_cleaned(ocs)})
    except GroupsError as e:
        body=json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name(name="groups_occasions_leave")
@app.route(route='groups/occasions/leave', methods=[func.HttpMethod.POST])
def groups_occasions_leave(req: func.HttpRequest) -> func.HttpResponse:
    '''Any user in an occasion can leave the occasion
    
    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID, occasionID: occasionID}
        
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", occasion: {...}}
        data: {result: False, msg: "User is not in the occasion"}'''
    data = req.get_json()
    userID = data['userID']
    occasionID = data['occasionID']
    try:
        divisions, oc = groups.occasions_leave(userID, occasionID)
        body = json.dumps({"result": True, "msg": "OK", "occasion": groups.occasion_cleaned(oc), "divisions": groups.divisions_cleaned(divisions)})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name(name="groups_secret_santa")
@app.route(route='groups/secret_santa', methods=[func.HttpMethod.POST])
def groups_secret_santa(req: func.HttpRequest) -> func.HttpResponse:
    '''Initiate Secret Santa

    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID, occasionID: occasionID}

    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", occasion: {...}, divisions: []}
        data: {result: False, msg: "User is not in the occasion"}
        data: {result: False, msg: "Occasion already has divisions"}'''
    data = req.get_json()
    userID = data['userID']
    occasionID = data['occasionID']
    try:
        oc, divisions = groups.secret_santa(userID, occasionID)
        body = json.dumps({"result": True, "msg": "OK", "occasion": groups.occasion_cleaned(oc), "divisions": groups.divisions_cleaned(divisions)})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name(name="groups_group_gifting")
@app.route(route='groups/group_gifting', methods=[func.HttpMethod.POST])
def groups_group_gifting(req: func.HttpRequest) -> func.HttpResponse:
    '''Initiate Group Gifting for a target recipient(s)
    
    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID, occasionID: occasionID, recipients: [recipientID, ...]}
    
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", occasion: {...}, divisions: []}
        data: {result: False, msg: "Occasion already has divisions"}
        data: {result: False, msg: "User is not in the occasion"}
        data: {result: False, msg: "A recipient in recipients does not exist"}'''
    data = req.get_json()
    userID = data['userID']
    occasionID = data['occasionID']
    recipients = data['recipients']
    try:
        oc, divisions = groups.group_gifting(userID, occasionID, recipients, chat_client)
        body = json.dumps({"result": True, "msg": "OK", "occasion": groups.occasion_cleaned(oc), "divisions": groups.divisions_cleaned(divisions)})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name(name="process_audio")
@app.route(route="process_audio", methods=[func.HttpMethod.POST])
def process_audio(req: func.HttpRequest) -> func.HttpResponse:
    from azure.cognitiveservices.speech import SpeechConfig, SpeechRecognizer, AudioConfig, audio
    import azure.cognitiveservices.speech as speechsdk
    import json
    import logging

    try:
        # Check if the request has a file
        audio_file = req.files.get("audio")
        if not audio_file:
            return func.HttpResponse(
                body=json.dumps({"error": "No audio file found in request"}),
                mimetype="application/json",
                status_code=400,
            )

        # Read the uploaded file into memory
        audio_data = audio_file.read()

        # Set up Azure Speech Service
        speech_key = "8fK4ZX2S2EXa6METEW0DlcRVz1SNW72Wg027cu3mzJ9YYvobuW70JQQJ99ALAC5RqLJXJ3w3AAAYACOGpXKw"
        service_region = "westeurope"

        if not speech_key or not service_region:
            return func.HttpResponse(
                body=json.dumps({"error": "Azure Speech key or region is not set"}),
                mimetype="application/json",
                status_code=500,
            )

        speech_config = SpeechConfig(subscription=speech_key, region=service_region)

        # Create a PushAudioInputStream and feed audio data
        push_stream = audio.PushAudioInputStream()
        audio_input = audio.AudioConfig(stream=push_stream)
        recognizer = SpeechRecognizer(speech_config=speech_config, audio_config=audio_input)

        # Push the audio data into the stream in chunks
        chunk_size = 1024
        for i in range(0, len(audio_data), chunk_size):
            push_stream.write(audio_data[i:i + chunk_size])

        # Signal that all data has been pushed
        push_stream.close()

        # Perform speech recognition
        result = recognizer.recognize_once()

        # Handle recognition result
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            return func.HttpResponse(
                body=json.dumps({"transcription": result.text}),
                mimetype="application/json",
                status_code=200,
            )
        elif result.reason == speechsdk.ResultReason.NoMatch:
            return func.HttpResponse(
                body=json.dumps({"error": "No speech could be recognized."}),
                mimetype="application/json",
                status_code=200,
            )
        else:
            return func.HttpResponse(
                body=json.dumps({"error": f"Recognition failed: {result.reason}"}),
                mimetype="application/json",
                status_code=500,
            )

    except Exception as e:
        logging.error(f"Error processing audio: {e}")
        return func.HttpResponse(
            body=json.dumps({"error": str(e)}),
            mimetype="application/json",
            status_code=500,
        )

##### DHRUVS CHANGES BELOW 

@app.function_name(name="register")
@app.route(route='register', methods=[func.HttpMethod.POST])
def register(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    logging.info(f"Register info: {data}")
    username = data['username']
    password = data['password']
    email = data['email']
    email_verification_code = ''.join(str(random.randint(0, 9)) for _ in range(6))
    logging.info(f"api key: {sendEmail_api_key}")
    sendEmail.send_verification_email(username, email, email_verification_code, sendEmail_api_key) # if error return the error
    phone = data['phone']
    notifications = data['notifications']
    output = login_register.register_user(username, password, user_container, email, phone, notifications, email_verification_code)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )
    return add_cors_headers(response)  

# Forgot passsword route
@app.function_name(name="fetch_user_details")
@app.route(route='fetch_user_details', methods=[func.HttpMethod.POST])
def fetch_user_details(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    email = data['email']
    output = login_register.get_user_details(email, user_container)
    if output == "fail":
        output = "Email does not have a registered account. Please register a new account."
        username = "Not found"
        token = 0
    else:
        username = output['username']
        token = sendEmail.send_OTP_email(email, username, sendEmail_api_key)
        output = f"One time password sent to {email}."
    response = func.HttpResponse(
        body=json.dumps({"username": username, "token": token}),
        mimetype="application/json",
    )
    return add_cors_headers(response) 
    

@app.function_name(name='register_product_or_get_id')
@app.route(route='register_product_or_get_id', methods=[func.HttpMethod.POST])
def register_product_or_get_id(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    product_info = {
        'url': data['url'],
        'title': data['title'],
        'image': data['image'],
        'price': data['price']
    }
    try:
        query = "SELECT * from products WHERE products.url = '{}'".format(product_info['url'])
        products = list(product_container.query_items(query=query, enable_cross_partition_query=True)) 
        if not products: # First check if product with current url is already in the database
            
            # Add to cosmosdb products container with id auto gen by cosmos
            product_container.create_item(body=product_info, enable_automatic_id_generation=True)
            
            # Get the id of the product
            products = list(product_container.query_items(query=query, enable_cross_partition_query=True))
            id = products[0]['id']
            
            response = func.HttpResponse(
                body=json.dumps({'response': 'Product registered successfully', 'id': id}),
                mimetype='application/json',
                status_code=200
            )
        else:
            response = func.HttpResponse(
                body=json.dumps({'response': 'Product already exists', 'id': products[0]['id']}),
                mimetype='application/json',
                status_code=400
            )
    except Exception as e:
        response = func.HttpResponse(
            body=json.dumps({'error': str(e)}),
            mimetype='application/json',
            status_code=500
        )
    return add_cors_headers(response)

@app.function_name(name='get_product_by_id')
@app.route(route='get_product_by_id', methods=[func.HttpMethod.GET])
def get_product_by_id(req: func.HttpRequest) -> func.HttpResponse:
    id = req.params.get('id')
    try:
        query = "SELECT * from products WHERE products.id = '{}'".format(id)
        products = list(product_container.query_items(query=query, enable_cross_partition_query=True))
        if products:
            product_info = {
                'url': products[0]['url'],
                'title': products[0]['title'],
                'image': products[0]['image'],
                'price': products[0]['price']
            }
            print("Sending product info:", product_info)
            response = func.HttpResponse(
                body=json.dumps({'response': product_info}),
                mimetype='application/json',
                status_code=200
            )
        else:
            response = func.HttpResponse(
                body=json.dumps({'response': 'Product not found'}),
                mimetype='application/json',
                status_code=404
            )
    except Exception as e:
        response = func.HttpResponse(
            body=json.dumps({'error': str(e)}),
            mimetype='application/json',
            status_code=500
        )
    return add_cors_headers(response)

def allowed_file(file):
        filename = file.filename
        format = '.' in filename and filename.rsplit('.', 1)[-1].lower() in {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico', 'tiff', 'mpo'}
        image = Image.open(file)
        imgByteIO = io.BytesIO()
        image.save(imgByteIO, format=image.format)
        imgByteArr = imgByteIO.getvalue()
        width, height = image.size #must be greater than 50 x 50 pixels and less than 16,000 x 16,000 pixels
        size_in_mb = len(imgByteArr) / (10**6) #image must be less than 20 megabytes (MB)
        return format and size_in_mb < 20 and width > 50 and height > 50 and width < 16000 and height < 16000

@app.function_name(name="product_img")
@app.route(route='product_img', methods=[func.HttpMethod.POST])
def product_img(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.form
        files = req.files
        username = data['username']
        brands = None
        objects = None
        if 'image' not in files:
            response = func.HttpResponse(
                body=json.dumps({'error': 'no File type'}),
                mimetype="application/json",
                status_code=400
            )
            return add_cors_headers(response)
        
        file = files['image']
        if file.filename == '':
            response = func.HttpResponse(
                body=json.dumps({'error': 'no file selected'}),
                mimetype="application/json",
                status_code=400
            )
            return add_cors_headers(response)
        if file and allowed_file(file):
            image = Image.open(file)
            imgByteIO = io.BytesIO()
            image.save(imgByteIO, format=image.format)
            imgByteArr = imgByteIO.getvalue()
            output = image_analyzer.image_analysis(imgByteArr)
            brands = output[0]
            objects = output[1]
            suggestion = "rec:" + ','.join(objects)
            gpt_req.update_suggestion(suggestion_container, username, suggestion)
            fetched_products = products.get_products(output)
            response = func.HttpResponse(
                body=json.dumps({"query": suggestion, "response": fetched_products}),
                mimetype="application/json",
                status_code=200
            )
            return add_cors_headers(response)
        response = func.HttpResponse(
            body=json.dumps({'error': 'File type not allowed'}),
            mimetype="application/json",
            status_code=400
        )
    except Exception as e:
        response = func.HttpResponse(
            body=json.dumps({'error': str(e)}),
            mimetype="application/json",
            status_code=500
        )
    return add_cors_headers(response)

@app.function_name(name="groups_exclusion_gifting")
@app.route(route='groups/exclusion_gifting', methods=[func.HttpMethod.POST])
def groups_exclusion_gifting(req: func.HttpRequest) -> func.HttpResponse:
    '''Initiate exclusion gifting of n divisions where n is the number of users in the occasion
    
    For example, [a,b,c,d,e]:
        [a,b,c,d] -> e
        [a,b,c,e] -> d
        [a,b,d,e] -> c
        [a,c,d,e] -> b
        [b,c,d,e] -> a
        
    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID, occasionID: occasionID}

    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", occasion: {...}, divisions: []}
        data: {result: False, msg: "User is not in the occasion"}
        data: {result: False, msg: "Occasion already has divisions"}'''
    data = req.get_json()
    userID = data['userID']
    occasionID = data['occasionID']
    try:
        oc, divisions = groups.exclusion_gifting(userID, occasionID, chat_client)
        body = json.dumps({"result": True, "msg": "OK", "occasion": groups.occasion_cleaned(oc), "divisions": groups.divisions_cleaned(divisions)})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)


@app.function_name(name="groups_white_elephant")
@app.route(route='groups/white_elephant', methods=[func.HttpMethod.POST])
def groups_white_elephant(req: func.HttpRequest) -> func.HttpResponse:
    #TODO: code if required
    pass

@app.function_name(name="groups_divisions_get")
@app.route(route='groups/divisions/get', methods=[func.HttpMethod.POST])
def groups_divisions_get(req: func.HttpRequest) -> func.HttpResponse:
    '''Get all divisions relevant to a user from an occasion
    
    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID, occasionID: occasionID}
        
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", divisions: [...]}
        data: {result: False, msg: "User is not in the occasion"}
        data: {result: False, msg: "User does not exist"}'''
    data = req.get_json()
    userID = data['userID']
    occasionID = data['occasionID']
    try:
        divisions = groups.get_divisions(userID, occasionID)
        body = json.dumps({"result": True, "msg": "OK", "divisions": groups.divisions_cleaned(divisions)})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)


@app.function_name(name="get_all_groups_occasions_divisions")
@app.route(route='groups/get_all', methods=[func.HttpMethod.POST])
def get_all_groups_occasions_divisions(req: func.HttpRequest) -> func.HttpResponse:
    '''Get all groups, occasions and divisions for a user
    
    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID}
        
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", groups: [], occasions: [], divisions: []}
        data: {result: False, msg: "User does not exist"}'''
    data = req.get_json()
    userID = data['userID']
    try:
        result = groups.get_all(userID)
        body = json.dumps({"result": True, "msg": "OK", "groups": result["grps"], "occasions": result["occs"], "divisions": result["divs"]})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name(name='groups_calendar_get')
@app.route(route='groups/calendar/get', methods=[func.HttpMethod.POST])
def groups_calendar_get(req: func.HttpRequest) -> func.HttpResponse:
    '''Get all occasion dates for a user
    
    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID}
        
    # Returns
    func.HttpResponse
    with
        data: {deadlines: [{occasionID: occasionID, occasionname: occasionname, occasiondate: occasiondate, 
                groupID: groupID, groupname: groupname}]}'''
    data = req.get_json()
    userID = data['userID']
    deadlines = groups.get_calendar(userID)
    body = json.dumps({"deadlines": deadlines})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)



# STREAM Chat
@app.function_name(name="get_token")
@app.route(route='get_token', methods=[func.HttpMethod.POST])
def get_token(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    username = data['username']
    userID = data['userID']
    if not userID:
        return func.HttpResponse(
            body=json.dumps({"result": False, "msg": "No userID provided"}),
            mimetype="application/json",
            status_code=400
        )
    token = chat_client.create_token(userID)
    return func.HttpResponse(
        body=json.dumps({"result": True, "msg": "OK", "token": token}),
        mimetype="application/json",
        status_code=200
    )

###############GROUPS_INVITATION###############
@app.function_name(name="groups_invite_generate")
@app.route(route='groups/invite/generate', methods=[func.HttpMethod.POST])
def groups_invite_generate(req: func.HttpRequest) -> func.HttpResponse:
    '''Generate a URL to invite a user to a group
    
    # Parameters
    req: func.HttpRequest
    with data:
    {
        userID: userID of user that generates link
        groupID: groupID of group to join via the link,
        expiryTime: expiryTime of the link in minutes (time to live)
        one_time: if link can be used only once
    }
    
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", "token": token}
        data: {result: False, msg: "User is not admin of the group"}
        data: {result: False, msg: "Group does not exist"}'''
    data = req.get_json()
    userID = data['userID']
    groupID = data['groupID']
    expiryTime = data['expiryTime']
    one_time = data['one_time']
    try:
        token = groups.generate_invite(userID, groupID, expiryTime, one_time)
        body = json.dumps({"result": True, "msg": "OK", "token": token})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name("groups_invite_validate")
@app.route(route='groups/invite/validate', methods=[func.HttpMethod.POST])
def groups_invite_validate(req: func.HttpRequest) -> func.HttpResponse:
    '''Validate and Use an invitation token
    
    # Parameters
    req: func.HttpRequest
    with
        data: {token: token}
    
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK"}
        data: {result: False, msg: "Token is expired"}
        data: {result: False, msg: "This token does not exist"}
        data: {result: False, msg: "this token has been used"}
        data: {result: False, msg: "Token has been revoked"}'''
    data = req.get_json()
    token = data['token']
    try:
        groups.validate_invite(token)
        body = json.dumps({"result": True, "msg": "OK"})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name("groups_invite_revoke")
@app.route(route='groups/invite/revoke', methods=[func.HttpMethod.POST])
def groups_invite_revoke(req: func.HttpRequest) -> func.HttpResponse:
    '''Revoke an invitation via the token
    
    # Parameters
    req: func.HttpRequest
    with
        data: {userID: userID, token: token}
        
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK"}
        data: {result: False, msg: "Token does not exist"}
        data: {result: False, msg: "Token has expired"}'''
    data = req.get_json()
    userID = data['userID']
    token = data['token']
    try:
        groups.revoke_invite(userID, token)
        body = json.dumps({"result": True, "msg": "OK"})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name("groups_invite_accept")
@app.route(route='groups/invite/accept', methods=[func.HttpMethod.POST])
def groups_invite_accept(req: func.HttpRequest) -> func.HttpResponse:
    '''User accepts invite via token
    
    # Parameters
    req: func.HttpRequest
    with
        data: {username: username, token: token}
        
    # Returns
    func.HttpResponse
    with
        data: {result: True, msg: "OK", group: {...}}
        data: all responses from groups_add_user (except if user is already in group, group is returned)
        data: responses for token'''
    data = req.get_json()
    username = data['username']
    token = data['token']
    try:
        group = groups.accept_invite(username, token, chat_client)
        body = json.dumps({"result": True, "msg": "OK", "group": groups.group_cleaned(group)})
    except GroupsError as e:
        body = json.dumps({"result": False, "msg": str(e)})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name("groups_invite_get")
@app.route(route='groups/invite/get', methods=[func.HttpMethod.GET])
def groups_invite_get(req: func.HttpRequest) -> func.HttpResponse:
    '''Get invitation tokens for a group
    
    # Parameters
    req: func.HttpRequest
    with
        data: {groupID: groupID}
        
    # Returns
    func.HttpResponse
    with
        data: {result: True, "msg": "OK", tokens: []}'''
    data = req.params
    groupID = data.get('groupID')
    logging.info(f"Getting invite tokens for group {groupID}")
    tokens = groups.get_invitations(groupID)
    body = json.dumps({"result": True, "msg": "OK", "tokens": tokens})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)

@app.function_name("groups_invite_clear_expired")
@app.route(route='groups/invite/clear_expired', methods=[func.HttpMethod.POST])
def groups_invite_clear_expired(req: func.HttpRequest) -> func.HttpResponse:
    '''Clear invitations container of expired or revoked invitations
    
    # Parameters
    req: func.httpRequest
    with
        data: {}
        
    # Returns
    func.httpResponse
    with
        data: {result: True, msg: "OK"}'''
    groups.clear_expired_invite()
    body = json.dumps({"result": True, "msg": "OK"})
    response = func.HttpResponse(
        body=body,
        mimetype="applications/json",
        status_code=200
    )
    return add_cors_headers(response)