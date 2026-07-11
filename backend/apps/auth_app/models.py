from mongoengine import Document, StringField, EmailField, BooleanField, DateTimeField, ListField, DictField, ReferenceField, IntField, FloatField
from datetime import datetime, timedelta
import random
import string

class User(Document):
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    full_name = StringField(required=True)
    phone = StringField()
    profile_photo = StringField()
    role = StringField(choices=('admin', 'member'), default='member')
    kitchen_id = ReferenceField('Kitchen')
    dietary_profile_id = ReferenceField('DietaryProfile')
    is_verified = BooleanField(default=False)
    is_active = BooleanField(default=True)
    last_login = DateTimeField()
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    device_tokens = ListField(StringField())
    notification_preferences = DictField(default={'email': True, 'push': True, 'in_app': True})
    # Subscription fields
    subscription_plan = StringField(choices=('free', 'pro', 'premium'), default='free')
    subscription_end_date = DateTimeField()
    # Brute-force lockout fields
    login_attempts = IntField(default=0)
    lockout_time = DateTimeField(null=True)
    
    meta = {'collection': 'users'}


# ──────────────────────────────────────────────────────────────────────
#  OTP MODEL FOR FORGOT PASSWORD
# ──────────────────────────────────────────────────────────────────────
class OTPToken(Document):
    """OTP tokens for password reset and email verification"""
    email = EmailField(required=True)
    otp_code = StringField(required=True, unique=True)
    purpose = StringField(choices=('password_reset', 'email_verification'), default='password_reset')
    is_used = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)
    expires_at = DateTimeField()
    attempts = IntField(default=0)
    max_attempts = IntField(default=5)
    
    meta = {'collection': 'otp_tokens'}
    
    @classmethod
    def generate_otp(cls, email, purpose='password_reset'):
        """Generate a new OTP for the user with 60-second cooldown rate limit"""
        last_otp = cls.objects(email=email, purpose=purpose).order_by('-created_at').first()
        if last_otp:
            now = datetime.utcnow()
            elapsed = (now - last_otp.created_at).total_seconds()
            if elapsed < 60:
                raise ValueError("Please wait 60 seconds before requesting another verification code.")

        otp_code = ''.join(random.choices(string.digits, k=6))
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        # Invalidate previous OTPs for this email
        cls.objects(email=email, purpose=purpose, is_used=False).update(set__is_used=True)
        
        otp = cls(
            email=email,
            otp_code=otp_code,
            purpose=purpose,
            expires_at=expires_at
        )
        otp.save()
        return otp_code
    
    def verify(self, code):
        """Verify OTP code"""
        if self.is_used or datetime.utcnow() > self.expires_at:
            return False
        if self.attempts >= self.max_attempts:
            return False
        if self.otp_code != code:
            self.attempts += 1
            self.save()
            return False
        self.is_used = True
        self.save()
        return True


# ──────────────────────────────────────────────────────────────────────
#  SUBSCRIPTION MODELS
# ──────────────────────────────────────────────────────────────────────
class SubscriptionPlan(Document):
    """Available subscription plans"""
    name = StringField(required=True, choices=('free', 'pro', 'premium'))
    display_name = StringField(required=True)
    price = FloatField(required=True)
    currency = StringField(default='INR')
    max_members = IntField(required=True)
    features = DictField(default={
        'meal_planning': False,
        'shopping_list': False,
        'recipe_sharing': False,
        'meal_suggestions': False,
        'family_alerts': False,
    })
    billing_cycle = StringField(choices=('monthly', 'annual'), default='monthly')
    created_at = DateTimeField(default=datetime.utcnow)
    
    meta = {'collection': 'subscription_plans'}


class Subscription(Document):
    """User subscription records"""
    user_id = ReferenceField(User, required=True)
    kitchen_id = ReferenceField('Kitchen')
    plan = ReferenceField(SubscriptionPlan, required=True)
    status = StringField(choices=('active', 'cancelled', 'expired', 'pending'), default='active')
    start_date = DateTimeField(default=datetime.utcnow)
    end_date = DateTimeField()
    auto_renew = BooleanField(default=True)
    payment_method = StringField(choices=('razorpay', 'manual'), default='razorpay')
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {'collection': 'subscriptions'}


class Payment(Document):
    """Payment records"""
    subscription_id = ReferenceField(Subscription, required=True)
    user_id = ReferenceField(User, required=True)
    amount = FloatField(required=True)
    currency = StringField(default='INR')
    payment_id = StringField(unique=True)
    order_id = StringField()
    status = StringField(choices=('pending', 'completed', 'failed', 'refunded'), default='pending')
    payment_method = StringField(choices=('razorpay', 'demo'), default='demo')
    receipt_url = StringField()
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {'collection': 'payments'}


class Invoice(Document):
    """Invoice generation for payments"""
    payment_id = ReferenceField(Payment, required=True)
    subscription_id = ReferenceField(Subscription)
    user_id = ReferenceField(User, required=True)
    invoice_number = StringField(unique=True)
    amount = FloatField(required=True)
    currency = StringField(default='INR')
    period_start = DateTimeField()
    period_end = DateTimeField()
    issued_date = DateTimeField(default=datetime.utcnow)
    due_date = DateTimeField()
    status = StringField(choices=('draft', 'issued', 'paid', 'cancelled'), default='issued')
    pdf_url = StringField()
    created_at = DateTimeField(default=datetime.utcnow)
    
    meta = {'collection': 'invoices'}
    
    @classmethod
    def generate_invoice_number(cls):
        """Generate unique invoice number"""
        date_str = datetime.utcnow().strftime('%Y%m%d')
        count = cls.objects(invoice_number__startswith=date_str).count()
        return f"INV-{date_str}-{str(count + 1).zfill(5)}"
