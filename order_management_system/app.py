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

@app.route('/create_order', methods=['POST'])
def create_order_route():
    data = request.get_json()
    if not validate_input(data, ['customer_id', 'customer_email', 'items']):
        return jsonify({"error": "Invalid data provided"}), 400

    # Creating order with basic validation on items
    order = create_order(data['customer_id'], data['items'], data['customer_email'])
    
    # Check if create_order returned an error dictionary
    if isinstance(order, dict) and 'error' in order:
        return jsonify(order), 400

    # Otherwise, assume order is an Order object and serialize it to JSON
    return jsonify(order.to_dict()), 201


@app.route('/order/<int:order_id>', methods=['PATCH'])
def update_order_status_route(order_id):
    data = request.get_json()
    new_status = data.get('status')
    
    if new_status not in ["pending", "processing", "shipped", "delivered"]:
        return jsonify({"error": "Invalid status value"}), 400

    order = update_order_status(order_id, new_status)

    # Check if `order` is a dictionary (indicating an error) or an `Order` object
    if isinstance(order, dict):
        return jsonify(order), 400  # Return the error dictionary if it's not an Order

    # Otherwise, `order` is an Order object, so we can safely call `to_dict()`
    return jsonify(order.to_dict()), 200


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

    # Check if the necessary data fields are present
    if not all(field in data for field in ["order_id", "reason", "request_type"]):
        return jsonify({"error": "Missing data fields"}), 400

    # Call the function to create the return request and store the result
    result = create_return_request(data['order_id'], data['reason'], data['request_type'])
    
    # If result contains an error, return it
    if 'error' in result:
        return jsonify(result), 400

    # Return the successful result with to_dict() applied
    return jsonify(result), 201

@app.route('/return/<int:return_id>/status', methods=['PUT'])
def update_return_request_status(return_id):
    action = request.json.get("action")
    if action not in ['approve', 'deny']:
        return jsonify({"error": "Invalid action"}), 400

    # Call the function to process the return request
    updated_request = process_return_request(return_id, action)
    
    # Check if `updated_request` is an error dictionary
    if isinstance(updated_request, dict) and 'error' in updated_request:
        return jsonify(updated_request), 400

    # Directly return the dictionary since it's already JSON-compatible
    return jsonify(updated_request), 200



# Run the application
if __name__ == '__main__':
    app.run(debug=True, port=5001)  
