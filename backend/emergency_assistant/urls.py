from django.contrib import admin
from django.urls import path, include

from config.views import HealthCheckView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', HealthCheckView.as_view(), name='health'),
    path('api/auth/', include('apps.users.urls')),
    path('api/', include('apps.emergencies.urls')),
    path('api/', include('apps.emergency_contacts.urls')),
    path('api/', include('apps.knowledge_base.urls')),
    path('api/', include('apps.locations.urls')),
    path('api/', include('apps.ai_assistant.urls')),
    path('api/', include('apps.notifications.urls')),
]
