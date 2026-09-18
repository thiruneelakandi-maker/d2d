import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  HeartPulse, 
  Shield, 
  Flame, 
  Home, 
  Navigation, 
  Phone, 
  Clock, 
  MapPin 
} from 'lucide-react';
import { EmergencyFacility } from '../types';
import { resourcesAPI } from '../services/api';
import { InteractiveMap } from './InteractiveMap';

interface NearbyResourcesSectionProps {
  userLat?: number | null;
  userLng?: number | null;
}

export const NearbyResourcesSection: React.FC<NearbyResourcesSectionProps> = ({
  userLat,
  userLng,
}) => {
  const [facilities, setFacilities] = useState<EmergencyFacility[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFacility, setSelectedFacility] = useState<EmergencyFacility | null>(null);

  useEffect(() => {
    loadResources(activeTab);
  }, [activeTab, userLat, userLng]);

  const loadResources = async (type: string) => {
    setLoading(true);
    try {
      const data = await resourcesAPI.getNearby(userLat, userLng, type);
      setFacilities(data.results);
      if (data.results.length > 0 && !selectedFacility) {
        setSelectedFacility(data.results[0]);
      }
    } catch (err) {
      console.error('Failed to load nearby resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGoogleMapsDirectionsUrl = (fac: EmergencyFacility) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`;
  };

  const tabs = [
    { id: 'all', label: 'All Resources', icon: Building2 },
    { id: 'hospital', label: 'Hospitals', icon: HeartPulse },
    { id: 'police', label: 'Police', icon: Shield },
    { id: 'fire', label: 'Fire & Rescue', icon: Flame },
    { id: 'shelter', label: 'Shelters', icon: Home },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Nearby Emergency Facilities
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time proximity ranking with verified operational status and navigation routes.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {tabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Map */}
        <div className="mt-5">
          <InteractiveMap
            userLat={userLat}
            userLng={userLng}
            facilities={facilities}
            selectedFacility={selectedFacility}
            onSelectFacility={(fac) => setSelectedFacility(fac)}
          />
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            Scanning nearby emergency facilities...
          </div>
        ) : facilities.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            No facilities found in this category.
          </div>
        ) : (
          facilities.map((facility) => {
            const isSelected = selectedFacility?.id === facility.id;
            return (
              <div
                key={facility.id}
                onClick={() => setSelectedFacility(facility)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'bg-blue-50/40 dark:bg-blue-950/40 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        facility.facility_type === 'hospital'
                          ? 'bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                          : facility.facility_type === 'police'
                          ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : facility.facility_type === 'fire'
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {facility.facility_type}
                    </span>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 block">
                        {facility.distance_km} km
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        ~{facility.eta_minutes} min drive
                      </span>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                    {facility.name}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{facility.address}</span>
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {facility.is_24_hours ? 'Open 24/7' : 'Standard Hours'}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{facility.bed_status}</span>
                    </div>
                    {facility.emergency_services && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {facility.emergency_services}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions: Directions & Direct Call */}
                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={getGoogleMapsDirectionsUrl(facility)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Directions</span>
                  </a>
                  <a
                    href={`tel:${facility.phone}`}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                    title={`Call ${facility.name}`}
                  >
                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
