import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from urllib.parse import urlparse
import socket

def send_low_stock_alert(product_id, warehouse_id):
    sender_email = os.getenv("SENDER_EMAIL")
    receiver_email = os.getenv("RECEIVER_EMAIL")
    email_password = os.getenv("EMAIL_PASSWORD")

    # Email content
    subject = "Low Stock Alert"
    body = f"Attention: The stock for product {product_id} in warehouse {warehouse_id} is running low."

    # Create the email message
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    try:
        # Connect to the SMTP server and send the email
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()  # Secure the connection
            server.login(sender_email, email_password)
            server.sendmail(sender_email, receiver_email, message.as_string())
        print("Low stock alert email sent successfully.")
    except Exception as e:
        print(f"Failed to send email alert: {e}")


ALLOWED_DOMAINS = ['example.com', 'trusted-cdn.com', 'localhost', '127.0.0.1']  # Add localhost for testing now cause im writing the code
def is_valid_url(url):
    try:
        # Parse the URL
        parsed_url = urlparse(url)
        
        # Ensure scheme is either http or https
        if parsed_url.scheme not in ['http', 'https']:
            return False
        
        # Resolve the host to an IP and allow localhost
        host_ip = socket.gethostbyname(parsed_url.hostname)
        if any([
            host_ip.startswith('127.'),
            host_ip.startswith('10.'),
            host_ip.startswith('172.16.'),
            host_ip.startswith('192.168.')
        ]) and parsed_url.hostname not in ['localhost', '127.0.0.1']:
            return False
        
        # Ensure the domain is in the allowed list
        domain = parsed_url.hostname
        if domain not in ALLOWED_DOMAINS:
            return False

        return True
    except Exception as e:
        print(f"URL validation error: {e}")
        return False
    
def validate_input(data, fields):
    for field in fields:
        if field not in data or data[field] is None:
            return False
    return True