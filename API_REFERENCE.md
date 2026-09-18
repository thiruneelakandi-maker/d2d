# Connected API Reference

Base URL in the browser: `/api`  
Local backend target: `http://127.0.0.1:8000/api`

The Vite proxy forwards browser requests from `/api/*` to Django. JWT requests use the `Authorization: Bearer <access-token>` header, which is attached automatically by `frontend/src/services/api.ts`.

## System and Authentication

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health/` | Public | Backend health check |
| POST | `/api/auth/register/` | Public | Create a user and return JWT tokens |
| POST | `/api/auth/login/` | Public | Login and return JWT tokens |
| POST | `/api/auth/refresh/` | Public | Refresh an access token |
| GET | `/api/auth/me/` | JWT | Read the current user profile |
| PATCH | `/api/auth/me/` | JWT | Update the current user profile |

## Emergency Workflow

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/emergencies/analyze/` | Public | Classify a description and return priority, guidance, and service |
| POST | `/api/emergencies/create/` | JWT | Re-analyze and store an emergency report |
| GET | `/api/emergencies/history/` | JWT | Return the signed-in user's reports |
| GET | `/api/emergencies/<id>/` | JWT | Read an owned report |
| PATCH | `/api/emergencies/<id>/` | JWT | Update an owned report status |

Supported categories include flood, fire, road accident, medical emergency, earthquake, cyclone/severe storm, landslide, tsunami, building collapse, missing person, gas/chemical leak, electrical emergency, and other/unknown.

## AI and Knowledge

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/ai/analyze/` | Public | AI service analysis contract |
| POST | `/api/ai/chat/` | Public | Emergency assistant chat |
| GET | `/api/protocols/` | Public | List protocols; supports `category` and `q` |
| GET | `/api/protocols/<id>/` | Public | Read one safety protocol |

## Contacts and Location

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/emergency-contacts/` | Public | List verified emergency contacts; supports `region` and `service` |
| GET | `/api/emergency-contacts/personal/` | Optional JWT | List personal ICE contacts |
| POST | `/api/emergency-contacts/personal/` | Optional JWT | Add a personal ICE contact |
| DELETE | `/api/emergency-contacts/personal/<id>/` | Optional JWT | Delete a personal ICE contact |
| GET | `/api/nearby-resources/?lat=<lat>&lng=<lng>` | Public | Find nearby resources |
| POST | `/api/location/nearby/` | Public | Find nearby resources from JSON coordinates |
| GET | `/api/weather/?lat=<lat>&lng=<lng>` | Public | Return weather data |

## Notifications and Translation

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/weather/` | Public | Return weather and disaster alerts |
| POST | `/api/translate/` | Public | Translate supplied text |

The frontend wrappers are in [frontend/src/services/api.ts](frontend/src/services/api.ts). The main report path is:

`Login -> Dashboard -> /api/emergencies/analyze/ -> /api/emergencies/create/ -> /api/emergencies/history/`