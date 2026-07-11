from rest_framework import serializers
from .models import Kitchen

class KitchenSerializer(serializers.Serializer):
    id = serializers.CharField(source='id', read_only=True)
    kitchen_name = serializers.CharField()
    invite_code = serializers.CharField(read_only=True)
    kitchen_type = serializers.CharField()
    default_diet_type = serializers.CharField()
    
    # We can add more fields if needed
