from flask import request, jsonify
from functools import wraps
from models import User, Role, db
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt  # Added get_jwt import

def authorize(required_roles=None):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            claims = get_jwt()
            role_id = claims.get("role_id")
            if required_roles and role_id not in required_roles:
                return jsonify({"error": "Unauthorized"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper