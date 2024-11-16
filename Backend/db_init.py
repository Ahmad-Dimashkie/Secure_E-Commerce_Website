from app import app  # Import your Flask app
from models import db, User, Role  # Import your models
from werkzeug.security import generate_password_hash
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

# Start application context to initialize database operations
with app.app_context():
    # Step 1: Create all tables
    try:
        db.create_all()
        logging.info("Database tables created successfully.")
    except Exception as e:
        logging.error(f"Error creating tables: {e}")

    # Step 2: Define and Add Roles
    try:
        roles = [
            {"name": "Admin"},
            {"name": "Product Manager"},
            {"name": "Order Manager"},
            {"name": "Inventory Manager"}
        ]

        for role_data in roles:
            role = Role(name=role_data["name"])
            db.session.add(role)

        db.session.commit()
        logging.info("Roles added successfully.")
    except Exception as e:
        logging.error(f"Error adding roles: {e}")

    # Step 3: Define and Add Users
    try:
        # Query the roles to get their IDs
        admin_role = Role.query.filter_by(name="Admin").first()
        product_manager_role = Role.query.filter_by(name="Product Manager").first()
        order_manager_role = Role.query.filter_by(name="Order Manager").first()
        inventory_manager_role = Role.query.filter_by(name="Inventory Manager").first()

        users = [
            {
                "username": "admin",
                "password": generate_password_hash("admin"),
                "role_id":  1,  # Admin role
            },
            {
                "username": "inventory_manager",
                "password": generate_password_hash("inventory_manager"),
                "role_id": 4,  # Inventory Manager role
            },
            {
                "username": "order_manager",
                "password": generate_password_hash("order_manager"),
                "role_id": 3,  # Order Manager role
            },
            {
                "username": "product_manager",
                "password": generate_password_hash("product_manager"),
                "role_id": 2,  # Product Manager role
            }
        ]

        for user_data in users:
            user = User(
                username=user_data["username"],
                password_hash=user_data["password"],
                role_id=user_data["role_id"],
            )
            db.session.add(user)

        db.session.commit()
        logging.info("Users added successfully.")
    except Exception as e:
        logging.error(f"Error adding users: {e}")
