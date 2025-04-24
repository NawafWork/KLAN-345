#!/usr/bin/env python
"""
Local development script for Water Charity App.
This script sets up and runs the Django backend and Flask donations app.
"""
import os
import subprocess
import sys
import time
from pathlib import Path
import signal
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Environment variables for local development
os.environ["DJANGO_SETTINGS_MODULE"] = "backend.settings_dev"

def setup_database():
    """Create PostgreSQL database if it doesn't exist"""
    db_name = os.getenv("DB_NAME", "charityweb")
    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD", "KLAN12345")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    
    # Connect to PostgreSQL server
    try:
        conn = psycopg2.connect(
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
        exists = cursor.fetchone()
        
        if not exists:
            print(f"Creating database '{db_name}'...")
            cursor.execute(f"CREATE DATABASE {db_name}")
            print(f"Database '{db_name}' created successfully!")
        else:
            print(f"Database '{db_name}' already exists")
            
        cursor.close()
        conn.close()
        
        return True
    except Exception as e:
        print(f"Error setting up database: {e}")
        return False

def run_django():
    """Run Django development server"""
    django_cmd = [
        sys.executable, 
        "backend/backend/manage.py", 
        "runserver", 
        "0.0.0.0:8000"
    ]
    
    env = os.environ.copy()
    env["PYTHONPATH"] = os.path.join(os.getcwd(), "backend")
    
    return subprocess.Popen(django_cmd, env=env)

def run_flask():
    """Run Flask development server"""
    flask_env = os.environ.copy()
    flask_env["FLASK_APP"] = "donations.app:create_app"
    flask_env["FLASK_ENV"] = "development"
    
    flask_cmd = [
        sys.executable, 
        "-m", 
        "flask", 
        "run", 
        "--host=0.0.0.0",
        "--port=5001"
    ]
    
    return subprocess.Popen(flask_cmd, env=flask_env)

def main():
    """Main function to run the application"""
    print("Setting up Water Charity App for local development...")
    
    # Setup database
    if not setup_database():
        print("Failed to setup database. Please check PostgreSQL is running.")
        return
    
    # Run Django migrations
    print("Running Django migrations...")
    subprocess.run([
        sys.executable, 
        "backend/backend/manage.py", 
        "migrate"
    ], check=True)
    
    # Start Django and Flask servers
    print("Starting Django server...")
    django_process = run_django()
    
    print("Starting Flask server...")
    flask_process = run_flask()
    
    print("\n===================================")
    print("🚀 Water Charity App is running!")
    print("===================================")
    print("Django: http://localhost:8000")
    print("Flask: http://localhost:5001")
    print("\nPress Ctrl+C to stop all servers")
    
    # Handle clean shutdown
    def signal_handler(sig, frame):
        print("\nShutting down servers...")
        django_process.terminate()
        flask_process.terminate()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    # Keep the script running
    try:
        django_process.wait()
        flask_process.wait()
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main() 