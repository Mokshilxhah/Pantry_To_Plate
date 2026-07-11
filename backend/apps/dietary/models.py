from mongoengine import Document, ReferenceField, ListField, StringField, IntField, DateTimeField
from datetime import datetime

class DietaryProfile(Document):
    user_id = ReferenceField('User', required=True)
    kitchen_id = ReferenceField('Kitchen', required=True)
    diet_type = ListField(StringField(choices=('veg', 'nonveg', 'jain', 'vegan', 'upwas', 'sattvic', 'eggetarian', 'keto', 'gluten_free', 'diabetic')))
    allergies = ListField(StringField())
    disliked_items = ListField(ReferenceField('MasterItem'))
    preferred_cuisines = ListField(StringField())
    calorie_goal = IntField()
    medical_restrictions = StringField()
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'dietary_profiles'}
