from mongoengine import Document, StringField, ReferenceField, FloatField, BooleanField, DateTimeField, ListField
from datetime import datetime

class ToBuyItem(Document):
    kitchen_id = ReferenceField('Kitchen', required=True)
    master_item_id = ReferenceField('MasterItem')
    name = StringField(required=True)
    quantity = FloatField()
    unit = StringField()
    category = StringField()
    is_urgent = BooleanField(default=False)
    is_purchased = BooleanField(default=False)
    added_by = ReferenceField('User')
    purchased_by = ReferenceField('User')
    assigned_to = ReferenceField('User')
    assigned_to_name = StringField(default='')
    estimated_cost = FloatField(default=0.0)
    is_favorite = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'to_buy_items'}
