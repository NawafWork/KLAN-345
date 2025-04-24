from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CharityProjectViewSet
from . import views

router = DefaultRouter()
router.register('projects', CharityProjectViewSet, basename='charity')

urlpatterns = [
    path('', include(router.urls)),
    path('donations/', views.create_donation, name='create-donation'),
    path('donations/user/<int:user_id>/', views.user_donations, name='user-donations'),
    
    path('projects/user/<int:user_id>/', views.user_projects, name='user-projects'),
]