import os, logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import random
import time

# IMPORTANT: Free 100 emails/day

def send_verification_email(username, to_email, verification_code, api_key):
    """
    Send a verification email to the specified email address.

    Parameters
    ----------
    username : str
        The username of the recipient.
    to_email : str
        The email address of the recipient.
    verification_code : str
        The verification code to be sent in the email.
    api_key : str
        The API key for the SendGrid service.

    Returns
    -------
    bool
        True if the email was sent successfully, False otherwise.
    """
    logging.info(f"Sending email to {to_email} with verification code {verification_code}")
    message = Mail(
        from_email='antoniomiguelpinto03@gmail.com',
        to_emails=to_email,
        subject='Giftly Email Verification Code',
        html_content=f'<p>Dear {username}, \nPlease verify your email using this code: <strong>{verification_code}</strong></p>')
    try:
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        logging.info("Email verification code sent.")
        return True
    except Exception as e:
        logging.info(f"Email verification failed: {e}")
        return False

def send_OTP_email(to_email, username, api_key):
    """
    Send a One Time Password (OTP) email for password reset.

    Parameters
    ----------
    to_email : str
        The recipient's email address.
    username : str
        The recipient's username.
    api_key : str
        The API key for the SendGrid service.

    Returns
    -------
    int or bool
        The OTP token if the email was sent successfully, otherwise False.
    """
    # Generate a random token
    token = random.randint(100000, 999999)
    message = Mail(
        from_email='antoniomiguelpinto03@gmail.com',
        to_emails=to_email,
        subject='Giftly Account Password Reset One Time Password',
        html_content=f'<p>Dear {username}, \nPlease use this OTP to reset your password: <strong>{token}</strong></p>')
    try:
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        logging.info("Email verification code sent.")        
        return token
    except Exception as e:
        logging.info(f"Email verification failed: {e}")
        return False

def sendUserNotification(username, notification, container, api_key):
    """
    Send an email notification to a user.
    
    Parameters
    ----------
    username : str
        The username of the recipient.
    notification : str
        The notification message to be sent.
    container : object
        The database container to query for the user's email.
    api_key : str
        The API key for the SendGrid service.
    
    Returns
    -------
    str
        A message indicating the result of the email notification delivery.
    """
    try:
        email = list(container.query_items(
            query="SELECT * FROM c WHERE c.username=@username",
            parameters=[{'name': '@username', 'value': username}],
            enable_cross_partition_query=True
        ))
        logging.info(f"email: {email}, username: {username}")
        if len(email) == 0:
            return "User does not have a registered account."
        
        to_email = email[0]['email']
        message = Mail(
            from_email='antoniomiguelpinto03@gmail.com',
            to_emails=to_email,
            subject='Giftly Notification',
            html_content=f'<p>Dear {username}, {notification} </p>'
        )
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        logging.info("Email verification code sent.")
        return "Email notification delivery success."
    except Exception as e:
        logging.info(f"Notification delivery failed: {e}")
        return "Failed to deliver email notification."