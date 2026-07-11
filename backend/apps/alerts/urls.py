from django.urls import path, re_path
from .views import AlertListView, AlertDetailView

urlpatterns = [
    re_path(r'^$', AlertListView.as_view(), name='alerts-list'),
    re_path(r'^(?P<alert_id>[^/]+)/?$', AlertDetailView.as_view(), name='alert-detail'),
]

