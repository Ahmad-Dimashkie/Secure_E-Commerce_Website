from flask import Flask, request, jsonify, make_response
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt, get_jwt_identity
from models import db, User, Role, Customer
from crud import create_user, get_user, create_role, assign_permission_to_role, get_customer_by_id
from auth import authorize
from config import Config
import logging
from werkzeug.security import check_password_hash
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}) #specifically grant access to the frontend
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

# Configure logging
logging.basicConfig(level=logging.INFO)

#Register
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

#Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=user.id, additional_claims={"role_id": user.role_id})
        logging.info(f"User '{user.username}' logged in")

        refresh_token = create_refresh_token(identity=user.id)
        response = make_response(jsonify({"message": "Login successful"}))
        response.set_cookie("access_token", access_token, httponly=True, secure=True, samesite="Lax")
        response.set_cookie("refresh_token", refresh_token, httponly=True, secure=True, samesite="Lax")
        return response, 200
    logging.warning(f"Invalid login attempt for user '{data['username']}'")
    return jsonify({"error": "Invalid credentials"}), 401

#Validate token
@app.route('/validate-token', methods=['GET'])
@jwt_required()
def validate_token():
    claims = get_jwt()
    role_id = claims.get("role_id")
    return jsonify({"role": role_id}), 200

# Refresh token endpoint to generate a new access token using a valid refresh token
@app.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    response = make_response(jsonify({"message": "Token refreshed"}))
    response.set_cookie("access_token", new_access_token, httponly=True, secure=True, samesite="Lax")
    return response, 200

#Create a role
@app.route('/roles', methods=['POST'])
@jwt_required()
@authorize('Admin')
def create_role_endpoint():
    data = request.get_json()
    role = create_role(data['name'])
    logging.info(f"Role '{role.name}' created")
    return jsonify(role.to_dict()), 201

#Assign Permission to Role
@app.route('/roles/<int:role_id>/permissions', methods=['POST'])
@jwt_required()
@authorize('Admin')
def add_permission(role_id):
    data = request.get_json()
    permission = assign_permission_to_role(role_id, data['permission_name'])
    logging.info(f"Permission '{permission.name}' added to role ID {role_id}")
    return jsonify({"message": "Permission added to role"}), 201

#Decode Token
@jwt_required()
def decode_token():
    claims = get_jwt()
    return jsonify(claims), 200


if __name__ == '__main__':
    app.run(debug=True)
    