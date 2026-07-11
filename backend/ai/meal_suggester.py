import random
from apps.recipes.models import Recipe
from apps.pantry.models import PantryItem

class MealSuggestionEngine:
    def suggest(self, kitchen_id, num_suggestions=5):
        # MOCK IMPLEMENTATION
        # In a real scenario, this would query OpenAI/Anthropic and pass pantry items.
        
        # 1. Fetch pantry items to simulate context passing
        pantry = PantryItem.objects(kitchen_id=kitchen_id)
        
        # 2. Fetch some recipes
        recipes = Recipe.objects(kitchen_id=kitchen_id)[:num_suggestions]
        
        suggestions = []
        for r in recipes:
            suggestions.append({
                "recipe_id": str(r.id),
                "name": r.title,
                "reason": "Uses expiring ingredients currently in your pantry.",
                "availability_score": random.randint(70, 100),
                "missing_items": [{"name": "Kasuri Methi", "quantity": "1 tbsp"}],
                "diet_safe_for": ["Admin"],
                "cook_time_mins": r.cook_time,
                "difficulty": r.difficulty
            })
            
        # Fallback if no recipes exist
        if not suggestions:
            suggestions = [
                {
                    "recipe_id": "mock_id_1",
                    "name": "Palak Paneer",
                    "reason": "Uses spinach which is expiring soon.",
                    "availability_score": 95,
                    "missing_items": [],
                    "diet_safe_for": ["All"],
                    "cook_time_mins": 30,
                    "difficulty": "medium"
                }
            ]
            
        return {
            "suggestions": suggestions,
            "pantry_health": 85,
            "expiring_items_used": 2,
            "total_suggestions": len(suggestions)
        }
