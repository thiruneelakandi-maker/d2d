from django.urls import path
from .views import AIAnalyzeView, AIChatView

urlpatterns = [
    path('ai/analyze/', AIAnalyzeView.as_view(), name='ai_analyze'),
    path('ai/chat/', AIChatView.as_view(), name='ai_chat'),
]
