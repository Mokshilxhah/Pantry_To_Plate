from django.urls import path
from .views import BudgetSettingsView, AnalyticsReportView, ExpenseListView, BudgetMealsView

urlpatterns = [
    path('budget/', BudgetSettingsView.as_view(), name='budget-settings'),
    path('report/', AnalyticsReportView.as_view(), name='analytics-report'),
    path('expenses/', ExpenseListView.as_view(), name='expense-list'),
    path('expenses/<str:expense_id>/', ExpenseListView.as_view(), name='expense-detail'),
    path('budget-meals/', BudgetMealsView.as_view(), name='budget-meals'),
]
