from rest_framework import viewsets, permissions, filters, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import CharityProject, Donation
from .serializers import CharityProjectSerializer, DonationSerializer, ProjectMinimalSerializer
from .permissions import IsOwnerOrReadOnly
from django.shortcuts import get_object_or_404


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