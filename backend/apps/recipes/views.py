from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import UntypedToken
from .models import Recipe, RecipeSave
from .serializers import RecipeSerializer
from apps.auth_app.models import User

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

# Mock recipe data (for development without MongoDB)
MOCK_RECIPES = [
    {
        "id": "recipe_001",
        "title": "Dal Tadka",
        "diet_type": "veg",
        "prep_time": 10,
        "cook_time": 20,
        "servings": 4,
        "difficulty": "easy",
        "ingredients": [
            {"name": "Toor Dal", "quantity": 1, "unit": "cup"},
            {"name": "Tomatoes", "quantity": 2, "unit": "pieces"},
            {"name": "Onions", "quantity": 1, "unit": "pieces"},
            {"name": "Ginger", "quantity": 1, "unit": "inch"},
            {"name": "Garlic", "quantity": 4, "unit": "cloves"}
        ],
        "steps": [
            "Pressure cook dal with turmeric and salt",
            "Prepare tadka with cumin, garlic, and onions",
            "Add tomatoes and cook until soft",
            "Mix tadka with cooked dal",
            "Garnish with coriander"
        ],
        "tags": ["Indian", "Comfort Food", "Protein Rich"]
    },
    {
        "id": "recipe_002",
        "title": "Paneer Butter Masala",
        "diet_type": "veg",
        "prep_time": 15,
        "cook_time": 30,
        "servings": 4,
        "difficulty": "medium",
        "ingredients": [
            {"name": "Paneer", "quantity": 250, "unit": "g"},
            {"name": "Tomatoes", "quantity": 4, "unit": "pieces"},
            {"name": "Onions", "quantity": 2, "unit": "pieces"},
            {"name": "Cream", "quantity": 100, "unit": "ml"},
            {"name": "Butter", "quantity": 2, "unit": "tbsp"}
        ],
        "steps": [
            "Make tomato-onion gravy",
            "Add spices and cook",
            "Add cream and butter",
            "Add paneer cubes",
            "Simmer for 5 minutes"
        ],
        "tags": ["Indian", "Rich", "Party Special"]
    },
    {
        "id": "recipe_003",
        "title": "Palak Paneer",
        "diet_type": "veg",
        "prep_time": 10,
        "cook_time": 25,
        "servings": 4,
        "difficulty": "medium",
        "ingredients": [
            {"name": "Spinach", "quantity": 500, "unit": "g"},
            {"name": "Paneer", "quantity": 200, "unit": "g"},
            {"name": "Onions", "quantity": 1, "unit": "pieces"},
            {"name": "Ginger", "quantity": 1, "unit": "inch"},
            {"name": "Garlic", "quantity": 4, "unit": "cloves"}
        ],
        "steps": [
            "Blanch spinach and make puree",
            "Prepare onion-ginger-garlic base",
            "Add spinach puree",
            "Add paneer cubes",
            "Finish with cream"
        ],
        "tags": ["Healthy", "Iron Rich", "Green"]
    },
    {
        "id": "recipe_004",
        "title": "Aloo Gobi",
        "diet_type": "veg",
        "prep_time": 10,
        "cook_time": 20,
        "servings": 4,
        "difficulty": "easy",
        "ingredients": [
            {"name": "Potatoes", "quantity": 2, "unit": "pieces"},
            {"name": "Cauliflower", "quantity": 1, "unit": "pieces"},
            {"name": "Tomatoes", "quantity": 2, "unit": "pieces"},
            {"name": "Onions", "quantity": 1, "unit": "pieces"}
        ],
        "steps": [
            "Cut vegetables into florets/cubes",
            "Sauté with spices",
            "Add tomatoes",
            "Cook covered until tender",
            "Garnish with coriander"
        ],
        "tags": ["Simple", "Everyday", "Dry Curry"]
    },
    {
        "id": "recipe_005",
        "title": "Vegetable Biryani",
        "diet_type": "veg",
        "prep_time": 20,
        "cook_time": 40,
        "servings": 6,
        "difficulty": "hard",
        "ingredients": [
            {"name": "Basmati Rice", "quantity": 2, "unit": "cups"},
            {"name": "Mixed Vegetables", "quantity": 3, "unit": "cups"},
            {"name": "Yogurt", "quantity": 1, "unit": "cup"},
            {"name": "Onions", "quantity": 2, "unit": "pieces"}
        ],
        "steps": [
            "Soak rice for 30 minutes",
            "Prepare vegetable masala",
            "Layer rice and vegetables",
            "Dum cook for 20 minutes",
            "Serve with raita"
        ],
        "tags": ["Festive", "One Pot", "Aromatic"]
    },
    {
        "id": "recipe_006",
        "title": "Tomato Rice",
        "diet_type": "veg",
        "prep_time": 10,
        "cook_time": 15,
        "servings": 4,
        "difficulty": "easy",
        "ingredients": [
            {"name": "Basmati Rice", "quantity": 2, "unit": "cups"},
            {"name": "Tomatoes", "quantity": 3, "unit": "pieces"},
            {"name": "Onions", "quantity": 1, "unit": "pieces"}
        ],
        "steps": [
            "Cook rice and keep aside",
            "Make tomato masala",
            "Mix rice with masala",
            "Temper with curry leaves",
            "Serve hot"
        ],
        "tags": ["Quick", "Tangy", "Lunch Box"]
    }
]

