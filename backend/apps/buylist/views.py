from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ToBuyItem
from apps.auth_app.models import User
from rest_framework_simplejwt.tokens import UntypedToken
from datetime import datetime

MOCK_BUYLIST = [
    {'id': 'buy_001', 'name': 'Eggs', 'quantity': 12.0, 'unit': 'pcs', 'category': 'Dairy', 'is_urgent': True, 'is_purchased': False},
    {'id': 'buy_002', 'name': 'Bread', 'quantity': 1.0, 'unit': 'loaf', 'category': 'Bakery', 'is_urgent': False, 'is_purchased': False},
    {'id': 'buy_003', 'name': 'Olive Oil', 'quantity': 1.0, 'unit': 'bottle', 'category': 'Oils', 'is_urgent': False, 'is_purchased': False},
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

def item_to_dict(item):
    urgency_str = 'urgent' if item.is_urgent else 'normal'
    return {
        'id': str(item.id),
        'name': item.name,
        'quantity': item.quantity or 1,
        'unit': item.unit or 'unit',
        'category': item.category or '',
        'is_urgent': item.is_urgent or False,
        'isUrgent': item.is_urgent or False,
        'urgency': urgency_str,
        'is_purchased': item.is_purchased or False,
        'isPurchased': item.is_purchased or False,
        'isBought': item.is_purchased or False,
        'added_by': str(item.added_by.id) if item.added_by else None,
        'assigned_to': str(item.assigned_to.id) if item.assigned_to else None,
        'assigned_to_name': item.assigned_to_name or '',
        'estimated_cost': item.estimated_cost or 0.0,
        'is_favorite': item.is_favorite or False,
        'created_at': item.created_at.isoformat() if item.created_at else '',
    }

class ToBuyItemListView(APIView):
    permission_classes = []

    def get(self, request):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response([])
        try:
            items = ToBuyItem.objects(kitchen_id=user.kitchen_id)
            return Response([item_to_dict(i) for i in items])
        except Exception:
            return Response([])

    def post(self, request):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response({'error': 'Auth required'}, status=401)
        d = request.data
        try:
            assigned_user = None
            assigned_name = ''
            if d.get('assigned_to'):
                assigned_user = User.objects(id=d.get('assigned_to')).first()
                if assigned_user:
                    assigned_name = assigned_user.full_name or "Family Member"

            # Support both format keys for urgency
            is_urgent = False
            if 'is_urgent' in d:
                is_urgent = bool(d['is_urgent'])
            elif 'isUrgent' in d:
                is_urgent = bool(d['isUrgent'])
            elif 'urgency' in d:
                is_urgent = (d['urgency'] == 'urgent')

            item_name = d.get('name', '').strip()
            if not item_name:
                return Response({'error': 'Item name cannot be empty'}, status=400)

            # Check if there is an existing unpurchased item with the same name in this kitchen
            existing_item = ToBuyItem.objects(
                kitchen_id=user.kitchen_id,
                name__iexact=item_name,
                is_purchased=False
            ).first()

            if existing_item:
                # Increment quantity, align unit, merge urgency
                existing_item.quantity = (existing_item.quantity or 0.0) + float(d.get('quantity', 1))
                if d.get('unit'):
                    existing_item.unit = d.get('unit')
                if is_urgent:
                    existing_item.is_urgent = True
                if assigned_user:
                    existing_item.assigned_to = assigned_user
                    existing_item.assigned_to_name = assigned_name
                if d.get('estimated_cost'):
                    existing_item.estimated_cost = float(d.get('estimated_cost', 0.0))
                existing_item.save()
                return Response(item_to_dict(existing_item), status=201)

            item = ToBuyItem(
                kitchen_id=user.kitchen_id,
                name=item_name,
                quantity=float(d.get('quantity', 1)),
                unit=d.get('unit', 'unit'),
                category=d.get('category', ''),
                is_urgent=is_urgent,
                assigned_to=assigned_user,
                assigned_to_name=assigned_name,
                estimated_cost=float(d.get('estimated_cost', 0.0)),
                is_favorite=bool(d.get('is_favorite', False)),
                added_by=user,
            )
            item.save()
            return Response(item_to_dict(item), status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class ToBuyItemDetailView(APIView):
    permission_classes = []

    def put(self, request, item_id):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response({'error': 'Authentication required'}, status=401)
        try:
            item = ToBuyItem.objects(id=item_id, kitchen_id=user.kitchen_id).first()
            if not item:
                return Response({'error': 'Not found'}, status=404)
            d = request.data
            
            # Check is_purchased / isBought / isPurchased
            is_purchased_val = None
            if 'is_purchased' in d:
                is_purchased_val = bool(d['is_purchased'])
            elif 'isPurchased' in d:
                is_purchased_val = bool(d['isPurchased'])
            elif 'isBought' in d:
                is_purchased_val = bool(d['isBought'])

            if is_purchased_val is not None:
                prev_purchased = item.is_purchased
                item.is_purchased = is_purchased_val
                if item.is_purchased:
                    item.purchased_by = user
                    # Get addToPantry from request (defaults to True for backward compatibility)
                    add_to_pantry = bool(d.get('addToPantry', d.get('add_to_pantry', True)))
                    if not prev_purchased and add_to_pantry:
                        from apps.pantry.models import PantryItem
                        
                        # Parse expiry date if provided
                        expiry = None
                        expiry_val = d.get('expiry_date') or d.get('expiryDate')
                        if expiry_val:
                            try:
                                expiry = datetime.fromisoformat(expiry_val.replace('Z', '+00:00'))
                            except Exception:
                                try:
                                    expiry = datetime.strptime(expiry_val[:10], "%Y-%m-%d")
                                except Exception:
                                    pass

                        req_category = d.get('category')
                        pantry_cat = None
                        standard_categories = [
                            'Fruits/Vegetables', 'Dairy', 'Grains', 'Wheat and Flours Type',
                            'Spices', 'Snacks and Beverages', 'Basic Needs', 'Other'
                        ]
                        
                        if req_category:
                            for c in standard_categories:
                                if c.lower() == req_category.lower().strip():
                                    pantry_cat = c
                                    break

                        if not pantry_cat:
                            cat_lower = (item.category or 'Other').lower()
                            pantry_cat = 'Other'
                            for c in standard_categories:
                                # Special rules for legacy category mapping
                                if c.lower() in cat_lower or cat_lower in c.lower() or \
                                   (c == 'Fruits/Vegetables' and ('vegetable' in cat_lower or 'fruit' in cat_lower)):
                                    pantry_cat = c
                                    break

                        existing = PantryItem.objects(kitchen_id=user.kitchen_id, name__iexact=item.name).first()
                        if existing:
                            existing.quantity += (item.quantity or 1.0)
                            if expiry:
                                existing.expiry_date = expiry
                            if pantry_cat:
                                existing.category = pantry_cat
                            existing.save()
                        else:
                            cat_lower = (pantry_cat or 'Other').lower()
                            location = 'shelf'
                            if 'vegetable' in cat_lower or 'fruit' in cat_lower or 'dairy' in cat_lower or 'meat' in cat_lower or 'protein' in cat_lower:
                                location = 'refrigerator'
                            elif 'freeze' in cat_lower:
                                location = 'freezer'
                            elif 'bread' in cat_lower or 'bakery' in cat_lower:
                                location = 'bread_box'
                            elif 'basket' in cat_lower:
                                location = 'fruit_basket'

                            PantryItem(
                                kitchen_id=user.kitchen_id,
                                name=item.name,
                                category=pantry_cat,
                                quantity=item.quantity or 1.0,
                                unit=item.unit or 'pcs',
                                storage_location=location,
                                brand='Shopping List Sync',
                                expiry_date=expiry,
                                added_by=user
                            ).save()

            if 'is_urgent' in d:
                item.is_urgent = bool(d['is_urgent'])
            elif 'isUrgent' in d:
                item.is_urgent = bool(d['isUrgent'])
            elif 'urgency' in d:
                item.is_urgent = (d['urgency'] == 'urgent')

            if 'name' in d:
                item.name = d['name']
            if 'quantity' in d:
                item.quantity = float(d['quantity'])
            if 'unit' in d:
                item.unit = d['unit']
            if 'category' in d:
                item.category = d['category']
            if 'estimated_cost' in d:
                item.estimated_cost = float(d['estimated_cost'])
            if 'is_favorite' in d:
                item.is_favorite = bool(d['is_favorite'])
            if 'assigned_to' in d:
                if d['assigned_to']:
                    assigned_user = User.objects(id=d['assigned_to']).first()
                    if assigned_user:
                        item.assigned_to = assigned_user
                        item.assigned_to_name = assigned_user.full_name or "Family Member"
                else:
                    item.assigned_to = None
                    item.assigned_to_name = ''
            
            item.save()
            return Response(item_to_dict(item))
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def delete(self, request, item_id):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response({'error': 'Authentication required'}, status=401)
        try:
            item = ToBuyItem.objects(id=item_id, kitchen_id=user.kitchen_id).first()
            if item:
                item.delete()
            return Response({'message': 'Deleted'})
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class ClearPurchasedView(APIView):
    permission_classes = []

    def post(self, request):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response({'error': 'Auth required'}, status=401)
        try:
            ToBuyItem.objects(kitchen_id=user.kitchen_id, is_purchased=True).delete()
            return Response({'message': 'Cleared purchased items'})
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class FavoritesQuickAddView(APIView):
    permission_classes = []

    def post(self, request):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response({'error': 'Auth required'}, status=401)
        try:
            item_id = request.data.get('item_id')
            fav_item = ToBuyItem.objects(id=item_id, kitchen_id=user.kitchen_id).first()
            if not fav_item:
                return Response({'error': 'Item not found'}, status=404)
            
            new_item = ToBuyItem(
                kitchen_id=user.kitchen_id,
                name=fav_item.name,
                quantity=fav_item.quantity or 1,
                unit=fav_item.unit or 'unit',
                category=fav_item.category or 'Grocery',
                is_urgent=fav_item.is_urgent,
                is_favorite=True,
                is_purchased=False,
                added_by=user
            )
            new_item.save()
            return Response(item_to_dict(new_item), status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
