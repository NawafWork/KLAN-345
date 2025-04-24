# donations/app.py
from flask import Flask
from .extensions import db, mail
from dotenv import load_dotenv
import os
import logging

# Load environment variables
load_dotenv()

def create_app(config=None):
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Configure app
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-for-testing')
    
    # Configure PostgreSQL database
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 
                                                     'postgresql://postgres:KLAN12345@localhost/charityweb')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Set up email for receipts
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@watercharity.org')
    
    # Apply any provided config
    if config:
        app.config.update(config)
    
    # Set up logging
    logging.basicConfig(level=logging.INFO)
    app.logger.info("Starting Flask donations app...")
    app.logger.info(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    # Initialize extensions with app
    db.init_app(app)
    mail.init_app(app)
    
    # Register blueprints
    from .routes import donations_bp
    app.register_blueprint(donations_bp, url_prefix='/donation')
    
    # Create database tables
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("Database tables created successfully")
        except Exception as e:
            app.logger.error(f"Error creating database tables: {e}")
    
    return app

# For running directly
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)