def seed_default_recipes(kitchen_id, user):
    from .models import Recipe
    
    # Check plan
    plan_name = 'free'
    if user.role == 'admin':
        plan_name = user.subscription_plan or 'free'
    else:
        # Get admin user of this kitchen
        from apps.kitchen.models import Kitchen
        kitchen = Kitchen.objects(id=kitchen_id).first()
        if kitchen and kitchen.admin_id:
            plan_name = kitchen.admin_id.subscription_plan or 'free'
            
    # Number of recipes to seed
    num_to_seed = 5
    if plan_name == 'pro':
        num_to_seed = 10
    elif plan_name == 'premium':
        num_to_seed = 20
        
    recipes_pool = [
        # 1-5 (Free)
        {
            "title": "Dal Tadka", "diet_type": "veg", "prep_time": 10, "cook_time": 20, "servings": 4, "difficulty": "easy",
            "ingredients": [{"name": "Toor Dal", "quantity": 1, "unit": "cup"}, {"name": "Tomatoes", "quantity": 2, "unit": "pieces"}, {"name": "Onions", "quantity": 1, "unit": "pieces"}, {"name": "Garlic", "quantity": 4, "unit": "cloves"}],
            "steps": ["Pressure cook dal with salt", "Prepare tadka with cumin, onions, garlic and tomatoes", "Mix tadka with cooked dal"],
            "tags": ["Indian", "Comfort", "Veg"]
        },
        {
            "title": "Paneer Butter Masala", "diet_type": "veg", "prep_time": 15, "cook_time": 30, "servings": 4, "difficulty": "medium",
            "ingredients": [{"name": "Paneer", "quantity": 250, "unit": "g"}, {"name": "Tomatoes", "quantity": 4, "unit": "pieces"}, {"name": "Cream", "quantity": 100, "unit": "ml"}, {"name": "Butter", "quantity": 2, "unit": "tbsp"}],
            "steps": ["Make tomato gravy with spices", "Add cream and butter", "Stir in paneer cubes and simmer"],
            "tags": ["Indian", "Rich", "Veg"]
        },
        {
            "title": "Masala Omelette", "diet_type": "veg", "prep_time": 5, "cook_time": 5, "servings": 1, "difficulty": "easy",
            "ingredients": [{"name": "Eggs", "quantity": 2, "unit": "pieces"}, {"name": "Onion", "quantity": 0.5, "unit": "pieces"}, {"name": "Green Chili", "quantity": 1, "unit": "pieces"}, {"name": "Coriander", "quantity": 1, "unit": "tbsp"}],
            "steps": ["Beat eggs with chopped onions, chili, coriander and salt", "Pour onto hot buttered pan", "Flip and cook both sides"],
            "tags": ["Quick", "Protein", "Eggs"]
        },
        {
            "title": "Aloo Gobi", "diet_type": "veg", "prep_time": 10, "cook_time": 20, "servings": 4, "difficulty": "easy",
            "ingredients": [{"name": "Potatoes", "quantity": 2, "unit": "pieces"}, {"name": "Cauliflower", "quantity": 1, "unit": "pieces"}, {"name": "Ginger", "quantity": 1, "unit": "inch"}, {"name": "Turmeric", "quantity": 1, "unit": "tsp"}],
            "steps": ["Chop potatoes and cauliflower", "Sauté in oil with ginger, turmeric and cumin", "Cook covered until tender"],
            "tags": ["Indian", "Simple", "Veg"]
        },
        {
            "title": "Tomato Basil Pasta", "diet_type": "veg", "prep_time": 10, "cook_time": 15, "servings": 2, "difficulty": "easy",
            "ingredients": [{"name": "Pasta", "quantity": 200, "unit": "g"}, {"name": "Tomatoes", "quantity": 3, "unit": "pieces"}, {"name": "Garlic", "quantity": 3, "unit": "cloves"}, {"name": "Basil Leaves", "quantity": 8, "unit": "pieces"}],
            "steps": ["Boil pasta in salted water", "Cook garlic and tomatoes in olive oil", "Toss pasta with sauce and fresh basil"],
            "tags": ["Italian", "Quick", "Veg"]
        },
        # 6-10 (Pro)
        {
            "title": "Butter Chicken", "diet_type": "nonveg", "prep_time": 20, "cook_time": 30, "servings": 4, "difficulty": "medium",
            "ingredients": [{"name": "Chicken", "quantity": 500, "unit": "g"}, {"name": "Yogurt", "quantity": 0.5, "unit": "cup"}, {"name": "Butter", "quantity": 3, "unit": "tbsp"}, {"name": "Tomato Puree", "quantity": 1, "unit": "cup"}],
            "steps": ["Marinate chicken in yogurt and spices", "Grill or pan-fry chicken", "Simmer chicken in rich butter-tomato sauce"],
            "tags": ["Indian", "Classic", "NonVeg"]
        },
        {
            "title": "Palak Paneer", "diet_type": "veg", "prep_time": 15, "cook_time": 20, "servings": 4, "difficulty": "medium",
            "ingredients": [{"name": "Spinach", "quantity": 400, "unit": "g"}, {"name": "Paneer", "quantity": 200, "unit": "g"}, {"name": "Ginger", "quantity": 1, "unit": "inch"}, {"name": "Cream", "quantity": 2, "unit": "tbsp"}],
            "steps": ["Blanch spinach and blend into smooth puree", "Sauté ginger, garlic and spices", "Add puree, paneer cubes, and cream"],
            "tags": ["Healthy", "Veg", "Iron"]
        },
        {
            "title": "Vegetable Biryani", "diet_type": "veg", "prep_time": 20, "cook_time": 40, "servings": 6, "difficulty": "hard",
            "ingredients": [{"name": "Basmati Rice", "quantity": 2, "unit": "cups"}, {"name": "Mixed Veggies", "quantity": 2, "unit": "cups"}, {"name": "Yogurt", "quantity": 1, "unit": "cup"}, {"name": "Fried Onions", "quantity": 0.5, "unit": "cup"}],
            "steps": ["Boil rice with whole spices until 70% cooked", "Cook veggies in yogurt-spice gravy", "Layer rice and veggies, dum cook covered"],
            "tags": ["Indian", "Fragrant", "Festive"]
        },
        {
            "title": "Garlic Bread", "diet_type": "veg", "prep_time": 5, "cook_time": 10, "servings": 3, "difficulty": "easy",
            "ingredients": [{"name": "Baguette", "quantity": 1, "unit": "pieces"}, {"name": "Butter", "quantity": 4, "unit": "tbsp"}, {"name": "Garlic", "quantity": 5, "unit": "cloves"}, {"name": "Parsley", "quantity": 1, "unit": "tbsp"}],
            "steps": ["Mix softened butter with minced garlic and parsley", "Slice baguette, spread butter mix", "Bake until golden and crisp"],
            "tags": ["Appetizer", "Garlic", "Baking"]
        },
        {
            "title": "Pancakes", "diet_type": "veg", "prep_time": 10, "cook_time": 10, "servings": 3, "difficulty": "easy",
            "ingredients": [{"name": "Flour", "quantity": 1.5, "unit": "cups"}, {"name": "Milk", "quantity": 1.25, "unit": "cups"}, {"name": "Sugar", "quantity": 2, "unit": "tbsp"}, {"name": "Baking Powder", "quantity": 1, "unit": "tbsp"}],
            "steps": ["Whisk dry and wet ingredients separately, then combine", "Pour batter onto hot greased griddle", "Flip when bubbles pop on surface"],
            "tags": ["Breakfast", "Sweet", "Veg"]
        },
        # 11-20 (Premium)
        {
            "title": "Chicken Tikka Masala", "diet_type": "nonveg", "prep_time": 20, "cook_time": 30, "servings": 4, "difficulty": "medium",
            "ingredients": [{"name": "Chicken Breast", "quantity": 600, "unit": "g"}, {"name": "Yogurt", "quantity": 0.5, "unit": "cup"}, {"name": "Tomato Paste", "quantity": 2, "unit": "tbsp"}, {"name": "Heavy Cream", "quantity": 0.5, "unit": "cup"}],
            "steps": ["Marinate and bake chicken skewers", "Make spiced onion-tomato gravy", "Toss chicken in gravy with cream"],
            "tags": ["Classic", "Rich", "NonVeg"]
        },
        {
            "title": "Fish Curry", "diet_type": "nonveg", "prep_time": 15, "cook_time": 20, "servings": 4, "difficulty": "medium",
            "ingredients": [{"name": "Fish Fillets", "quantity": 500, "unit": "g"}, {"name": "Coconut Milk", "quantity": 1, "unit": "cup"}, {"name": "Tamarind", "quantity": 1, "unit": "tbsp"}, {"name": "Mustard Seeds", "quantity": 1, "unit": "tsp"}],
            "steps": ["Sauté mustard seeds, curry leaves, and spices", "Pour coconut milk and tamarind water, bring to simmer", "Add fish and cook until flaky"],
            "tags": ["Seafood", "Coastal", "NonVeg"]
        },
        {
            "title": "Greek Salad", "diet_type": "veg", "prep_time": 10, "cook_time": 0, "servings": 2, "difficulty": "easy",
            "ingredients": [{"name": "Cucumber", "quantity": 1, "unit": "pieces"}, {"name": "Tomatoes", "quantity": 2, "unit": "pieces"}, {"name": "Feta Cheese", "quantity": 100, "unit": "g"}, {"name": "Olives", "quantity": 10, "unit": "pieces"}],
            "steps": ["Dice cucumber, tomatoes, and red onion", "Toss with olive oil, oregano, and lemon juice", "Top with feta cheese and olives"],
            "tags": ["Salad", "Fresh", "Healthy"]
        },
        {
            "title": "Chicken Alfredo Pasta", "diet_type": "nonveg", "prep_time": 15, "cook_time": 20, "servings": 3, "difficulty": "medium",
            "ingredients": [{"name": "Fettuccine", "quantity": 250, "unit": "g"}, {"name": "Chicken Breast", "quantity": 300, "unit": "g"}, {"name": "Heavy Cream", "quantity": 1, "unit": "cup"}, {"name": "Parmesan", "quantity": 0.5, "unit": "cup"}],
            "steps": ["Boil fettuccine", "Sauté chicken breast slices", "Prepare cream and parmesan sauce, mix with pasta and chicken"],
            "tags": ["Italian", "Creamy", "NonVeg"]
        },
        {
            "title": "Mango Lassi", "diet_type": "veg", "prep_time": 5, "cook_time": 0, "servings": 2, "difficulty": "easy",
            "ingredients": [{"name": "Mango Pulp", "quantity": 1, "unit": "cup"}, {"name": "Yogurt", "quantity": 1, "unit": "cup"}, {"name": "Milk", "quantity": 0.25, "unit": "cup"}, {"name": "Cardamom", "quantity": 0.25, "unit": "tsp"}],
            "steps": ["Add mango pulp, yogurt, milk, sugar and cardamom to blender", "Blend until smooth and frothy", "Serve chilled"],
            "tags": ["Drink", "Mango", "Summer"]
        },
        {
            "title": "Egg Fried Rice", "diet_type": "nonveg", "prep_time": 10, "cook_time": 10, "servings": 2, "difficulty": "easy",
            "ingredients": [{"name": "Cooked Rice", "quantity": 2, "unit": "cups"}, {"name": "Eggs", "quantity": 2, "unit": "pieces"}, {"name": "Soy Sauce", "quantity": 1.5, "unit": "tbsp"}, {"name": "Green Onions", "quantity": 2, "unit": "stalks"}],
            "steps": ["Scramble eggs in wok and set aside", "Sauté chopped veggies, add cold cooked rice", "Drizzle soy sauce, mix in eggs and green onions"],
            "tags": ["Chinese", "Quick", "Eggs"]
        },
        {
            "title": "Chocolate Chip Cookies", "diet_type": "veg", "prep_time": 15, "cook_time": 10, "servings": 12, "difficulty": "medium",
            "ingredients": [{"name": "Flour", "quantity": 1.25, "unit": "cups"}, {"name": "Butter", "quantity": 0.5, "unit": "cup"}, {"name": "Chocolate Chips", "quantity": 0.75, "unit": "cup"}, {"name": "Sugar", "quantity": 0.5, "unit": "cup"}],
            "steps": ["Cream butter and sugars, beat in vanilla extract", "Fold in flour, baking soda, and chocolate chips", "Drop dough spoonfuls on sheet, bake at 180C"],
            "tags": ["Baking", "Sweet", "Dessert"]
        },
        {
            "title": "Vegetable Stir Fry", "diet_type": "veg", "prep_time": 10, "cook_time": 10, "servings": 3, "difficulty": "easy",
            "ingredients": [{"name": "Broccoli", "quantity": 1, "unit": "cup"}, {"name": "Bell Peppers", "quantity": 1, "unit": "pieces"}, {"name": "Carrots", "quantity": 1, "unit": "pieces"}, {"name": "Sesame Oil", "quantity": 1, "unit": "tbsp"}],
            "steps": ["Slice vegetables thinly", "Stir fry in sesame oil over high heat", "Drizzle with soy sauce and sesame seeds"],
            "tags": ["Healthy", "Vegan", "Crunchy"]
        },
        {
            "title": "Chili Chicken", "diet_type": "nonveg", "prep_time": 15, "cook_time": 15, "servings": 3, "difficulty": "medium",
            "ingredients": [{"name": "Chicken Cubes", "quantity": 400, "unit": "g"}, {"name": "Capsicum", "quantity": 1, "unit": "pieces"}, {"name": "Soy Sauce", "quantity": 2, "unit": "tbsp"}, {"name": "Cornflour", "quantity": 2, "unit": "tbsp"}],
            "steps": ["Coat chicken in cornflour and deep/shallow fry", "Sauté garlic, green chilies, onions and capsicum", "Toss chicken with soy and chili sauces"],
            "tags": ["IndoChinese", "Spicy", "NonVeg"]
        },
        {
            "title": "Fruit Salad", "diet_type": "veg", "prep_time": 10, "cook_time": 0, "servings": 3, "difficulty": "easy",
            "ingredients": [{"name": "Apples", "quantity": 1, "unit": "pieces"}, {"name": "Bananas", "quantity": 1, "unit": "pieces"}, {"name": "Strawberries", "quantity": 5, "unit": "pieces"}, {"name": "Honey", "quantity": 1, "unit": "tbsp"}],
            "steps": ["Dice all fruits into bite-sized chunks", "Toss together in a bowl", "Drizzle with honey and fresh mint"],
            "tags": ["Fruit", "Dessert", "Healthy"]
        }
    ]
    
    # Save the sliced default recipes
    for r in recipes_pool[:num_to_seed]:
        Recipe(
            kitchen_id=kitchen_id,
            title=r["title"],
            diet_type=r["diet_type"],
            prep_time=r["prep_time"],
            cook_time=r["cook_time"],
            servings=r["servings"],
            difficulty=r["difficulty"],
            ingredients=r["ingredients"],
            steps=r["steps"],
            tags=r["tags"]
        ).save()

