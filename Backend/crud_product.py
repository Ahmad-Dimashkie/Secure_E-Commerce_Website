
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from datetime import datetime, timedelta
from models import db, Product, Promotion, Coupon, Order, OrderDetail
from utils import is_valid_url
import pandas as pd
import os
from flask import jsonify


def create_product(name, category_id, inventory_id, description, price, stock_level=0, image_url=None, subcategory_id=None, specifications=None):
    try:
        # Validate and sanitize image_url for SSRF protection
        if image_url and not is_valid_url(image_url):
            raise ValueError("Invalid or untrusted URL for image")

        new_product = Product(
            name=name,
            category_id=int(category_id),
            inventory_id=int(inventory_id),
            description=description[:1000],
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
        required_columns = {'name', 'category_id', 'inventory_id', 'description', 'price', 'stock_level'}
        if not required_columns.issubset(data.columns):
            os.remove(file_path)  # Clean up
            return jsonify({"error": "CSV file is missing required columns"}), 400
        for _, row in data.iterrows():
            if not isinstance(row['name'], str) or len(row['name']) > 255:
                raise ValueError("Invalid product name")
            if not isinstance(row['description'], str) or len(row['description']) > 255:
                raise ValueError("Invalid product description")
            if not isinstance(row['price'], (int, float)) or row['price'] < 0:
                raise ValueError("Invalid price")
            if not isinstance(row['stock_level'], int) or row['stock_level'] < 0:
                raise ValueError("Invalid stock level")
            # Validate and sanitize inputs, including URL validation for image_url
            image_url = row.get('image_url', '')
            if not is_valid_url(image_url):
                image_url = ''  # Optionally set to a default image URL if invalid  
                 
            new_product = Product(
                name=row['name'],
                category_id=int(row['category_id']),
                inventory_id=int(row['inventory_id']),
                stock_level=max(0, int(row['stock_level'])),
                price=max(0, float(row['price'])),
                description=row.get('description', '')[:1000],
            )
            db.session.add(new_product)
        db.session.commit()
    except (SQLAlchemyError, ValueError, pd.errors.ParserError) as e:
        db.session.rollback()
        print(f"Error processing CSV file: {e}")


from sqlalchemy.exc import SQLAlchemyError

def create_promotion(product_id, discount_percentage, start_date, end_date):
    try:
        # Create a new promotion
        promotion = Promotion(
            product_id=product_id,
            discount_percentage=discount_percentage,
            start_date=start_date,
            end_date=end_date
        )
        db.session.add(promotion)
        db.session.flush()  # Ensures the promotion is assigned an ID before committing

        # Update the product's promotion_id field with the newly created promotion's ID
        product = db.session.query(Product).filter(Product.id == product_id).first()
        if product:
            product.promotion_id = promotion.id  # Link the promotion ID to the product
            product.discounted_price = ((100-discount_percentage)/100)*product.price
            db.session.commit()

        return promotion
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Error creating promotion: {e}")
        raise ValueError("Failed to create promotion and link it to product")  


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
    # Fetch the product with its promotions using the correct class-bound attribute
    product = db.session.query(Product).options(joinedload(Product.promotions)).filter(Product.id == product_id).first()
    
    if not product:
        return None

    # Get the current date and time
    current_time = datetime.utcnow()

    # Find an active promotion for this product (if any)
    active_promotion = db.session.query(Promotion).filter(
        Promotion.product_id == product_id,
        Promotion.start_date <= current_time,
        Promotion.end_date >= current_time
    ).first()

    # If there's an active promotion, calculate the discounted price
    if active_promotion:
        discount = active_promotion.discount_percentage
        product.discounted_price = product.price * (1 - discount / 100)
    else:
        # No active promotion; set discounted_price to None
        product.discounted_price = None

    return product


def get_most_popular_products(top_n=5, start_date=None, end_date=None):
    query = db.session.query(
        OrderDetail.product_id,
        func.sum(OrderDetail.quantity).label('total_quantity_sold')
    ).join(Order).filter(
        OrderDetail.order_id == Order.id
    )

    if start_date:
        query = query.filter(Order.created_at >= start_date)
    if end_date:
        query = query.filter(Order.created_at <= end_date)

    query = query.group_by(OrderDetail.product_id)
    query = query.order_by(func.sum(OrderDetail.quantity).desc())
    query = query.limit(top_n)

    results = query.all()

    # Fetch product details
    report = []
    for product_id, total_quantity_sold in results:
        product = Product.query.get(product_id)
        report.append({
            "product_id": product_id,
            "product_name": product.name if product else "Unknown",
            "total_quantity_sold": total_quantity_sold
        })

    return report

def predict_future_demand(product_id, past_days=30, future_days=30):
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=past_days)

    # Calculate total quantity sold for the product in the past period
    total_quantity_sold = db.session.query(
        func.sum(OrderDetail.quantity)
    ).join(Order).filter(
        OrderDetail.order_id == Order.id,
        OrderDetail.product_id == product_id,
        Order.created_at.between(start_date, end_date)
    ).scalar() or 0

    # Calculate average daily sales
    avg_daily_sales = total_quantity_sold / past_days

    # Predict future demand
    predicted_demand = avg_daily_sales * future_days

    return {
        "product_id": product_id,
        "average_daily_sales": avg_daily_sales,
        "predicted_demand_next_{}_days".format(future_days): predicted_demand
    }