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
import random

app = func.FunctionApp()
client = CosmosClient.from_connection_string(os.getenv("AzureCosmosDBConnectionString"))
database = client.get_database_client(os.getenv("DatabaseName"))
user_container = database.get_container_client(os.getenv("UserContainer"))
suggestion_container = database.get_container_client(os.getenv("SuggestionContainer"))
wishlist_container = database.get_container_client(os.getenv("WishListContainer"))
cart_container = database.get_container_client(os.getenv("CartContainer"))
product_container = database.get_container_client(os.getenv("ProductContainer"))
sendEmail_api_key = os.getenv("SendGrid_API_KEY")

def add_cors_headers(response: func.HttpResponse) -> func.HttpResponse:
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.function_name(name="wishlist_get")
@app.route(route='wishlist_get', methods=[func.HttpMethod.POST])
def wishlist_get(req: func.HttpRequest) -> func.HttpResponse:
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
    data = req.get_json()
    cart_name = data['cart_name']
    cart_content = data['cart_content']
    username = data['username']
    output = cart.save(username, cart_name, cart_content, cart_container)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )
    return add_cors_headers(response) 

@app.function_name(name="load_cart")
@app.route(route="load_cart", methods=[func.HttpMethod.POST])
def load_cart(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    cart_name = data['cart_name']
    username = data['username']
    output = cart.load(username, cart_name, cart_container)
    if output==f"{username} does not have stored cart named {cart_name}" or output==f"{username} does not have any carts stored":
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
    data = req.get_json()
    cart_name = data['cart_name']
    username = data['username']
    output = cart.delete(username, cart_name, cart_container)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )
    return add_cors_headers(response) 

@app.function_name(name="find_user_autocomplete")
@app.route(route="find_user_autocomplete", methods=[func.HttpMethod.POST])
def find_user_autocomplete(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        query = data.get('query', '')
        if not query:
            return func.HttpResponse(json.dumps({"usernames": []}), status_code=200, mimetype="application/json")

        # Replace with your database query to find matching usernames
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
    # sendEmail.send_verification_email(username, email, email_verification_code, sendEmail_api_key) # if error return the error
    phone = data['phone']
    notifications = data['notifications']
    output = login_register.register_user(username, password, user_container, email, phone, notifications, email_verification_code)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )
    return add_cors_headers(response) 

@app.function_name(name="email_verification")
@app.route(route='email_verification', methods=[func.HttpMethod.POST])
def email_verification(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    username = data['username']
    code = data['code']
    output = login_register.email_verification(username, code, user_container)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
    )
    return add_cors_headers(response) 

@app.function_name(name="fetch_user_details")
@app.route(route='fetch_user_details', methods=[func.HttpMethod.POST])
def fetch_user_details(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    email = data['email']
    output = login_register.get_user_details(email, user_container)
    if output == "fail":
        output = "Email does not have a registered account. Please register a new account."
    else:
        username = output['username']
        password = output['password']
        sendEmail.sendUserDetails(email, username, password, sendEmail_api_key)
        output = f"Username and Password details sent to {email}."
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
    output = login_register.update_user_details(username, field, details, user_container)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
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
    # TODO: uncomment this line for production
    # output = gpt_req.llm_suggestion(prompt, suggestion_container, username)
    output = "rec:Lebron James Hoodie,Lebron James Poster,Lebron James Jersey"
    fetched_products = products.get_products(output)
    response = func.HttpResponse(
        body=json.dumps({'query': output, 'response': fetched_products}),
        mimetype='application/json',
        status_code=200
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
            logging.info("Product not found in database")
            print("Product not found in database")
            
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
            logging.info("Product already exists in database")
            print("Product already exists in database")
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

def allowed_file(file):
        filename = file.filename
        format = '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico', 'tiff', 'mpo'}
        size = False #image must be less than 20 megabytes (MB)
        dimensions = False #must be greater than 50 x 50 pixels and less than 16,000 x 16,000 pixels

@app.function_name(name="product_img")
@app.route(route='product_img', methods=[func.HttpMethod.POST])
def product_img(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    username = data['username']
    img_data = data['img_data']
    brands = None
    objects = None
    if 'image' not in img_data.files:
        response = func.HttpResponse(
            body=json.dumps({'error': 'no File type'}),
            mimetype="application/json",
            status_code=400
        )
        return add_cors_headers(response)
    file = img_data.files['image']
    if file.filename == '':
        response = func.HttpResponse(
            body=json.dumps({'error': 'no file selected'}),
            mimetype="application/json",
            status_code=400
        )
        return add_cors_headers(response)
    if file and allowed_file(file):
        image_binary = file.read()
        output = image_analyzer.image_analysis(image_binary)
        brands = output[0]
        objects = output[1]
        suggestion = "rec:" + ','.join(objects)
        gpt_req.update_suggestion(suggestion_container, username, suggestion)
        fetched_products = products.get_products(output)
        response = func.HttpResponse(
            body=json.dumps({"response": fetched_products}),
            mimetype="application/json",
            status_code=200
        )
        return add_cors_headers(response)
    response = func.HttpResponse(
        body=json.dumps({'error': 'File type not allowed'}),
        mimetype="application/json",
        status_code=400
    )
    return add_cors_headers(response)

@app.function_name(name="product_types")
@app.route(route='product_types', methods=[func.HttpMethod.POST])
def product_types(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    username = data['Username'].strip()
    occassions = [item.strip() for item in data['Occasions'].split(",")]
    recipient = data['Recipient'].strip()
    price = data['Price'].strip()
    themes = [item.strip() for item in data['Themes'].split(",")]
    input = f"I want a gift for my {recipient} that matches ocassions {occassions}, that suits the themes of {themes}."
    output = gpt_req.llm_suggestion(input, suggestion_container, username)
    fetched_products = products.get_products_with_price_limitation(output, price)
    response = func.HttpResponse(
        body=json.dumps({"response": output}),
        mimetype="application/json",
        status_code=200
    )

    return add_cors_headers(response)

