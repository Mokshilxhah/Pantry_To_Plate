from mongoengine import Document, StringField, ReferenceField, DateTimeField
from datetime import datetime

class Alert(Document):
    kitchen_id = StringField(required=True)
    user_id = ReferenceField('User', required=True)
    title = StringField(required=True)
    description = StringField(default='')
    category = StringField(required=True, choices=('meals', 'water', 'grocery', 'health', 'system'))
    severity = StringField(choices=('critical', 'warning', 'info'), default='info')
    status = StringField(choices=('unread', 'read', 'snoozed', 'deleted'), default='unread')
    snoozed_until = DateTimeField()
    created_at = DateTimeField(default=datetime.utcnow)
    action = StringField(default='') # e.g. 'Use it', 'Evaluate', 'Plan Dining', 'Procure'
    action_item_name = StringField(default='') # e.g. 'Milk'

    meta = {
        'collection': 'alerts',
        'indexes': ['kitchen_id', 'status', 'category'],
        'ordering': ['-created_at']
    }
