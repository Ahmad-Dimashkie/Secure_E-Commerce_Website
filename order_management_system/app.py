from flask import Flask, request, jsonify
from models import db, Order, OrderItem, ReturnRequest, Invoice
from config import Config
from crud import create_order, process_return_request, update_order_status, create_return_request, generate_invoice
from datetime import datetime

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

# Error handler for SSRF and basic input validation
def validate_input(data, fields):
    for field in fields:
        if field not in data or data[field] is None:
            return False
    return True

# Routes

@app.route('/orders', methods=['GET'])
def get_orders():
    orders = Order.query.all()
    return jsonify([order.to_dict() for order in orders]), 200

@app.route('/order', methods=['POST'])
def create_order_route():
    data = request.get_json()

    if not validate_input(data, ['customer_id', 'customer_email', 'items']):
        return jsonify({"error": "Invalid data provided"}), 400

    # Creating order with basic validation on items
    order = create_order(data['customer_id'], data['items'], data['customer_email'])
    if 'error' in order:
        return jsonify(order), 400
    return jsonify(order.to_dict()), 201

@app.route('/order/<int:order_id>', methods=['PATCH'])
def update_order_status_route(order_id):
    data = request.get_json()
    new_status = data.get('status')

    if new_status not in ["pending", "processing", "shipped", "delivered"]:
        return jsonify({"error": "Invalid status value"}), 400

    order = update_order_status(order_id, new_status)
    if order:
        return jsonify(order.to_dict()), 200
    return jsonify({"error": "Order not found"}), 404

@app.route('/order/<int:order_id>/invoice', methods=['POST'])
def generate_invoice_route(order_id):
    invoice = generate_invoice(order_id)
    if invoice:
        return jsonify(invoice.to_dict()), 201
    return jsonify({"error": "Order not found"}), 404


@app.route('/order/<int:order_id>', methods=['GET'])
def get_order(order_id):
    order = Order.query.get(order_id)
    if order:
        return jsonify(order.to_dict()), 200
    return jsonify({"error": "Order not found"}), 404

# Automatically notify customer based on order status (mock function)
def notify_customer(order_id, status):
    order = Order.query.get(order_id)
    if order:
        # Mock sending notification (e.g., via email)
        print(f"Notification: Order {order_id} status updated to {status} for {order.customer_email}")

# Hook or trigger to automatically notify customer after order status update
@app.after_request
def after_request_callback(response):
    if request.endpoint == 'update_order_status_route' and response.status_code == 200:
        data = request.get_json()
        order_id = request.view_args.get('order_id')
        notify_customer(order_id, data.get('status'))
    return response


@app.route('/return', methods=['POST'])
def create_return_request_route():
    data = request.get_json()

    if 'order_id' not in data or 'reason' not in data or 'request_type' not in data:
        return jsonify({"error": "Invalid data provided"}), 400

    if data['request_type'] not in ['refund', 'replacement']:
        return jsonify({"error": "Invalid request type"}), 400

    return_request = create_return_request(data['order_id'], data['reason'], data['request_type'])
    if 'error' in return_request:
        return jsonify(return_request), 400
    return jsonify(return_request.to_dict()), 201

@app.route('/return/<int:return_id>', methods=['PATCH'])
def update_return_request_status(return_id):
    data = request.get_json()
    action = data.get('action')

    if action not in ['approve', 'deny']:
        return jsonify({"error": "Invalid action"}), 400

    updated_request = process_return_request(return_id, action)
    if 'error' in updated_request:
        return jsonify(updated_request), 400
    return jsonify(updated_request.to_dict()), 200

# Run the application
if __name__ == '__main__':
    app.run(debug=True)
