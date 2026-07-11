import re
import os
import json
import random
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.recipes.models import Recipe
from apps.pantry.models import PantryItem
from apps.recipes.views import MOCK_RECIPES
from apps.auth_app.views import get_user_from_request

# Standard substitutions map
SUBSTITUTIONS = {
    "butter": ["Olive Oil", "Mayonnaise", "Ghee", "Coconut Oil"],
    "milk": ["Almond Milk", "Soy Milk", "Oat Milk", "Coconut Milk"],
    "eggs": ["Yogurt", "Flaxseed Meal", "Applesauce", "Chia Seeds"],
    "cheese": ["Nutritional Yeast", "Vegan Cheese", "Tofu Cream"],
    "paneer": ["Tofu", "Ricotta Cheese", "Halloumi"],
    "chicken": ["Tofu", "Soya Chunks", "Mushrooms", "Tempeh"],
    "wheat flour": ["Gluten-Free Flour", "Almond Flour", "Oat Flour"],
    "sugar": ["Honey", "Maple Syrup", "Stevia", "Jaggery"],
    "yogurt": ["Sour Cream", "Coconut Yogurt", "Greek Yogurt"],
    "mayonnaise": ["Greek Yogurt", "Hummus", "Mashed Avocado"]
}

def get_substitutions_for(ingredient_name):
    name_lower = ingredient_name.lower().strip()
    for key, subs in SUBSTITUTIONS.items():
        if key in name_lower or name_lower in key:
            return subs
    return []

def get_all_recipes(kitchen_id):
    # Retrieve all recipes from database
    db_recipes = list(Recipe.objects(kitchen_id=kitchen_id))
    # Fallback to MOCK_RECIPES if database is empty
    if not db_recipes:
        combined = []
        for mr in MOCK_RECIPES:
            # Convert mock recipe representation to a standard object structure
            combined.append(Recipe(
                title=mr.get('title'),
                diet_type=mr.get('diet_type', 'veg'),
                prep_time=mr.get('prep_time', 15),
                cook_time=mr.get('cook_time', 20),
                servings=mr.get('servings', 4),
                difficulty=mr.get('difficulty', 'easy'),
                ingredients=mr.get('ingredients', []),
                steps=mr.get('steps', []),
                cuisine=mr.get('tags', ['Universal'])[0] if mr.get('tags') else 'Universal',
                calories=mr.get('calories', 320),
                protein=mr.get('protein', 10),
                carbs=mr.get('carbs', 40),
                fat=mr.get('fat', 12)
            ))
        return combined
    return db_recipes

