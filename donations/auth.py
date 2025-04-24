# donations/auth.py
import jwt
from functools import wraps
from flask import request, jsonify, current_app
import os
import requests

def token_required(f):
    """Decorator to validate Django JWT tokens"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('JWT ') or auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        # Also check for token in cookies or query parameters
        if not token and 'jwt' in request.cookies:
            token = request.cookies.get('jwt')
        
        if not token and 'token' in request.args:
            token = request.args.get('token')
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            # Decode the token using Django's JWT secret key
            jwt_secret = os.getenv('JWT_SECRET_KEY')
            data = jwt.decode(token, jwt_secret, algorithms=['HS256'])
            
            # You can use the user_id to fetch additional user data if needed
            user_id = data.get('user_id')
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
            
        # Pass the decoded user info to the route
        return f(data, *args, **kwargs)
    
    return decorated

def get_user_from_token(token):
    """Helper function to get user info from token"""
    try:
        jwt_secret = os.getenv('JWT_SECRET_KEY')
        data = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        user_id = data.get('user_id')
        
        # Optional: Use Django's API to get more user details
        # This assumes Django has an endpoint to fetch user profile data
        django_api_url = os.getenv('DJANGO_API_URL', 'http://localhost:8000')
        response = requests.get(
            f"{django_api_url}/api/users/{user_id}/",
            headers={"Authorization": f"JWT {token}"}
        )
        
        if response.status_code == 200:
            return response.json()
        return data
    except Exception as e:
        current_app.logger.error(f"Error getting user data: {str(e)}")
        return None