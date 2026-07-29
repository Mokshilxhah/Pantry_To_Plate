from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Kitchen
from apps.pantry.models import PantryItem
from apps.buylist.models import ToBuyItem
from apps.auth_app.models import User
from rest_framework_simplejwt.tokens import UntypedToken
from apps.pantry.views import calculate_low_stock_status

MOCK_SUMMARY = {
    'health_score': 82,
    'total_items': 12,
    'low_stock': 2,
    'to_buy': 3,
    'members': 2,
    'expiring_soon': 3,
}

MOCK_MEMBERS = [
    {'id': 'mock_m1', 'full_name': 'Kitchen Admin', 'role': 'admin', 'email': 'admin@test.com'},
    {'id': 'mock_m2', 'full_name': 'Family Member', 'role': 'member', 'email': 'member@test.com'},
]

def get_user_from_request(request):
    token = request.headers.get('Authorization', '').replace('Bearer ', '').strip()
    if not token or token == 'mock-token':
        return None
    try:
        data = UntypedToken(token)
        return User.objects(id=data['user_id']).first()
    except Exception:
        return None

from rest_framework.permissions import IsAuthenticated

class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.pantry.models import PantryItem
        from apps.buylist.models import ToBuyItem
        from apps.auth_app.models import User
        from apps.alerts.models import Alert
        from apps.mealplans.models import WeeklyMealPlan
        from apps.analytics.models import BudgetSettings, Expense
        from datetime import datetime, timedelta

        user = request.user
        empty_summary = {
            'totalItems': 0,
            'expiringItems': 0,
            'lowStockItems': 0,
            'budget': {'limit': 0, 'spent': 0},
            'topAlert': None,
            'todayMenu': {'breakfast': 'None planned', 'lunch': 'None planned', 'dinner': 'None planned'},
            'familyMembers': [],
            'buyListCount': 0
        }
        if not user or not user.kitchen_id:
            return Response(empty_summary)
        try:
            kitchen_id = user.kitchen_id
            kitchen_id_str = str(kitchen_id.id) if hasattr(kitchen_id, 'id') else str(kitchen_id)

            # 1. Total pantry items
            totalItems = PantryItem.objects(kitchen_id=kitchen_id).count()

            # 2. Expiring items (<= 3 days)
            now = datetime.utcnow()
            three_days_later = now + timedelta(days=3)
            expiringItems = PantryItem.objects(kitchen_id=kitchen_id, expiry_date__lte=three_days_later).count()

            # 3. Low stock items (using same logic as pantry view)
            all_pantry_items = PantryItem.objects(kitchen_id=kitchen_id)
            lowStockItems = sum(1 for item in all_pantry_items if calculate_low_stock_status(item))

            # 4. Budget limits and spent
            budget_settings = BudgetSettings.objects(kitchen_id=kitchen_id_str).first()
            limit = 0
            if budget_settings and budget_settings.categories:
                limit = sum(budget_settings.categories.values())
            
            start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            expenses = Expense.objects(kitchen_id=kitchen_id_str, date__gte=start_of_month)
            spent = sum(e.amount for e in expenses)
            budget = {'limit': limit, 'spent': spent}

            # 5. TopAlert (latest unread alert)
            alert = Alert.objects(kitchen_id=kitchen_id_str, status='unread').order_by('-created_at').first()
            topAlert = {
                'id': str(alert.id),
                'title': alert.title,
                'severity': alert.severity
            } if alert else None

            # 6. Today's menu
            today_name = now.strftime('%A').lower()
            plan = WeeklyMealPlan.objects(kitchen_id=kitchen_id_str).first()
            today_plan = getattr(plan, today_name, {}) if plan else {}
            
            def get_meal_name(slot):
                m = today_plan.get(slot, {})
                if isinstance(m, dict):
                    return m.get('name') or 'None planned'
                return 'None planned'

            todayMenu = {
                'breakfast': get_meal_name('breakfast'),
                'lunch': get_meal_name('lunch'),
                'dinner': get_meal_name('dinner')
            }

            # 7. Family members
            members = User.objects(kitchen_id=kitchen_id)
            familyMembers = [{
                'id': str(m.id),
                'fullName': m.full_name,
                'email': m.email,
                'role': m.role
            } for m in members]

            # 8. Buy list count
            buyListCount = ToBuyItem.objects(kitchen_id=kitchen_id, is_purchased=False).count()

            return Response({
                'totalItems': totalItems,
                'expiringItems': expiringItems,
                'lowStockItems': lowStockItems,
                'budget': budget,
                'topAlert': topAlert,
                'todayMenu': todayMenu,
                'familyMembers': familyMembers,
                'buyListCount': buyListCount,
                'inviteCode': kitchen_id.invite_code
            })
        except Exception as e:
            return Response(empty_summary)

class KitchenMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user or not user.kitchen_id:
            return Response([])
        try:
            members = User.objects(kitchen_id=user.kitchen_id)
            return Response([{'id': str(m.id), 'full_name': m.full_name, 'role': m.role, 'email': m.email} for m in members])
        except Exception:
            return Response([])
