from rest_framework import serializers
from .models import Recipe, CommunityRecipe

class RecipeSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    prep_time = serializers.IntegerField(required=False, default=10)
    cook_time = serializers.IntegerField(required=False, default=15)
    servings = serializers.IntegerField(required=False, default=2)
    difficulty = serializers.CharField(required=False, default='easy')
    ingredients = serializers.ListField(required=False, default=list)
    steps = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    tags = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    diet_type = serializers.CharField(required=False, default='veg')
    category = serializers.CharField(required=False, allow_blank=True, default='dinner')
    image_url = serializers.CharField(required=False, allow_blank=True, default='')
    calories = serializers.IntegerField(required=False, default=300)
    protein = serializers.IntegerField(required=False, default=10)
    carbs = serializers.IntegerField(required=False, default=40)
    fat = serializers.IntegerField(required=False, default=10)
    cuisine = serializers.CharField(required=False, default='Universal')
    source = serializers.CharField(required=False, default='manual')

    def to_internal_value(self, data):
        processed_data = data.copy() if hasattr(data, 'copy') else dict(data)
        
        # 1. Parse ingredients if it is a string
        ingredients_val = processed_data.get('ingredients')
        if isinstance(ingredients_val, str):
            parsed_ing = []
            for item in ingredients_val.split(','):
                item_clean = item.strip()
                if item_clean:
                    parsed_ing.append({'name': item_clean, 'quantity': 1.0, 'unit': 'pcs'})
            processed_data['ingredients'] = parsed_ing

        # 2. Parse steps if it is a string
        steps_val = processed_data.get('steps')
        if isinstance(steps_val, str):
            processed_data['steps'] = [s.strip() for s in steps_val.split('\n') if s.strip()]

        # 3. Parse tags if it is a string
        tags_val = processed_data.get('tags')
        if isinstance(tags_val, str):
            processed_data['tags'] = [t.strip() for t in tags_val.split(',') if t.strip()]

        return super().to_internal_value(processed_data)

    def create(self, validated_data):
        request = self.context.get('request')
        recipe = Recipe(
            author_id=request.user,
            kitchen_id=request.user.kitchen_id,
            **validated_data
        )
        recipe.save()
        return recipe

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
