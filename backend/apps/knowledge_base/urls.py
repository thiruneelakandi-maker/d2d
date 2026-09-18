from django.urls import path
from .views import ProtocolListView, ProtocolDetailView

urlpatterns = [
    path('protocols/', ProtocolListView.as_view(), name='protocol_list'),
    path('protocols/<int:pk>/', ProtocolDetailView.as_view(), name='protocol_detail'),
]
