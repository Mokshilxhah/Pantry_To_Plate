from rest_framework import serializers
from .models import ToBuyItem

class ToBuyItemSerializer(serializers.Serializer):
    id = serializers.CharField(source='id', read_only=True)
    name = serializers.CharField()
    quantity = serializers.FloatField(required=False)
    unit = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    category = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    is_urgent = serializers.BooleanField(default=False)
    is_purchased = serializers.BooleanField(default=False)
    assigned_to = serializers.CharField(required=False, allow_null=True)
    assigned_to_name = serializers.CharField(required=False, allow_blank=True)
    estimated_cost = serializers.FloatField(default=0.0)
    is_favorite = serializers.BooleanField(default=False)
    
    def create(self, validated_data):
        request = self.context.get('request')
        kitchen_id = request.user.kitchen_id
        
        item = ToBuyItem(
            kitchen_id=kitchen_id,
            added_by=request.user,
            **validated_data
        )
        item.save()
        return item
