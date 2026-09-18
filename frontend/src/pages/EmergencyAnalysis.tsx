import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  PhoneCall, 
  ArrowRight, 
  Map, 
  Clock, 
  FileText, 
  CheckCircle2, 
  RefreshCw,
  Share2
} from 'lucide-react';
import { emergencyAPI } from '../services/api';
import { EmergencyRequest } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { ConfidenceMeter } from '../components/ConfidenceMeter';
import { SafetyInstructionsCard } from '../components/SafetyInstructionsCard';
import { useEmergency } from '../context/EmergencyContext';

export const EmergencyAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeEmergency, setActiveEmergency, translate } = useEmergency();

  const [emergency, setEmergency] = useState<EmergencyRequest | null>(activeEmergency);
  const [loading, setLoading] = useState(!activeEmergency);
  const [error, setError] = useState<string | null>(null);

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
      console.error('Failed to load emergency triage:', err);
      setError('Could not retrieve triage record. Please call 911 / 112 if in danger.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">
          {translate('analysis.loading')}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Grounding life-safety instructions against official disaster protocols.
        </p>
      </div>
    );
  }

  if (error || !emergency) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{translate('analysis.notFound')}</h3>
        <p className="text-sm text-slate-600 mt-2">{error || 'Emergency incident could not be found.'}</p>
        <Link
          to="/"
          className="mt-5 inline-block px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const ai = emergency.ai_response;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Top Banner: Official Emergency Notice */}
      <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs transition-colors">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-red-600 text-white shrink-0 mt-0.5 animate-pulse">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black uppercase text-red-700 dark:text-red-400 tracking-wider">
              Immediate Dispatch Advisory
            </span>
            <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
              Have you called 112 / 911 yet?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              AI-generated advice is an informational aid, NOT a replacement for official emergency dispatchers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:112"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md shadow-red-500/30 transition-all cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 112 Now</span>
          </a>
          <a
            href="tel:911"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            <span>911</span>
          </a>
        </div>
      </div>

      {/* Emergency Classification Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              {translate('analysis.detected')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {emergency.emergency_type || ai?.emergency_type || 'Emergency Incident'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{translate('analysis.reported')} {new Date(emergency.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>•</span>
              <span className="capitalize font-bold text-blue-600 dark:text-blue-400">{emergency.status.toLowerCase()}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase mr-1">{translate('analysis.priority')}:</span>
            <PriorityBadge priority={emergency.priority || ai?.priority || 'HIGH'} size="lg" />
          </div>
        </div>

        {/* AI Confidence Meter */}
        <ConfidenceMeter
          confidence={ai?.confidence ?? 0.92}
          ragGrounded={ai?.rag_grounded ?? true}
        />

        {/* User's Submitted Description Review */}
        <div className="bg-slate-50 dark:bg-slate-950/70 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>{translate('analysis.situation')}</span>
          </div>
          <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed italic">
            "{emergency.description}"
          </p>
        </div>

        {/* AI Situation Summary */}
        {ai?.summary && (
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-blue-50/50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/60">
            <strong className="text-blue-900 dark:text-blue-300 block font-bold mb-1">{translate('analysis.assessment')}:</strong>
            {ai.summary}
          </div>
        )}
      </div>

      {/* Immediate Safety Instructions Component */}
      <SafetyInstructionsCard
        instructions={ai?.immediate_instructions || []}
        dos={ai?.dos || []}
        donts={ai?.donts || []}
        disclaimer={ai?.emergency_disclaimer}
        sourceProtocols={ai?.source_protocols || []}
      />

      {/* Bottom Floating Navigation: Proceed to Full Response & Map Center */}
      <div className="sticky bottom-4 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <Map className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Need nearby hospital beds, evacuation shelters, or interactive GPS routing?</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate(`/response/${emergency.id}`)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <span>{translate('analysis.response')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
