from models import db, Order, OrderItem, ReturnRequest, Invoice
from sqlalchemy.exc import IntegrityError
from datetime import datetime

def create_order(customer_id, items, customer_email):
    try:
        order = Order(customer_id=customer_id, total_amount=0, customer_email=customer_email)
        db.session.add(order)
        db.session.flush()

        for item in items:
            quantity = int(item.get('quantity', 1))
            price_per_unit = float(item.get('price_per_unit'))
            order_item = OrderItem(order_id=order.id, product_id=item['product_id'],
                                   quantity=quantity, price_per_unit=price_per_unit)
            db.session.add(order_item)
            order.total_amount += quantity * price_per_unit

        db.session.commit()
        send_notification(customer_email, "Order Created", f"Your order #{order.id} has been created.")
        return order
    except (IntegrityError, ValueError) as e:
        db.session.rollback()
        return {"error": "Failed to create order", "details": str(e)}

def update_order_status(order_id, new_status):
    order = Order.query.get(order_id)
    if order:
        if not is_valid_status_transition(order.status, new_status):
            return {"error": f"Invalid status transition from '{order.status}' to '{new_status}'"}
        
        previous_status = order.status
        order.status = new_status
        order.updated_at = datetime.utcnow()
        db.session.commit()

        send_notification(order.customer_email, "Order Status Update", 
                          f"Your order #{order.id} status has changed from '{previous_status}' to '{new_status}'.")
        return order
    return None


from models import db, Order, ReturnRequest, Invoice
from datetime import datetime
from sqlalchemy.exc import IntegrityError

def create_return_request(order_id, reason, request_type):
    try:
        if request_type not in ['refund', 'replacement']:
            return {"error": "Invalid request type"}, 400

        return_request = ReturnRequest(order_id=order_id, reason=reason, request_type=request_type)
        db.session.add(return_request)
        db.session.commit()
        return return_request
    except IntegrityError as e:
        db.session.rollback()
        return {"error": "Failed to create return request", "details": str(e)}

def process_return_request(return_id, action):
    return_request = ReturnRequest.query.get(return_id)
    if not return_request:
        return {"error": "Return request not found"}, 404

    if action == 'approve':
        return_request.status = 'approved'
        if return_request.request_type == 'refund':
            refund_order(return_request.order_id)
            return_request.status = 'refunded'
        elif return_request.request_type == 'replacement':
            # Replacement logic here, e.g., initiate a new order or mark for shipment
            return_request.status = 'replaced'
    else:
        return {"error": "Invalid action"}, 400

    db.session.commit()
    return return_request

def refund_order(order_id):
    order = Order.query.get(order_id)
    if order:
        # Here you can trigger actual refund logic, e.g., via payment gateway API
        print(f"Refund processed for order {order_id}")
        return True
    return False


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

def send_notification(email, subject, message):
    # Simulating email notification (replace with actual email logic)
    print(f"Sending email to {email} - Subject: {subject} - Message: {message}")

def notify_admin(message):
    # Simulating admin notification (e.g., could be an alert in the dashboard)
    print(f"Admin notification: {message}")

# Additional helper function to ensure status transitions are valid
def is_valid_status_transition(current_status, new_status):
    valid_transitions = {
        "pending": ["processing", "canceled"],
        "processing": ["shipped", "canceled"],
        "shipped": ["delivered"],
        "delivered": [],
        "canceled": []
    }
    return new_status in valid_transitions.get(current_status, [])
