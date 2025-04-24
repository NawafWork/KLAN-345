from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import CharityProject, Donation
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core import mail
from datetime import date
from PIL import Image
import io

User = get_user_model()

class CharityProjectTests(APITestCase):
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            first_name='Test',
            last_name='User' 
        )
        
        # Create test image
        image = Image.new('RGB', (100, 100), color='red')
        image_io = io.BytesIO()
        image.save(image_io, format='JPEG')
        self.test_image = SimpleUploadedFile(
            name='test.jpg',
            content=image_io.getvalue(),
            content_type='image/jpeg'
        )
        
        # Test charity data
        self.charity_data = {
            'title': 'Test Charity',
            'description': 'Test Description',
            'goal_amount': 1000.00,
            'image': self.test_image,
            'start_date': date.today(),
            'end_date': date.today(),
            'location': 'Test Location',
            'latitude': 40.7128,
            'longitude': -74.0060
        }
        
        # Create a test charity
        self.charity = CharityProject.objects.create(
            created_by=self.user,
            **{k: v for k, v in self.charity_data.items() if k != 'image'}
        )

        # API endpoints
        self.list_url = reverse('charity-list')
        self.detail_url = reverse('charity-detail', args=[self.charity.id])

    def test_create_charity(self):
        """Test creating a new charity project"""
        self.client.force_authenticate(user=self.user)
        
        # Create test image using PIL
        image = Image.new('RGB', (100, 100), color='red')
        image_io = io.BytesIO()
        image.save(image_io, format='JPEG')
        image_io.seek(0)
        test_image = SimpleUploadedFile(
            name='test.jpg',
            content=image_io.getvalue(),
            content_type='image/jpeg'
        )
        
        # Use data types that match your model fields
        data = {
            'title': 'Test Charity',
            'description': 'Test Description',
            'goal_amount': '1000.00',  # DecimalField expects string
            'image': test_image,
            'start_date': date.today().isoformat(),  # DateField expects string
            'end_date': date.today().isoformat(),
            'location': 'Test Location',
            'latitude': 40.7128,  # FloatField expects number
            'longitude': -74.0060,  # FloatField expects number
        }
        
        response = self.client.post(
            self.list_url,
            data=data,
            format='multipart'
        )
        
        # Debug information if test fails
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Response Data: {response.data}")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CharityProject.objects.count(), 2)
        
        # Verify created charity data
        created_charity = CharityProject.objects.last()
        self.assertEqual(created_charity.title, data['title'])
        self.assertEqual(created_charity.description, data['description'])
        self.assertEqual(float(created_charity.goal_amount), float(data['goal_amount']))
        self.assertIsNotNone(created_charity.image.name)

    def test_update_charity(self):
        """Test updating a charity"""
        self.client.force_authenticate(user=self.user)
        
        # Create a new test image for update
        image = Image.new('RGB', (100, 100), color='blue')
        image_io = io.BytesIO()
        image.save(image_io, format='JPEG')
        updated_image = SimpleUploadedFile(
            name='updated_test.jpg',
            content=image_io.getvalue(),
            content_type='image/jpeg'
        )
        
        updated_data = {
            'title': 'Updated Charity',
            'description': 'Updated Description',
            'image': updated_image
        }
        
        response = self.client.patch(
            self.detail_url,
            data=updated_data,
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], updated_data['title'])

    def test_list_charities(self):
        """Test listing all charities"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_charity(self):
        """Test retrieving a specific charity"""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.charity_data['title'])

    

    def test_delete_charity(self):
        """Test deleting a charity"""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CharityProject.objects.count(), 0)

    def test_unauthorized_create(self):
        """Test creating charity without authentication"""
        response = self.client.post(
            self.list_url,
            self.charity_data,
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthorized_update(self):
        """Test updating charity without authentication"""
        response = self.client.patch(
            self.detail_url,
            {'title': 'Unauthorized Update'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_search_charities(self):
        """Test searching charities"""
        response = self.client.get(f'{self.list_url}?search=Test')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class DonationTests(APITestCase):
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='donator',
            email='donator@example.com',
            password='TestPass123!',
            first_name='Test',
            last_name='Donator'
        )
        
        # Create a charity project for donations
        self.charity = CharityProject.objects.create(
            title='Test Project',
            description='Test Description',
            goal_amount=1000.00,
            start_date=date.today(),
            end_date=date.today(),
            location='Test Location',
            created_by=self.user
        )
        
        # API endpoint
        self.donation_url = reverse('create-donation')

    def test_create_donation(self):
        """Test creating a new donation"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'amount': '50.00',
            'project': self.charity.id
        }
        
        response = self.client.post(self.donation_url, data)
        
        # Debug information if test fails
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Response Data: {response.data}")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Donation.objects.count(), 1)
        
        # Verify donation data
        donation = Donation.objects.first()
        self.assertEqual(float(donation.amount), float(data['amount']))
        self.assertEqual(donation.project.id, data['project'])
        self.assertEqual(donation.user, self.user)
        
        # Verify project amount_raised was updated
        self.charity.refresh_from_db()
        self.assertEqual(float(self.charity.amount_raised), float(data['amount']))

    def test_unauthorized_donation(self):
        """Test making donation without authentication"""
        data = {
            'amount': '50.00',
            'project': self.charity.id
        }
        
        response = self.client.post(self.donation_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Donation.objects.count(), 0)

    def test_invalid_amount_donation(self):
        """Test donation with invalid amount"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'amount': '-50.00',  # Negative amount
            'project': self.charity.id
        }
        
        response = self.client.post(self.donation_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Donation.objects.count(), 0)

    def test_nonexistent_project_donation(self):
        """Test donation to non-existent project"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'amount': '50.00',
            'project': 99999  # Non-existent project ID
        }
        
        response = self.client.post(self.donation_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Donation.objects.count(), 0)

    def test_user_donation_list(self):
        """Test listing user's donations"""
        self.client.force_authenticate(user=self.user)
        
        # Create some donations
        Donation.objects.create(
            user=self.user,
            project=self.charity,
            amount=50.00,
            transaction_id='test_transaction_1'
        )
        Donation.objects.create(
            user=self.user,
            project=self.charity,
            amount=75.00,
            transaction_id='test_transaction_2'
        )
        
        url = reverse('user-donations', args=[self.user.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_donation_updates_project_amount(self):
        """Test that donation properly updates project amount_raised"""
        self.client.force_authenticate(user=self.user)
        initial_amount = float(self.charity.amount_raised)
        
        data = {
            'amount': '150.00',
            'project': self.charity.id
        }
        
        response = self.client.post(self.donation_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Refresh project from database
        self.charity.refresh_from_db()
        expected_amount = initial_amount + float(data['amount'])
        self.assertEqual(float(self.charity.amount_raised), expected_amount)



class EmailTest(TestCase):
    def test_send_email(self):
        mail.send_mail(
            'Test Subject',
            'Test Message',
            'from@example.com',
            ['to@example.com'],
            fail_silently=False,
        )
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, 'Test Subject')