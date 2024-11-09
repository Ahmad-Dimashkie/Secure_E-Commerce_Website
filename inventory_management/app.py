from datetime import datetime
from flask import Flask, jsonify, request
from config import Config
from models import db, Inventory, Alert, Category
from crud import create_inventory_item, get_inventory, get_product_with_promotion, update_inventory_item, delete_inventory_item, get_low_stock_items
from crud import calculate_inventory_turnover, get_most_popular_products, predict_future_demand
from utils import send_low_stock_alert
from crud import create_product, get_all_products, get_product_by_id, update_product, delete_product, process_csv, create_promotion, create_coupon
import os


app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

# Define the upload folder path
UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the folder exists when the app starts
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/inventory', methods=['GET'])
def get_inventory_route():
    inventory_data = [item.to_dict() for item in get_inventory()]
    return jsonify(inventory_data), 200

@app.route('/inventory', methods=['POST'])
def create_inventory_route():
    data = request.get_json()
    new_item = create_inventory_item(data['product_id'], data['warehouse_id'], data['stock_level'], data.get('threshold', 10))
    return jsonify(new_item.to_dict()), 201

@app.route('/inventory/<int:item_id>', methods=['PUT'])
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

@app.route('/inventory/<int:item_id>', methods=['DELETE'])
def delete_inventory_route(item_id):
    success = delete_inventory_item(item_id)
    if success:
        return jsonify({"message": "Item deleted"}), 200
    else:
        return jsonify({"error": "Inventory item not found"}), 404



# New route to get low stock items
@app.route('/inventory/low-stock', methods=['GET'])
def low_stock_items_route():
    low_stock_items = [item.to_dict() for item in get_low_stock_items()]
    return jsonify(low_stock_items), 200

# Optional: Route to retrieve alerts if logging in database
@app.route('/alerts', methods=['GET'])
def get_alerts_route():
    alerts = Alert.query.order_by(Alert.alert_time.desc()).all()
    return jsonify([alert.to_dict() for alert in alerts]), 200


@app.route('/report/inventory-turnover', methods=['GET'])
def inventory_turnover_report():
    report = calculate_inventory_turnover()
    return jsonify(report), 200

@app.route('/report/most-popular-products', methods=['GET'])
def most_popular_products_report():
    top_n = request.args.get('top_n', default=5, type=int)
    report = get_most_popular_products(top_n=top_n)
    return jsonify(report), 200

@app.route('/report/predict-demand', methods=['GET'])
def predict_demand_report():
    product_id = request.args.get('product_id', type=int)
    days = request.args.get('days', default=30, type=int)
    report = predict_future_demand(product_id, days=days)
    return jsonify(report), 200


@app.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    category_data = [category.to_dict() for category in categories]
    return jsonify(category_data), 200



@app.route('/products', methods=['POST'])
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


@app.route('/products', methods=['GET'])
def get_all_products_route():
    products = get_all_products()
    return jsonify([product.to_dict() for product in products]), 200





@app.route('/products/<int:product_id>', methods=['PUT'])
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
def delete_product_route(product_id):
    success = delete_product(product_id)
    if success:
        return jsonify({"message": "Product deleted"}), 200
    else:
        return jsonify({"error": "Failed to delete product or product not found"}), 404



@app.route('/upload-products', methods=['POST'])
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

@app.route('/promotions', methods=['POST'])
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
def get_product_route(product_id):
    product = get_product_with_promotion(product_id)
    if product:
        return jsonify(product.to_dict()), 200
    else:
        return jsonify({"error": "Product not found"}), 404


if __name__ == '__main__':
    app.run(debug=True)
