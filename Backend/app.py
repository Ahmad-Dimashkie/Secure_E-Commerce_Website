from sqlite3 import IntegrityError
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
from models import Product, db, User, Inventory, Category, Order
from crud_role_and_user import create_user, create_role
from crud_inventory import get_inventory, create_inventory, update_inventory, delete_inventory_by_id, get_low_stock_inventory
from crud_product import create_product, get_all_products, update_product, delete_product, process_csv, get_product_with_promotion, create_promotion, create_coupon
from crud_order import  get_all_return_requests, update_order_status, generate_invoice, create_return_request, process_return_request
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
from werkzeug.utils import secure_filename



app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
app.config.from_object(Config)


app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_ACCESS_COOKIE_NAME"] = "access_token"
app.config["JWT_REFRESH_COOKIE_NAME"] = "refresh_token"
app.config["JWT_COOKIE_CSRF_PROTECT"] = True  # Enable CSRF protection
app.config["JWT_ACCESS_CSRF_COOKIE_NAME"] = "csrf_access_token"
app.config["JWT_REFRESH_CSRF_COOKIE_NAME"] = "csrf_refresh_token"

import os

# Set the folder where uploaded files will be saved
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')  # Creates an "uploads" folder in the current working directory
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

# Configure logging
logging.basicConfig(level=logging.INFO)

SECURE_COOKIES = os.getenv("FLASK_ENV") == "production" 
# Utility to set cookies
def set_cookie(response, name, value, max_age=None, httponly=True,domain=None):
    response.set_cookie(
        name,
        value,
        httponly=httponly,
        secure=SECURE_COOKIES,
        samesite="None",  # Use "None" to allow cross-origin requests
        max_age=max_age,
        domain=domain,
    )



# Register
@app.route("/register", methods=["POST"])
def register_user():
    try:
        data = request.get_json()
        username = data.get("username", "").strip()
        password = data.get("password", "").strip()
        role_id = data.get("role_id")
        if not username or not password or not role_id:
            return jsonify({"error": "Invalid input"}), 400
        
        user = create_user(username, password, role_id)
        logging.info(f"User '{user.username}' registered with role ID {user.role_id}")
        return jsonify(user.to_dict()), 201
    except Exception as e:
        logging.error(f"Error registering user: {e}")
        return jsonify({"error": "Error registering user"}), 500

# Login
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    if not username or not password:
        return jsonify({"error": "Invalid credentials"}), 401

    user = User.query.filter(User.username == username).first()  # Parameterized filter

    if user and check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=user.id, additional_claims={
            "role_id": user.role_id,
            "username": user.username,
        })
        refresh_token = create_refresh_token(identity=user.id)

        # Decode tokens to extract CSRF tokens
        csrf_access_token = decode_token(access_token)["csrf"]
        csrf_refresh_token = decode_token(refresh_token)["csrf"]

        response = make_response(jsonify({"message": "Login successful"}))
        set_cookie(response, "access_token", access_token)
        set_cookie(response, "refresh_token", refresh_token)

        # Set CSRF tokens in cookies
        # Login Route
        set_cookie(response, "csrf_access_token", csrf_access_token, httponly=False)
        set_cookie(response, "csrf_refresh_token", csrf_refresh_token, httponly=False)


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
    set_cookie(response, "csrf_access_token", csrf_access_token, httponly=False)

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
    new_item = create_inventory(data['category_id'], data['capacity'], data.get('threshold', 50))
    return jsonify(new_item.to_dict()), 201

#update inventory
@app.route('/inventory/<int:inv_id>', methods=['PUT'])
@jwt_required()
@authorize(required_roles=[1, 4])
def update_inventory_by_id(inv_id):
    data = request.get_json()
    try:
        capacity = data.get("capacity")
        if capacity is None or not isinstance(capacity, int) or capacity < 0:
            return jsonify({"error": "Invalid capacity value"}), 400
        
        inv= Inventory.query.get(inv_id)
        if not inv:
            return jsonify({"error": "Inventory not found"}), 404
    
        update_inventory(inv_id, capacity)
    
        db.session.commit()
        return jsonify(inv.to_dict()), 200
    except Exception as e:
        logging.error(f"Error updating inventory: {e}")
        return jsonify({"error": "Error updating inventory"}), 500



