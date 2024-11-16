from flask import Flask, request, jsonify, make_response
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt,
    get_jwt_identity,
    decode_token,
)
from models import db, User, Inventory, Alert, Category, Order
from crud_role_and_user import create_user, create_role
from crud_inventory import get_inventory, create_inventory_item, delete_inventory_item, get_low_stock_items, calculate_inventory_turnover, get_most_popular_products, predict_future_demand
from crud_product import create_product, get_all_products, update_product, delete_product, process_csv, get_product_with_promotion, create_promotion, create_coupon
from crud_order import create_order, update_order_status, generate_invoice, create_return_request, process_return_request
from utils import send_low_stock_alert, validate_input
from auth import authorize
from config import Config
import logging
from werkzeug.security import check_password_hash
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import os
from datetime import datetime



app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
app.config.from_object(Config)


app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_ACCESS_COOKIE_NAME"] = "access_token"
app.config["JWT_REFRESH_COOKIE_NAME"] = "refresh_token"
app.config["JWT_COOKIE_CSRF_PROTECT"] = True  # Enable CSRF protection
app.config["JWT_ACCESS_CSRF_COOKIE_NAME"] = "csrf_access_token"
app.config["JWT_REFRESH_CSRF_COOKIE_NAME"] = "csrf_refresh_token"


# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

# Configure logging
logging.basicConfig(level=logging.INFO)

SECURE_COOKIES = os.getenv("FLASK_ENV") == "production" 
# Utility to set cookies
def set_cookie(response, name, value, max_age=None):
    response.set_cookie(
        name,
        value,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="None",  # Use "None" to allow cross-origin requests
        max_age=max_age,
    )


# Register
@app.route("/register", methods=["POST"])
def register_user():
    try:
        data = request.get_json()
        user = create_user(data["username"], data["password"], data["role_id"])
        logging.info(f"User '{user.username}' registered with role ID {user.role_id}")
        return jsonify(user.to_dict()), 201
    except Exception as e:
        logging.error(f"Error registering user: {e}")
        return jsonify({"error": "Error registering user"}), 500

# Login
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()
    if user and check_password_hash(user.password_hash, data["password"]):
        access_token = create_access_token(identity=user.id, additional_claims={
        "role_id": user.role_id,
        "username": user.username,  # Optional: Include more claims as needed
    })
        refresh_token = create_refresh_token(identity=user.id)

        # Decode tokens to extract CSRF tokens
        csrf_access_token = decode_token(access_token)["csrf"]
        csrf_refresh_token = decode_token(refresh_token)["csrf"]

        response = make_response(jsonify({"message": "Login successful"}))
        set_cookie(response, "access_token", access_token)
        set_cookie(response, "refresh_token", refresh_token)

        # Set CSRF tokens in cookies
        set_cookie(response, "csrf_access_token", csrf_access_token)
        set_cookie(response, "csrf_refresh_token", csrf_refresh_token)

        logging.info(f"User '{user.username}' logged in")
        return response, 200
    logging.warning(f"Invalid login attempt for user '{data['username']}'")
    return jsonify({"error": "Invalid credentials"}), 401


# Validate Token
@app.route("/validate-token", methods=["GET"])
@jwt_required()
def validate_token():
    try:
        logging.info(f"Incoming cookies: {request.cookies}")
        claims = get_jwt()
        role_id = claims.get("role_id")
        user_id = get_jwt_identity()
        username = claims.get("username")  # Add this if included in the token

        logging.info(f"Validating token for user ID {user_id} with role ID {role_id} and username '{username}'")
        return jsonify({
            "id": user_id,
            "username": username,
            "role": role_id,
        }), 200
    except Exception as e:
        logging.error(f"Token validation error: {e}")
        return jsonify({"error": "Invalid or expired token"}), 401

# Refresh Token
@app.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    incoming_csrf = request.headers.get("X-CSRF-TOKEN")
    if not incoming_csrf:
        return jsonify({"error": "CSRF token missing"}), 400

    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    csrf_access_token = decode_token(new_access_token)["csrf"]

    response = make_response(jsonify({"message": "Token refreshed"}))
    set_cookie(response, "access_token", new_access_token)
    set_cookie(response, "csrf_access_token", csrf_access_token)

    logging.info("Access token refreshed")
    return response, 200


