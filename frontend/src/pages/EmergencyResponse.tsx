import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  RefreshCw, 
  Bot, 
  Building2, 
  PhoneCall, 
  CloudSun, 
  Layers,
  Check
} from 'lucide-react';
import { emergencyAPI } from '../services/api';
import { EmergencyRequest } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { SafetyInstructionsCard } from '../components/SafetyInstructionsCard';
import { EmergencyContactsSection } from '../components/EmergencyContactsSection';
import { NearbyResourcesSection } from '../components/NearbyResourcesSection';
import { WeatherAlertSection } from '../components/WeatherAlertSection';
import { AICopilotChat } from '../components/AICopilotChat';
import { useEmergency } from '../context/EmergencyContext';

export const EmergencyResponse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { location, activeEmergency, setActiveEmergency } = useEmergency();

  const [emergency, setEmergency] = useState<EmergencyRequest | null>(activeEmergency);
  const [loading, setLoading] = useState(!activeEmergency);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id && (!emergency || emergency.id !== id)) {
      loadEmergency(id);
    }
  }, [id]);

  const loadEmergency = async (reqId: string) => {
    setLoading(true);
    try {
      const data = await emergencyAPI.getById(reqId);
      setEmergency(data);
      setActiveEmergency(data);
    } catch (err) {
      console.error('Failed to load response center:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!emergency) return;
    setUpdatingStatus(true);
    try {
      const updated = await emergencyAPI.updateStatus(emergency.id, 'RESOLVED');
      setEmergency(updated);
      setActiveEmergency(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">
          Loading Emergency Response Center...
        </h2>
      </div>
    );
  }

  const ai = emergency?.ai_response;
  const userLat = emergency?.latitude ?? location.lat;
  const userLng = emergency?.longitude ?? location.lng;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="space-y-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {emergency?.emergency_type || 'Emergency Response Center'}
            </h1>
            {emergency && <PriorityBadge priority={emergency.priority} size="md" />}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Incident Location: {location.address}</span>
          </p>
        </div>

        {/* Resolution status action */}
        <div className="flex items-center gap-3">
          {emergency?.status === 'RESOLVED' ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Incident Marked Safe & Resolved
            </span>
          ) : (
            <button
              onClick={handleMarkResolved}
              disabled={updatingStatus}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {updatingStatus ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Mark Situation Resolved</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION E: Weather & Disaster Alert */}
      <WeatherAlertSection userLat={userLat} userLng={userLng} />

      {/* Main Grid: Left Column (Safety Steps & Contacts), Right Column (Map, Resources, Copilot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* SECTION A: Immediate Safety Instructions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Section A: Immediate Life Safety Guidance</span>
            </div>
            <SafetyInstructionsCard
              instructions={ai?.immediate_instructions || []}
              dos={ai?.dos || []}
              donts={ai?.donts || []}
              disclaimer={ai?.emergency_disclaimer}
              sourceProtocols={ai?.source_protocols || []}
            />
          </div>

          {/* SECTION B: Emergency Contacts (Police, Ambulance, Fire, Disaster) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <PhoneCall className="w-4 h-4 text-red-600" />
              <span>Section B: Regional Emergency Dispatch</span>
            </div>
            <EmergencyContactsSection description={emergency?.description} />
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* SECTION C & D: Nearby Resources & Interactive Map */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Sections C & D: Nearby Resources & Map</span>
            </div>
            <NearbyResourcesSection userLat={userLat} userLng={userLng} />
          </div>

          {/* SECTION F: AI Emergency Copilot Chat */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Bot className="w-4 h-4 text-blue-600" />
              <span>Section F: Interactive Emergency Copilot</span>
            </div>
            <AICopilotChat emergencyContext={emergency} />
          </div>
        </div>
      </div>
    </div>
  );
};
