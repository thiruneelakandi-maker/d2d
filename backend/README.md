# AI Emergency Communication and Information Assistant - Backend

This folder contains the Django REST Framework backend for the AI Emergency Communication and Information Assistant.

## Quickstart (Windows)

1. Create a virtual environment:

```powershell
python -m venv venv
```

2. Activate the virtual environment (Windows PowerShell):

```powershell
venv\Scripts\Activate
```

3. Install requirements:

```powershell
pip install -r requirements.txt
```

4. Copy `.env.example` to `.env` and configure `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS`:

```powershell
copy .env.example .env
```

5. Run migrations:

```powershell
python manage.py migrate
```

6. Start the development server:

```powershell
python manage.py runserver
```

## Health check

GET http://127.0.0.1:8000/api/health/

Response:

```json
{
  "status": "ok",
  "message": "Emergency Assistant Backend is running"
}
```

## Notes
- JWT authentication protects emergency creation, history, detail, and status updates.
- AI analysis supports all Sprint 1 emergency categories and falls back to verified local guidance when an external model is unavailable.
- The database defaults to SQLite for easy local setup. Set `USE_POSTGRES=True` and the PostgreSQL variables in `.env` for PostgreSQL.
- The Vite frontend uses `http://localhost:5173` by default; keep that origin in `CORS_ALLOWED_ORIGINS` for local development.
- See the repository-level [SPRINT1_CHECKLIST.md](../SPRINT1_CHECKLIST.md) for implemented requirements and remaining scale/deployment work.
