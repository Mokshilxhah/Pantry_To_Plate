from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import PantryItem, MasterItem
from apps.auth_app.models import User
from datetime import datetime, timedelta
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework.parsers import MultiPartParser, FormParser
import csv
import io
import pandas as pd


# Mock data
MOCK_PANTRY_ITEMS = [
    {
        "id": "mock_item_001",
        "name": "Tomatoes",
        "category": "Vegetables",
        "quantity": 1.0,
        "unit": "kg",
        "storage_location": "fridge",
        "expiry_date": (datetime.now() + timedelta(days=2)).isoformat(),
        "status": "expiring_soon",
        "purchase_date": (datetime.now() - timedelta(days=3)).isoformat(),
        "days_until_expiry": 2
    },
    {
        "id": "mock_item_002",
        "name": "Basmati Rice",
        "category": "Grains",
        "quantity": 3.0,
        "unit": "kg",
        "storage_location": "shelf",
        "expiry_date": (datetime.now() + timedelta(days=180)).isoformat(),
        "status": "fresh",
        "purchase_date": (datetime.now() - timedelta(days=10)).isoformat(),
        "days_until_expiry": 180
    },
    {
        "id": "mock_item_003",
        "name": "Spinach",
        "category": "Vegetables",
        "quantity": 500,
        "unit": "g",
        "storage_location": "fridge",
        "expiry_date": (datetime.now() + timedelta(days=5)).isoformat(),
        "status": "fresh",
        "purchase_date": (datetime.now() - timedelta(days=1)).isoformat(),
        "days_until_expiry": 5
    },
    {
        "id": "mock_item_004",
        "name": "Milk",
        "category": "Dairy",
        "quantity": 2.0,
        "unit": "L",
        "storage_location": "fridge",
        "expiry_date": (datetime.now() + timedelta(days=4)).isoformat(),
        "status": "fresh",
        "purchase_date": (datetime.now() - timedelta(days=1)).isoformat(),
        "days_until_expiry": 4
    },
    {
        "id": "mock_item_005",
        "name": "Onions",
        "category": "Vegetables",
        "quantity": 2.0,
        "unit": "kg",
        "storage_location": "shelf",
        "expiry_date": (datetime.now() + timedelta(days=30)).isoformat(),
        "status": "fresh",
        "purchase_date": (datetime.now() - timedelta(days=5)).isoformat(),
        "days_until_expiry": 30
    },
    {
        "id": "mock_item_006",
        "name": "Paneer",
        "category": "Dairy",
        "quantity": 250,
        "unit": "g",
        "storage_location": "fridge",
        "expiry_date": (datetime.now() + timedelta(days=1)).isoformat(),
        "status": "expiring_soon",
        "purchase_date": (datetime.now() - timedelta(days=2)).isoformat(),
        "days_until_expiry": 1
    }
]

MOCK_MASTER_ITEMS = [
    {"id": "master_001", "name": "Tomatoes", "category": "Vegetables", "default_unit": "kg"},
    {"id": "master_002", "name": "Basmati Rice", "category": "Grains", "default_unit": "kg"},
    {"id": "master_003", "name": "Spinach", "category": "Vegetables", "default_unit": "g"},
    {"id": "master_004", "name": "Milk", "category": "Dairy", "default_unit": "L"},
    {"id": "master_005", "name": "Onions", "category": "Vegetables", "default_unit": "kg"},
    {"id": "master_006", "name": "Paneer", "category": "Dairy", "default_unit": "g"},
    {"id": "master_007", "name": "Toor Dal", "category": "Pulses", "default_unit": "kg"},
    {"id": "master_008", "name": "Coriander", "category": "Vegetables", "default_unit": "g"},
    {"id": "master_009", "name": "Ginger", "category": "Vegetables", "default_unit": "g"},
    {"id": "master_010", "name": "Garlic", "category": "Vegetables", "default_unit": "g"},
]


def get_user_from_request(request):
    token = request.headers.get('Authorization', '').replace('Bearer ', '').strip()
    if not token or token == 'mock-token':
        return None
    try:
        data = UntypedToken(token)
        user_id = data['user_id']
        return User.objects(id=user_id).first()
    except Exception:
        return None


def is_fast_decomposing(name):
    if not name:
        return False
    lower_name = name.lower()
    fast_items = ['milk', 'bread', 'eggs', 'egg', 'paneer', 'chicken', 'fish', 'yogurt', 'curd', 'butter']
    return any(item in lower_name for item in fast_items)


