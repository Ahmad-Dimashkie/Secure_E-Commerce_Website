from flask import request, jsonify
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Role, db

def authorize(*roles):
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            role = Role.query.get(user.role_id)
            if role.name not in roles:
                return jsonify({"error": "Unauthorized"}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator
