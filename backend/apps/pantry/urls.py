from django.urls import path, re_path
from .views import PantryItemListView, PantryItemDetailView, MasterItemListView, PantrySuggestRecipesView, PantryAnalyticsView, PantryUploadView

urlpatterns = [
    re_path(r'^items/?$', PantryItemListView.as_view(), name='pantry-items'),
    re_path(r'^items/upload/?$', PantryUploadView.as_view(), name='pantry-upload'),
    re_path(r'^items/(?P<item_id>[^/]+)/?$', PantryItemDetailView.as_view(), name='pantry-item-detail'),
    re_path(r'^master/?$', MasterItemListView.as_view(), name='master-items'),
    re_path(r'^suggest-recipes/?$', PantrySuggestRecipesView.as_view(), name='pantry-suggest-recipes'),
    re_path(r'^analytics/?$', PantryAnalyticsView.as_view(), name='pantry-analytics'),
]


