# from django.shortcuts import render
# from django.contrib.auth.models import User
# from rest_framework import generics
# from .serializers import UserSerializer, ProjectSerializer
# from rest_framework.permissions import IsAuthenticated, AllowAny, SAFE_METHODS
# from .models import Project

# # Create your views here.

# # View to create a new user
# class CreateUserView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [AllowAny]
    

# # View to list all projects or create a new project
# class ProjectListCreateView(generics.ListCreateAPIView):
#     serializer_class = ProjectSerializer
#     permission_classes = [IsAuthenticated]
    
#     #def get_permissions(self):
#         # Allow any user to list projects, but require authentication to create a new project
#     #    if self.request.method in SAFE_METHODS:
#     #        return [AllowAny()]
#     #    return [IsAuthenticated()]
    
#     def get_queryset(self):
#         user = self.request.user
#         return Project.objects.all() # Can view all projects
#         #return Project.objects.filter(author=user) # Can only view projects created by the user
      

#     def perform_create(self, serializer):
#         # Automatically set the author to the currently logged-in user
#         if serializer.is_valid():    
#             serializer.save(author=self.request.user)
#         else:
#             print(serializer.errors)

# class ProjectDeleteView(generics.DestroyAPIView):
#     serializer_class = ProjectSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         queryset = Project.objects.filter(author=user)
#         print(f"User: {user}, Queryset: {queryset}")
#         return queryset

# # View to retrieve, update, or delete a specific project
# class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = Project.objects.all()
#     serializer_class = ProjectSerializer
#     #permission_classes = [IsAuthenticated]

#     def get_permissions(self):
#         # Allow any user to list projects, but require authentication to create a new project
#         if self.request.method in SAFE_METHODS:
#             return [AllowAny()]
#         return [IsAuthenticated()]