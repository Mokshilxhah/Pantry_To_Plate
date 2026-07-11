from mongoengine import Document, StringField, ReferenceField, ListField, DateTimeField, DictField, IntField, BooleanField
from datetime import datetime

class Kitchen(Document):
    kitchen_name = StringField(required=True)
    admin_id = ReferenceField('User', required=True)
    member_ids = ListField(ReferenceField('User'))
    invite_code = StringField(unique=True, max_length=8)
    invite_code_expiry = DateTimeField()
    kitchen_type = StringField(choices=('nuclear', 'joint', 'couple', 'single'))
    default_diet_type = StringField(choices=('veg', 'nonveg', 'jain', 'upwas', 'mixed'))
    timezone = StringField(default='UTC')
    currency = StringField(default='INR')
    created_at = DateTimeField(default=datetime.utcnow)
    settings = DictField(default={
        'allow_member_delete': False,
        'alert_advance_days': 3,
        'low_stock_threshold': 2,
        'auto_buylist': True
    })

    meta = {'collection': 'kitchens'}
