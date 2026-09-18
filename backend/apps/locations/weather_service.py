import os
import requests
from typing import Any, Dict, Optional
from django.conf import settings


def _demo_weather(lat: Optional[float], lng: Optional[float]) -> Dict[str, Any]:
    # Return stable demo data so the UI always has something to show in DEMO_MODE
    return {
        "temperature": 22,
        "condition": "Partly Cloudy",
        "weather_code": 802,
        "wind_speed_kmh": 12,
        "precipitation_mm": 0,
        "severity": "normal",
        "has_alert": False,
        "alert": None,
        "source": "demo"
    }


def _map_openweather_response(payload: Dict[str, Any]) -> Dict[str, Any]:
    main = payload.get('main', {})
    weather = (payload.get('weather') or [{}])[0]
    wind = payload.get('wind', {})
    rain = payload.get('rain', {})
    snow = payload.get('snow', {})

    precipitation = 0.0
    # OpenWeather may provide rain or snow in mm for last 1h
    if isinstance(rain, dict):
        precipitation += float(rain.get('1h', 0) or 0)
    if isinstance(snow, dict):
        precipitation += float(snow.get('1h', 0) or 0)

    wind_kmh = round(float(wind.get('speed', 0)) * 3.6, 1)

    return {
        "temperature": round(float(main.get('temp', 0)), 1),
        "condition": weather.get('description', 'Unknown').title(),
        "weather_code": int(weather.get('id') or 0),
        "wind_speed_kmh": wind_kmh,
        "precipitation_mm": round(precipitation, 1),
        "severity": "severe" if (200 <= int(weather.get('id', 0)) < 700) else "normal",
        "has_alert": False,
        "alert": None,
        "source": "openweathermap"
    }


def get_weather(latitude: Optional[float], longitude: Optional[float]) -> Dict[str, Any]:
    """Return current weather for given coordinates.

    In DEMO_MODE this returns canned data. In production, this will try the configured
    weather provider (OpenWeatherMap by default). The function never raises; it returns
    a fallback payload on errors.
    """
    # validate coordinates
    try:
        if latitude is None or longitude is None:
            raise ValueError('missing coordinates')
        lat = float(latitude)
        lng = float(longitude)
        if not (-90 <= lat <= 90 and -180 <= lng <= 180):
            raise ValueError('invalid coordinate range')
    except Exception:
        # Invalid location: return demo payload but include source indicating invalid
        fallback = _demo_weather(latitude, longitude)
        fallback['source'] = 'invalid_location_fallback'
        return fallback

    demo_mode = getattr(settings, 'DEMO_MODE', os.environ.get('DEMO_MODE', 'True') == 'True')
    api_key = getattr(settings, 'WEATHER_API_KEY', os.environ.get('WEATHER_API_KEY'))

    if demo_mode or not api_key:
        return _demo_weather(lat, lng)

    # Call OpenWeatherMap current weather endpoint as a sensible default provider
    url = 'https://api.openweathermap.org/data/2.5/weather'
    params = {
        'lat': lat,
        'lon': lng,
        'appid': api_key,
        'units': 'metric',
    }

    try:
        resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
        payload = resp.json()
        return _map_openweather_response(payload)
    except requests.exceptions.Timeout:
        # Timeout: return demo fallback with note
        fallback = _demo_weather(lat, lng)
        fallback['source'] = 'timeout_fallback'
        return fallback
    except requests.exceptions.RequestException:
        # Any other request error: fallback
        fallback = _demo_weather(lat, lng)
        fallback['source'] = 'request_error_fallback'
        return fallback
    except Exception:
        fallback = _demo_weather(lat, lng)
        fallback['source'] = 'unknown_error_fallback'
        return fallback
