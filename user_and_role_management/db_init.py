from app import app
from models import db, User, Role
from werkzeug.security import generate_password_hash

# Start application context to initialize database operations
with app.app_context():
    # Step 1: Define Roles
    roles = [
        {"name": "Admin"},
        {"name": "Inventory Manager"},
        {"name": "Order Manager"},
        {"name": "Product Manager"}
    ]

    # Add roles to the database
    for role_data in roles:
        role = Role(name=role_data["name"])
        db.session.add(role)

    db.session.commit()
    print("Roles added successfully.")

    # Step 2: Define Users and Assign Roles
    # Assuming you have role_id values set after adding roles
    users = [
        {
            "username": "admin_user",
            "password": generate_password_hash("admin_password"),
            "role_id": 1  # Admin role
        },
        {
            "username": "inventory_manager",
            "password": generate_password_hash("inventory_password"),
            "role_id": 2  # Inventory Manager role
        },
        {
            "username": "order_manager",
            "password": generate_password_hash("order_password"),
            "role_id": 3  # Order Manager role
        },
        {
            "username": "support_user",
            "password": generate_password_hash("support_password"),
            "role_id": 4  # Customer Support role
        }
    ]

    # Add users to the database
    for user_data in users:
        user = User(
            username=user_data["username"],
            password_hash=user_data["password"],
            role_id=user_data["role_id"]
        )
        db.session.add(user)

    db.session.commit()
    print("Users added successfully.")
