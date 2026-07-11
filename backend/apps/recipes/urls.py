from django.urls import path, re_path
from .views import RecipeListView, RecipeDetailView, RecipeSaveView, RecipeSavedListView
from .ai_recipe_views import AIRecipeGenerateView, AIPantryChatView

urlpatterns = [
    re_path(r'^$', RecipeListView.as_view(), name='recipes-list'),
    re_path(r'^saved/?$', RecipeSavedListView.as_view(), name='recipe-saved-list'),
    re_path(r'^ai-generate/?$', AIRecipeGenerateView.as_view(), name='recipe-ai-generate'),
    re_path(r'^ai-chat/?$', AIPantryChatView.as_view(), name='recipe-ai-chat'),
    re_path(r'^(?P<recipe_id>[^/]+)/?$', RecipeDetailView.as_view(), name='recipe-detail'),
    re_path(r'^(?P<recipe_id>[^/]+)/save/?$', RecipeSaveView.as_view(), name='recipe-save'),
]

