from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/', include('apps.emergencies.urls')),
    path('api/', include('apps.emergency_contacts.urls')),
    path('api/', include('apps.knowledge_base.urls')),
    path('api/', include('apps.locations.urls')),
    path('api/', include('apps.ai_assistant.urls')),
    path('api/', include('apps.notifications.urls')),
]
