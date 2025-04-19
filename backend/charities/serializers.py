from rest_framework import serializers
from .models import CharityProject
from accounts.serializers import UserSerializer

class CharityProjectSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = CharityProject
        fields = '__all__'
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
        return data
    
    def create(self, validated_data):
        # Set default value for amount_raised if not provided
        validated_data['amount_raised'] = validated_data.get('amount_raised', 0.00)
        return super().create(validated_data)