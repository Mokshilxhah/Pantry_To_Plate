from mongoengine import Document, StringField, ReferenceField, FloatField, DateTimeField, BooleanField, ListField, DictField, IntField
from datetime import datetime

class MasterItem(Document):
    name = StringField(required=True)
    slug = StringField(unique=True, sparse=True)  # For image mapping
    aliases = ListField(StringField())
    category = StringField(required=True)
    sub_category = StringField()
    default_unit = StringField()
    avg_shelf_life_days = IntField()
    storage_tip = StringField()
    nutrition_per_100g = DictField()
    diet_tags = ListField(StringField())
    allergen_tags = ListField(StringField())
    is_perishable = BooleanField(default=False)
    seasonal = StringField()
    barcode = StringField()
    hindi_name = StringField()
    gujarati_name = StringField()
    regional_names = DictField()
    image_url = StringField()  # URL to product image (local or S3)

    meta = {'collection': 'master_items'}

class PantryItem(Document):
    kitchen_id = ReferenceField('Kitchen', required=True)
    master_item_id = ReferenceField('MasterItem')
    name = StringField(required=True)
    category = StringField()
    sub_category = StringField()
    quantity = FloatField(required=True)
    unit = StringField(required=True)
    purchase_date = DateTimeField(default=datetime.utcnow)
    expiry_date = DateTimeField()
    best_before = DateTimeField()
    storage_location = StringField(choices=('refrigerator', 'freezer', 'shelf', 'bread_box', 'fruit_basket'))
    brand = StringField()
    notes = StringField()
    image_url = StringField()
    low_stock_threshold = FloatField()
    is_essential = BooleanField(default=False)
    added_by = ReferenceField('User')
    updated_by = ReferenceField('User')
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    status = StringField(choices=('fresh', 'expiring_soon', 'expired', 'low_stock'), default='fresh')

    meta = {'collection': 'pantry_items'}
