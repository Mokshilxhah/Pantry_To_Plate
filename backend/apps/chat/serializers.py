from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    sender_name = serializers.CharField()
    sender_id = serializers.CharField(read_only=True)
    message_type = serializers.CharField()
    text = serializers.CharField(required=False, allow_blank=True, default='')
    image_url = serializers.CharField(required=False, allow_blank=True, default='')
    file_url = serializers.CharField(required=False, allow_blank=True, default='')
    file_name = serializers.CharField(required=False, allow_blank=True, default='')
    poll_question = serializers.CharField(required=False, allow_blank=True, default='')
    poll_options = serializers.ListField(required=False)
    voted_by = serializers.ListField(child=serializers.CharField(), required=False)
    is_pinned = serializers.BooleanField(required=False)
    pinned_by = serializers.CharField(read_only=True)
    pinned_at = serializers.DateTimeField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        sender_user = None
        if hasattr(instance, 'sender_id') and instance.sender_id:
            sender_user = instance.sender_id
            
        ret['sender_id'] = str(getattr(sender_user, 'id', sender_user)) if sender_user else ''
        ret['userId'] = ret['sender_id']
        
        # Populate 'user' dict for frontend compatibility
        if sender_user:
            ret['user'] = {
                'id': ret['sender_id'],
                'fullName': getattr(sender_user, 'full_name', '') or getattr(instance, 'sender_name', 'Family Member'),
                'role': getattr(sender_user, 'role', 'member')
            }
        else:
            ret['user'] = {
                'id': '',
                'fullName': getattr(instance, 'sender_name', 'Family Member'),
                'role': 'member'
            }
            
        # Support camelCase timestamp fields
        ret['timestamp'] = instance.created_at.isoformat() if hasattr(instance, 'created_at') and instance.created_at else ''
        
        if hasattr(instance, 'pinned_by') and instance.pinned_by:
            ret['pinned_by'] = str(getattr(instance.pinned_by, 'id', instance.pinned_by))

        # Populate poll options with voter details
        if instance.message_type == 'poll' and instance.poll_options:
            try:
                # Get all users in this kitchen to build a quick lookup map
                from apps.auth_app.models import User
                users = User.objects(kitchen_id=instance.kitchen_id)
                user_map = {str(u.id): u.full_name or "Family Member" for u in users}
                
                serialized_options = []
                for opt in instance.poll_options:
                    voters_list = opt.get('voters', [])
                    voter_details = []
                    for voter_id in voters_list:
                        voter_id_str = str(voter_id)
                        voter_details.append({
                            'id': voter_id_str,
                            'fullName': user_map.get(voter_id_str, "Family Member")
                        })
                    
                    serialized_options.append({
                        'text': opt.get('text', ''),
                        'votes': len(voters_list) if 'voters' in opt else int(opt.get('votes', 0)),
                        'voters': voter_details
                    })
                ret['poll_options'] = serialized_options
            except Exception:
                pass

        return ret
