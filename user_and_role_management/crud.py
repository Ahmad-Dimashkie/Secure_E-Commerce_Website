from models import db, User, Role, Permission, Customer
from werkzeug.security import generate_password_hash, check_password_hash
import logging

def create_user(username, password, role_id):
    try:
        password_hash = generate_password_hash(password)
        user = User(username=username, password_hash=password_hash, role_id=role_id)
        db.session.add(user)
        db.session.commit()
        return user
    except Exception as e:
        logging.error(f"Failed to create user '{username}': {e}")
        return None

def get_user(user_id):
    return User.query.get(user_id)

def create_role(name):
    try:
        role = Role(name=name)
        db.session.add(role)
        db.session.commit()
        return role
    except Exception as e:
        logging.error(f"Failed to create role '{name}': {e}")
        return None

def assign_permission_to_role(role_id, permission_name):
    try:
        permission = Permission(name=permission_name, role_id=role_id)
        db.session.add(permission)
        db.session.commit()
        return permission
    except Exception as e:
        logging.error(f"Failed to assign permission '{permission_name}' to role ID {role_id}: {e}")
        return None

def get_customer_by_id(customer_id):
    return Customer.query.get(customer_id)
