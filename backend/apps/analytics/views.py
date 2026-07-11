from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import BudgetSettings

# ── Default budget seed values ─────────────────────────────────────────────
DEFAULT_CATEGORIES = {
    'Vegetables': 3000, 'Dairy': 2500, 'Proteins': 4000,
    'Grains': 2000,     'Spices': 1500, 'Fruits': 2500,
    'Condiments': 1500,
}
DEFAULT_ITEMS = {
    'Milk': 1200, 'Paneer': 800, 'Chicken': 2000,
    'Basmati Rice': 800, 'Onion': 500, 'Tomato': 500,
    'Eggs': 600, 'Olive Oil': 1000,
}


def _get_kitchen_id(request):
    kid = getattr(request.user, 'kitchen_id', None)
    if kid:
        if hasattr(kid, 'id'):
            return str(kid.id)
        return str(kid)
    return str(getattr(request.user, 'id', 'default'))


# ─────────────────────────────────────────────────────────────────────────────
class BudgetSettingsView(APIView):
    """
    GET  /api/v1/analytics/budget/  → return saved budget (or defaults)
    POST /api/v1/analytics/budget/  → upsert budget settings
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        kid = _get_kitchen_id(request)
        doc = BudgetSettings.objects(kitchen_id=kid).first()

        if not doc:
            return Response({
                'kitchen_id': kid,
                'categories': DEFAULT_CATEGORIES,
                'items':      DEFAULT_ITEMS,
                'is_default': True,
            })

        data = doc.to_dict()
        data['is_default'] = False
        return Response(data)

    def post(self, request):
        kid  = _get_kitchen_id(request)
        data = request.data

        doc = BudgetSettings.objects(kitchen_id=kid).first()
        if not doc:
            doc = BudgetSettings(kitchen_id=kid)

        if 'categories' in data:
            # Merge with existing so partial updates work
            merged = dict(doc.categories or DEFAULT_CATEGORIES)
            merged.update(data['categories'])
            doc.categories = merged

        if 'items' in data:
            merged = dict(doc.items or DEFAULT_ITEMS)
            merged.update(data['items'])
            doc.items = merged

        doc.updated_at = datetime.utcnow()
        doc.save()

        return Response(doc.to_dict(), status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
class AnalyticsReportView(APIView):
    """
    GET /api/v1/analytics/report/
    Returns enhanced mock analytics data — spending trends, waste reduction,
    top categories, recipe frequency, savings estimate.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'food_waste_trend': [
                {'week': 'Week 1', 'waste': 140},
                {'week': 'Week 2', 'waste': 110},
                {'week': 'Week 3', 'waste': 85},
                {'week': 'Week 4', 'waste': 60},
            ],
            'monthly_spending': [
                {'month': 'Jan', 'spent': 12400, 'budget': 17000},
                {'month': 'Feb', 'spent': 13800, 'budget': 17000},
                {'month': 'Mar', 'spent': 11200, 'budget': 17000},
                {'month': 'Apr', 'spent': 14500, 'budget': 17000},
                {'month': 'May', 'spent': 13100, 'budget': 17000},
                {'month': 'Jun', 'spent': 10400, 'budget': 17000},
            ],
            'top_categories': [
                {'name': 'Vegetables', 'value': 1800, 'color': '#22C55E'},
                {'name': 'Dairy',      'value': 2350, 'color': '#3B82F6'},
                {'name': 'Proteins',   'value': 3900, 'color': '#EF4444'},
                {'name': 'Grains',     'value': 850,  'color': '#F59E0B'},
                {'name': 'Spices',     'value': 400,  'color': '#8B5CF6'},
                {'name': 'Fruits',     'value': 1200, 'color': '#EC4899'},
                {'name': 'Condiments', 'value': 950,  'color': '#14B8A6'},
            ],
            'top_recipes': [
                {'name': 'Chole Bhature',       'count': 14},
                {'name': 'Chicken Biryani',      'count': 12},
                {'name': 'Paneer Butter Masala', 'count': 10},
                {'name': 'Palak Paneer',         'count': 9},
                {'name': 'Masala Dosa',          'count': 8},
            ],
            'top_items': [
                {'name': 'Basmati Rice', 'frequency': 58},
                {'name': 'Milk',         'frequency': 60},
                {'name': 'Onion',        'frequency': 52},
                {'name': 'Tomato',       'frequency': 48},
                {'name': 'Paneer',       'frequency': 38},
                {'name': 'Chicken',      'frequency': 35},
                {'name': 'Eggs',         'frequency': 42},
                {'name': 'Olive Oil',    'frequency': 28},
            ],
            'savings_estimate': 3450,
            'waste_reduction_pct': 57,
        })


from .models import BudgetSettings, Expense
from apps.recipes.models import Recipe

PRICES = {
    'tomato': 40, 'onion': 30, 'potato': 30, 'garlic': 150, 'ginger': 120, 'spinach': 40, 'carrot': 60,
    'milk': 60, 'paneer': 360, 'butter': 500, 'cheese': 400, 'chicken': 250, 'egg': 6,
    'rice': 80, 'flour': 40, 'wheat': 45, 'oil': 180, 'ghee': 650, 'lentil': 120, 'dal': 120,
    'default': 20
}