class RecipeListView(APIView):
    permission_classes = []

    def get(self, request):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response([])
        try:
            recipes_count = Recipe.objects(kitchen_id=user.kitchen_id).count()
            if recipes_count == 0:
                seed_default_recipes(user.kitchen_id, user)
                
            recipes = Recipe.objects(kitchen_id=user.kitchen_id)
            
            # Apply search filter (case-insensitive title or ingredient name)
            search = request.GET.get('search', '').strip()
            if search:
                from mongoengine.queryset.visitor import Q
                recipes = recipes.filter(
                    Q(title__icontains=search) | 
                    Q(ingredients__match={'name': {'$regex': search, '$options': 'i'}})
                )

            # Apply tag / diet_type filter
            tag = request.GET.get('tag', 'all').lower().strip()
            if tag and tag != 'all':
                if tag in ('veg', 'nonveg', 'non-veg'):
                    dt = 'nonveg' if tag in ('nonveg', 'non-veg') else 'veg'
                    recipes = recipes.filter(diet_type=dt)
                else:
                    recipes = recipes.filter(tags=tag)

            serializer = RecipeSerializer(recipes, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response([])

    def post(self, request):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response({'error': 'Authentication required'}, status=401)
        
        request.user = user  # Set request.user so serializer context works
        serializer = RecipeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RecipeDetailView(APIView):
    permission_classes = []

    def get(self, request, recipe_id):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            recipe = Recipe.objects(id=recipe_id, kitchen_id=user.kitchen_id).first()
            if not recipe:
                return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response(RecipeSerializer(recipe).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, recipe_id):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            recipe = Recipe.objects(id=recipe_id, kitchen_id=user.kitchen_id).first()
            if not recipe:
                return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = RecipeSerializer(recipe, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, recipe_id):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            recipe = Recipe.objects(id=recipe_id, kitchen_id=user.kitchen_id).first()
            if not recipe:
                return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
            recipe.delete()
            return Response({'message': 'Recipe deleted successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RecipeSaveView(APIView):
    permission_classes = []

    def post(self, request, recipe_id):
        user = get_user_from_request(request)
        if not user or not user.kitchen_id:
            return Response({'error': 'Authentication required'}, status=401)
        try:
            recipe = Recipe.objects(id=recipe_id, kitchen_id=user.kitchen_id).first()
            if not recipe:
                return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Toggle save
            saved = RecipeSave.objects(user_id=user, recipe_id=recipe).first()
            if saved:
                saved.delete()
                return Response({'saved': False, 'message': 'Recipe unsaved successfully'})
            else:
                RecipeSave(user_id=user, recipe_id=recipe).save()
                return Response({'saved': True, 'message': 'Recipe saved successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RecipeSavedListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            saves = RecipeSave.objects(user_id=request.user)
            recipe_ids = [s.recipe_id.id for s in saves]
            recipes = Recipe.objects(id__in=recipe_ids)
            serializer = RecipeSerializer(recipes, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
