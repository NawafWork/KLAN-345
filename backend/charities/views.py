from rest_framework import viewsets, permissions, filters, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import CharityProject, Donation
from .serializers import CharityProjectSerializer, DonationSerializer, ProjectMinimalSerializer
from .permissions import IsOwnerOrReadOnly
from django.shortcuts import get_object_or_404
from django.db import transaction
import uuid
from decimal import Decimal


class CharityProjectViewSet(viewsets.ModelViewSet):
    queryset = CharityProject.objects.all()
    serializer_class = CharityProjectSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['created_at', 'goal_amount', 'end_date']
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
            
        serializer.save()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_donations(request, user_id):
    if request.user.id != user_id:
        return Response(
            {"error": "Not authorized to view these donations"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    donations = Donation.objects.filter(user_id=user_id)
    serializer = DonationSerializer(donations, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_projects(request, user_id):
    if request.user.id != user_id:
        return Response(
            {"error": "Not authorized to view these projects"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    projects = CharityProject.objects.filter(created_by_id=user_id)
    serializer = CharityProjectSerializer(projects, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_donation(request):
    try:
        
        
        with transaction.atomic():
            project = get_object_or_404(CharityProject, id=request.data.get('project'))
            amount = Decimal(request.data.get('amount'))

            # Validate amount
            if amount <= 0:
                return Response(
                    {"message": "Amount must be greater than 0"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create donation
            donation = Donation.objects.create(
                user=request.user,
                project=project,
                amount=amount,
                transaction_id=str(uuid.uuid4())
            )

            # Update project amount raised
            project.amount_raised = project.amount_raised + amount
            project.save()

            # Send thank you email
            try:
                donation.send_thank_you_email()
            except Exception as e:
                print(f"Failed to send thank you email: {e}")

            # Check if goal reached and notify
            try:
                donation.check_and_notify_goal_reached()
            except Exception as e:
                print(f"Failed to send goal reached notification: {e}")

            serializer = DonationSerializer(donation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {"message": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )