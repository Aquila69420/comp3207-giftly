import uuid, json, os, logging
import azure.functions as func

def register_user(username, password, container):
    # add username reqs
    # add pass reqs

    try:
        # Check if user already exists
        user = list(container.query_items(
            query="SELECT * FROM c WHERE c.username=@username",
            parameters=[{'name': '@username', 'value': username}],
            enable_cross_partition_query=True
        ))
        if user: 
            logging.info("Username already exists")
            return "Username already exists"

        # Add user
        container.create_item(body={
            'id': str(uuid.uuid4()),
            'username': username,
            'password': password,
        })

        logging.info("User registered.")

        return "User successfully registered."
    except Exception as e:
        return e

def login_user(username, password, container):
    logging.info(f"Trying to login: {username}, {password}")
    try:
        # Get user password
        real_password_data = list(container.query_items(
            query="SELECT c.password FROM c WHERE c.username=@username",
            parameters=[{'name': '@username', 'value': username}],
            enable_cross_partition_query=True
        ))

        # If passoword doens't exist then user doesn't exist
        if len(real_password_data) == 0: 
            logging("Username or password incorrect")
            return "Username or password incorrect"

        # Get the password value
        real_password = real_password_data[0]['password']

        # Compare true vs inputted password value
        if password == real_password: 
            logging("Username successfully logged in.")
            return "User successfully logged in."
        else: 
            logging("Username or password incorrect")
            return "Username or password incorrect"
    except Exception as e:
        return e