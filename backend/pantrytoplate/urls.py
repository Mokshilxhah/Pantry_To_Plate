from django.contrib import admin
from django.urls import path, include, re_path
from apps.kitchen.views import DashboardSummaryView

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    re_path(r'^api/v1/dashboard/summary/?$', DashboardSummaryView.as_view(), name='dashboard-summary'),
    re_path(r'^api/v1/auth(?:/|$)', include('apps.auth_app.urls')),
    re_path(r'^api/v1/pantry(?:/|$)', include('apps.pantry.urls')),
    re_path(r'^api/v1/buylist(?:/|$)', include('apps.buylist.urls')),
    re_path(r'^api/v1/shopping(?:/|$)', include('apps.buylist.urls')),
    re_path(r'^api/v1/kitchen(?:/|$)', include('apps.kitchen.urls')),
    re_path(r'^api/v1/recipes(?:/|$)', include('apps.recipes.urls')),
    re_path(r'^api/v1/mealplans(?:/|$)', include('apps.mealplans.urls')),
    re_path(r'^api/v1/analytics(?:/|$)', include('apps.analytics.urls')),
    re_path(r'^api/v1/chat(?:/|$)', include('apps.chat.urls')),
    re_path(r'^api/v1/alerts(?:/|$)', include('apps.alerts.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