#delete inventory
@app.route('/inventory/<int:inv_id>', methods=['DELETE'])
@jwt_required()
@authorize(required_roles=[1, 4]) 
def delete_inventory(inv_id):
    try:
        inv = Inventory.query.get(inv_id)
        if not inv:
            return jsonify({"error": "Inventory not found"}), 404
        success = delete_inventory_by_id(inv_id)
        if success:
            return jsonify({"message": "Inventory deleted"}), 200
    except Exception as e:
        logging.error(f"Error deleting inventory: {e}")
        return jsonify({"error": "Error deleting inventory"}), 500


# New route to get low stock items
@app.route('/inventory/low-stock', methods=['GET'])
@jwt_required()
@authorize(required_roles=[1, 4]) 
def low_stock_items_route():
    low_stock_invs = [inv.to_dict() for inv in get_low_stock_inventory()]
    return jsonify(low_stock_invs), 200

# # Optional: Route to retrieve alerts if logging in database
# @app.route('/alerts', methods=['GET'])
# @jwt_required()
# @authorize(required_roles=[1, 4]) 
# def get_alerts_route():
#     alerts = Alert.query.order_by(Alert.alert_time.desc()).all()
#     return jsonify([alert.to_dict() for alert in alerts]), 200


# # Reports
# @app.route('/report/inventory-turnover', methods=['GET'])
# @jwt_required()
# @authorize(required_roles=[1, 4]) 
# def inventory_turnover_report():
#     report = calculate_inventory_turnover()
#     return jsonify(report), 200

# # Reports
# @app.route('/report/most-popular-products', methods=['GET'])
# @jwt_required()
# @authorize(required_roles=[1, 4]) 
# def most_popular_products_report():
#     top_n = request.args.get('top_n', default=5, type=int)
#     report = get_most_popular_products(top_n=top_n)
#     return jsonify(report), 200

# # Reports
# @app.route('/report/predict-demand', methods=['GET'])
# @jwt_required()
# @authorize(required_roles=[1, 4]) 
# def predict_demand_report():
#     product_id = request.args.get('product_id', type=int)
#     days = request.args.get('days', default=30, type=int)
#     report = predict_future_demand(product_id, days=days)
#     return jsonify(report), 200

################################################################################### Product Management Routes #########################################################


# get Categories
@app.route('/categories', methods=['GET'])
@jwt_required()
@authorize(required_roles=[1, 2, 3, 4])
def get_categories():
    categories = Category.query.all()
    category_data = [category.to_dict() for category in categories]
    return jsonify(category_data), 200


from flask import request

