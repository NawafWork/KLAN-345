# Water Charity Application

A full-stack web application for water charity donations, built with Django and Flask.

## Tech Stack

- **Backend:** Django REST Framework (Charities and User Accounts) + Flask (Donations)
- **Database:** PostgreSQL
- **Authentication:** JWT with Djoser

## Local Development Setup

### Prerequisites

- Python 3.9+
- PostgreSQL 13+
- pip (Python package manager)

### Initial Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Water_charity_app
   ```

2. Set up a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r local_requirements.txt
   ```

4. Configure PostgreSQL:
   - Make sure PostgreSQL is running on your system
   - Create a database named 'charityweb' (will be created automatically by the run script)
   - The default credentials are (user: postgres, password: KLAN12345)
   - You can change these in the .env file

5. Update `.env` file with your local settings if needed
   - Check the database credentials
   - For email functionality, add your email credentials

### Running the Application Locally

Use the provided script to run both Django and Flask components:

```bash
python run_local.py
```

This will:
- Create the database if it doesn't exist
- Run Django migrations
- Start the Django server on port 8000
- Start the Flask server on port 5001

Alternatively, you can run each component separately:

**Django Backend:**
```bash
cd backend/backend
python manage.py runserver 0.0.0.0:8000
```

**Flask Donations App:**
```bash
export FLASK_APP=donations.app:create_app
export FLASK_ENV=development
flask run --host=0.0.0.0 --port=5001
```

### Accessing the Application

- Django Admin: http://localhost:8000/admin/
- API Endpoints: http://localhost:8000/api/
- Donations API: http://localhost:5001/donation/

## Docker Setup

To run the application using Docker:

```bash
docker-compose up -d
```

This will start all services:
- PostgreSQL database
- Django backend (port 8000)
- Flask donations app (port 5001)
- Nginx server (port 80)

## Database Migrations

To create new migrations:

```bash
cd backend/backend
python manage.py makemigrations
python manage.py migrate
```

## Running Tests

```bash
cd backend/backend
python manage.py test
```

## Project Structure

- `backend/`: Django application
  - `backend/`: Django project settings
  - `accounts/`: User authentication and profiles
  - `charities/`: Charity information and management
- `donations/`: Flask application for donation processing
- `nginx/`: Nginx configuration files
- `.env`: Environment configuration
- `docker-compose.yml`: Docker Compose configuration 