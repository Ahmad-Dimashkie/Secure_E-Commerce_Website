from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.orm import validates
from sqlalchemy.orm import relationship
db = SQLAlchemy()

######################################################################### User and Role Models #########################################################################
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)  # Increased length from 128 to 256
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "role_id": self.role_id,
            "created_at": self.created_at
        }

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
        }

#################################################################### Inventory and Product Models #########################################################################

class Inventory(db.Model):
    __tablename__ = 'inventory'
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    capacity = db.Column(db.Integer, default=100)
    threshold = db.Column(db.Integer, default=50)

    @validates('category_id', 'capacity', 'threshold')
    def validate_inventory_fields(self, key, value):
        if key in ['category_id', 'capacity', 'threshold'] and not isinstance(value, int):
            raise ValueError(f"{key} must be an integer")
        if key == 'capacity' and value < 0:
            raise ValueError("Stock level cannot be negative")
        if key == 'threshold' and value < 0:
            raise ValueError("Threshold cannot be negative")
        return value

    def to_dict(self):
        return {
            "id": self.id,
            "category_id": self.category_id,
            "capacity": self.capacity,
            "threshold": self.threshold,
        }

class Category(db.Model):
    __tablename__ = 'category'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
        }

class Product(db.Model):
    __tablename__ = 'product'
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    inventory_id = db.Column(db.Integer, db.ForeignKey('inventory.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    stock_level = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(255))
    discounted_price = db.Column(db.Float, nullable=True)
    promotion_id = db.Column(db.Integer, db.ForeignKey('promotion.id'), nullable=False)
    promotions = db.relationship('Promotion', backref='product', foreign_keys='Promotion.product_id')


    @validates('name', 'description', 'price', 'stock_level', 'discounted_price')
    def validate_product_fields(self, key, value):
        if key in ['price', 'discounted_price'] and (value is not None and value < 0):
            raise ValueError(f"{key} cannot be negative")
        if key == 'stock_level' and value < 0:
            raise ValueError("Stock level cannot be negative")
        return value

    def to_dict(self):
        return {
            "id": self.id,
            "category_id": self.category_id,
            "inventory_id": self.inventory_id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "stock_level": self.stock_level,
            "discounted_price": self.discounted_price,
            "image_url": self.image_url,
            "promotion_id": self.promotion_id,
        }

class Promotion(db.Model):
    __tablename__ = 'promotion'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    discount_percentage = db.Column(db.Float, nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)

    @validates('discount_percentage')
    def validate_discount_percentage(self, key, value):
        if value < 0 or value > 100:
            raise ValueError("Discount percentage must be between 0 and 100")
        return value

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
    code = db.Column(db.String(50), unique=True, nullable=False)
    discount_percentage = db.Column(db.Float, nullable=False)
    user_tier = db.Column(db.String(50), nullable=False)
    max_uses = db.Column(db.Integer, nullable=True)
    expires_at = db.Column(db.DateTime, nullable=False)

    @validates('code', 'discount_percentage', 'user_tier', 'max_uses')
    def validate_coupon_fields(self, key, value):
        if key == 'discount_percentage' and (value < 0 or value > 100):
            raise ValueError("Discount percentage must be between 0 and 100")
        if key == 'max_uses' and (value is not None and value < 0):
            raise ValueError("Max uses cannot be negative")
        return value

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "discount_percentage": self.discount_percentage,
            "user_tier": self.user_tier,
            "max_uses": self.max_uses,
            "expires_at": self.expires_at
        }


#################################################################### Order Management Models #########################################################################

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, default=1 ,nullable=False)
    status = db.Column(db.String(50), nullable=False, default='pending')  # Order statuses
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    total_amount = db.Column(db.Float, nullable=False, default=0.0)
    customer_email = db.Column(db.String(120), default="test@gmail.com", nullable=False)
    invoices = db.relationship('Invoice', backref='order', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'status': self.status,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'total_amount': self.total_amount,
            'customer_email': self.customer_email,
            'invoices': [invoice.to_dict() for invoice in self.invoices]
        }

class OrderDetail(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer,db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_per_unit = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'price_per_unit': self.price_per_unit
        }

class ReturnRequest(db.Model):
    __tablename__ = 'return_requests'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    reason = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), default='pending')  # pending, approved, refunded, replaced
    request_type = db.Column(db.String(50), nullable=False)  # refund or replacement
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'reason': self.reason,
            'status': self.status,
            'request_type': self.request_type,
            'created_at': self.created_at
        }

class Invoice(db.Model):
    __tablename__ = 'invoices'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'amount': self.amount,
            'generated_at': self.generated_at
        }
