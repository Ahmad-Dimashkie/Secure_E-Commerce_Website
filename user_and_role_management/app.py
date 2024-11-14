from flask import Flask, request, jsonify, make_response
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt,
    get_jwt_identity,
    decode_token,
)
from models import db, User, Role
from crud import create_user, create_role, assign_permission_to_role
from auth import authorize
from config import Config
import logging
from werkzeug.security import check_password_hash
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
app.config.from_object(Config)

app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_ACCESS_COOKIE_NAME"] = "access_token"
app.config["JWT_REFRESH_COOKIE_NAME"] = "refresh_token"
app.config["JWT_COOKIE_CSRF_PROTECT"] = True  # Enable CSRF protection
app.config["JWT_ACCESS_CSRF_COOKIE_NAME"] = "csrf_access_token"
app.config["JWT_REFRESH_CSRF_COOKIE_NAME"] = "csrf_refresh_token"


# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

# Configure logging
logging.basicConfig(level=logging.INFO)

# Utility to set cookies
def set_cookie(response, name, value, max_age=None):
    response.set_cookie(
        name,
        value,
        httponly=True,
        secure=True,
        samesite="Lax",
        max_age=max_age,
    )

# Register
@app.route("/register", methods=["POST"])
def register_user():
    try:
        data = request.get_json()
        user = create_user(data["username"], data["password"], data["role_id"])
        logging.info(f"User '{user.username}' registered with role ID {user.role_id}")
        return jsonify(user.to_dict()), 201
    except Exception as e:
        logging.error(f"Error registering user: {e}")
        return jsonify({"error": "Error registering user"}), 500

# Login
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()
    if user and check_password_hash(user.password_hash, data["password"]):
        access_token = create_access_token(identity=user.id, additional_claims={"role_id": user.role_id})
        refresh_token = create_refresh_token(identity=user.id)

        # Decode tokens to extract CSRF tokens
        csrf_access_token = decode_token(access_token)["csrf"]
        csrf_refresh_token = decode_token(refresh_token)["csrf"]

        response = make_response(jsonify({"message": "Login successful"}))
        set_cookie(response, "access_token", access_token)
        set_cookie(response, "refresh_token", refresh_token)

        # Set CSRF tokens in cookies
        response.set_cookie("csrf_access_token", csrf_access_token, secure=True, samesite="Lax")
        response.set_cookie("csrf_refresh_token", csrf_refresh_token, secure=True, samesite="Lax")

        logging.info(f"User '{user.username}' logged in")
        return response, 200
    logging.warning(f"Invalid login attempt for user '{data['username']}'")
    return jsonify({"error": "Invalid credentials"}), 401

# Validate Token
@app.route("/validate-token", methods=["GET"])
@jwt_required()
def validate_token():
    try:
        claims = get_jwt()
        logging.info(f"JWT claims: {claims}")
        csrf_token = request.headers.get("X-CSRF-TOKEN")
        logging.info(f"Incoming CSRF Token: {csrf_token}")
        role_id = claims.get("role_id")
        return jsonify({"role": role_id}), 200
    except Exception as e:
        logging.error(f"Token validation error: {e}")
        return jsonify({"error": "Invalid or expired token"}), 401


# Refresh Token
@app.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    incoming_csrf = request.headers.get("X-CSRF-TOKEN")
    logging.info(f"Incoming CSRF Token: {incoming_csrf}")
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)

    # Decode the new token to extract CSRF
    csrf_access_token = decode_token(new_access_token)["csrf"]

    response = make_response(jsonify({"message": "Token refreshed"}))
    set_cookie(response, "access_token", new_access_token)

    # Add the new CSRF token in a cookie
    response.set_cookie("csrf_access_token", csrf_access_token, secure=True, samesite="Lax")

    return response, 200

# Logout
@app.route("/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({"message": "Logout successful"}))
    response.delete_cookie("access_token", samesite="Lax")
    response.delete_cookie("refresh_token", samesite="Lax")
    response.delete_cookie("csrf_access_token", samesite="Lax")
    response.delete_cookie("csrf_refresh_token", samesite="Lax")
    logging.info("User logged out")
    return response, 200

# Create a Role
@app.route("/roles", methods=["POST"])
@jwt_required()
@authorize("Admin")
def create_role_endpoint():
    data = request.get_json()
    role = create_role(data["name"])
    logging.info(f"Role '{role.name}' created")
    return jsonify(role.to_dict()), 201

# Assign Permission to Role
@app.route("/roles/<int:role_id>/permissions", methods=["POST"])
@jwt_required()
@authorize("Admin")
def add_permission(role_id):
    data = request.get_json()
    permission = assign_permission_to_role(role_id, data["permission_name"])
    logging.info(f"Permission '{permission.name}' added to role ID {role_id}")
    return jsonify({"message": "Permission added to role"}), 201

# JWT Exception Handler
@app.errorhandler(Exception)
def handle_exceptions(e):
    logging.error(f"Exception occurred: {e}")
    return jsonify({"error": "Something went wrong. Please try again later."}), 500

if __name__ == "__main__":
    app.run(debug=True)
