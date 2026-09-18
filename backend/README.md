# AI Emergency Communication and Information Assistant - Backend (STEP 1)

This folder contains a minimal Django REST Framework backend scaffold for STEP 1.

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

4. Copy `.env.example` to `.env` and fill values (at minimum set `SECRET_KEY`):

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
- This step intentionally does not implement authentication, AI, maps or weather integrations.
- The database defaults to SQLite for easy local setup. If you provide `DATABASE_URL` in `.env`, you can later wire it up.
