from django.urls import path
from .views import WeatherAlertView, TranslateView

urlpatterns = [
    path('weather/', WeatherAlertView.as_view(), name='weather_alert'),
    path('translate/', TranslateView.as_view(), name='translate'),
]
