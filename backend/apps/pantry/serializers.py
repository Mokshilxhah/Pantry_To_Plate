from rest_framework import serializers
from .models import PantryItem, MasterItem

class MasterItemSerializer(serializers.Serializer):
    id = serializers.CharField(source='id', read_only=True)
    name = serializers.CharField()
    category = serializers.CharField()
    unit = serializers.CharField(source='default_unit')
    image_url = serializers.CharField(required=False)

class PantryItemSerializer(serializers.Serializer):
    id = serializers.CharField(source='id', read_only=True)
    master_item_id = serializers.CharField(required=False, allow_null=True)
    name = serializers.CharField()
    category = serializers.CharField()
    quantity = serializers.FloatField()
    unit = serializers.CharField()
    expiry_date = serializers.DateTimeField(required=False, allow_null=True)
    storage_location = serializers.CharField()
    status = serializers.CharField(read_only=True)

    def create(self, validated_data):
        request = self.context.get('request')
        kitchen_id = request.user.kitchen_id
        
        master_id = validated_data.pop('master_item_id', None)
        if master_id:
            master = MasterItem.objects(id=master_id).first()
            validated_data['master_item_id'] = master
            
        item = PantryItem(
            kitchen_id=kitchen_id,
            added_by=request.user,
            **validated_data
        )
        item.save()
        return item
