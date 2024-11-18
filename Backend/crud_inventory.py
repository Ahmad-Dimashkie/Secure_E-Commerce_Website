from models import db, Product, Inventory, Order, OrderDetail
from utils import send_low_stock_alert
from sqlalchemy import func
from datetime import datetime, timedelta
def get_inventory():
    return Inventory.query.all()

def create_inventory(category_id, capacity, threshold=50):
    new_item = Inventory(category_id=category_id,capacity=capacity, threshold=threshold)
    db.session.add(new_item)
    db.session.commit()
    return new_item


def get_inventory_by_id(inv_id):
    return Inventory.query.filter_by(id=inv_id).first()

def update_inventory(inv_id, capacity_change):
    inv = get_inventory_by_id(inv_id)
    if inv:
        inv.capacity -= capacity_change
        db.session.commit()
    else:
        return None
    
def delete_inventory_by_id(inv_id):
    inv = Inventory.query.get(inv_id)
    if inv:
        db.session.delete(inv)
        db.session.commit()
        return True
    return False

def get_low_stock_inventory():
    return Inventory.query.filter(Inventory.capacity < Inventory.threshold).all()


def calculate_inventory_turnover(days=30):
    # Define the time period
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)

    # Calculate Total Sales (COGS)
    total_sales = db.session.query(
        func.sum(OrderDetail.quantity * OrderDetail.price_per_unit)
    ).join(Order).filter(
        Order.created_at.between(start_date, end_date)
    ).scalar() or 0

    # Calculate Average Inventory
    # For simplicity, using the average of beginning and ending inventory capacities
    beginning_inventory = db.session.query(func.sum(Inventory.capacity)).scalar() or 0

    # Assuming no inventory records over time, so ending inventory is same as current inventory
    ending_inventory = beginning_inventory

    average_inventory = (beginning_inventory + ending_inventory) / 2 if beginning_inventory else 0

    # Calculate Inventory Turnover Ratio
    inventory_turnover = (total_sales / average_inventory) if average_inventory else None

    return {
        "total_sales": total_sales,
        "average_inventory": average_inventory,
        "inventory_turnover": inventory_turnover
    }

# def get_most_popular_products(top_n=5):
#     # Query total quantity sold per product
#     popular_products = db.session.query(
#         Sales.product_id,
#         func.sum(Sales.quantity_sold).label('total_quantity_sold')
#     ).group_by(Sales.product_id).order_by(func.sum(Sales.quantity_sold).desc()).limit(top_n).all()

#     report = []
#     for product in popular_products:
#         report.append({
#             "product_id": product.product_id,
#             "total_quantity_sold": product.total_quantity_sold
#         })

#     return report

# def predict_future_demand(product_id, days=30):
#     # Calculate the average quantity sold per day for the past N days
#     end_date = datetime.utcnow()
#     start_date = end_date - timedelta(days=days)

#     avg_sales = db.session.query(
#         func.avg(Sales.quantity_sold)
#     ).filter(Sales.product_id == product_id, Sales.sale_date.between(start_date, end_date)).scalar()

#     # Prediction for the next period (e.g., 30 days)
#     if avg_sales:
#         future_demand = avg_sales * days
#     else:
#         future_demand = 0

#     return {
#         "product_id": product_id,
#         "predicted_demand_next_30_days": future_demand
#     }