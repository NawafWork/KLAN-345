# from django.contrib.auth.models import User
# from rest_framework import serializers
# from .models import Project

# #map python object to the corresponding code that needs to make change in the database
# #Use JSON to serialize the data
# #serializer is a class that converts complex data types, 
# #such as querysets and model instances, to native Python datatypes

# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ["id", "username", "password"]
#         #accept password when creating a new user
#         #but not when updating an existing user
#         extra_kwargs = {"password": {"write_only": True}} #password is write only, not readable

#     def create(self, validated_data):
#         #create a new user
#         print(validated_data)
#         user = User.objects.create_user(**validated_data)
#         return user
    
# class ProjectSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Project
#         fields = [
#             "id",
#             "title",
#             "description",
#             "goal_amount",
#             "amount_raised",
#             "percentage_completed",
#             "start_date",
#             "end_date",
#             "created_at",
#             "author"
#         ]
#         extra_kwargs = {
#             "author": {"read_only": True},  # author is read only
#             "percentage_completed": {"read_only": True},  # percentage_completed is read only
#         }
#         read_only_fields = ["id", "created_at", "percentage_completed", "author"]
        
#     def validate(self, data):
#         # Validate that the goal amount is greater than zero
#         if data.get("goal_amount") <= 0:
#             raise serializers.ValidationError("Goal amount must be greater than zero.")
        
#         # Validate that the end date is in the future
#         if data.get("end_date") <= data.get("start_date"):
#             raise serializers.ValidationError("End date must be after the start date.")
        
#         return data
    
#     def validate_title(self, value):
#         if not value.strip():  # Check if the title is empty or contains only whitespace
#             raise serializers.ValidationError("Title cannot be empty or whitespace.")
#         return value
    
#     def validate_description(self, value):
#         # Ensure the description is not empty or whitespace
#         if not value.strip():
#             raise serializers.ValidationError("Description cannot be empty or whitespace.")
#         return value