def calculate_low_stock_status(item):
    category = (item.category or '').lower().strip()
    unit = (item.unit or '').lower().strip()
    quantity = float(item.quantity or 0)

    # Prioritize user-defined threshold if it exists
    if item.low_stock_threshold is not None:
        return quantity <= item.low_stock_threshold

    # Staples: wheat/flour, grains, rice, sugar, beans, lentils
    is_staple = any(x in category or x in (item.name or '').lower() 
                    for x in ('wheat', 'flour', 'rice', 'grain', 'sugar', 'pulse', 'lentil', 'bean'))
    
    if is_staple:
        if unit in ('kg', 'kgs'):
            return quantity < 1.0
        if unit in ('g', 'gm', 'gms', 'grams'):
            return quantity < 1000
        if unit in ('pcs', 'pieces', 'piece'):
            return quantity < 4
        if unit in ('pack', 'packet', 'packs', 'packets'):
            return quantity < 1
            
    # Spices
    elif 'spice' in category or 'masala' in category or 'spice' in (item.name or '').lower():
        if unit in ('g', 'gm', 'gms', 'grams'):
            return quantity < 100
        if unit in ('pack', 'packet', 'packs', 'packets'):
            return quantity < 1

    # General / Dairy / Vegetables / Fruits
    else:
        if unit in ('ml', 'mls'):
            return quantity < 500
        if unit in ('l', 'liters', 'litre', 'litres', 'liter'):
            return quantity < 1.0
        if unit in ('kg', 'kgs'):
            return quantity < 0.5
        if unit in ('g', 'gm', 'gms', 'grams'):
            if 'vegetable' in category or 'fruit' in category:
                return quantity < 500
            return quantity < 200
        if unit in ('pcs', 'pieces', 'piece'):
            return quantity < 4
        if unit in ('pack', 'packet', 'packs', 'packets'):
            return quantity < 1

    # Fallback default low stock threshold for other units
    return quantity <= 1.0


def item_to_dict(item):
    days = None
    status = item.status or 'fresh'
    is_critical_alert = False

    if item.expiry_date:
        now_date = datetime.utcnow().date()
        exp_date = item.expiry_date.date()
        diff = (exp_date - now_date).days
        days = diff
        
        if diff < 0:
            status = 'expired'
            is_critical_alert = True
        else:
            if is_fast_decomposing(item.name):
                # Milk, eggs, bread decompose fast -> alert 2 days before
                if diff <= 2:
                    status = 'expiring_soon'
                    is_critical_alert = True
            else:
                # Regular items -> alert 1 day before
                if diff <= 1:
                    status = 'expiring_soon'

    # Check low stock status
    if calculate_low_stock_status(item):
        status = 'low_stock'

    # Return both camelCase and snake_case properties
    expiry_iso = item.expiry_date.isoformat() if item.expiry_date else None
    purchase_iso = item.purchase_date.isoformat() if item.purchase_date else None

    return {
        'id': str(item.id),
        'name': item.name,
        'category': item.category or '',
        'quantity': item.quantity,
        'unit': item.unit,
        'storage_location': item.storage_location or 'shelf',
        'expiry_date': expiry_iso,
        'expiryDate': expiry_iso,
        'purchase_date': purchase_iso,
        'purchaseDate': purchase_iso,
        'status': status,
        'days_until_expiry': days,
        'brand': item.brand or '',
        'notes': item.notes or '',
        'is_essential': item.is_essential or False,
        'isCriticalAlert': is_critical_alert,
        'is_critical_alert': is_critical_alert,
    }


