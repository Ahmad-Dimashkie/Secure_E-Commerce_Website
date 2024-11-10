from models import db, Inventory, Alert
from datetime import datetime
from utils import send_low_stock_alert
from models import db, Sales, Inventory, Product
from sqlalchemy import func
from datetime import timedelta
from sqlalchemy.exc import SQLAlchemyError
import pandas as pd
import socket
from urllib.parse import urlparse


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



def create_inventory_item(product_id, warehouse_id, stock_level, threshold=10):
    new_item = Inventory(product_id=product_id, warehouse_id=warehouse_id, stock_level=stock_level, threshold=threshold)
    db.session.add(new_item)
    db.session.commit()
    return new_item

def get_inventory():
    return Inventory.query.all()

def get_inventory_item(product_id, warehouse_id):
    return Inventory.query.filter_by(product_id=product_id, warehouse_id=warehouse_id).first()

def update_inventory_item(product_id, warehouse_id, stock_change):
    item = get_inventory_item(product_id, warehouse_id)
    if item:
        item.stock_level += stock_change
        item.last_updated = datetime.utcnow()
        db.session.commit()

        # Trigger alert if stock level is below the threshold
        if item.stock_level < item.threshold:
            send_low_stock_alert(item.product_id, item.warehouse_id)
            # Optional: Save alert in the Alert table
            alert_message = f"Low stock alert for product {product_id} in warehouse {warehouse_id}"
            new_alert = Alert(product_id=product_id, warehouse_id=warehouse_id, alert_message=alert_message)
            db.session.add(new_alert)
            db.session.commit()
        return item
    else:
        return None

def delete_inventory_item(product_id, warehouse_id):
    item = get_inventory_item(product_id, warehouse_id)
    if item:
        db.session.delete(item)
        db.session.commit()
        return True
    return False

def get_inventory_by_warehouse(warehouse_id):
    return Inventory.query.filter_by(warehouse_id=warehouse_id).all()

def get_inventory_by_product(product_id):
    return Inventory.query.filter_by(product_id=product_id).all()

def get_low_stock_items():
    return Inventory.query.filter(Inventory.stock_level < Inventory.threshold).all()
from models import db, Inventory, Alert
from datetime import datetime
from utils import send_low_stock_alert

def create_inventory_item(product_id, warehouse_id, stock_level, threshold=10):
    new_item = Inventory(product_id=product_id, warehouse_id=warehouse_id, stock_level=stock_level, threshold=threshold)
    db.session.add(new_item)
    db.session.commit()
    return new_item

def get_inventory():
    return Inventory.query.all()

def get_inventory_item(product_id, warehouse_id):
    return Inventory.query.filter_by(product_id=product_id, warehouse_id=warehouse_id).first()

def update_inventory_item(item_id, stock_change):
    item = Inventory.query.get(item_id)
    if item:
        item.stock_level += stock_change
        item.last_updated = datetime.utcnow()
        db.session.commit()
        
        # Trigger alert if stock level is below the threshold
        if item.stock_level < item.threshold:
            send_low_stock_alert(item.product_id, item.warehouse_id)
            
        return item
    return None


def delete_inventory_item(product_id, warehouse_id):
    item = get_inventory_item(product_id, warehouse_id)
    if item:
        db.session.delete(item)
        db.session.commit()
        return True
    return False

# Additional helper functions
def get_inventory_by_warehouse(warehouse_id):
    return Inventory.query.filter_by(warehouse_id=warehouse_id).all()

def get_inventory_by_product(product_id):
    return Inventory.query.filter_by(product_id=product_id).all()

def get_low_stock_items():
    return Inventory.query.filter(Inventory.stock_level < Inventory.threshold).all()

def calculate_inventory_turnover():
    total_sales = db.session.query(
        Sales.product_id,
        func.sum(Sales.quantity_sold).label('total_quantity_sold')
    ).group_by(Sales.product_id).all()

    # Calculate inventory turnover for each product
    turnover_report = []
    for sale in total_sales:
        product_id = sale.product_id
        total_quantity_sold = sale.total_quantity_sold

        # Get the average inventory for the product
        avg_inventory = db.session.query(
            func.avg(Inventory.stock_level)
        ).filter(Inventory.product_id == product_id).scalar()

        if avg_inventory and avg_inventory > 0:
            turnover_rate = total_quantity_sold / avg_inventory
        else:
            turnover_rate = 0  # Prevent division by zero

        turnover_report.append({
            "product_id": product_id,
            "total_quantity_sold": total_quantity_sold,
            "average_inventory": avg_inventory,
            "inventory_turnover": turnover_rate
        })

    return turnover_report

