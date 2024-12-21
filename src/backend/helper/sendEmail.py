import os, logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Free 100 emails/day

def send_verification_email(username, to_email, verification_code, api_key):
    message = Mail(
        from_email='antoniomiguelpinto03@gmail.com',
        to_emails=to_email,
        subject='Giftly Email Verification Code',
        html_content=f'<p>Dear {username}, \nPlease verify your email using this code: <strong>{verification_code}</strong></p>')
    try:
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        logging.info("Email verification code sent.")
        print("Email verification code sent.")
        return True
    except Exception as e:
        logging.info(f"Email verification failed: {e}")
        print(f"Email verification failed: {e}")
        return False
    
def sendUserDetails(email, username, password, api_key):
    message = Mail(
        from_email='antoniomiguelpinto03@gmail.com',
        to_emails=email,
        subject='Giftly Account Details',
        html_content=f'<p>Username: {username}, Password: {password}')
    try:
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        logging.info("Email verification code sent.")
        print("Email verification code sent.")
        return True
    except Exception as e:
        logging.info(f"Email verification failed: {e}")
        print(f"Email verification failed: {e}")
        return False
    

# send_verification_email("Antonio", "antoniomiguelpinto@gmail.com", 123123, "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")