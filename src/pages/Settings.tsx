import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  MapPin, 
  Bell, 
  Users, 
  Lock, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  ShieldAlert,
  Volume2
} from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { contactsAPI } from '../services/api';
import { PersonalICEContact } from '../types';

export const Settings: React.FC = () => {
  const { language, setLanguage, location, refreshLocation } = useEmergency();

  const [iceContacts, setIceContacts] = useState<PersonalICEContact[]>([]);
  const [newIceName, setNewIceName] = useState('');
  const [newIceRel, setNewIceRel] = useState('Family');
  const [newIcePhone, setNewIcePhone] = useState('');
  const [addingIce, setAddingIce] = useState(false);

  // Preference switches
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoSmsIce, setAutoSmsIce] = useState(true);
  const [highAccuracyGps, setHighAccuracyGps] = useState(true);
  const [anonymousTriage, setAnonymousTriage] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    loadICEContacts();
  }, []);

  const loadICEContacts = async () => {
    try {
      const data = await contactsAPI.getPersonalICE();
      setIceContacts(data);
    } catch (err) {
      console.error('Failed to load ICE contacts:', err);
    }
  };

  const handleAddICE = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIceName.trim() || !newIcePhone.trim()) return;

    setAddingIce(true);
    try {
      const res = await contactsAPI.addPersonalICE({
        name: newIceName.trim(),
        relationship: newIceRel.trim(),
        phone: newIcePhone.trim(),
        notify_on_sos: autoSmsIce,
      });
      setIceContacts((prev) => [...prev, res]);
      setNewIceName('');
      setNewIcePhone('');
    } catch (err) {
      console.error('Failed to add ICE contact:', err);
    } finally {
      setAddingIce(false);
    }
  };

  const handleDeleteICE = async (id?: number) => {
    if (!id) return;
    try {
      await contactsAPI.deletePersonalICE(id);
      setIceContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete ICE contact:', err);
    }
  };

  const handleSavePreferences = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const languages = [
    { code: 'en', label: 'English (US & International)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'es', label: 'Español (Spanish)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'fr', label: 'Français (French)' },
    { code: 'de', label: 'Deutsch (German)' },
    { code: 'ar', label: 'العربية (Arabic)' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Settings & Emergency Preferences
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure default language, personal In Case of Emergency (ICE) contacts, and privacy.
          </p>
        </div>

        {savedNotice && (
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Preferences Saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Language & Localization */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3>Language & Localization</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Emergency safety steps and AI translations will automatically prioritize this language.
          </p>

          <div className="space-y-2 pt-2">
            {languages.map((l) => (
              <label
                key={l.code}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                  language === l.code
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{l.label}</span>
                <input
                  type="radio"
                  name="language_select"
                  checked={language === l.code}
                  onChange={() => setLanguage(l.code)}
                  className="text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Section 2: Location & GPS Preferences */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3>Location & Geolocation</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your GPS coordinates are used to rank nearby hospitals and compute driving routes.
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Current Locked Address:</span>
              <button
                onClick={refreshLocation}
                className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Re-sync GPS
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-750">
              {location.address}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <span>High-Accuracy GPS Polling</span>
              <input
                type="checkbox"
                checked={highAccuracyGps}
                onChange={(e) => setHighAccuracyGps(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <span>Include GPS in SOS SMS Links</span>
              <input
                type="checkbox"
                checked={autoSmsIce}
                onChange={(e) => setAutoSmsIce(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Section 3: Personal Emergency Contacts (ICE) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <Users className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3>Personal ICE (In Case of Emergency) Contacts</h3>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Family & trusted friends to alert during severe incidents
          </span>
        </div>

        {/* Existing ICE list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {iceContacts.length === 0 ? (
            <div className="col-span-2 p-6 text-center text-slate-400 dark:text-slate-500 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              No personal ICE contacts added yet. Add family members below.
            </div>
          ) : (
            iceContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {contact.name}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {contact.relationship} • {contact.phone}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteICE(contact.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                  title="Remove ICE Contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add New ICE Form */}
        <form onSubmit={handleAddICE} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Contact Name</label>
            <input
              type="text"
              value={newIceName}
              onChange={(e) => setNewIceName(e.target.value)}
              placeholder="e.g., Mom or Spouse"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="w-full sm:w-36 space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Relationship</label>
            <input
              type="text"
              value={newIceRel}
              onChange={(e) => setNewIceRel(e.target.value)}
              placeholder="Family / Friend"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex-1 w-full space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Phone Number</label>
            <input
              type="tel"
              value={newIcePhone}
              onChange={(e) => setNewIcePhone(e.target.value)}
              placeholder="+1-555-0199"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={addingIce}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add ICE</span>
          </button>
        </form>
      </div>

      {/* Section 4: Alerts & Privacy */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
          <Lock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3>Notifications & Privacy Safeguards</h3>
        </div>

        <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
          <label className="flex items-center justify-between pt-2 cursor-pointer">
            <div>
              <span className="font-bold block text-slate-900 dark:text-white">Audible Siren / Alert Tone</span>
              <span className="text-slate-500 dark:text-slate-400">Play high-priority alert sound on critical hazard detection</span>
            </div>
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={(e) => setSoundAlerts(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between pt-3 cursor-pointer">
            <div>
              <span className="font-bold block text-slate-900 dark:text-white">Anonymous Emergency Triage</span>
              <span className="text-slate-500 dark:text-slate-400">Do not store personal identity tags alongside incident logs</span>
            </div>
            <input
              type="checkbox"
              checked={anonymousTriage}
              onChange={(e) => setAnonymousTriage(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSavePreferences}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