def estimate_recipe_cost(recipe):
    total = 0.0
    for ing in recipe.ingredients:
        name = ing.get('name', '').lower().strip()
        try:
            qty = float(ing.get('quantity', 1.0) or 1.0)
        except Exception:
            qty = 1.0
        unit = ing.get('unit', '').lower().strip()

        price_per_unit = PRICES.get('default')
        for key, p in PRICES.items():
            if key in name:
                price_per_unit = p
                break
        
        if unit in ('g', 'ml'):
            cost = (qty / 1000.0) * price_per_unit
        elif unit in ('kg', 'l', 'litre', 'pcs', 'unit', 'cup', 'spoons'):
            cost = qty * price_per_unit
        elif unit == 'dozen':
            cost = qty * 12.0 * price_per_unit
        else:
            cost = qty * price_per_unit
        total += cost

    if total <= 0:
        total = (recipe.calories or 300) * 0.4
    return round(total, 2)


class ExpenseListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        kid = _get_kitchen_id(request)
        expenses = Expense.objects(kitchen_id=kid).order_by('-date')
        return Response([e.to_dict() for e in expenses])

    def post(self, request):
        kid = _get_kitchen_id(request)
        data = request.data
        name = data.get('name', '').strip()
        category = data.get('category', 'Other').strip()
        try:
            amount = float(data.get('amount', 0))
        except Exception:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

        if not name or amount <= 0:
            return Response({'error': 'Name and positive amount are required'}, status=status.HTTP_400_BAD_REQUEST)

        expense_date = datetime.utcnow()
        if 'date' in data and data['date']:
            try:
                expense_date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
            except Exception:
                try:
                    expense_date = datetime.strptime(data['date'][:10], "%Y-%m-%d")
                except Exception:
                    pass

        expense = Expense(
            kitchen_id=kid,
            name=name,
            category=category,
            amount=amount,
            buyer_id=request.user,
            buyer_name=request.user.full_name or request.user.username or "Family Member",
            date=expense_date
        )
        expense.save()
        return Response(expense.to_dict(), status=status.HTTP_201_CREATED)

    def put(self, request, expense_id):
        try:
            expense = Expense.objects(id=expense_id).first()
        except Exception:
            return Response({'error': 'Invalid ID format'}, status=status.HTTP_400_BAD_REQUEST)

        if not expense:
            return Response({'error': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)

        kid = _get_kitchen_id(request)
        if expense.kitchen_id != kid:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        if 'name' in data:
            expense.name = data['name'].strip()
        if 'category' in data:
            expense.category = data['category'].strip()
        if 'amount' in data:
            try:
                expense.amount = float(data['amount'])
            except Exception:
                return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
        if 'date' in data and data['date']:
            try:
                expense.date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
            except Exception:
                try:
                    expense.date = datetime.strptime(data['date'][:10], "%Y-%m-%d")
                except Exception:
                    pass

        expense.save()
        return Response(expense.to_dict(), status=status.HTTP_200_OK)

    def delete(self, request, expense_id):
        try:
            expense = Expense.objects(id=expense_id).first()
        except Exception:
            return Response({'error': 'Invalid ID format'}, status=status.HTTP_400_BAD_REQUEST)

        if not expense:
            return Response({'error': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)

        kid = _get_kitchen_id(request)
        if expense.kitchen_id != kid:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        expense.delete()
        return Response({'message': 'Expense deleted successfully'})


class BudgetMealsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Load recipes
        kid = _get_kitchen_id(request)
        recipes = Recipe.objects(kitchen_id=kid)
        
        low_meals = []
        med_meals = []
        high_meals = []

        for r in recipes:
            cost = estimate_recipe_cost(r)
            servings = r.servings or 2
            cost_per_serving = round(cost / servings, 2)
            
            meal_info = {
                'id': str(r.id),
                'title': r.title,
                'cost': cost,
                'cost_per_serving': cost_per_serving,
                'servings': servings,
                'cuisine': r.cuisine or 'Universal',
                'image_url': r.image_url or ''
            }

            if cost < 120:
                low_meals.append(meal_info)
            elif cost <= 250:
                med_meals.append(meal_info)
            else:
                high_meals.append(meal_info)

        # Fallback if recipe database is empty
        if not low_meals and not med_meals and not high_meals:
            low_meals = [
                {'id': 'f1', 'title': 'Vegetable Khichdi', 'cost': 90, 'cost_per_serving': 45, 'servings': 2, 'cuisine': 'Indian'},
                {'id': 'f2', 'title': 'Dal & Rice', 'cost': 80, 'cost_per_serving': 40, 'servings': 2, 'cuisine': 'Indian'},
            ]
            med_meals = [
                {'id': 'f3', 'title': 'Egg Curry', 'cost': 140, 'cost_per_serving': 70, 'servings': 2, 'cuisine': 'Indian'},
                {'id': 'f4', 'title': 'Vegetable Fried Rice', 'cost': 120, 'cost_per_serving': 60, 'servings': 2, 'cuisine': 'Chinese'},
            ]
            high_meals = [
                {'id': 'f5', 'title': 'Paneer Butter Masala', 'cost': 260, 'cost_per_serving': 130, 'servings': 2, 'cuisine': 'Indian'},
                {'id': 'f6', 'title': 'Pasta Alfredo', 'cost': 280, 'cost_per_serving': 140, 'servings': 2, 'cuisine': 'Italian'},
            ]

        return Response({
            'low': low_meals[:5],
            'medium': med_meals[:5],
            'high': high_meals[:5]
        })
