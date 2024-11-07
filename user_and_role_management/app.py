from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from models import db, User, Role, Customer
from crud import create_user, get_user, create_role, assign_permission_to_role, get_customer_by_id
from auth import authorize
from config import Config
import logging
from werkzeug.security import check_password_hash
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

# Configure logging
logging.basicConfig(level=logging.INFO)

@app.route('/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        user = create_user(data['username'], data['password'], data['role_id'])
        logging.info(f"User '{user.username}' registered with role ID {user.role_id}")
        return jsonify(user.to_dict()), 201
    except Exception as e:
        logging.error(f"Error registering user: {e}")
        return jsonify({"error": "Error registering user"}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=user.id)
        logging.info(f"User '{user.username}' logged in")
        return jsonify(access_token=access_token), 200
    logging.warning(f"Invalid login attempt for user '{data['username']}'")
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/roles', methods=['POST'])
@jwt_required()
@authorize('Admin')
def create_role_endpoint():
    data = request.get_json()
    role = create_role(data['name'])
    logging.info(f"Role '{role.name}' created")
    return jsonify(role.to_dict()), 201

@app.route('/roles/<int:role_id>/permissions', methods=['POST'])
@jwt_required()
@authorize('Admin', 'Manager')
def add_permission(role_id):
    data = request.get_json()
    permission = assign_permission_to_role(role_id, data['permission_name'])
    logging.info(f"Permission '{permission.name}' added to role ID {role_id}")
    return jsonify({"message": "Permission added to role"}), 201

@app.route('/customers/<int:customer_id>', methods=['GET'])
@authorize('Admin', 'Customer Support')
@jwt_required()
def get_customer(customer_id):
    customer = get_customer_by_id(customer_id)
    if customer:
        return jsonify(customer.to_dict()), 200
    logging.warning(f"Customer with ID {customer_id} not found")
    return jsonify({"error": "Customer not found"}), 404

@app.route('/customer-segmentation', methods=['GET'])
@authorize('Admin', 'Customer Support')
@jwt_required()
def customer_segmentation():
    min_score = request.args.get('min_score', default=0.0, type=float)
    customers = Customer.query.filter(Customer.engagement_score >= min_score).all()
    logging.info(f"Retrieved {len(customers)} customers with engagement score >= {min_score}")
    return jsonify([customer.to_dict() for customer in customers]), 200

if __name__ == '__main__':
    app.run(debug=True)
