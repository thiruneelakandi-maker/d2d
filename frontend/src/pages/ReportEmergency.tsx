import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { emergencyAPI } from '../services/api';
import { EmergencyContact } from '../types';
import { EmergencyContactsSection } from '../components/EmergencyContactsSection';

const emergencyCategories = [
  { value: 'flood', label: 'Flood' },
  { value: 'fire', label: 'Fire' },
  { value: 'road_accident', label: 'Road Accident' },
  { value: 'medical_emergency', label: 'Medical Emergency' },
  { value: 'earthquake', label: 'Earthquake' },
  { value: 'cyclone_storm', label: 'Cyclone / Severe Storm' },
  { value: 'landslide', label: 'Landslide' },
  { value: 'tsunami', label: 'Tsunami' },
  { value: 'building_collapse', label: 'Building Collapse' },
  { value: 'missing_person', label: 'Missing Person' },
  { value: 'gas_chemical_leak', label: 'Gas or Chemical Leak' },
  { value: 'electrical_emergency', label: 'Electrical Emergency' },
  { value: 'other_unknown', label: 'Other / Unknown Emergency' },
];

const severityOptions = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const normalizePriority = (value?: string) => {
  const v = (value || 'MEDIUM').toUpperCase();
  if (v === 'CRITICAL' || v === 'HIGH' || v === 'MEDIUM' || v === 'LOW') return v;
  if (v === 'URGENT') return 'HIGH';
  return 'MEDIUM';
};

export const ReportEmergency: React.FC = () => {
  const navigate = useNavigate();
  const { location, refreshLocation, translate } = useEmergency();

  const [form, setForm] = useState({
    emergencyType: 'medical_emergency',
    description: '',
    severity: 'HIGH',
    locationText: location.address || 'Current location',
  });
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any>(null);

  const locationLabel = useMemo(() => {
    if (form.locationText && form.locationText.trim()) return form.locationText.trim();
    return 'Location not specified';
  }, [form.locationText]);

  const handleFieldChange = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const runAiAnalysis = async () => {
    if (!form.description.trim()) {
      setError('Please describe the emergency before running AI analysis.');
      return;
    }

    setError(null);
    setAnalyzing(true);

    try {
      const result = await emergencyAPI.analyze(form.description, form.emergencyType);
      const normalizedPriority = normalizePriority(result.priority || result.emergency_type);
      setAiResult({ ...result, priority: normalizedPriority });
      setForm((prev) => ({ ...prev, severity: normalizedPriority }));
      setSuccess('AI analysis completed. Review the recommended actions below.');
    } catch (err: any) {
      console.error('AI analysis failed:', err);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          'AI analysis could not be completed. Please try again or call emergency services directly.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.description.trim()) {
      setError('Please provide a description of the emergency.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const analysis = aiResult || (await emergencyAPI.analyze(form.description, form.emergencyType));
      const finalAiResponse = {
        ...analysis,
        priority: normalizePriority(analysis.priority),
        summary: analysis.summary || `Detected emergency type: ${analysis.emergency_type || form.emergencyType}`,
      };

      const created = await emergencyAPI.create({
        description: form.description,
        category: form.emergencyType || analysis.emergency_type,
        latitude: location.lat,
        longitude: location.lng,
        ai_response: finalAiResponse,
      });

      setSuccess('Emergency report created successfully and sent to the incident history.');
      navigate('/history', {
        state: {
          createdEmergency: created,
          successMessage: 'Emergency report created successfully.',
        },
      });
    } catch (err: any) {
      console.error('Emergency report submission failed:', err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.response?.data?.non_field_errors?.[0] ||
          'Unable to submit the emergency report right now. Please contact emergency services directly.'
      );
    } finally {
      setLoading(false);
    }
  };

  const aiInstructions = Array.isArray(aiResult?.instructions) ? aiResult.instructions : [];
  const recommendedService = aiResult?.recommended_service || 'Dispatch the appropriate emergency responder.';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <AlertTriangle className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-wider">{translate('nav.report')}</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {translate('report.title')}
            </h1>
          </div>

          <button
            type="button"
            onClick={refreshLocation}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            Refresh GPS
          </button>
        </div>

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {translate('report.type')}
              </label>
              <select
                value={form.emergencyType}
                onChange={(e) => handleFieldChange('emergencyType', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                {emergencyCategories.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {translate('report.description')}
              </label>
              <textarea
                rows={6}
                value={form.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Describe what happened, the people involved, injuries, hazards, and any urgency details."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {translate('report.severity')}
                </label>
                <select
                  value={form.severity}
                  onChange={(e) => handleFieldChange('severity', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  {severityOptions.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {translate('report.location')}
                </label>
                <input
                  type="text"
                  value={form.locationText}
                  onChange={(e) => handleFieldChange('locationText', e.target.value)}
                  placeholder="Location name or address"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Selected location
              </div>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{locationLabel}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={runAiAnalysis}
                disabled={analyzing || loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {analyzing ? 'Analyzing...' : translate('report.analyze')}
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || analyzing}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {loading ? 'Submitting...' : translate('report.submit')}
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/60">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Stethoscope className="w-4 h-4 text-amber-500" />
                {translate('report.result')}
              </div>

              {aiResult ? (
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      {aiResult.emergency_type || emergencyCategories.find((item) => item.value === form.emergencyType)?.label || form.emergencyType}
                    </span>
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-700 dark:bg-red-950/60 dark:text-red-300">
                      {normalizePriority(aiResult.priority)} severity
                    </span>
                  </div>

                  <div className="rounded-2xl border border-blue-200 bg-white p-4 dark:border-blue-900 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <Clock3 className="w-4 h-4 text-blue-600" />
                      Recommended immediate actions
                    </div>

                    {aiInstructions.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                        {aiInstructions.map((instruction: string, index: number) => (
                          <li key={`${instruction}-${index}`} className="flex gap-2">
                            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600" />
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                        Use the emergency team or emergency line to confirm the safest next steps. Keep bystanders back and preserve the scene.
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
                    <div className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      Recommended service
                    </div>
                    <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">{recommendedService}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  Run the AI analysis to identify the emergency type, severity, and recommended actions.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Prepared response summary
              </div>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                Current emergency severity: <span className="font-bold">{form.severity}</span>
              </p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                Report location: <span className="font-bold">{locationLabel}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <EmergencyContactsSection description={form.description} />
    </div>
  );
};
