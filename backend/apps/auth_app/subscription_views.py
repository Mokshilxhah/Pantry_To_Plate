"""
Subscription and Billing Management Views
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User, Subscription, Payment, Invoice, SubscriptionPlan
from .subscription_manager import SubscriptionManager, PaymentManager, AuthorizationManager
from .views import get_user_from_request
from datetime import datetime, timedelta


# ──────────────────────────────────────────────────────────────────────
#  SUBSCRIPTION ENDPOINTS
# ──────────────────────────────────────────────────────────────────────
class GetSubscriptionView(APIView):
    """Get user's current subscription details"""
    
    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=401)
        
        try:
            subscription = SubscriptionManager.get_user_subscription(user)
            plan = subscription.plan
            
            return Response({
                'subscription': {
                    'id': str(subscription.id),
                    'plan': {
                        'name': plan.name,
                        'display_name': plan.display_name,
                        'price': plan.price,
                        'max_members': plan.max_members,
                        'features': plan.features,
                    },
                    'status': subscription.status,
                    'start_date': subscription.start_date.isoformat(),
                    'end_date': subscription.end_date.isoformat() if subscription.end_date else None,
                    'auto_renew': subscription.auto_renew,
                },
            }, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class GetAvailablePlansView(APIView):
    """Get all available subscription plans"""
    permission_classes = []
    
    def get(self, request):
        try:
            plans = SubscriptionManager.get_all_plans()
            return Response({
                'plans': plans,
                'currency': 'INR',
            }, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class CheckFeatureAccessView(APIView):
    """Check if user has access to a feature"""
    
    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=401)
        
        feature_name = request.data.get('feature_name', '')
        
        if not feature_name:
            return Response({'error': 'feature_name is required'}, status=400)
        
        try:
            has_access = SubscriptionManager.check_feature_access(user, feature_name)
            subscription = SubscriptionManager.get_user_subscription(user)
            
            return Response({
                'feature': feature_name,
                'has_access': has_access,
                'plan': subscription.plan.name,
            }, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class CheckMemberLimitView(APIView):
    """Check if user can add more members to their kitchen"""
    
    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=401)
        
        if user.role != 'admin':
            return Response({'error': 'Only admin can check member limits'}, status=403)
        
        try:
            kitchen = user.kitchen_id
            if not kitchen:
                return Response({'error': 'Kitchen not found'}, status=404)
            
            can_add, message = SubscriptionManager.can_add_member(user, kitchen)
            subscription = SubscriptionManager.get_user_subscription(user)
            current_members = User.objects(kitchen_id=kitchen, role='member').count()
            
            return Response({
                'can_add_member': can_add,
                'message': message,
                'current_members': current_members,
                'max_members': subscription.plan.max_members,
                'plan': subscription.plan.name,
            }, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


# ──────────────────────────────────────────────────────────────────────
#  PAYMENT & UPGRADE ENDPOINTS
# ──────────────────────────────────────────────────────────────────────
class InitiateDemoPaymentView(APIView):
    """Initiate a demo payment for subscription upgrade"""
    
    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=401)
        
        if user.role != 'admin':
            return Response({'error': 'Only admin can upgrade plan'}, status=403)
        
        plan_name = request.data.get('plan_name', '').lower()
        
        if not plan_name or plan_name not in ['free', 'pro', 'premium']:
            return Response({'error': 'Invalid plan name'}, status=400)
        
        try:
            plan = SubscriptionManager.get_subscription_plan(plan_name)
            
            # Create subscription object for payment
            subscription = Subscription(
                user_id=user,
                kitchen_id=user.kitchen_id,
                plan=plan,
                status='pending',
            )
            subscription.save()
            
            # Create demo payment
            payment, invoice = PaymentManager.create_demo_payment(
                user=user,
                subscription=subscription,
                amount=plan.price,
                payment_method='demo'
            )
            
            # Update subscription to active
            Subscription.objects(user_id=user, status='active').update(set__status='expired')
            subscription.status = 'active'
            subscription.start_date = datetime.utcnow()
            subscription.end_date = datetime.utcnow() + timedelta(days=30)
            subscription.save()
            
            # Update user subscription
            user.subscription_plan = plan_name
            user.subscription_end_date = subscription.end_date
            user.save()
            
            return Response({
                'message': 'Payment successful. Subscription upgraded!',
                'payment': {
                    'id': str(payment.id),
                    'status': payment.status,
                    'amount': payment.amount,
                    'currency': payment.currency,
                },
                'invoice': {
                    'id': str(invoice.id),
                    'number': invoice.invoice_number,
                    'amount': invoice.amount,
                },
                'subscription': {
                    'plan': plan.name,
                    'status': subscription.status,
                    'end_date': subscription.end_date.isoformat(),
                },
            }, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class GetPaymentHistoryView(APIView):
    """Get user's payment history"""
    
    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=401)
        
        try:
            payments = Payment.objects(user_id=user).order_by('-created_at')
            
            payment_list = []
            for payment in payments:
                payment_list.append({
                    'id': str(payment.id),
                    'amount': payment.amount,
                    'currency': payment.currency,
                    'status': payment.status,
                    'payment_method': payment.payment_method,
                    'created_at': payment.created_at.isoformat(),
                })
            
            return Response({
                'payments': payment_list,
            }, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class GetInvoicesView(APIView):
    """Get user's invoices"""
    
    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=401)
        
        try:
            invoices = Invoice.objects(user_id=user).order_by('-issued_date')
            
            invoice_list = []
            for invoice in invoices:
                invoice_list.append({
                    'id': str(invoice.id),
                    'number': invoice.invoice_number,
                    'amount': invoice.amount,
                    'currency': invoice.currency,
                    'status': invoice.status,
                    'issued_date': invoice.issued_date.isoformat(),
                    'period_start': invoice.period_start.isoformat() if invoice.period_start else None,
                    'period_end': invoice.period_end.isoformat() if invoice.period_end else None,
                    'pdf_url': invoice.pdf_url,
                })
            
            return Response({
                'invoices': invoice_list,
            }, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class CancelSubscriptionView(APIView):
    """Cancel user's subscription"""
    
    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=401)
        
        if user.role != 'admin':
            return Response({'error': 'Only admin can cancel subscription'}, status=403)
        
        try:
            subscription = Subscription.objects(
                user_id=user,
                status__in=['active', 'pending']
            ).first()
            
            if not subscription:
                return Response({'error': 'No active subscription found'}, status=404)
            
            subscription.status = 'cancelled'
            subscription.save()
            
            # Revert to free plan
            user.subscription_plan = 'free'
            user.subscription_end_date = None
            user.save()
            
            # Create free subscription
            SubscriptionManager.create_user_subscription(user, 'free')
            
            return Response({
                'message': 'Subscription cancelled. Reverted to free plan.',
            }, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
