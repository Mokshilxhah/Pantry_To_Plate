from django.urls import path, re_path
from .views import ToBuyItemListView, ToBuyItemDetailView, ClearPurchasedView, FavoritesQuickAddView

urlpatterns = [
    re_path(r'^items/?$', ToBuyItemListView.as_view(), name='buylist-items'),
    re_path(r'^items/(?P<item_id>[^/]+)/?$', ToBuyItemDetailView.as_view(), name='buylist-item-detail'),
    re_path(r'^clear-purchased/?$', ClearPurchasedView.as_view(), name='clear-purchased'),
    re_path(r'^favorites/add/?$', FavoritesQuickAddView.as_view(), name='favorites-add'),
]