# Create a Product
@app.route('/products', methods=['POST'])
@jwt_required()
@authorize(required_roles=[1, 2])
def create_product_route():
    try:
        # Parse incoming JSON data
        data = request.get_json()

        # Validate required fields
        required_fields = ["name", "category_id", "inventory_id", "description", "price", "stock_level"]
        missing_fields = [field for field in required_fields if field not in data or data[field] is None]

        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        # Extract fields with default/fallback values if needed
        name = data["name"]
        description = data["description"]
        price = float(data["price"])
        category_id = int(data["category_id"])
        inventory_id = int(data["inventory_id"])
        stock_level = int(data["stock_level"])
        image_url = data.get("image_url", None)  # Image URL is optional

        # Create the Product instance
        product = Product(
            name=name,
            description=description,
            price=price,
            category_id=category_id,
            inventory_id=inventory_id,
            stock_level=stock_level,
            image_url=image_url
        )

        # Add and commit the product to the database
        db.session.add(product)
        db.session.commit()

        return jsonify(product.to_dict()), 201

    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": f"Database Integrity Error: {str(e)}"}), 500
    except TypeError as e:
        return jsonify({"error": f"Type Error: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

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
    if "category_id" not in data or data["category_id"] is None:
        return jsonify({"error": "category_id is required"}), 400
    if "inventory_id" not in data or data["inventory_id"] is None:
        return jsonify({"error": "inventory_id is required"}), 400
    if "price" not in data or data["price"] is None:
        return jsonify({"error": "price is required"}), 400

    # Call the update function with valid data
    product = update_product(
        product_id,
        name=data.get('name'),
        category_id=data.get('category_id'),
        inventory_id=data.get('inventory_id'),
        description=data.get('description'),
        price=data.get('price'),
        stock_level=data.get('stock_level', 0),
        image_url=data.get('image_url'),
        promotion_id=data.get('promotion_id')
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
    if not file.filename:
        return jsonify({"error": "No selected file"}), 400
    
    filename = secure_filename(file.filename)
    
    if not filename.endswith('.csv'):
            return jsonify({"error": "Invalid file type, only CSV files are allowed"}), 400

    
    # Save the file to the UPLOAD_FOLDER
    upload_folder = app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)
    max_file_size = 5 * 1024 * 1024  # 5 MB
    if os.path.getsize(file_path) > max_file_size:
        os.remove(file_path)  # Clean up the oversized file
        return jsonify({"error": "File size exceeds the allowed limit (5MB)"}), 400
    try:
        # Process the CSV file and add products
        process_csv(file_path)
        return jsonify({"message": "File uploaded and processed successfully"}), 200
    except Exception as e:
            os.remove(file_path)  # Clean up
            return jsonify({"error": f"Invalid CSV content: {str(e)}"}), 400
    

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


@app.route('/products-with-promotions', methods=['GET'])
def get_products_with_promotions():
    try:
        # Get the current time (to calculate active promotions)
        current_time = datetime.utcnow()

        # Query the Product table where promotion_id is not null
        products_with_promotions = db.session.query(Product).filter(
            Product.promotion_id.isnot(None)
        ).all()

        # Prepare the response
        result = []
        for product in products_with_promotions:
            # Check if the promotion is active (assuming promotion details are stored in the Product table or precomputed)
            active_promotion = None
            if product.discounted_price:
                active_promotion = {
                    "discount_percentage": round(100 - (product.discounted_price / product.price) * 100, 2),
                    "discounted_price": product.discounted_price
                }
            product_data = {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "stock_level": product.stock_level,
                "description": product.description,
                "image_url": product.image_url,
                "promotion": active_promotion
            }
            result.append(product_data)

        return jsonify(result), 200

    except Exception as e:
        logging.exception(f"Error fetching products with promotions: {e}")
        return jsonify({"error": "Failed to fetch products with promotions"}), 500



############################################################## Order Management Routes ##############################################


@app.route('/orders', methods=['GET'])
@jwt_required()
@authorize(required_roles=[1, 3])
def get_all_orders():
    try:
        orders = Order.query.all()
        orders_list = [order.to_dict() for order in orders]  # Convert orders to dictionaries
        return jsonify(orders_list), 200
    except Exception as e:
        logging.exception("Error fetching orders")
        return jsonify({"error": "Failed to fetch orders"}), 500

# to be implemented when we have customers
# # Create an order
# @app.route('/create_order', methods=['POST'])
# def create_order_route():
#     data = request.get_json()
#     if not validate_input(data, ['customer_id', 'customer_email', 'items']):
#         return jsonify({"error": "Invalid data provided"}), 400

#     # Creating order with basic validation on items
#     order = create_order(data['customer_id'], data['items'], data['customer_email'])
    
#     # Check if create_order returned an error dictionary
#     if isinstance(order, dict) and 'error' in order:
#         return jsonify(order), 400

#     # Otherwise, assume order is an Order object and serialize it to JSON
#     return jsonify(order.to_dict()), 201


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



# Update return request status endpoint
@app.route('/return/<int:return_id>/status', methods=['PUT'])
@jwt_required()
@authorize(required_roles=[1, 3])
def update_return_request_status(return_id):
    action = request.json.get("action")

    # Call the function to process the return request
    updated_request = process_return_request(return_id, action)
    
    # Check if `updated_request` is an error dictionary
    if isinstance(updated_request, dict) and 'error' in updated_request:
        return jsonify(updated_request), 400

    # Directly return the dictionary since it's already JSON-compatible
    return jsonify(updated_request), 200


# Add a new route to fetch all return requests
@app.route('/returns', methods=['GET'])
@jwt_required()

def get_return_requests_route():
    try:
        return_requests = get_all_return_requests()
        if 'error' in return_requests:
            return jsonify(return_requests), 500
        return jsonify(return_requests), 200
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

##################################################################################################################################################


# JWT Exception Handler
@app.errorhandler(Exception)
def handle_exceptions(e):
    logging.exception(f"Unhandled exception: {e}")
    return jsonify({"error": "An internal server error occurred"}), 500

if __name__ == "__main__":
    app.run(debug=True, host='localhost')
