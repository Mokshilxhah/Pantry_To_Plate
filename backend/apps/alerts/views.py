from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from datetime import datetime, timedelta

from .models import Alert
from .serializers import AlertSerializer
from apps.pantry.models import PantryItem
from apps.mealplans.models import WeeklyMealPlan

def _get_kitchen_id(request):
    kitchen = getattr(request.user, 'kitchen_id', None)
    if kitchen:
        kitchen_id = getattr(kitchen, 'id', kitchen)
        return str(kitchen_id)
    uid = str(getattr(request.user, 'id', 'default'))
    return uid

def sync_pantry_alerts_helper(kitchen_id_str, user):
    from apps.pantry.models import PantryItem
    from apps.pantry.views import calculate_low_stock_status
    from .models import Alert
    
    pantry_items = PantryItem.objects(kitchen_id=kitchen_id_str)
    for item in pantry_items:
        days = None
        if item.expiry_date:
            days = (item.expiry_date.replace(tzinfo=None) - datetime.utcnow().replace(tzinfo=None)).days
        
        # Expiration checks
        if days is not None and days <= 3:
            alert_title = f"{item.name} has EXPIRED!" if days < 0 else f"{item.name} expires in {days} days — plan a dish!"
            existing = Alert.objects(kitchen_id=kitchen_id_str, action_item_name=item.name, category='grocery', severity='critical', status__in=['unread', 'read', 'snoozed']).first()
            if not existing:
                Alert(
                    kitchen_id=kitchen_id_str,
                    user_id=user,
                    title=alert_title,
                    category='grocery',
                    severity='critical',
                    status='unread',
                    action='Plan Dining',
                    action_item_name=item.name,
                    description=f"Expiring pantry stock alert for {item.name}."
                ).save()
        else:
            Alert.objects(kitchen_id=kitchen_id_str, action_item_name=item.name, severity='critical').update(set__status='deleted')

        # Low stock checks
        if calculate_low_stock_status(item):
            alert_title = f"{item.name} is running low ({item.quantity} {item.unit} remaining)"
            existing = Alert.objects(kitchen_id=kitchen_id_str, action_item_name=item.name, category='grocery', severity='warning', status__in=['unread', 'read', 'snoozed']).first()
            if not existing:
                Alert(
                    kitchen_id=kitchen_id_str,
                    user_id=user,
                    title=alert_title,
                    category='grocery',
                    severity='warning',
                    status='unread',
                    action='Procure',
                    action_item_name=item.name,
                    description=f"Stock for {item.name} is below threshold."
                ).save()
        else:
            Alert.objects(kitchen_id=kitchen_id_str, action_item_name=item.name, severity='warning').update(set__status='deleted')


def sync_budget_alerts_helper(kitchen_id_str, user):
    from apps.analytics.models import BudgetSettings, Expense
    from .models import Alert
    
    now = datetime.utcnow()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # 1. Fetch budget settings
    budget_settings = BudgetSettings.objects(kitchen_id=kitchen_id_str).first()
    if not budget_settings:
        return
        
    categories = budget_settings.categories or {}
    
    # 2. Calculate expenses by category for current month
    expenses = Expense.objects(kitchen_id=kitchen_id_str, date__gte=start_of_month)
    
    total_spent = 0.0
    spent_by_cat = {}
    for exp in expenses:
        total_spent += exp.amount
        spent_by_cat[exp.category] = spent_by_cat.get(exp.category, 0.0) + exp.amount
        
    # Check category budget exceeds limits
    for cat, limit in categories.items():
        try:
            limit_val = float(limit or 0)
        except Exception:
            continue
            
        if limit_val > 0:
            spent = spent_by_cat.get(cat, 0.0)
            alert_title = f"Budget Exceeded: {cat} limit is Rs.{limit_val:.0f}"
            existing = Alert.objects(
                kitchen_id=kitchen_id_str, 
                category='system', 
                title=alert_title, 
                status__in=['unread', 'read', 'snoozed']
            ).first()
            
            if spent > limit_val:
                if not existing:
                    Alert(
                        kitchen_id=kitchen_id_str,
                        user_id=user,
                        title=alert_title,
                        category='system',
                        severity='warning',
                        status='unread',
                        description=f"Spending on {cat} is Rs.{spent:.0f}, which exceeds the limit of Rs.{limit_val:.0f}."
                    ).save()
            else:
                if existing:
                    Alert.objects(id=existing.id).update(set__status='deleted')
                    
    # Check total budget and remaining budget alert
    total_limit = sum(float(v or 0) for v in categories.values() if v)
    if total_limit > 0:
        remaining = total_limit - total_spent
        
        # Alert when remaining budget is just left under 500
        alert_title_under_500 = f"Low Budget Alert: Less than Rs.500 remaining"
        existing_under_500 = Alert.objects(
            kitchen_id=kitchen_id_str, 
            category='system', 
            title=alert_title_under_500, 
            status__in=['unread', 'read', 'snoozed']
        ).first()
        
        if 0 <= remaining < 500:
            if not existing_under_500:
                Alert(
                    kitchen_id=kitchen_id_str,
                    user_id=user,
                    title=alert_title_under_500,
                    category='system',
                    severity='warning',
                    status='unread',
                    description=f"Only Rs.{remaining:.0f} is left in your monthly kitchen budget."
                ).save()
        else:
            if existing_under_500:
                Alert.objects(id=existing_under_500.id).update(set__status='deleted')
                
        # Also, check if total budget is exceeded
        alert_title_total_exceeded = f"Total Budget Exceeded: Spent Rs.{total_spent:.0f} of Rs.{total_limit:.0f}"
        existing_total_exceeded = Alert.objects(
            kitchen_id=kitchen_id_str, 
            category='system', 
            title=alert_title_total_exceeded, 
            status__in=['unread', 'read', 'snoozed']
        ).first()
        
        if remaining < 0:
            if not existing_total_exceeded:
                Alert(
                    kitchen_id=kitchen_id_str,
                    user_id=user,
                    title=alert_title_total_exceeded,
                    category='system',
                    severity='critical',
                    status='unread',
                    description=f"Your total kitchen spending is Rs.{total_spent:.0f}, exceeding your total budget limit of Rs.{total_limit:.0f}."
                ).save()
        else:
            if existing_total_exceeded:
                Alert.objects(id=existing_total_exceeded.id).update(set__status='deleted')


class AlertListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            kitchen = getattr(request.user, 'kitchen_id', None)
            kitchen_id_str = _get_kitchen_id(request)

            # 1. Check if database has alerts. If zero, seed default mock notifications
            alerts_count = Alert.objects(kitchen_id=kitchen_id_str).count()
            if alerts_count == 0:
                mock_alerts = [
                    {
                        "title": "🍳 Breakfast reminder - Oats with Fruits",
                        "category": "meals",
                        "severity": "info",
                        "description": "It's time for breakfast! Prepare Oats with Fruits.",
                        "action": "Use it",
                        "action_item_name": "Oats with Fruits"
                    },
                    {
                        "title": "💧 Drink 250 ml water",
                        "category": "water",
                        "severity": "info",
                        "description": "Stay hydrated! Time to drink 250 ml of water.",
                        "action": "",
                        "action_item_name": ""
                    },
                    {
                        "title": "🎉 10-day healthy eating streak!",
                        "category": "health",
                        "severity": "info",
                        "description": "Awesome job! You have followed your meal plan for 10 days straight.",
                        "action": "",
                        "action_item_name": ""
                    },
                    {
                        "title": "🍝 New Italian recipes added",
                        "category": "system",
                        "severity": "info",
                        "description": "Check out the newly imported Mediterranean pasta recipes.",
                        "action": "Use it",
                        "action_item_name": ""
                    },
                    {
                        "title": "Possible allergen detected in Dinner recipe",
                        "category": "health",
                        "severity": "warning",
                        "description": "Tonight's dinner contains nuts. Please verify for allergy safety.",
                        "action": "Evaluate",
                        "action_item_name": "nuts"
                    },
                    {
                        "title": "Tomorrow's meal plan is ready",
                        "category": "meals",
                        "severity": "info",
                        "description": "Your custom menu for tomorrow has been prepared and matches your caloric goals.",
                        "action": "Plan Dining",
                        "action_item_name": ""
                    }
                ]
                for ma in mock_alerts:
                    Alert(
                        kitchen_id=kitchen_id_str,
                        user_id=request.user,
                        title=ma['title'],
                        category=ma['category'],
                        severity=ma['severity'],
                        status='unread',
                        description=ma['description'],
                        action=ma['action'],
                        action_item_name=ma['action_item_name']
                    ).save()

            # 2. Sync dynamic pantry-based alerts
            if kitchen:
                sync_pantry_alerts_helper(kitchen_id_str, request.user)
                sync_budget_alerts_helper(kitchen_id_str, request.user)

            # 3. Sync nutrition deficit alert based on active meal plan
            plan = WeeklyMealPlan.objects(kitchen_id=kitchen_id_str).first()
            if plan and plan.is_ai_generated:
                # Calculate scheduled proteins on Monday
                monday_meals = plan.monday or {}
                scheduled_protein = 0
                for slot, meal in monday_meals.items():
                    if meal and isinstance(meal, dict):
                        scheduled_protein += meal.get('protein', 0)
                
                target_protein = plan.target_protein or 120
                if scheduled_protein < target_protein - 10:
                    diff = target_protein - scheduled_protein
                    alert_title = f"You are {diff}g short of today's protein goal"
                    existing = Alert.objects(kitchen_id=kitchen_id_str, category='health', title__contains='protein goal', status__in=['unread', 'read', 'snoozed']).first()
                    if not existing:
                        Alert(
                            kitchen_id=kitchen_id_str,
                            user_id=request.user,
                            title=alert_title,
                            category='health',
                            severity='warning',
                            status='unread',
                            description=f"Protein intake of {scheduled_protein}g is below the daily goal of {target_protein}g."
                        ).save()

            # Query building
            status_param = request.query_params.get('status', 'active')
            category_param = request.query_params.get('category', 'all')

            qs = Alert.objects(kitchen_id=kitchen_id_str)

            # Filter categories / severities
            if category_param != 'all':
                if category_param == 'critical':
                    # Expiry items: severity is critical
                    qs = qs.filter(severity='critical')
                elif category_param == 'attention':
                    # Low stock items: title contains "low" or description contains "threshold"
                    from mongoengine.queryset.visitor import Q
                    qs = qs.filter(Q(title__icontains='low') | Q(description__icontains='threshold'))
                elif category_param == 'info':
                    # Member registration alerts: title contains "registered" or "joined"
                    from mongoengine.queryset.visitor import Q
                    qs = qs.filter(Q(title__icontains='registered') | Q(title__icontains='joined') | Q(description__icontains='registered'))
                else:
                    qs = qs.filter(category=category_param)

            # Filter statuses
            now = datetime.utcnow()
            if status_param == 'active':
                # Return unread OR snoozed alerts whose snooze time has passed
                qs = qs.filter(status__in=['unread', 'snoozed'])
                # Exclude alerts currently in snooze
                qs = qs.filter(snoozed_until__not__gt=now)
            elif status_param in ('history', 'resolved'):
                # Show read or snoozed active (history/resolved tab matches read alerts)
                qs = qs.filter(status='read')
            elif status_param != 'all':
                qs = qs.filter(status=status_param)

            # Limit to top 50
            alerts = qs.order_by('-created_at')[:50]
            serializer = AlertSerializer(alerts, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            kitchen_id_str = _get_kitchen_id(request)
            data = request.data
            
            alert = Alert(
                kitchen_id=kitchen_id_str,
                user_id=request.user,
                title=data.get('title'),
                description=data.get('description', ''),
                category=data.get('category', 'system').lower(),
                severity=data.get('severity', 'info').lower(),
                status='unread',
                action=data.get('action', ''),
                action_item_name=data.get('action_item_name', '')
            )
            alert.save()
            serializer = AlertSerializer(alert)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AlertDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, alert_id):
        return self.patch(request, alert_id)

    def patch(self, request, alert_id):
        try:
            kitchen_id_str = _get_kitchen_id(request)
            alert = Alert.objects(id=alert_id, kitchen_id=kitchen_id_str).first()
            if not alert:
                return Response({'error': 'Alert not found'}, status=status.HTTP_404_NOT_FOUND)

            d = request.data
            status_val = d.get('status')
            
            # Map isRead: true or is_read: true to status: 'read'
            if d.get('isRead') is True or d.get('is_read') is True:
                status_val = 'read'

            if status_val:
                if status_val not in ('unread', 'read', 'snoozed', 'deleted'):
                    return Response({'error': 'Invalid status value'}, status=status.HTTP_400_BAD_REQUEST)
                alert.status = status_val
                
                if status_val == 'snoozed':
                    # Snooze for 30 minutes
                    alert.snoozed_until = datetime.utcnow() + timedelta(minutes=30)
                else:
                    alert.snoozed_until = None

            alert.save()
            serializer = AlertSerializer(alert)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, alert_id):
        try:
            kitchen_id_str = _get_kitchen_id(request)
            alert = Alert.objects(id=alert_id, kitchen_id=kitchen_id_str).first()
            if not alert:
                return Response({'error': 'Alert not found'}, status=status.HTTP_404_NOT_FOUND)

            alert.status = 'deleted'
            alert.save()
            return Response({'message': 'Alert marked as deleted successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
