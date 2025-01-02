import uuid, json, os, logging
import azure.functions as func

def save(username, session_id, cart_content, container):
    """
    Save cart content to database

    Parameters
    ----------
    username : str
        The username of the user
    session_id : str
        The name of the cart
    cart_content : dict
        The content of the cart
    container : azure.cosmos.CosmosClient
        The container object to interact with the database

    Returns
    -------
    str
        The status of the operation
    """
    try:
        user_cart_data = list(container.query_items(
            query="SELECT * FROM c WHERE c.username=@username",
            parameters=[{'name': '@username', 'value': username}],
            enable_cross_partition_query=False
        ))
        if user_cart_data:
            cart_names = list(user_cart_data[0]['carts'].keys())
            if session_id in cart_names:
                return "Cart name already exists"
            else:
                user_cart_data[0]['carts'][session_id] = cart_content
                container.replace_item(
                    item = user_cart_data[0]['id'],
                    body = user_cart_data[0],
                    pre_trigger_include = None,
                    post_trigger_include = None
                )
                return "Cart saved"
        else:
            container.create_item(body={
                'id': str(uuid.uuid4()),
                'username': username,
                'carts': {session_id: cart_content}
            })
            return "Cart saved"
    except Exception as e:
        logging.info(f"cart save error: {e}")
        return "database error"

def load(username, session_id, container):
    """
    Load cart content from database

    Parameters
    ----------
    username : str
        The username of the user
    session_id : str
        The name of the cart
    container : azure.cosmos.CosmosClient
        The container object to interact with the database

    Returns
    -------
    dict or str
        The content of the cart or the status of the operation
    """
    try:
        user_cart_data = list(container.query_items(
            query="SELECT * FROM c WHERE c.username=@username",
            parameters=[{'name': '@username', 'value': username}],
            enable_cross_partition_query=False
        ))
        if user_cart_data:
            if session_id in user_cart_data[0]['carts'].keys():
                return {session_id: user_cart_data[0]['carts'][session_id]}
            else:
                return f"{username} does not have stored cart named {session_id}"
        else: return f"{username} does not have any carts stored"
    except Exception as e:
        logging.info(f"cart load error: {e}")
        return "database error"
    
def delete(username, session_id, container):
    """
    Delete cart content from database

    Parameters
    ----------
    username : str
        The username of the user
    session_id : str
        The name of the cart
    container : azure.cosmos.CosmosClient
        The container object to interact with the database

    Returns
    -------
    str
        The status of the operation
    """
    try:
        user_cart_data = list(container.query_items(
            query="SELECT * FROM c WHERE c.username=@username",
            parameters=[{'name': '@username', 'value': username}],
            enable_cross_partition_query=False
        ))
        if user_cart_data:
            if session_id in user_cart_data[0]['carts'].keys():
                new_cart_data = {}
                new_cart_data['id'] = user_cart_data[0]['id']
                new_cart_data['username'] = username
                new_cart_data['carts'] = {}
                for cartName, cartData in user_cart_data[0]['carts'].items():
                    if session_id != cartName:
                        new_cart_data['carts'][cartName] = cartData
                container.replace_item(
                    item = user_cart_data[0]['id'],
                    body = new_cart_data,
                    pre_trigger_include = None,
                    post_trigger_include = None
                )
                return "Cart deleted"
            else:
                return f"{username} does not have stored cart named {session_id}"
        else: return f"{username} does not have any carts stored"
    except Exception as e:
        logging.info(f"cart load error: {e}")
        return "database error"