class AIRecipeGenerateView(APIView):
    permission_classes = []

    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=401)
        
        d = request.data
        manual_ingredients = d.get('ingredients', [])
        cuisine_filter = d.get('cuisine', '').lower().strip()
        diet_filter = d.get('diet_type', '').lower().strip()
        allergy_filter = d.get('allergies', '')
        max_time = d.get('max_time')
        max_calories = d.get('calories')

        # 1. Gather all available ingredients names (lowercase)
        available_names = set()
        for ing in manual_ingredients:
            if ing:
                available_names.add(ing.lower().strip())
                
        # If no manual inputs, load from current pantry
        if not available_names:
            pantry_items = PantryItem.objects(kitchen_id=user.kitchen_id)
            for pi in pantry_items:
                available_names.add(pi.name.lower().strip())

        # Check if OpenAI API Key is configured
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key and api_key.strip():
            try:
                ingredients_str = ", ".join(list(available_names))
                prompt = (
                    f"You are a professional chef. Suggest up to 3 delicious recipes using some or all of the following available ingredients: {ingredients_str}.\n"
                    f"Filters to apply if possible:\n"
                    f"- Cuisine: {cuisine_filter if cuisine_filter else 'Any'}\n"
                    f"- Diet: {diet_filter if diet_filter else 'Any'}\n"
                    f"- Max prep + cook time: {max_time if max_time else 'Any'} minutes\n"
                    f"- Max calories: {max_calories if max_calories else 'Any'} kcal\n"
                    f"- Allergy warnings to avoid (do not use these ingredients): {allergy_filter if allergy_filter else 'None'}\n\n"
                    f"Respond ONLY with a valid JSON array of recipe objects. Do not include markdown code block formatting or any explanation text. The JSON array must exactly match this structure:\n"
                    f"[\n"
                    f"  {{\n"
                    f"    \"recipe_id\": \"unique_id\",\n"
                    f"    \"title\": \"Recipe Name\",\n"
                    f"    \"cuisine\": \"Indian/Italian/etc\",\n"
                    f"    \"diet_type\": \"veg/non-veg/vegan\",\n"
                    f"    \"prep_time\": 10,\n"
                    f"    \"cook_time\": 15,\n"
                    f"    \"total_time\": 25,\n"
                    f"    \"difficulty\": \"easy/medium/hard\",\n"
                    f"    \"calories\": 350,\n"
                    f"    \"protein\": 12,\n"
                    f"    \"carbs\": 45,\n"
                    f"    \"fat\": 10,\n"
                    f"    \"match_score\": 90,\n"
                    f"    \"matched_ingredients\": [\"ingredient_name\"],\n"
                    f"    \"missing_ingredients\": [{{\"name\": \"missing_ingredient_name\", \"quantity\": 1, \"unit\": \"pcs\"}}],\n"
                    f"    \"substitutions\": {{\"missing_ingredient_name\": [\"substitute_1\", \"substitute_2\"]}},\n"
                    f"    \"rating\": 4.7\n"
                    f"  }}\n"
                    f"]"
                )

                headers = {
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "contents": [{
                        "parts": [{
                            "text": prompt
                        }]
                    }],
                    "generationConfig": {
                        "responseMimeType": "application/json"
                    }
                }
                
                response = requests.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={api_key}",
                    headers=headers,
                    json=payload,
                    timeout=25
                )
                
                if response.status_code == 200:
                    result_json = response.json()
                    content = result_json['candidates'][0]['content']['parts'][0]['text'].strip()
                    
                    if content.startswith("```"):
                        content = re.sub(r"^```(?:json)?\n", "", content)
                        content = re.sub(r"\n```$", "", content)
                        content = content.strip()
                        
                    parsed_recipes = json.loads(content)
                    return Response(parsed_recipes, status=200)
                else:
                    raise Exception(f"Gemini API returned status code {response.status_code}: {response.text}")
            except Exception as e:
                print(f"Gemini API call failed: {str(e)}. Falling back to local mock suggestions.")

        # 2. Get list of recipes (Local Fallback)
        recipes = get_all_recipes(user.kitchen_id)
        suggestions = []

        # Parse allergy words
        allergy_words = []
        if allergy_filter:
            allergy_words = [w.strip().lower() for w in re.split(r'[,;\s]+', allergy_filter) if w.strip()]

        for r in recipes:
            # Apply Filters
            # A. Cuisine Filter
            if cuisine_filter and cuisine_filter != 'all':
                rc = (r.cuisine or '').lower()
                r_tags = [t.lower() for t in (r.tags or [])]
                if cuisine_filter not in rc and cuisine_filter not in r_tags:
                    continue

            # B. Diet Filter
            if diet_filter and diet_filter != 'all':
                rd = (r.diet_type or '').lower()
                if diet_filter == 'veg' and rd not in ['veg', 'vegetarian']:
                    continue
                if diet_filter == 'vegan' and rd != 'vegan':
                    continue
                if diet_filter == 'non-veg' and rd == 'veg':
                    continue

            # C. Time Filter
            total_time = (r.prep_time or 0) + (r.cook_time or 0)
            if max_time is not None:
                try:
                    if total_time > int(max_time):
                        continue
                except ValueError:
                    pass

            # D. Calorie Filter
            if max_calories is not None:
                try:
                    r_cal = r.calories or 300
                    if r_cal > int(max_calories):
                        continue
                except ValueError:
                    pass

            # E. Allergy Filter
            has_allergy = False
            for ing in r.ingredients:
                ing_name_lower = ing.get('name', '').lower()
                for allergen in allergy_words:
                    if allergen in ing_name_lower:
                        has_allergy = True
                        break
                if has_allergy:
                    break
            if has_allergy:
                continue

            # 3. Match ingredients
            matched = []
            missing = []
            sub_suggestions = {}

            for ing in r.ingredients:
                ing_name = ing.get('name', '')
                ing_name_lower = ing_name.lower().strip()
                
                is_matched = False
                for p_name in available_names:
                    if p_name in ing_name_lower or ing_name_lower in p_name:
                        is_matched = True
                        break
                
                if is_matched:
                    matched.append(ing_name)
                else:
                    missing.append({
                        "name": ing_name,
                        "quantity": ing.get('quantity', 1),
                        "unit": ing.get('unit', 'pcs')
                    })
                    subs = get_substitutions_for(ing_name)
                    if subs:
                        sub_suggestions[ing_name] = subs

            # Calculate match score
            total_ingredients_count = len(r.ingredients)
            if total_ingredients_count > 0:
                match_score = int((len(matched) / total_ingredients_count) * 100)
            else:
                match_score = 100

            suggestions.append({
                "recipe_id": str(r.id) if getattr(r, 'id', None) else "mock_id_" + r.title.replace(" ", "_"),
                "title": r.title,
                "cuisine": r.cuisine or "Universal",
                "diet_type": r.diet_type or "veg",
                "prep_time": r.prep_time or 10,
                "cook_time": r.cook_time or 15,
                "total_time": total_time,
                "difficulty": r.difficulty or "easy",
                "calories": r.calories or 350,
                "protein": r.protein or 12,
                "carbs": r.carbs or 45,
                "fat": r.fat or 10,
                "match_score": match_score,
                "matched_ingredients": matched,
                "missing_ingredients": missing,
                "substitutions": sub_suggestions,
                "rating": round(random.uniform(4.3, 4.9), 1)
            })

        # Sort by match score descending
        suggestions = sorted(suggestions, key=lambda x: x['match_score'], reverse=True)
        return Response(suggestions, status=200)

