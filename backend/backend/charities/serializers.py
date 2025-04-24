from rest_framework import serializers
from .models import CharityProject, Donation
from accounts.serializers import UserSerializer

class CharityProjectSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CharityProject
        fields = [
            'id', 'title', 'description', 'goal_amount', 
            'amount_raised', 'created_by', 'latitude', 
            'longitude', 'location', 'image', 'image_url',
            'start_date', 'end_date'
        ]
        read_only_fields = ['amount_raised', 'created_by']

    def validate(self, data):
        """
        Check that start date is before end date.
        """
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError({
                    "end_date": "End date must be after start date."
                })
            
        if 'latitude' in data and 'longitude' in data:
            lat = data['latitude']
            lng = data['longitude']
            
            if not (-90 <= float(lat) <= 90):
                raise serializers.ValidationError({'latitude': 'Invalid latitude value'})
            
            if not (-180 <= float(lng) <= 180):
                raise serializers.ValidationError({'longitude': 'Invalid longitude value'})
        return data
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url  # Fallback to relative URL if no request
        return None
    
    def create(self, validated_data):
        # Set default value for amount_raised if not provided
        validated_data['amount_raised'] = validated_data.get('amount_raised', 0.00)
        return super().create(validated_data)
    

class ProjectMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = CharityProject
        fields = ['id', 'title', 'goal_amount', 'amount_raised']

class DonationSerializer(serializers.ModelSerializer):
    project = ProjectMinimalSerializer(read_only=True)
    
    class Meta:
        model = Donation
        fields = ['id', 'amount', 'date', 'transaction_id', 'project']