from rest_framework import serializers
from .models import Alert

class AlertSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    kitchen_id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True, default='')
    category = serializers.CharField()
    severity = serializers.CharField()
    status = serializers.CharField()
    snoozed_until = serializers.DateTimeField(required=False, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    action = serializers.CharField(required=False, allow_blank=True, default='')
    action_item_name = serializers.CharField(required=False, allow_blank=True, default='')

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Convert ReferenceField/id to string
        if hasattr(instance, 'user_id') and instance.user_id:
            ret['user_id'] = str(getattr(instance.user_id, 'id', instance.user_id))
        return ret
