"""
Subscription management utilities and business logic
"""

from datetime import datetime, timedelta
from .models import User, Subscription, SubscriptionPlan, Payment, Invoice
from apps.kitchen.models import Kitchen


class SubscriptionManager:
    """Handle subscription operations and validations"""
    
    # Default plans configuration
    DEFAULT_PLANS = {
        'free': {
            'name': 'free',
            'display_name': 'Free Plan',
            'price': 0,
            'max_members': 2,
            'features': {
                'meal_planning': True,
                'shopping_list': True,
                'recipe_sharing': False,
                'meal_suggestions': False,
                'family_alerts': False,
                'analytics': False,
            }
        },
        'pro': {
            'name': 'pro',
            'display_name': 'Pro Plan',
            'price': 199,
            'max_members': 5,
            'features': {
                'meal_planning': True,
                'shopping_list': True,
                'recipe_sharing': True,
                'meal_suggestions': True,
                'family_alerts': True,
                'analytics': False,
            }
        },
        'premium': {
            'name': 'premium',
            'display_name': 'Premium Plan',
            'price': 399,
            'max_members': -1,  # Unlimited
            'features': {
                'meal_planning': True,
                'shopping_list': True,
                'recipe_sharing': True,
                'meal_suggestions': True,
                'family_alerts': True,
                'analytics': True,
            }
        }
    }
    
    @staticmethod
    def initialize_default_plans():
        """Create default subscription plans in database"""
        for plan_key, plan_data in SubscriptionManager.DEFAULT_PLANS.items():
            plan = SubscriptionPlan.objects(name=plan_key).first()
            if not plan:
                plan = SubscriptionPlan(name=plan_key)
            plan.display_name = plan_data['display_name']
            plan.price = plan_data['price']
            plan.max_members = plan_data['max_members']
            plan.features = plan_data['features']
            plan.save()
    
    @staticmethod
    def create_user_subscription(user, plan_name='free', start_date=None):
        """Create subscription for a new user"""
        plan = SubscriptionPlan.objects(name=plan_name).first()
        if not plan:
            plan = SubscriptionPlan.objects(name='free').first()
        
        end_date = None
        if plan_name != 'free':
            start_date = start_date or datetime.utcnow()
            end_date = start_date + timedelta(days=30)  # 30-day subscription
        
        # Deactivate any existing active subscriptions for this user
        Subscription.objects(user_id=user, status='active').update(set__status='expired')

        subscription = Subscription(
            user_id=user,
            plan=plan,
            status='active',
            start_date=start_date or datetime.utcnow(),
            end_date=end_date,
        )
        subscription.save()
        
        # Update user's subscription plan
        user.subscription_plan = plan_name
        user.subscription_end_date = end_date
        user.save()
        
        return subscription
    
    @staticmethod
    def get_user_subscription(user):
        """Get user's active subscription"""
        subscription = Subscription.objects(
            user_id=user,
            status='active'
        ).first()
        
        if not subscription:
            # Create default free subscription
            return SubscriptionManager.create_user_subscription(user, 'free')
        
        # Check if subscription has expired
        if subscription.end_date and datetime.utcnow() > subscription.end_date:
            subscription.status = 'expired'
            subscription.save()
            # Create new free subscription
            return SubscriptionManager.create_user_subscription(user, 'free')
        
        return subscription
    
    @staticmethod
    def get_subscription_plan(plan_name):
        """Get plan details"""
        plan = SubscriptionPlan.objects(name=plan_name).first()
        return plan or SubscriptionPlan.objects(name='free').first()
    
    @staticmethod
    def can_add_member(user, kitchen):
        """Check if user can add another member to kitchen"""
        subscription = SubscriptionManager.get_user_subscription(user)
        plan = subscription.plan
        
        # Query total registered family members for this kitchen
        current_members = User.objects(kitchen_id=kitchen, role='member').count()
        
        # Free allows 2 members, Pro allows 5 members, Premium allows unlimited
        if plan.name == 'free':
            max_allowed_members = 2
        elif plan.name == 'pro':
            max_allowed_members = 5
        else:  # premium (unlimited)
            return True, None
        
        if current_members >= max_allowed_members:
            plan_label = plan.display_name
            return False, f"Your {plan_label} allows maximum {max_allowed_members} family members. Current: {current_members}"
        
        return True, None
    
    @staticmethod
    def check_feature_access(user, feature_name):
        """Check if user has access to a feature"""
        subscription = SubscriptionManager.get_user_subscription(user)
        plan = subscription.plan
        
        # Check if feature is available in the plan
        features = plan.features or {}
        return features.get(feature_name, False)
    
    @staticmethod
    def get_plan_info(plan_name):
        """Get plan information for frontend"""
        plan_config = SubscriptionManager.DEFAULT_PLANS.get(plan_name)
        if not plan_config:
            plan_config = SubscriptionManager.DEFAULT_PLANS['free']
        
        return {
            'name': plan_config['name'],
            'display_name': plan_config['display_name'],
            'price': plan_config['price'],
            'max_members': plan_config['max_members'],
            'features': plan_config['features'],
            'currency': 'INR',
        }
    
    @staticmethod
    def get_all_plans():
        """Get all available plans"""
        plans = []
        for plan_name in ['free', 'pro', 'premium']:
            plans.append(SubscriptionManager.get_plan_info(plan_name))
        return plans


