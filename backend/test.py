from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from unittest.mock import patch

User = get_user_model()

class AuthenticationTests(APITestCase):
    def setUp(self):
        """Set up test data"""
        self.login_url = '/auth/jwt/create/'
        self.register_url = '/auth/users/'
        self.test_users = [
            {
                'username': 'testuser1',
                'email': 'test1@example.com',
                'password': 'TestPass123!',
                're_password': 'TestPass123!',
                'first_name': 'Test1',
                'last_name': 'User1'
            },
            {
                'username': 'testuser2',
                'email': 'test2@example.com',
                'password': 'TestPass456!',
                're_password': 'TestPass456!',
                'first_name': 'Test2',
                'last_name': 'User2'
            }
        ]
        self.user_data = self.test_users[0]
        self.login_data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }

    def test_user_registration_success(self):
        """Test successful user registration"""
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email=self.user_data['email']).exists())

    def test_user_registration_weak_password(self):
        """Test registration with weak password"""
        weak_password_data = self.user_data.copy()
        weak_password_data['password'] = '123'
        weak_password_data['re_password'] = '123'
        response = self.client.post(self.register_url, weak_password_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_password_mismatch(self):
        """Test registration with mismatched passwords"""
        mismatch_data = self.user_data.copy()
        mismatch_data['re_password'] = 'DifferentPass123!'
        response = self.client.post(self.register_url, mismatch_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        """Test successful login"""
        User.objects.create_user(**{k: v for k, v in self.user_data.items() 
                                if k not in ['re_password']})
        response = self.client.post(self.login_url, self.login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_login_wrong_credentials(self):
        """Test login with wrong credentials"""
        User.objects.create_user(**{k: v for k, v in self.user_data.items() 
                                if k not in ['re_password']})
        wrong_data = {
            'username': self.login_data['username'],
            'password': 'WrongPass123!'
        }
        response = self.client.post(self.login_url, wrong_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_password_reset_request(self):
        """Test password reset request"""
        User.objects.create_user(**{k: v for k, v in self.user_data.items() 
                                if k not in ['re_password']})
        response = self.client.post('/auth/users/reset_password/', 
                                {'email': self.user_data['email']}, 
                                format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_protected_endpoint_access(self):
        """Test accessing protected endpoint"""
        user = User.objects.create_user(**{k: v for k, v in self.user_data.items() 
                                        if k not in ['re_password']})
        response = self.client.post(self.login_url, self.login_data, format='json')
        token = response.data['access']
        
        # Test without token
        response = self.client.get('/auth/users/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Test with token
        self.client.credentials(HTTP_AUTHORIZATION=f'JWT {token}')
        response = self.client.get('/auth/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_token_refresh(self):
        """Test JWT token refresh"""
        User.objects.create_user(**{k: v for k, v in self.user_data.items() 
                                if k not in ['re_password']})
        response = self.client.post(self.login_url, self.login_data, format='json')
        refresh_token = response.data['refresh']
        
        response = self.client.post('/auth/jwt/refresh/', {'refresh': refresh_token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_multiple_user_registration(self):
        """Test registering multiple users"""
        for user_data in self.test_users:
            response = self.client.post(self.register_url, user_data, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertTrue(User.objects.filter(email=user_data['email']).exists())

    def test_duplicate_registration(self):
        """Test attempting to register with duplicate username/email"""
        # Register first user
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Attempt to register with same username
        duplicate_user = self.user_data.copy()
        duplicate_user['email'] = 'different@example.com'
        response = self.client.post(self.register_url, duplicate_user, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)