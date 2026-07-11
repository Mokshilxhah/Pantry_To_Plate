import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pantrytoplate.settings')
django.setup()

from apps.auth_app.models import User, OTPToken, SubscriptionPlan, Subscription, Payment, Invoice
from apps.kitchen.models import Kitchen
from apps.pantry.models import PantryItem, MasterItem
from apps.buylist.models import ToBuyItem
from apps.recipes.models import Recipe, CommunityRecipe, RecipeLike, RecipeSave, RecipeComment, UserFollow, RecipeRating, FoodGalleryPost, CommunityChallenge
from apps.alerts.models import Alert
from apps.analytics.models import BudgetSettings, Expense
from apps.chat.models import Message
from apps.dietary.models import DietaryProfile
from apps.mealplans.models import WeeklyMealPlan, MenuChangeRequest, MealCompletionLog, WaterIntakeLog, WeightLog

def clear_all_data():
    print("Starting database clean up...")
    
    models = [
        User, OTPToken, SubscriptionPlan, Subscription, Payment, Invoice,
        Kitchen,
        PantryItem, MasterItem,
        ToBuyItem,
        Recipe, CommunityRecipe, RecipeLike, RecipeSave, RecipeComment, UserFollow, RecipeRating, FoodGalleryPost, CommunityChallenge,
        Alert,
        BudgetSettings, Expense,
        Message,
        DietaryProfile,
        WeeklyMealPlan, MenuChangeRequest, MealCompletionLog, WaterIntakeLog, WeightLog
    ]
    
    for model in models:
        try:
            name = model.__name__
            count = model.objects.count()
            print(f"Deleting {count} records from {name}...")
            model.objects.delete()
        except Exception as e:
            print(f"Error deleting from model {name}: {e}")
            
    print("Database cleanup completed successfully!")

if __name__ == '__main__':
    clear_all_data()