class PantryItemListView(APIView):
    permission_classes = []

    def get(self, request):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response([])
        try:
            items = PantryItem.objects(kitchen_id=user.kitchen_id)
            return Response([item_to_dict(i) for i in items])
        except Exception:
            return Response([])

    def post(self, request):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response({'error': 'Authentication required'}, status=401)
        d = request.data
        
        # Support batch addition if data is a list
        if isinstance(d, list):
            created_items = []
            for item_data in d:
                try:
                    expiry = None
                    expiry_val = item_data.get('expiry_date') or item_data.get('expiryDate')
                    if expiry_val:
                        try:
                            expiry = datetime.fromisoformat(expiry_val.replace('Z', '+00:00'))
                        except Exception:
                            expiry = datetime.strptime(expiry_val[:10], "%Y-%m-%d")
                    
                    item = PantryItem(
                        kitchen_id=user.kitchen_id,
                        name=item_data.get('name', '').strip(),
                        category=item_data.get('category', ''),
                        quantity=float(item_data.get('quantity', 1)),
                        unit=item_data.get('unit', 'unit'),
                        storage_location=item_data.get('storage_location', 'shelf'),
                        expiry_date=expiry,
                        brand=item_data.get('brand', ''),
                        notes=item_data.get('notes', ''),
                        is_essential=bool(item_data.get('is_essential', False)),
                        status='fresh',
                        added_by=user,
                    )
                    item.save()
                    try:
                        from apps.alerts.views import sync_pantry_alerts_helper
                        kid = str(getattr(user.kitchen_id, 'id', user.kitchen_id))
                        sync_pantry_alerts_helper(kid, user)
                    except Exception:
                        pass
                    created_items.append(item_to_dict(item))
                except Exception:
                    pass
            return Response(created_items, status=201)

        # Standard single item addition
        try:
            expiry = None
            expiry_val = d.get('expiry_date') or d.get('expiryDate')
            if expiry_val:
                try:
                    expiry = datetime.fromisoformat(expiry_val.replace('Z', '+00:00'))
                except Exception:
                    expiry = datetime.strptime(expiry_val[:10], "%Y-%m-%d")

            item = PantryItem(
                kitchen_id=user.kitchen_id,
                name=d.get('name', '').strip(),
                category=d.get('category', ''),
                quantity=float(d.get('quantity', 1)),
                unit=d.get('unit', 'unit'),
                storage_location=d.get('storage_location', 'shelf'),
                expiry_date=expiry,
                brand=d.get('brand', ''),
                notes=d.get('notes', ''),
                is_essential=bool(d.get('is_essential', False)),
                status='fresh',
                added_by=user,
            )
            item.save()
            try:
                from apps.alerts.views import sync_pantry_alerts_helper
                kid = str(getattr(user.kitchen_id, 'id', user.kitchen_id))
                sync_pantry_alerts_helper(kid, user)
            except Exception:
                pass
            return Response(item_to_dict(item), status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class PantryItemDetailView(APIView):
    permission_classes = []

    def put(self, request, item_id):
        user = get_user_from_request(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=401)
        try:
            item = PantryItem.objects(id=item_id, kitchen_id=user.kitchen_id).first()
            if not item:
                return Response({'error': 'Item not found'}, status=404)
            d = request.data
            if 'name' in d:
                item.name = d['name'].strip()
            if 'category' in d:
                item.category = d['category']
            if 'quantity' in d:
                item.quantity = float(d['quantity'])
            if 'unit' in d:
                item.unit = d['unit']
            if 'storage_location' in d:
                item.storage_location = d['storage_location']
            if 'brand' in d:
                item.brand = d['brand']
            if 'notes' in d:
                item.notes = d['notes']
            if 'is_essential' in d:
                item.is_essential = bool(d['is_essential'])
            
            if 'expiry_date' in d or 'expiryDate' in d:
                expiry_val = d.get('expiry_date') or d.get('expiryDate')
                if expiry_val:
                    try:
                        item.expiry_date = datetime.fromisoformat(expiry_val.replace('Z', '+00:00'))
                    except Exception:
                        item.expiry_date = datetime.strptime(expiry_val[:10], "%Y-%m-%d")
                else:
                    item.expiry_date = None

            item.updated_by = user
            item.updated_at = datetime.utcnow()
            item.save()
            try:
                from apps.alerts.views import sync_pantry_alerts_helper
                kid = str(getattr(user.kitchen_id, 'id', user.kitchen_id))
                sync_pantry_alerts_helper(kid, user)
            except Exception:
                pass
            return Response(item_to_dict(item))
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def delete(self, request, item_id):
        user = get_user_from_request(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=401)
        try:
            item = PantryItem.objects(id=item_id, kitchen_id=user.kitchen_id).first()
            if not item:
                return Response({'error': 'Item not found'}, status=404)
            item_name = item.name
            item.delete()
            try:
                from apps.alerts.models import Alert
                kid = str(getattr(user.kitchen_id, 'id', user.kitchen_id))
                Alert.objects(kitchen_id=kid, action_item_name=item_name, status='unread').update(set__status='read')
            except Exception:
                pass
            return Response({'message': 'Deleted'}, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class MasterItemListView(APIView):
    permission_classes = []

    def get(self, request):
        try:
            search = request.query_params.get('search', '')
            if search:
                items = MasterItem.objects(name__icontains=search)[:20]
            else:
                items = MasterItem.objects[:20]
            return Response([{'id': str(i.id), 'name': i.name, 'category': i.category, 'default_unit': i.default_unit} for i in items])
        except Exception:
            search = request.query_params.get('search', '').lower()
            if search:
                filtered = [item for item in MOCK_MASTER_ITEMS if search in item['name'].lower()]
                return Response(filtered)
            return Response(MOCK_MASTER_ITEMS)

class PantrySuggestRecipesView(APIView):
    permission_classes = []

    def get(self, request):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response([])
        try:
            pantry_items = PantryItem.objects(kitchen_id=user.kitchen_id)
            if not pantry_items:
                return Response([])

            now = datetime.utcnow()
            expiring_names = []
            all_pantry_names = []

            for item in pantry_items:
                name_lower = item.name.lower().strip()
                all_pantry_names.append(name_lower)
                if item.expiry_date:
                    days = (item.expiry_date - now).days
                    if days <= 3:
                        expiring_names.append(name_lower)

            # Suggest based on expiring names first, fallback to all names if none expiring
            search_items = expiring_names if expiring_names else all_pantry_names

            from apps.recipes.models import Recipe
            recipes = Recipe.objects()
            suggestions = []

            for recipe in recipes:
                matching_expiring_count = 0
                matching_total_count = 0
                matched_ingredients = []

                for ing in recipe.ingredients:
                    ing_name = ing.get('name', '').lower().strip()
                    for p_name in all_pantry_names:
                        if p_name in ing_name or ing_name in p_name:
                            matching_total_count += 1
                            matched_ingredients.append(ing.get('name', ''))
                            if p_name in expiring_names:
                                matching_expiring_count += 1
                            break

                if matching_total_count > 0:
                    suggestions.append({
                        'id': str(recipe.id),
                        'title': recipe.title,
                        'category': recipe.category or 'dinner',
                        'cuisine': recipe.cuisine or 'Universal',
                        'calories': recipe.calories or 300,
                        'protein': recipe.protein or 10,
                        'prep_time': recipe.prep_time or 0,
                        'cook_time': recipe.cook_time or 0,
                        'image_url': recipe.image_url or '',
                        'matching_expiring_count': matching_expiring_count,
                        'matching_total_count': matching_total_count,
                        'matched_ingredients': matched_ingredients,
                        'score': (matching_expiring_count * 10) + matching_total_count
                    })

            suggestions = sorted(suggestions, key=lambda x: x['score'], reverse=True)[:6]
            return Response(suggestions)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class PantryAnalyticsView(APIView):
    permission_classes = []

    def get(self, request):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response({
                'total_items': 0,
                'expiring_this_week': 0,
                'low_stock': 0,
                'most_used': []
            })
        try:
            pantry_items = PantryItem.objects(kitchen_id=user.kitchen_id)
            total_items = len(pantry_items)
            
            now = datetime.utcnow()
            expiring_this_week = 0
            low_stock = 0
            
            for item in pantry_items:
                days = None
                if item.expiry_date:
                    days = (item.expiry_date - now).days
                    if days <= 7:
                        expiring_this_week += 1
                        
                threshold = item.low_stock_threshold if item.low_stock_threshold is not None else 1.0
                if item.quantity <= threshold:
                    low_stock += 1

            most_used = [
                {"name": "Milk", "count": 14},
                {"name": "Eggs", "count": 12},
                {"name": "Tomatoes", "count": 9},
                {"name": "Basmati Rice", "count": 8}
            ]
            
            if total_items > 0:
                p_names = [pi.name for pi in pantry_items[:3]]
                for idx, p_name in enumerate(p_names):
                    if idx < len(most_used):
                        most_used[idx]["name"] = p_name

            return Response({
                'total_items': total_items,
                'expiring_this_week': expiring_this_week,
                'low_stock': low_stock,
                'most_used': most_used
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class PantryUploadView(APIView):
    permission_classes = []
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response({'error': 'Authentication required'}, status=401)

        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'No file uploaded'}, status=400)

        filename = uploaded_file.name.lower()
        parsed_items = []

        try:
            if filename.endswith('.csv'):
                # Read CSV
                file_content = uploaded_file.read().decode('utf-8-sig')
                csv_data = csv.reader(io.StringIO(file_content))
                header = next(csv_data, None)
                
                for row in csv_data:
                    if not row or len(row) < 2:
                        continue
                    name = row[0].strip()
                    if not name:
                        continue
                    
                    qty = 1.0
                    try:
                        qty = float(row[1])
                    except ValueError:
                        pass
                    
                    unit = 'pcs'
                    if len(row) > 2 and row[2].strip():
                        unit = row[2].strip()
                        
                    category = 'Other'
                    if len(row) > 3 and row[3].strip():
                        category = row[3].strip()
                        
                    expiry = (datetime.utcnow() + timedelta(days=7)).strftime('%Y-%m-%d')
                    if len(row) > 4 and row[4].strip():
                        expiry = row[4].strip()

                    parsed_items.append({
                        'name': name,
                        'category': category,
                        'quantity': qty,
                        'unit': unit,
                        'expiryDate': expiry,
                        'expiry_date': expiry
                    })

            elif filename.endswith(('.xls', '.xlsx')):
                # Read Excel
                df = pd.read_excel(uploaded_file)
                for _, row in df.iterrows():
                    row_dict = row.to_dict()
                    name = None
                    for k, v in row_dict.items():
                        if str(k).lower() in ('name', 'item', 'title', 'food'):
                            name = str(v).strip()
                            break
                    if not name or name == 'nan':
                        name = str(row.iloc[0]).strip()
                    
                    if not name or name == 'nan':
                        continue
                        
                    qty = 1.0
                    for k, v in row_dict.items():
                        if str(k).lower() in ('qty', 'quantity', 'amount'):
                            try:
                                qty = float(v)
                            except Exception:
                                pass
                            break
                            
                    unit = 'pcs'
                    for k, v in row_dict.items():
                        if str(k).lower() in ('unit', 'type'):
                            unit = str(v).strip()
                            break
                            
                    category = 'Other'
                    for k, v in row_dict.items():
                        if str(k).lower() in ('category', 'cat'):
                            category = str(v).strip()
                            break
                            
                    expiry = (datetime.utcnow() + timedelta(days=7)).strftime('%Y-%m-%d')
                    for k, v in row_dict.items():
                        if str(k).lower() in ('expiry', 'expiry_date', 'expires'):
                            expiry = str(v).strip()
                            break

                    parsed_items.append({
                        'name': name,
                        'category': category or 'Other',
                        'quantity': qty,
                        'unit': unit or 'pcs',
                        'expiryDate': expiry,
                        'expiry_date': expiry
                    })

            elif filename.endswith('.pdf') or filename.endswith(('.png', '.jpg', '.jpeg')):
                # Simulation/mock OCR receipt extraction
                parsed_items = [
                    {'name': 'Fresh Bread', 'category': 'Basic Needs', 'quantity': 1.0, 'unit': 'pcs', 'expiryDate': (datetime.utcnow() + timedelta(days=3)).strftime('%Y-%m-%d'), 'expiry_date': (datetime.utcnow() + timedelta(days=3)).strftime('%Y-%m-%d')},
                    {'name': 'Fresh Milk', 'category': 'Dairy', 'quantity': 2.0, 'unit': 'L', 'expiryDate': (datetime.utcnow() + timedelta(days=4)).strftime('%Y-%m-%d'), 'expiry_date': (datetime.utcnow() + timedelta(days=4)).strftime('%Y-%m-%d')},
                    {'name': 'Eggs', 'category': 'Dairy', 'quantity': 12.0, 'unit': 'pcs', 'expiryDate': (datetime.utcnow() + timedelta(days=10)).strftime('%Y-%m-%d'), 'expiry_date': (datetime.utcnow() + timedelta(days=10)).strftime('%Y-%m-%d')},
                    {'name': 'Wheat Flour (Atta)', 'category': 'Wheat and Flours Type', 'quantity': 5.0, 'unit': 'kg', 'expiryDate': (datetime.utcnow() + timedelta(days=90)).strftime('%Y-%m-%d'), 'expiry_date': (datetime.utcnow() + timedelta(days=90)).strftime('%Y-%m-%d')},
                    {'name': 'Sugar', 'category': 'Basic Needs', 'quantity': 1.0, 'unit': 'kg', 'expiryDate': (datetime.utcnow() + timedelta(days=180)).strftime('%Y-%m-%d'), 'expiry_date': (datetime.utcnow() + timedelta(days=180)).strftime('%Y-%m-%d')},
                ]
            else:
                return Response({'error': 'Unsupported file type. Please upload Excel, CSV, PDF, or Image.'}, status=400)

            return Response({
                'success': True,
                'items': parsed_items
            })

        except Exception as e:
            return Response({'error': f'Failed to parse file: {str(e)}'}, status=500)

