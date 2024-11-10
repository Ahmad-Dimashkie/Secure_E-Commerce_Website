from app import app
from models import db
from sqlalchemy import text

with app.app_context():
    # Drop all tables in the public schema using raw SQL
    db.session.execute(text('DROP SCHEMA public CASCADE;'))
    db.session.execute(text('CREATE SCHEMA public;'))
    db.session.commit()  # Commit the schema changes

    # Recreate all tables as defined in models.py
    db.create_all()
    print("Database reinitialized with PostgreSQL!")
