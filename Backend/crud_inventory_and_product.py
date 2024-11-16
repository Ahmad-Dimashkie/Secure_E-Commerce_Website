from models import db, Product, Inventory, Alert, Sales
from utils import send_low_stock_alert
from sqlalchemy import func
from datetime import datetime, timedelta
def get_inventory():
    return Inventory.query.all()

def create_inventory_item(product_id, warehouse_id, stock_level, threshold=10):
    new_item = Inventory(product_id=product_id, warehouse_id=warehouse_id, stock_level=stock_level, threshold=threshold)
    db.session.add(new_item)
    db.session.commit()
    return new_item


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
    
def delete_inventory_item(item_id):
    item = Inventory.query.get(item_id)
    if item:
        db.session.delete(item)
        db.session.commit()
        return True
    return False

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