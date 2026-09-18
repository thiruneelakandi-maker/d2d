from django.urls import path
from .views import EmergencyContactListView, PersonalICEContactView

urlpatterns = [
    path('emergency-contacts/', EmergencyContactListView.as_view(), name='emergency_contacts_list'),
    path('emergency-contacts/personal/', PersonalICEContactView.as_view(), name='personal_ice_list'),
    path('emergency-contacts/personal/<int:pk>/', PersonalICEContactView.as_view(), name='personal_ice_delete'),
]