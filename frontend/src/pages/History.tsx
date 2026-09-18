import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  History as HistoryIcon, 
  Calendar, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  RefreshCw,
  PlusCircle,
  FileText
} from 'lucide-react';
import { emergencyAPI } from '../services/api';
import { EmergencyRequest } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { useEmergency } from '../context/EmergencyContext';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveEmergency } = useEmergency();

  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await emergencyAPI.getHistory();
      setEmergencies(data);
    } catch (err) {
      console.error('Failed to load emergency history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (em: EmergencyRequest) => {
    setActiveEmergency(em);
    navigate(`/analyze/${em.id}`);
  };

  const filtered = emergencies.filter((em) => {
    if (filter === 'all') return true;
    return em.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Emergency Incident Log
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Historical record of past emergency triage requests and verified response instructions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Emergency Request</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'active', 'in_progress', 'resolved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
              filter === f
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Incident List */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Retrieving incident records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No emergency records found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Previous emergency requests and AI safety triage reports will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((item) => {
            const dateStr = new Date(item.created_at).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const timeStr = new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                onClick={() => handleOpen(item)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={item.priority} size="sm" />
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        item.status === 'RESOLVED'
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : item.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 ml-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {dateStr} at {timeStr}
                      </span>
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.emergency_type}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    "{item.description}"
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                    <span>View Triage Details</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
