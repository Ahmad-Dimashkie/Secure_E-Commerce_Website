from datetime import datetime
from flask import Flask, jsonify, request
from config import Config
from models import db, Inventory, Alert, Category
from crud import create_inventory_item, get_inventory, update_inventory_item, delete_inventory_item, get_low_stock_items
from crud import calculate_inventory_turnover, get_most_popular_products, predict_future_demand
from utils import send_low_stock_alert

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

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
    
    # Ensure that we are looking up the item by its primary key 'id'
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
    data = request.get_json()
    success = delete_inventory_item(data['product_id'], data['warehouse_id'])
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


if __name__ == '__main__':
    app.run(debug=True)
