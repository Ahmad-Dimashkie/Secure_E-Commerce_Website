from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Inventory(db.Model):
    __tablename__ = 'inventory'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, nullable=False)
    warehouse_id = db.Column(db.Integer, db.ForeignKey('warehouse.id'), nullable=False)
    stock_level = db.Column(db.Integer, default=0)
    threshold = db.Column(db.Integer, default=10)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "warehouse_id": self.warehouse_id,
            "stock_level": self.stock_level,
            "threshold": self.threshold,
            "last_updated": self.last_updated
        }

class Warehouse(db.Model):
    __tablename__ = 'warehouse'
    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(255), nullable=False)
    inventory_items = db.relationship('Inventory', backref='warehouse')

# Optional: Log alerts in a table if you want to display alerts on the dashboard
class Alert(db.Model):
    __tablename__ = 'alerts'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, nullable=False)
    warehouse_id = db.Column(db.Integer, nullable=False)
    alert_message = db.Column(db.Text, nullable=False)
    alert_time = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "warehouse_id": self.warehouse_id,
            "alert_message": self.alert_message,
            "alert_time": self.alert_time
        }
        

class Sales(db.Model):
    __tablename__ = 'sales'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, nullable=False)
    warehouse_id = db.Column(db.Integer, nullable=False)
    quantity_sold = db.Column(db.Integer, nullable=False)
    sale_date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "warehouse_id": self.warehouse_id,
            "quantity_sold": self.quantity_sold,
            "sale_date": self.sale_date
        }


class Category(db.Model):
    __tablename__ = 'category'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    subcategories = db.relationship('Subcategory', backref='category', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "subcategories": [sub.to_dict() for sub in self.subcategories]
        }

class Subcategory(db.Model):
    __tablename__ = 'subcategory'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    products = db.relationship('Product', backref='subcategory', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category_id": self.category_id
        }


class Product(db.Model):
    __tablename__ = 'product'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    subcategory_id = db.Column(db.Integer, db.ForeignKey('subcategory.id'), nullable=False)
    description = db.Column(db.Text)
    specifications = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)  # original price
    stock_level = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(255))
    discounted_price = db.Column(db.Float, nullable=True)  # Or db.Numeric if that's your preference

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "subcategory_id": self.subcategory_id,
            "description": self.description,
            "specifications": self.specifications,
            "price": self.price,
            "stock_level": self.stock_level,
            "discounted_price": self.discounted_price,
            "image_url": self.image_url
        }

        
class Promotion(db.Model):
    __tablename__ = 'promotion'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    discount_percentage = db.Column(db.Float, nullable=False)  # e.g., 10% discount
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "discount_percentage": self.discount_percentage,
            "start_date": self.start_date,
            "end_date": self.end_date
        }

class Coupon(db.Model):
    __tablename__ = 'coupon'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)  # e.g., "WELCOME10"
    discount_percentage = db.Column(db.Float, nullable=False)
    user_tier = db.Column(db.String(50), nullable=False)  # e.g., "regular", "premium"
    max_uses = db.Column(db.Integer, nullable=True)  # max uses allowed, null for unlimited
    expires_at = db.Column(db.DateTime, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "discount_percentage": self.discount_percentage,
            "user_tier": self.user_tier,
            "max_uses": self.max_uses,
            "expires_at": self.expires_at
        }