def get_most_popular_products(top_n=5):
    # Query total quantity sold per product
    popular_products = db.session.query(
        Sales.product_id,
        func.sum(Sales.quantity_sold).label('total_quantity_sold')
    ).group_by(Sales.product_id).order_by(func.sum(Sales.quantity_sold).desc()).limit(top_n).all()

    report = []
    for product in popular_products:
        report.append({
            "product_id": product.product_id,
            "total_quantity_sold": product.total_quantity_sold
        })

    return report

def predict_future_demand(product_id, days=30):
    # Calculate the average quantity sold per day for the past N days
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)

    avg_sales = db.session.query(
        func.avg(Sales.quantity_sold)
    ).filter(Sales.product_id == product_id, Sales.sale_date.between(start_date, end_date)).scalar()

    # Prediction for the next period (e.g., 30 days)
    if avg_sales:
        future_demand = avg_sales * days
    else:
        future_demand = 0

    return {
        "product_id": product_id,
        "predicted_demand_next_30_days": future_demand
    }
    
def create_product(name, subcategory_id, description, specifications, price, stock_level=0, image_url=None):
    try:
        # Validate and sanitize image_url for SSRF protection
        if image_url and not is_valid_url(image_url):
            raise ValueError("Invalid or untrusted URL for image")

        new_product = Product(
            name=name,
            subcategory_id=int(subcategory_id),
            description=description[:1000],
            specifications=specifications[:1000],
            price=max(0, float(price)),
            stock_level=max(0, int(stock_level)),
            image_url=image_url
        )
        db.session.add(new_product)
        db.session.commit()
        return new_product
    except (SQLAlchemyError, ValueError) as e:
        db.session.rollback()
        print(f"Error creating product: {e}")
        return None


# Get all products
def get_all_products():
    return Product.query.all()


# Get a product by ID
def get_product_by_id(product_id):
    return Product.query.get(product_id)


# Update a product by ID
def update_product(product_id, **kwargs):
    product = get_product_by_id(product_id)
    if product:
        for key, value in kwargs.items():
            setattr(product, key, value)
        try:
            db.session.commit()
            return product
        except SQLAlchemyError as e: # type: ignore
            db.session.rollback()
            print("Error updating product:", e)
            return None
    return None


# Delete a product by ID
def delete_product(product_id):
    product = get_product_by_id(product_id)
    if product:
        db.session.delete(product)
        try:
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            print("Error deleting product:", e)
    return False


def process_csv(file_path):
    try:
        data = pd.read_csv(file_path, encoding='ISO-8859-1')
        for _, row in data.iterrows():
            # Validate and sanitize inputs, including URL validation for image_url
            image_url = row.get('image_url', '')
            if not is_valid_url(image_url):
                image_url = ''  # Optionally set to a default image URL if invalid
            
            new_product = Product(
                name=row['name'],
                subcategory_id=int(row['subcategory_id']),
                stock_level=max(0, int(row['stock_level'])),
                price=max(0, float(row['price'])),
                description=row.get('description', '')[:1000],
                specifications=row.get('specifications', '')[:1000],
                image_url=image_url
            )
            db.session.add(new_product)
        db.session.commit()
    except (SQLAlchemyError, ValueError, pd.errors.ParserError) as e:
        db.session.rollback()
        print(f"Error processing CSV file: {e}")

from datetime import datetime
from models import db, Promotion, Coupon

def create_promotion(product_id, discount_percentage, start_date, end_date):
    promotion = Promotion(
        product_id=product_id,
        discount_percentage=discount_percentage,
        start_date=start_date,
        end_date=end_date
    )
    db.session.add(promotion)
    db.session.commit()
    return promotion

def create_coupon(code, discount_percentage, user_tier, max_uses, expires_at):
    coupon = Coupon(
        code=code,
        discount_percentage=discount_percentage,
        user_tier=user_tier,
        max_uses=max_uses,
        expires_at=expires_at
    )
    db.session.add(coupon)
    db.session.commit()
    return coupon

def get_product_with_promotion(product_id):
    product = Product.query.get(product_id)
    promotion = Promotion.query.filter_by(
        product_id=product_id
    ).filter(
        Promotion.start_date <= datetime.utcnow(),
        Promotion.end_date >= datetime.utcnow()
    ).first()

    if promotion:
        product.discounted_price = product.price * (1 - promotion.discount_percentage / 100)
    else:
        product.discounted_price = product.price  # No promotion applied

    return product
