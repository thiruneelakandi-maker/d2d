import React, { createContext, useContext, useState, useEffect } from 'react';
import { EmergencyRequest, EmergencyAIResponse } from '../types';

interface LocationState {
  lat: number | null;
  lng: number | null;
  address: string;
  loading: boolean;
  permissionGranted: boolean;
  error?: string;
}

interface EmergencyContextType {
  location: LocationState;
  refreshLocation: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  activeEmergency: EmergencyRequest | null;
  setActiveEmergency: (req: EmergencyRequest | null) => void;
  cachedAnalysis: EmergencyAIResponse | null;
  setCachedAnalysis: (analysis: EmergencyAIResponse | null) => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationState>({
    lat: 40.7128,
    lng: -74.0060,
    address: 'Midtown Manhattan, New York, NY (Default)',
    loading: false,
    permissionGranted: false,
  });

  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('emergency_lang') || 'en';
  });

  const [activeEmergency, setActiveEmergency] = useState<EmergencyRequest | null>(null);
  const [cachedAnalysis, setCachedAnalysis] = useState<EmergencyAIResponse | null>(null);

  const setLanguage = (lang: string) => {
    localStorage.setItem('emergency_lang', lang);
    setLanguageState(lang);
  };

  const refreshLocation = () => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: undefined }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let addr = `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° W`;
        try {
          // Quick reverse-geocode via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`,
            { headers: { 'User-Agent': 'EmergencyAssistantApp/1.0' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              const parts = data.display_name.split(',');
              addr = parts.slice(0, 3).join(', ');
            }
          }
        } catch {
          // Fallback to formatted coordinates
        }

        setLocation({
          lat: latitude,
          lng: longitude,
          address: addr,
          loading: false,
          permissionGranted: true,
        });
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: 'Location access denied or timed out. Using approximate coordinates.',
        }));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    // Attempt location fetch on mount
    refreshLocation();
  }, []);

  return (
    <EmergencyContext.Provider
      value={{
        location,
        refreshLocation,
        language,
        setLanguage,
        activeEmergency,
        setActiveEmergency,
        cachedAnalysis,
        setCachedAnalysis,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const ctx = useContext(EmergencyContext);
  if (!ctx) throw new Error('useEmergency must be used within an EmergencyProvider');
  return ctx;
};
