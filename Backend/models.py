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
    product_id = db.Column(db.Integer, nullable=False)
    warehouse_id = db.Column(db.Integer, db.ForeignKey('warehouse.id'), nullable=False)
    stock_level = db.Column(db.Integer, default=0)
    threshold = db.Column(db.Integer, default=10)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    @validates('product_id', 'warehouse_id', 'stock_level', 'threshold')
    def validate_inventory_fields(self, key, value):
        if key in ['product_id', 'warehouse_id', 'stock_level', 'threshold'] and not isinstance(value, int):
            raise ValueError(f"{key} must be an integer")
        if key == 'stock_level' and value < 0:
            raise ValueError("Stock level cannot be negative")
        if key == 'threshold' and value < 0:
            raise ValueError("Threshold cannot be negative")
        return value

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

# Alert class with validations
class Alert(db.Model):
    __tablename__ = 'alerts'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, nullable=False)
    warehouse_id = db.Column(db.Integer, nullable=False)
    alert_message = db.Column(db.Text, nullable=False)
    alert_time = db.Column(db.DateTime, default=datetime.utcnow)

    @validates('alert_message')
    def validate_alert_message(self, key, value):
        if not value:
            raise ValueError("Alert message cannot be empty")
        return value

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

    @validates('quantity_sold')
    def validate_quantity_sold(self, key, value):
        if value < 0:
            raise ValueError("Quantity sold cannot be negative")
        return value

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
    price = db.Column(db.Float, nullable=False)
    stock_level = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(255))
    discounted_price = db.Column(db.Float, nullable=True)
    promotions = relationship('Promotion', backref='product', lazy=True)


    @validates('name', 'description', 'specifications', 'price', 'stock_level', 'discounted_price')
    def validate_product_fields(self, key, value):
        if key in ['price', 'discounted_price'] and (value is not None and value < 0):
            raise ValueError(f"{key} cannot be negative")
        if key == 'stock_level' and value < 0:
            raise ValueError("Stock level cannot be negative")
        return value

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
    customer_id = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='pending')  # Order statuses
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    total_amount = db.Column(db.Float, nullable=False, default=0.0)
    customer_email = db.Column(db.String(120), nullable=False)
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")
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
            'items': [item.to_dict() for item in self.items],
            'invoices': [invoice.to_dict() for invoice in self.invoices]
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
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