class PaymentManager:
    """Handle payment operations"""
    
    @staticmethod
    def create_demo_payment(user, subscription, amount, payment_method='demo'):
        """Create a demo/test payment"""
        payment = Payment(
            subscription_id=subscription,
            user_id=user,
            amount=amount,
            currency='INR',
            status='completed',
            payment_method=payment_method,
            payment_id=f"DEMO-{int(datetime.utcnow().timestamp())}",
        )
        payment.save()
        
        # Create invoice
        invoice_number = Invoice.generate_invoice_number()
        invoice = Invoice(
            payment_id=payment,
            subscription_id=subscription,
            user_id=user,
            invoice_number=invoice_number,
            amount=amount,
            currency='INR',
            period_start=datetime.utcnow(),
            period_end=datetime.utcnow() + timedelta(days=30),
            status='paid',
        )
        invoice.save()
        
        return payment, invoice
    
    @staticmethod
    def upgrade_subscription(user, new_plan_name):
        """Upgrade user's subscription"""
        plan = SubscriptionManager.get_subscription_plan(new_plan_name)
        
        # Get or create subscription
        subscription = Subscription.objects(
            user_id=user,
            status__in=['active', 'expired']
        ).first()
        
        if subscription:
            subscription.plan = plan
            subscription.status = 'active'
            subscription.end_date = datetime.utcnow() + timedelta(days=30)
        else:
            subscription = Subscription(
                user_id=user,
                plan=plan,
                status='active',
                start_date=datetime.utcnow(),
                end_date=datetime.utcnow() + timedelta(days=30),
            )
        
        subscription.save()
        
        # Update user
        user.subscription_plan = new_plan_name
        user.subscription_end_date = subscription.end_date
        user.save()
        
        return subscription


class AuthorizationManager:
    """Handle authorization and data isolation checks"""
    
    @staticmethod
    def can_access_kitchen(user, kitchen):
        """Check if user can access a kitchen"""
        if user.role == 'admin':
            return kitchen.admin_id.id == user.id
        elif user.role == 'member':
            return kitchen.id in [str(m.id) for m in kitchen.member_ids or []]
        return False
    
    @staticmethod
    def ensure_kitchen_isolation(user, kitchen):
        """Verify kitchen isolation - user should only access their own kitchen"""
        if not AuthorizationManager.can_access_kitchen(user, kitchen):
            return False, "You do not have access to this kitchen"
        return True, None
    
    @staticmethod
    def get_user_kitchens(user):
        """Get all kitchens accessible by user"""
        if user.role == 'admin':
            return Kitchen.objects(admin_id=user)
        elif user.role == 'member':
            return Kitchen.objects(member_ids=user)
        return []
