from django.urls import path
from .views import DashboardSummaryView, KitchenMembersView

urlpatterns = [
    path('dashboard/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('members/', KitchenMembersView.as_view(), name='kitchen-members'),
]
