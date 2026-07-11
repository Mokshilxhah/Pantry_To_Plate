from mongoengine import Document, StringField, ReferenceField, DateTimeField, ListField, DictField, BooleanField
from datetime import datetime

class Message(Document):
    kitchen_id = ReferenceField('Kitchen', required=True)
    sender_id = ReferenceField('User', required=True)
    sender_name = StringField(required=True)
    
    # Message type: 'text' | 'image' | 'poll' | 'system' | 'file' | 'audio'
    message_type = StringField(choices=('text', 'image', 'poll', 'system', 'file', 'audio'), default='text')
    
    # Text contents (also used for system messages, poll descriptions, or image captions)
    text = StringField(default='')
    
    # Image URL if message_type == 'image'
    image_url = StringField(default='')

    # File details if message_type == 'file'
    file_url = StringField(default='')
    file_name = StringField(default='')
    
    # Poll fields
    poll_question = StringField(default='')
    poll_options = ListField(DictField()) # [{"text": "Pizza", "votes": 0}]
    voted_by = ListField(StringField()) # user IDs who voted
    
    # Pinned status
    is_pinned = BooleanField(default=False)
    pinned_by = ReferenceField('User')
    pinned_at = DateTimeField()

    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'messages',
        'ordering': ['created_at'],
        'indexes': ['kitchen_id', 'is_pinned']
    }
