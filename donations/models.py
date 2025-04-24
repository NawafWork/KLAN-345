# donations/models.py
from .extensions import db
from datetime import datetime

class Donation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(120))
    card_last4 = db.Column(db.String(4))
    stripe_payment_id = db.Column(db.String(100))
    save_card = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    receipt_sent = db.Column(db.Boolean, default=False)
    
    # Add relationship to Django User model if needed
    # django_user_id = db.Column(db.Integer)
    
    def __repr__(self):
        return f'<Donation {self.id} - ${self.amount}>'