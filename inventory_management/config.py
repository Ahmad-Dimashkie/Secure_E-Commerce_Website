import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI", "postgresql://postgres:Talineslim0303$@localhost/EcommerceWebsite")
