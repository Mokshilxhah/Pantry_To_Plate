from mongoengine import Document, StringField, DictField, DateTimeField, FloatField, ReferenceField
from datetime import datetime


class BudgetSettings(Document):
    """
    Stores per-kitchen monthly budget thresholds.
    categories : { "Vegetables": 3000, "Dairy": 2500, ... }
    items      : { "Milk": 1200, "Paneer": 800, ... }
    """
    kitchen_id  = StringField(required=True, unique=True)
    categories  = DictField(default=dict)
    items       = DictField(default=dict)
    updated_at  = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'budget_settings',
        'indexes':    ['kitchen_id'],
    }

    def to_dict(self):
        return {
            'kitchen_id': self.kitchen_id,
            'categories': self.categories,
            'items':      self.items,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class Expense(Document):
    kitchen_id  = StringField(required=True)
    name        = StringField(required=True)
    category    = StringField(required=True)
    amount      = FloatField(required=True)
    buyer_id    = ReferenceField('User', required=True)
    buyer_name  = StringField(required=True)
    date        = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'expenses',
        'indexes':    ['kitchen_id'],
    }

    def to_dict(self):
        return {
            'id':          str(self.id),
            'kitchen_id':  self.kitchen_id,
            'name':        self.name,
            'category':    self.category,
            'amount':      self.amount,
            'buyer_id':    str(self.buyer_id.id) if self.buyer_id else None,
            'buyer_name':  self.buyer_name,
            'date':        self.date.isoformat() if self.date else None,
        }
