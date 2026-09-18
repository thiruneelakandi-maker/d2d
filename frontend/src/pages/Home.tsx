import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Car, 
  HeartPulse, 
  Waves, 
  Activity, 
  UserX, 
  HelpCircle, 
  ArrowRight, 
  MapPin, 
  AlertCircle, 
  Loader2, 
  Radio, 
  ShieldCheck,
  Zap,
  PhoneCall,
  Sparkles,
  Biohazard,
  Ambulance,
  Shield,
  Stethoscope
} from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { emergencyAPI } from '../services/api';
import { VoiceInput } from '../components/VoiceInput';
import { WeatherAlertSection } from '../components/WeatherAlertSection';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { location, refreshLocation, setActiveEmergency, setCachedAnalysis, translate } = useEmergency();

  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [useLocationToggle, setUseLocationToggle] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick situation chips for 1-tap rapid dispatch description
  const quickSituations = [
    { label: '🌊 Flood / Rising Water', category: 'flood', prompt: 'Rapidly rising floodwater entering residential area, electrical danger, and families needing evacuation.' },
    { label: '🔥 Structure Fire / Smoke', category: 'fire', prompt: 'Active structure fire with thick black smoke and people possibly trapped on upper floors.' },
    { label: '🚗 Road Accident / Crash', category: 'road_accident', prompt: 'Two-vehicle collision on a highway with one person trapped and another bleeding severely.' },
    { label: '🩺 Medical Emergency', category: 'medical_emergency', prompt: 'Person has severe chest pain, trouble breathing, and is sweating heavily.' },
    { label: '🌍 Earthquake / Tremor', category: 'earthquake', prompt: 'Strong earthquake shaking with building damage and a person trapped under debris.' },
    { label: '🌪️ Cyclone / Severe Storm', category: 'cyclone_storm', prompt: 'Severe storm with strong winds, fallen trees, and a roof partially torn off.' },
    { label: '⛰️ Landslide / Slope Failure', category: 'landslide', prompt: 'Mud and rock slide across the road with vehicles stranded and people trapped nearby.' },
    { label: '🌊 Tsunami / Coastal Wave', category: 'tsunami', prompt: 'Coastal warning siren sounding with rising water and residents evacuating from low-lying areas.' },
    { label: '🏚️ Building Collapse', category: 'building_collapse', prompt: 'Part of a building has collapsed and workers may be trapped beneath rubble.' },
    { label: '🧭 Missing Person', category: 'missing_person', prompt: 'Senior citizen missing since early morning and last seen near a local park.' },
    { label: '☠️ Gas / Chemical Leak', category: 'gas_chemical_leak', prompt: 'Strong chemical smell causing dizziness, burns, and breathing difficulty in a warehouse.' },
    { label: '⚡ Electrical Emergency', category: 'electrical_emergency', prompt: 'Downed power line across the street with sparking wires and a nearby pedestrian shocked.' },
    { label: '❔ Other / Unknown Emergency', category: 'other_unknown', prompt: 'Unclear emergency with visible danger, unknown immediate risks, and people needing urgent support.' },
  ];

  const emergencyCategories = [
    { id: 'flood', name: 'Flood', icon: Waves, color: 'hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400' },
    { id: 'fire', name: 'Fire', icon: Flame, color: 'hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
    { id: 'road_accident', name: 'Road Accident', icon: Car, color: 'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400' },
    { id: 'medical_emergency', name: 'Medical Emergency', icon: HeartPulse, color: 'hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400' },
    { id: 'earthquake', name: 'Earthquake', icon: Activity, color: 'hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
    { id: 'cyclone_storm', name: 'Cyclone / Storm', icon: Zap, color: 'hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-violet-600 dark:text-violet-400' },
    { id: 'landslide', name: 'Landslide', icon: AlertCircle, color: 'hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-950/40 text-stone-600 dark:text-stone-400' },
    { id: 'tsunami', name: 'Tsunami', icon: Waves, color: 'hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-600 dark:text-sky-400' },
    { id: 'building_collapse', name: 'Building Collapse', icon: AlertCircle, color: 'hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-orange-600 dark:text-orange-400' },
    { id: 'missing_person', name: 'Missing Person', icon: UserX, color: 'hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400' },
    { id: 'gas_chemical_leak', name: 'Gas / Chemical Leak', icon: Biohazard, color: 'hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-orange-600 dark:text-orange-400' },
    { id: 'electrical_emergency', name: 'Electrical Emergency', icon: Zap, color: 'hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400' },
    { id: 'other_unknown', name: 'Other / Unknown', icon: HelpCircle, color: 'hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400' },
  ];

  // Quick regional helplines
  const regionalHelplines = [
    { name: 'National Emergency', number: '112', desc: 'All-in-one Emergency (Police/Fire/Ambulance)', icon: PhoneCall, badge: 'Universal', bg: 'bg-red-600 hover:bg-red-700 text-white' },
    { name: 'Ambulance / Medical', number: '108', desc: 'Emergency Medical & Trauma Dispatch', icon: Ambulance, badge: 'Medical', bg: 'bg-rose-600 hover:bg-rose-700 text-white' },
    { name: 'Police Control', number: '100', desc: 'Law Enforcement & Immediate Protection', icon: Shield, badge: 'Police', bg: 'bg-blue-600 hover:bg-blue-700 text-white' },
    { name: 'Fire & Rescue', number: '101', desc: 'Fire Brigade & Disaster Relief', icon: Flame, badge: 'Fire', bg: 'bg-amber-600 hover:bg-amber-700 text-white' },
    { name: 'US / International', number: '911', desc: 'US / North American Emergency Dispatch', icon: PhoneCall, badge: '911', bg: 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600' },
  ];

  const handleSituationClick = (situation: typeof quickSituations[0]) => {
    setSelectedCategory(situation.category);
    if (!description.trim()) {
      setDescription(situation.prompt);
    } else {
      setDescription((prev) => `${prev}. ${situation.prompt}`);
    }
    if (error) setError(null);
  };

  const handleQuickSelect = (categoryId: string, name: string) => {
    setSelectedCategory(categoryId);
    if (!description.trim()) {
      setDescription(`Immediate emergency response requested for ${name.toLowerCase()} situation.`);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a brief description of the emergency.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const lat = useLocationToggle ? location.lat : null;
      const lng = useLocationToggle ? location.lng : null;

      // 1. Rapid AI analysis and RAG retrieval
      const analysis = await emergencyAPI.analyze(description, selectedCategory);
      setCachedAnalysis(analysis);

      // 2. Persist Emergency Request in Backend
      const created = await emergencyAPI.create({
        description,
        category: selectedCategory,
        latitude: lat,
        longitude: lng,
        ai_response: analysis,
      });

      setActiveEmergency(created);
      navigate(`/analyze/${created.id}`);
    } catch (err: any) {
      console.error('Emergency submission error:', err);
      setError('Unable to analyze request. Please call 112 / 911 directly if in immediate danger.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full pb-16">
      {/* Hero Section */}
      <section className="pt-8 pb-6 sm:pt-12 sm:pb-8 text-center max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-bold mb-4 shadow-2xs">
          <Radio className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span>{translate('home.badge')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {translate('home.title')}
        </h1>
        <p className="mt-2.5 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal">
          {translate('home.subtitle')}
        </p>

        {/* 1-Tap Quick Helplines Dial Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {regionalHelplines.map((item) => (
            <a
              key={item.number}
              href={`tel:${item.number}`}
              title={`${item.name} (${item.desc})`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-xs transition-transform hover:scale-105 cursor-pointer ${item.bg}`}
            >
              <item.icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.badge}: {item.number}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Weather & Disaster Alert Bar */}
        <WeatherAlertSection userLat={location.lat} userLng={location.lng} />

        {/* Emergency Input Card (Command Console) */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl dark:shadow-blue-950/20 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center justify-between">
              <label className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{translate('home.describe')}</span>
                <span className="text-red-600 dark:text-red-400 font-black">*</span>
              </label>

              {/* Voice Input Button */}
              <VoiceInput
                onTranscript={(text) => setDescription((prev) => (prev ? `${prev} ${text}` : text))}
                disabled={loading}
              />
            </div>

            {/* Quick Situation Chips */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>1-Tap Situation Tags (Click to pre-fill)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickSituations.map((sit, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSituationClick(sit)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer"
                  >
                    {sit.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Textarea */}
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (error) setError(null);
                }}
                rows={4}
                placeholder="E.g., Two cars collided at 5th and Main. One person is trapped, bleeding heavily from their forehead and having trouble breathing..."
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm sm:text-base placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent leading-relaxed transition-colors"
                disabled={loading}
              />
            </div>

            {/* Error notice */}
            {error && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Controls Bar: Category Dropdown & Location Access */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Emergency Type Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {translate('home.category')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  disabled={loading}
                >
                  <option value="">{translate('home.autoDetect')}</option>
                  <option value="flood">Flood</option>
                  <option value="fire">Fire</option>
                  <option value="road_accident">Road Accident</option>
                  <option value="medical_emergency">Medical Emergency</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="cyclone_storm">Cyclone / Severe Storm</option>
                  <option value="landslide">Landslide</option>
                  <option value="tsunami">Tsunami</option>
                  <option value="building_collapse">Building Collapse</option>
                  <option value="missing_person">Missing Person</option>
                  <option value="gas_chemical_leak">Gas or Chemical Leak</option>
                  <option value="electrical_emergency">Electrical Emergency</option>
                  <option value="other_unknown">Other / Unknown Emergency</option>
                </select>
              </div>

              {/* Location Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {translate('home.location')}
                  </label>
                  <button
                    type="button"
                    onClick={refreshLocation}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {translate('home.refreshGps')}
                  </button>
                </div>
                <div
                  onClick={() => setUseLocationToggle(!useLocationToggle)}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                    useLocationToggle
                      ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                      : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className={`w-4 h-4 shrink-0 ${useLocationToggle ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <span className="truncate">
                      {useLocationToggle ? location.address : 'Location Disabled'}
                    </span>
                  </div>
                  <div
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 ${
                      useLocationToggle ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        useLocationToggle ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base sm:text-lg shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-70 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing Situation & Grounding Protocols...</span>
                  </>
                ) : (
                  <>
                    <span>{translate('home.getHelp')}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Emergency Categories Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{translate('home.quickCategories')}</span>
            </h3>
            <span className="text-xs text-slate-400">Click for instant pre-filled triage</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {emergencyCategories.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleQuickSelect(cat.id, cat.name)}
                  className={`p-3 rounded-2xl border bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/60 dark:bg-blue-950/60'
                      : `border-slate-200 dark:border-slate-800 ${cat.color}`
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 text-center truncate w-full">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trust & Verification Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Verified Protocols</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">WHO, Red Cross & FEMA Grounding</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Live Proximity Map</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Nearest Trauma Units & Shelters</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">1-Tap 112 / 911 Dial</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Instant Dispatcher Connection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