# Logout
@app.route("/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({"message": "Logout successful"}))
    cookies_to_delete = ["access_token", "refresh_token", "csrf_access_token", "csrf_refresh_token"]
    for cookie in cookies_to_delete:
        response.set_cookie(cookie, '', expires=0, samesite="None", secure=True, httponly=True)
    return response, 200


# Create a Role
@app.route("/roles", methods=["POST"])
@jwt_required()
@authorize("Admin")
def create_role_endpoint():
    data = request.get_json()
    role = create_role(data["name"])
    logging.info(f"Role '{role.name}' created")
    return jsonify(role.to_dict()), 201


# Admin orders endpoint
@app.route("/admin/orders", methods=["GET"])
@jwt_required()
@authorize(required_roles=[1, 3])  # Admin and OrderManager
def admin_orders():
    return jsonify({"message": "Orders data"})

# Admin products endpoint
@app.route("/admin/products", methods=["GET"])
@jwt_required()
@authorize(required_roles=[1, 2])  # Admin and ProductManager
def admin_products():
    return jsonify({"message": "Products data"})

# Admin inventory endpoint
@app.route("/admin/inventory", methods=["GET"])
@jwt_required()
@authorize(required_roles=[1, 4])  # Admin and Inventory Manager
def admin_inventory():
    return jsonify({"message": "Inventory data"})


#######################################################################inventory management routes################################################################
#get all inventory
@app.route('/inventory', methods=['GET'])
@jwt_required()
@authorize(required_roles=[1, 4])
def get_inventory_route():
    inventory_data = [item.to_dict() for item in get_inventory()]
    return jsonify(inventory_data), 200

#create inventory
@app.route('/inventory', methods=['POST'])
@jwt_required()
@authorize(required_roles=[1, 4])
def create_inventory_route():
    data = request.get_json()
    new_item = create_inventory_item(data['product_id'], data['warehouse_id'], data['stock_level'], data.get('threshold', 10))
    return jsonify(new_item.to_dict()), 201

#update inventory
@app.route('/inventory/<int:item_id>', methods=['PUT'])
@jwt_required()
@authorize(required_roles=[1, 4])
def update_inventory_route(item_id):
    data = request.get_json()
    
    item = Inventory.query.get(item_id)
    if not item:
        return jsonify({"error": "Inventory item not found"}), 404
    
    # Update the stock level based on the provided stock_change
    stock_change = data.get("stock_change", 0)
    item.stock_level += stock_change
    item.last_updated = datetime.utcnow()
    
    # Check if an alert should be sent
    if item.stock_level < item.threshold:
        send_low_stock_alert(item.product_id, item.warehouse_id)
    
    db.session.commit()
    return jsonify(item.to_dict()), 200


#delete inventory
@app.route('/inventory/<int:item_id>/<int:warehouse_id>', methods=['DELETE'])
@jwt_required()
@authorize(required_roles=[1, 4]) 
def delete_inventory_route(item_id, warehouse_id):
    success = delete_inventory_item(item_id, warehouse_id)
    if success:
        return jsonify({"message": "Item deleted"}), 200
    else:
        return jsonify({"error": "Inventory item not found"}), 404


# New route to get low stock items
@app.route('/inventory/low-stock', methods=['GET'])
@jwt_required()
@authorize(required_roles=[1, 4]) 
def low_stock_items_route():
    low_stock_items = [item.to_dict() for item in get_low_stock_items()]
    return jsonify(low_stock_items), 200

# Optional: Route to retrieve alerts if logging in database
@app.route('/alerts', methods=['GET'])
@jwt_required()
@authorize(required_roles=[1, 4]) 
def get_alerts_route():
    alerts = Alert.query.order_by(Alert.alert_time.desc()).all()
    return jsonify([alert.to_dict() for alert in alerts]), 200


# Reports
@app.route('/report/inventory-turnover', methods=['GET'])
@jwt_required()
@authorize(required_roles=[1, 4]) 
def inventory_turnover_report():
    report = calculate_inventory_turnover()
    return jsonify(report), 200

# Reports
@app.route('/report/most-popular-products', methods=['GET'])
@jwt_required()
@authorize(required_roles=[1, 4]) 
def most_popular_products_report():
    top_n = request.args.get('top_n', default=5, type=int)
    report = get_most_popular_products(top_n=top_n)
    return jsonify(report), 200

# Reports
@app.route('/report/predict-demand', methods=['GET'])
@jwt_required()
@authorize(required_roles=[1, 4]) 
def predict_demand_report():
    product_id = request.args.get('product_id', type=int)
    days = request.args.get('days', default=30, type=int)
    report = predict_future_demand(product_id, days=days)
    return jsonify(report), 200

################################################################################### Product Management Routes #########################################################


# get Categories
@app.route('/categories', methods=['GET'])
@jwt_required()
@authorize(required_roles=[1, 2])
def get_categories():
    categories = Category.query.all()
    category_data = [category.to_dict() for category in categories]
    return jsonify(category_data), 200


# Create a Product
@app.route('/products', methods=['POST'])
@jwt_required()
@authorize(required_roles=[1, 2])
def create_product_route():
    data = request.get_json()
    product = create_product(
        name=data.get('name'),
        subcategory_id=data.get('subcategory_id'),
        description=data.get('description'),
        specifications=data.get('specifications'),
        price=data.get('price'),
        stock_level=data.get('stock_level', 0),
        image_url=data.get('image_url')
    )
    if product:
        return jsonify(product.to_dict()), 201
    else:
        return jsonify({"error": "Failed to create product"}), 400


# Get all Products
@app.route('/products', methods=['GET'])
@jwt_required()
@authorize(required_roles=[1, 2])
def get_all_products_route():
    products = get_all_products()
    return jsonify([product.to_dict() for product in products]), 200


# Update a Product
@app.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
@authorize(required_roles=[1, 2])
def update_product_route(product_id):
    data = request.get_json()
    # Check if all required fields are present
    if "subcategory_id" not in data or data["subcategory_id"] is None:
        return jsonify({"error": "subcategory_id is required"}), 400
    if "price" not in data or data["price"] is None:
        return jsonify({"error": "price is required"}), 400

    # Call the update function with valid data
    product = update_product(
        product_id,
        name=data.get('name'),
        subcategory_id=data.get('subcategory_id'),
        description=data.get('description'),
        specifications=data.get('specifications'),
        price=data.get('price'),
        stock_level=data.get('stock_level', 0),
        image_url=data.get('image_url')
    )
    if product:
        return jsonify(product.to_dict()), 200
    else:
        return jsonify({"error": "Failed to update product or product not found"}), 404



@app.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
@authorize(required_roles=[1, 2])
def delete_product_route(product_id):
    success = delete_product(product_id)
    if success:
        return jsonify({"message": "Product deleted"}), 200
    else:
        return jsonify({"error": "Failed to delete product or product not found"}), 404


# upload products from a CSV file
@app.route('/upload-products', methods=['POST'])
@jwt_required()
@authorize(required_roles=[1, 2])
def upload_products():
    # Check if the 'file' key is in the uploaded files
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    # Get the file from the request
    file = request.files['file']
    
    # Check if the file has a valid filename
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and file.filename.endswith('.csv'):
        # Save the file to the UPLOAD_FOLDER
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        
        # Process the CSV file and add products
        process_csv(file_path)
        
        return jsonify({"message": "File uploaded and processed successfully"}), 200
    else:
        return jsonify({"error": "Invalid file type, please upload a CSV file"}), 400
    

# Promotions and Coupons
@app.route('/promotions', methods=['POST'])
@jwt_required()
@authorize(required_roles=[1, 2])
def add_promotion():
    data = request.get_json()
    promotion = create_promotion(
        product_id=data['product_id'],
        discount_percentage=data['discount_percentage'],
        start_date=data['start_date'],
        end_date=data['end_date']
    )
    return jsonify(promotion.to_dict()), 201

@app.route('/coupons', methods=['POST'])
@jwt_required()
@authorize(required_roles=[1, 2])
def add_coupon():
    data = request.get_json()
    coupon = create_coupon(
        code=data['code'],
        discount_percentage=data['discount_percentage'],
        user_tier=data['user_tier'],
        max_uses=data.get('max_uses'),
        expires_at=data['expires_at']
    )
    return jsonify(coupon.to_dict()), 201

@app.route('/products/<int:product_id>', methods=['GET'])
@jwt_required()
@authorize(required_roles=[1, 2])
def get_product_route(product_id):
    product = get_product_with_promotion(product_id)
    if product:
        return jsonify(product.to_dict()), 200
    else:
        return jsonify({"error": "Product not found"}), 404

############################################################## Order Management Routes ##############################################

# Get all orders
app.route('/orders', methods=['GET'])
@jwt_required()
@authorize(required_roles=[1, 3])
def get_orders():
    orders = Order.query.all()
    return jsonify([order.to_dict() for order in orders]), 200

# Create an order
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


# Update order status
@app.route('/order/<int:order_id>', methods=['PATCH'])
@jwt_required()
@authorize(required_roles=[1, 3])
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


# post an invoice of an order
@app.route('/order/<int:order_id>/invoice', methods=['POST'])
@jwt_required()
@authorize(required_roles=[1, 3])
def generate_invoice_route(order_id):
    invoice = generate_invoice(order_id)
    if invoice:
        return jsonify(invoice.to_dict()), 201
    return jsonify({"error": "Order not found"}), 404

# Get a specific order
@app.route('/order/<int:order_id>', methods=['GET'])
@jwt_required()
@authorize(required_roles=[1, 3])
def get_order(order_id):
    order = Order.query.get(order_id)
    if order:
        return jsonify(order.to_dict()), 200
    return jsonify({"error": "Order not found"}), 404



# Post a return request
@app.route('/return', methods=['POST'])
@jwt_required()
@authorize(required_roles=[1, 3])
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


# Update return request status
@app.route('/return/<int:return_id>/status', methods=['PUT'])
@jwt_required()
@authorize(required_roles=[1, 3])
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


##################################################################################################################################################


# JWT Exception Handler
@app.errorhandler(Exception)
def handle_exceptions(e):
    logging.exception(f"Unhandled exception: {e}")
    return jsonify({"error": "An internal server error occurred"}), 500

if __name__ == "__main__":
    app.run(debug=True)
