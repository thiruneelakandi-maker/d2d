import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Sun, 
  Wind, 
  AlertTriangle, 
  Thermometer, 
  Droplets, 
  CloudLightning,
  ShieldAlert
} from 'lucide-react';
import { WeatherData } from '../types';
import { servicesAPI } from '../services/api';

interface WeatherAlertSectionProps {
  userLat?: number | null;
  userLng?: number | null;
}

export const WeatherAlertSection: React.FC<WeatherAlertSectionProps> = ({
  userLat,
  userLng,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadWeather();
  }, [userLat, userLng]);

  const loadWeather = async () => {
    setLoading(true);
    try {
      const data = await servicesAPI.getWeather(userLat, userLng);
      setWeather(data);
    } catch (err) {
      console.error('Failed to load weather:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-2"></div>
        <div className="h-8 bg-slate-100 dark:bg-slate-850 rounded"></div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="space-y-3">
      {/* Severe Disaster Warning Banner if active */}
      {weather.has_alert && weather.alert && (
        <div className="p-4 sm:p-5 rounded-3xl bg-red-600 text-white shadow-lg shadow-red-600/30 border border-red-700 flex items-start gap-3.5 animate-emergency-beacon">
          <div className="p-2.5 bg-white/20 rounded-2xl shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white text-red-700 rounded-full">
                CRITICAL DISASTER WARNING
              </span>
              <span className="text-xs text-red-100 font-medium">National Weather Advisory</span>
            </div>
            <h4 className="text-base sm:text-lg font-black tracking-tight">
              {weather.alert.headline}
            </h4>
            <p className="text-xs sm:text-sm text-red-100 leading-relaxed font-medium">
              {weather.alert.instruction}
            </p>
          </div>
        </div>
      )}

      {/* General Weather Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center shrink-0">
            {weather.condition.toLowerCase().includes('rain') ? (
              <CloudRain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            ) : weather.condition.toLowerCase().includes('storm') ? (
              <CloudLightning className="w-6 h-6 text-amber-500" />
            ) : (
              <Sun className="w-6 h-6 text-amber-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Local Meteorological Conditions
              </span>
              {weather.has_alert && (
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                  <AlertTriangle className="w-3 h-3" /> Hazard Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {weather.temperature}°C
              </span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {weather.condition}
              </span>
            </div>
          </div>
        </div>

        {/* Weather Metrics */}
        <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <Wind className="w-4 h-4 text-slate-400" />
            <span>{weather.wind_speed_kmh} km/h wind</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span>{weather.precipitation_mm} mm precip</span>
          </div>
        </div>
      </div>
    </div>
  );
};
