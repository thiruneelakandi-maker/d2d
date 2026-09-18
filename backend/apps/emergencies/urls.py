from django.urls import path
from .views import (
    EmergencyAnalyzeView,
    EmergencyCreateView,
    EmergencyHistoryView,
    EmergencyDetailView
)

urlpatterns = [
    path('emergencies/analyze/', EmergencyAnalyzeView.as_view(), name='emergency_analyze'),
    path('emergencies/create/', EmergencyCreateView.as_view(), name='emergency_create'),
    path('emergencies/history/', EmergencyHistoryView.as_view(), name='emergency_history'),
    path('emergencies/<str:pk>/', EmergencyDetailView.as_view(), name='emergency_detail'),
]