class AIPantryChatView(APIView):
    permission_classes = []

    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=401)

        message = request.data.get('message', '').strip()
        if not message:
            return Response({'error': 'Message required'}, status=400)

        # Check if Gemini API Key is configured
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key and api_key.strip():
            try:
                pantry_items = PantryItem.objects(kitchen_id=user.kitchen_id)
                pantry_list = [pi.name.lower().strip() for pi in pantry_items]
                pantry_str = ", ".join(pantry_list)
                
                prompt = (
                    f"You are a helpful AI Pantry Chef. The user is asking: '{message}'.\n"
                    f"Here are the active ingredients in their virtual kitchen pantry: {pantry_str}.\n"
                    f"Provide a helpful conversational reply to their query. If you recommend recipes, suggest up to 2 specific dishes. "
                    f"Respond ONLY with a valid JSON object matching the following structure (do not include markdown code block syntax):\n"
                    f"{{\n"
                    f"  \"message\": \"Conversational response text (you can use markdown here)\",\n"
                    f"  \"recipes\": [\n"
                    f"    {{\n"
                    f"      \"recipe_id\": \"unique_id\",\n"
                    f"      \"title\": \"Recipe Title\",\n"
                    f"      \"cook_time\": 20,\n"
                    f"      \"match_score\": 90,\n"
                    f"      \"missing\": [\"missing_ingredient\"],\n"
                    f"      \"matched\": [\"matched_ingredient\"]\n"
                    f"    }}\n"
                    f"  ]\n"
                    f"}}"
                )

                headers = {
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "contents": [{
                        "parts": [{
                            "text": prompt
                        }]
                    }],
                    "generationConfig": {
                        "responseMimeType": "application/json"
                    }
                }
                
                response = requests.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={api_key}",
                    headers=headers,
                    json=payload,
                    timeout=25
                )
                
                if response.status_code == 200:
                    result_json = response.json()
                    content = result_json['candidates'][0]['content']['parts'][0]['text'].strip()
                    
                    if content.startswith("```"):
                        content = re.sub(r"^```(?:json)?\n", "", content)
                        content = re.sub(r"\n```$", "", content)
                        content = content.strip()
                        
                    parsed_chat = json.loads(content)
                    return Response(parsed_chat, status=200)
                else:
                    raise Exception(f"Gemini API returned status code {response.status_code}: {response.text}")
            except Exception as e:
                print(f"Gemini Chat API call failed: {str(e)}. Falling back to local mock chatbot.")

        # 1. Simple regex scanner to identify ingredient terms from natural queries (Local Fallback)
        known_keywords = ["tomato", "cucumber", "bread", "cheese", "eggs", "paneer", "chicken", "onion", "garlic", "rice", "spinach", "potato", "milk", "butter"]
        extracted_ingredients = []
        for kw in known_keywords:
            if re.search(r'\b' + kw + r's?\b', message.lower()):
                extracted_ingredients.append(kw)

        # Fallback to pantry if no words matching ingredients list were typed
        pantry_items = PantryItem.objects(kitchen_id=user.kitchen_id)
        if not extracted_ingredients:
            extracted_ingredients = [pi.name.lower().strip() for pi in pantry_items]

        # Extract time constraint if present
        max_time = None
        time_match = re.search(r'(\d+)\s*(min|minute|mins)', message.lower())
        if time_match:
            try:
                max_time = int(time_match.group(1))
            except ValueError:
                pass

        # 2. Match against recipe lists
        recipes = get_all_recipes(user.kitchen_id)
        suggestions = []

        for r in recipes:
            matched = []
            missing = []
            for ing in r.ingredients:
                ing_name_lower = ing.get('name', '').lower()
                is_matched = False
                for p_name in extracted_ingredients:
                    if p_name in ing_name_lower or ing_name_lower in p_name:
                        is_matched = True
                        break
                if is_matched:
                    matched.append(ing.get('name', ''))
                else:
                    missing.append(ing.get('name', ''))

            total_time = (r.prep_time or 0) + (r.cook_time or 0)
            if max_time and total_time > max_time:
                continue

            total_count = len(r.ingredients)
            score = int((len(matched) / total_count) * 100) if total_count > 0 else 0

            # Only suggest if match is reasonable
            if score > 0:
                suggestions.append({
                    "recipe_id": str(r.id) if getattr(r, 'id', None) else "mock_id_" + r.title.replace(" ", "_"),
                    "title": r.title,
                    "cook_time": total_time,
                    "match_score": score,
                    "missing": missing,
                    "matched": matched
                })

        suggestions = sorted(suggestions, key=lambda x: x['match_score'], reverse=True)[:3]

        # 3. Formulate natural response
        if suggestions:
            response_text = f"Here are the recipes matching your ingredients (**{', '.join([i.capitalize() for i in extracted_ingredients[:5]])}**):\n\n"
            for sug in suggestions:
                response_text += f"- **{sug['title']}** (Time: {sug['cook_time']} min) - *{sug['match_score']}% match*\n"
                if sug['missing']:
                    response_text += f"  - *Missing:* {', '.join(sug['missing'][:2])}\n"
            response_text += "\nFeel free to ask me for quick substitutions or add missing items to your grocery list!"
        else:
            response_text = "I couldn't find any exact recipes for those ingredients. Would you like me to suggest some general pantry recipes like Scrambled Eggs or a Quick Green Salad instead?"

        return Response({
            "message": response_text,
            "recipes": suggestions
        }, status=200)
