from models import db, Order, OrderDetail, ReturnRequest, Invoice
from sqlalchemy.exc import IntegrityError
from datetime import datetime

def send_notification(email, subject, message):
    # Simulating email notification (replace with actual email logic)
    print(f"Sending email to {email} - Subject: {subject} - Message: {message}")
    
def update_order_status(order_id, new_status):
    order = Order.query.get(order_id)
    if not order:
        return {"error": "Order not found"}

    # Define valid transitions for each current status
    valid_transitions = {
        "pending": ["processing", "shipped"],  # Add "shipped" if skipping "processing" is allowed
        "processing": ["shipped"],
        "shipped": ["delivered"]
    }

    # Check if the transition is allowed
    if new_status not in valid_transitions.get(order.status, []):
        return {"error": f"Invalid status transition from '{order.status}' to '{new_status}'"}

    # Update status if valid
    order.status = new_status
    db.session.commit()
    return order


def generate_invoice(order_id):
    order = Order.query.get(order_id)
    if order:
        invoice = Invoice(order_id=order.id, amount=order.total_amount)
        db.session.add(invoice)
        db.session.commit()

        # Send invoice to the customer
        send_notification(order.customer_email, "Invoice Generated", 
                          f"An invoice for order #{order.id} has been generated with a total amount of ${order.total_amount}.")
        return invoice
    return None



def create_return_request(order_id, reason, request_type):
    try:
        return_request = ReturnRequest(order_id=order_id, reason=reason, request_type=request_type)
        db.session.add(return_request)
        db.session.commit()

        # Return as dictionary instead of object
        return return_request.to_dict()
    except IntegrityError as e:
        db.session.rollback()
        return {"error": "Failed to create return request", "details": str(e)}


def process_return_request(return_id, action):
    try:
        return_request = ReturnRequest.query.get(return_id)
        if not return_request:
            return {"error": "Return request not found"}
        
        # Update the status based on action
        return_request.status = 'approved' if action == 'approve' else 'denied'
        db.session.commit()
        
        # Return the updated return request as a dictionary
        return return_request.to_dict()
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}


def refund_order(order_id):
    order = Order.query.get(order_id)
    if order:
        # Here you can trigger actual refund logic, e.g., via payment gateway API
        print(f"Refund processed for order {order_id}")
        return True
    return False


# New function to get all return requests
def get_all_return_requests():
    try:
        return_requests = ReturnRequest.query.all()
        return [return_request.to_dict() for return_request in return_requests]
    except Exception as e:
        return {"error": "Failed to fetch return requests", "details": str(e)}