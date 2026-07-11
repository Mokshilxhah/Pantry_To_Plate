from mongoengine import (
    Document, StringField, DateTimeField,
    DictField, IntField, BooleanField, ReferenceField, FloatField
)
from datetime import datetime


class WeeklyMealPlan(Document):
    """
    Stores the full 7-day meal plan for a kitchen.
    Each day holds a dict with breakfast / lunch / dinner,
    each being a sub-dict: { name, ingredients, time_required, notes }.
    Only one active plan per kitchen at a time (upsert on kitchen_id).
    """
    kitchen_id   = StringField(required=True)          # owner kitchen
    week_label   = StringField(default='')              # e.g. "Jun 2 – Jun 8"

    monday    = DictField(default=dict)
    tuesday   = DictField(default=dict)
    wednesday = DictField(default=dict)
    thursday  = DictField(default=dict)
    friday    = DictField(default=dict)
    saturday  = DictField(default=dict)
    sunday    = DictField(default=dict)

    is_ai_generated = BooleanField(default=False)
    version         = IntField(default=1)               # increment on regenerate

    target_calories = IntField(default=2000)
    target_protein = IntField(default=120)
    target_carbs = IntField(default=220)
    target_fat = IntField(default=65)

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'weekly_meal_plans',
        'indexes': ['kitchen_id'],
    }

    def to_dict(self):
        return {
            'id':             str(self.pk),
            'kitchen_id':     self.kitchen_id,
            'week_label':     self.week_label,
            'monday':         self.monday,
            'tuesday':        self.tuesday,
            'wednesday':      self.wednesday,
            'thursday':       self.thursday,
            'friday':         self.friday,
            'saturday':       self.saturday,
            'sunday':         self.sunday,
            'is_ai_generated': self.is_ai_generated,
            'version':        self.version,
            'target_calories': self.target_calories,
            'target_protein':  self.target_protein,
            'target_carbs':    self.target_carbs,
            'target_fat':      self.target_fat,
            'created_at':     self.created_at.isoformat() if self.created_at else None,
            'updated_at':     self.updated_at.isoformat() if self.updated_at else None,
        }


class MenuChangeRequest(Document):
    """A member can request a change to a specific meal in the weekly plan."""
    kitchen_id     = StringField(required=True)
    requested_by   = StringField(required=True)      # user ID
    requester_name = StringField(default='')
    day            = StringField(required=True)       # 'monday', 'tuesday', etc.
    meal_slot      = StringField(required=True)       # 'breakfast', 'lunch', 'dinner'
    current_meal   = StringField(default='')
    reason         = StringField(default='')
    suggestion     = StringField(default='')           # optional alternative
    status         = StringField(default='pending')    # 'pending', 'approved', 'declined'
    admin_response = StringField(default='')
    created_at     = DateTimeField(default=datetime.utcnow)
    resolved_at    = DateTimeField()

    meta = {
        'collection': 'menu_change_requests',
        'indexes': ['kitchen_id', 'status'],
        'ordering': ['-created_at'],
    }

    def to_dict(self):
        return {
            'id':             str(self.pk),
            'kitchen_id':     self.kitchen_id,
            'requested_by':   self.requested_by,
            'requester_name': self.requester_name,
            'day':            self.day,
            'meal_slot':      self.meal_slot,
            'current_meal':   self.current_meal,
            'reason':         self.reason,
            'suggestion':     self.suggestion,
            'status':         self.status,
            'admin_response': self.admin_response,
            'created_at':     self.created_at.isoformat() if self.created_at else None,
            'resolved_at':    self.resolved_at.isoformat() if self.resolved_at else None,
        }


class MealCompletionLog(Document):
    kitchen_id = StringField(required=True)
    day = StringField(required=True)
    slot = StringField(required=True)
    meal_name = StringField(required=True)
    calories = IntField(default=0)
    completed_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'meal_completion_logs',
        'indexes': ['kitchen_id', 'day', 'slot'],
    }

    def to_dict(self):
        return {
            'id': str(self.pk),
            'kitchen_id': self.kitchen_id,
            'day': self.day,
            'slot': self.slot,
            'meal_name': self.meal_name,
            'calories': self.calories,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class WaterIntakeLog(Document):
    user_id = ReferenceField('User', required=True)
    kitchen_id = StringField(required=True)
    amount = FloatField(required=True)  # in Liters
    logged_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'water_intake_logs',
        'indexes': ['user_id', 'kitchen_id'],
    }

    def to_dict(self):
        return {
            'id': str(self.pk),
            'user_id': str(self.user_id.id) if self.user_id else None,
            'kitchen_id': self.kitchen_id,
            'amount': self.amount,
            'logged_at': self.logged_at.isoformat() if self.logged_at else None
        }


class WeightLog(Document):
    user_id = ReferenceField('User', required=True)
    weight = FloatField(required=True)
    target_weight = FloatField(required=True)
    logged_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'weight_logs',
        'indexes': ['user_id', '-logged_at'],
    }

    def to_dict(self):
        return {
            'id': str(self.pk),
            'user_id': str(self.user_id.id) if self.user_id else None,
            'weight': self.weight,
            'target_weight': self.target_weight,
            'logged_at': self.logged_at.isoformat() if self.logged_at else None
        }


