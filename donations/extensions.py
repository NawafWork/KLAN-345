# donations/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
import stripe
import os

# Initialize extensions
db = SQLAlchemy()
mail = Mail()

# Configure Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')