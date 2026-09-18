from django.urls import path
from .views import NearbyResourcesView
from .views import WeatherView

urlpatterns = [
    path('nearby-resources/', NearbyResourcesView.as_view(), name='nearby_resources'),
    path('location/nearby/', NearbyResourcesView.as_view(), name='location_nearby'),
    path('weather/', WeatherView.as_view(), name='weather'),
]
