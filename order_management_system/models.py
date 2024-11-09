from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

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

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_per_unit = db.Column(db.Float, nullable=False)

class ReturnRequest(db.Model):
    __tablename__ = 'return_requests'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    reason = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), default='pending')  # pending, approved, refunded, replaced
    request_type = db.Column(db.String(50), nullable=False)  # refund or replacement
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Invoice(db.Model):
    __tablename__ = 'invoices'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
