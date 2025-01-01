import uuid, json, os, logging
import azure.functions as func
import bcrypt

def hash_password(password):
    return bcrypt.hashpw(password, bcrypt.gensalt(12))

def check_password(password, hashed_password):
    return bcrypt.checkpw(password, hashed_password)

def register_user(username, password, container, email, phone, notifications, email_verification_code):
    logging.info(f"Trying to register: {username}, {password}, {email}, {phone}, {notifications}, {email_verification_code}")
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
            'password': hash_password(password),
            'email': email,
            'phone': phone,
            'notifications': notifications, 
            'email_verification_code': email_verification_code
        })

        logging.info("User registered.")

        return "User successfully registered."
    except Exception as e:
        logging.info(f"Register error: {e}")
        return "database error"

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
            logging.info("Username or password incorrect")
            return "Username or password incorrect"

        # Get the password value
        real_password = real_password_data[0]['password']
        logging.info("Real password of user: {}".format(real_password))

        # Compare true vs inputted password value
        if check_password(password, real_password): 
            logging.info("{} successfully logged in.".format(username))
            return "User successfully logged in."
        else: 
            logging.info("Username or password incorrect")
            return "Username or password incorrect"
    except Exception as e:
        logging.info(f"Login error: {e}")
        return "database error"
    
def email_verification(username, code, container):
    try:
        user_data = list(container.query_items(
            query="SELECT c.email_verification_code FROM c WHERE c.username=@username",
            parameters=[{'name': '@username', 'value': username}],
            enable_cross_partition_query=True
        ))
        logging.info(f"user data: {user_data} {code}")
        user_email_verification_code = user_data[0]['email_verification_code']
        if code == user_email_verification_code:
            return "Verification successful."
        else:
            return "Verification failed."
    except Exception as e:
        logging.info(f"Email verification error: {e}")
        return "database error"
    
def get_user_details(email, container):
    try:
        results = list(container.query_items(
            query="SELECT * FROM c WHERE c.email = @email",
            parameters=[{'name': '@email', 'value': email}],
            enable_cross_partition_query=True
        ))
        if results:
            return {"username": results[0].get("username"), "password": results[0].get("password")}
        else: return "fail"
    except Exception as e:
        logging.info(f"Failed to get user details: {e}")
        return "Database error"

def fetch_other_details(user_details, user_data, field_to_update):
    for field in field_to_update:
        user_data[field] = user_details[0][field]
    return user_data

def update_user_details(username, field, details, container):
    try:
        user_details = list(container.query_items(
            query="SELECT * FROM c WHERE c.username=@username",
            parameters=[{'name': '@username', 'value': username}],
            enable_cross_partition_query=True
        ))
        user_id = user_details[0]['id']
        user_data = {}
        user_data['id'] = user_id
        if field == "username":
            user_data['username'] = details
            user_data = fetch_other_details(user_details, user_data, ['password', 'email', 'phone', 'notifications'])
        elif field == "password":
            user_data['password'] = hash_password(details)
            user_data = fetch_other_details(user_details, user_data, ['username', 'email', 'phone', 'notifications'])
        elif field == "email":
            user_data['email'] = details
            user_data = fetch_other_details(user_details, user_data, ['username', 'password', 'phone', 'notifications'])
        elif field == "phone":
            user_data['phone'] = details
            user_data = fetch_other_details(user_details, user_data, ['username', 'password', 'email', 'notifications'])
        else: 
            user_data['notifications'] = details
            fetch_other_details(user_details, user_data, ['username', 'password', 'email', 'phone'])
        container.replace_item(
            item = user_id,
            body = user_data,
            pre_trigger_include = None,
            post_trigger_include = None
        )
        return f"{field} successfully updated to {details}."
    except Exception as e:
        logging.info(f"update user details error: {e}")
        return "database error"
    
    