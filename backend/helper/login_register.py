import uuid, json, os, logging
import azure.functions as func
import bcrypt

def hash_password(password):
    """
    Hash the password using bcrypt
    
    Parameters
    ----------
    password : str
        The password to hash
        
    Returns
    -------
    str
        The hashed password
    """
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12))

def check_password(password, hashed_password):
    """
    Check if the provided password matches the hashed password.
    
    Parameters
    ----------
    password : str
        The plain text password to check.
    hashed_password : str
        The hashed password to compare against.

    Returns
    -------
    bool
        True if the password matches the hashed password, False otherwise.
    """
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def register_user(username, password, container, email, phone, notifications, email_verification_code):
    """
    Register a new user in the system.
    
    Parameters
    ----------
    username : str
        The username of the new user.
    password : str
        The password of the new user.
    container : object
        The database container where user data is stored.
    email : str
        The email address of the new user.
    phone : str
        The phone number of the new user.
    notifications : bool
        Whether the user wants to receive notifications.
    email_verification_code : str
        The email verification code for the new user.
    
    Returns
    -------
    str
        A message indicating the result of the registration process.
    """
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
            'password': hash_password(password).decode('utf-8'),
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
    """
    Attempt to log in a user with the provided username and password.
    
    Parameters
    ----------
    username : str
        The username of the user attempting to log in.
    password : str
        The password of the user attempting to log in.
    container : object
        The database container object used to query user information.
    
    Returns
    -------
    str
        A message indicating the result of the login attempt. Possible values are:
        - "User successfully logged in."
        - "Username or password incorrect"
        - "database error"
    """
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
    """
    Verify the email verification code for a given username.
    
    Parameters
    ----------
    username : str
        The username of the user whose email verification code is to be verified.
    code : str
        The email verification code provided by the user.
    container : object
        The database container to query for the user's email verification code.
    
    Returns
    -------
    str
        A message indicating whether the verification was successful, failed, or if there was a database error.
    """
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
    """
    Retrieve user details from the database based on the provided email.
    
    Parameters
    ----------
    email : str
        The email address of the user whose details are to be retrieved.
    container : object
        The database container object used to query user details.

    Returns
    -------
    dict or str
        A dictionary containing the username and password if the user is found,
        otherwise returns "fail". In case of an exception, returns "Database error".
    """
    try:
        results = list(container.query_items(
            query="SELECT * FROM c WHERE c.email = @email",
            parameters=[{'name': '@email', 'value': email}],
            enable_cross_partition_query=True
        ))
        if results:
            return {"username": results[0].get("username"), "password": results[0].get("password")}
        else: 
            logging.info("Results for get user details: ", results)
            return "fail"
    except Exception as e:
        logging.info(f"Failed to get user details: {e}")
        return "Database error"

def fetch_other_details(user_details, user_data, field_to_update):
    """
    Update user_data with specific fields from user_details.
    
    Parameters
    ----------
    user_details : list of dict
        A list containing user details dictionaries.
    user_data : dict
        The dictionary to be updated with new fields.
    field_to_update : list of str
        A list of field names to update in user_data.
    
    Returns
    -------
    dict
        The updated user_data dictionary.
    """
    for field in field_to_update:
        user_data[field] = user_details[0][field]
    return user_data

def update_user_details(username, field, details, container):
    """
    Update the user details in the database.

    Parameters
    ----------
    username : str
        The username of the user whose details are to be updated.
    field : str
        The field to be updated (e.g., "password", "email", "phone", "notifications").
    details : str
        The new details to be updated in the specified field.
    container : object
        The database container object to perform the query and update operations.

    Returns
    -------
    str
        A message indicating whether the update was successful or if there was a database error.
    """
    try:
        user_details = list(container.query_items(
            query="SELECT * FROM c WHERE c.username=@username",
            parameters=[{'name': '@username', 'value': username}],
            enable_cross_partition_query=True
        ))
        user_id = user_details[0]['id']
        user_data = {}
        user_data['id'] = user_id
        if field == "password":
            user_data['password'] = hash_password(details).decode('utf-8')  
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
        print(user_id, user_data, "this should show the error here if the not a json object")
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