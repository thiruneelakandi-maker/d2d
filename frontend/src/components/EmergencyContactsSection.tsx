import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Shield, 
  HeartPulse, 
  Flame, 
  AlertTriangle, 
  PhoneCall, 
  Check, 
  Copy,
  Globe2
} from 'lucide-react';
import { EmergencyContact } from '../types';
import { contactsAPI } from '../services/api';
import { useEmergency } from '../context/EmergencyContext';

interface EmergencyContactsSectionProps {
  description?: string;
}

export const EmergencyContactsSection: React.FC<EmergencyContactsSectionProps> = ({
  description,
}) => {
  const { location } = useEmergency();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [region, setRegion] = useState<string>('US');
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadContacts(region);
  }, [region]);

  const loadContacts = async (reg: string) => {
    setLoading(true);
    try {
      const res = await contactsAPI.getContacts(reg);
      // API returns { success: true, contacts: [] }
      const data = Array.isArray(res) ? res : res.contacts || [];
      setContacts(data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'police':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'ambulance':
        return <HeartPulse className="w-5 h-5 text-red-600" />;
      case 'fire':
        return <Flame className="w-5 h-5 text-amber-600" />;
      case 'disaster':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <PhoneCall className="w-5 h-5 text-emerald-600" />;
    }
  };

  const generateSmsLink = (phone: string) => {
    const locText = location.lat && location.lng ? `My GPS Coordinates: ${location.lat}, ${location.lng} (${location.address})` : 'Location unknown';
    const message = encodeURIComponent(
      `EMERGENCY ALERT! Immediate assistance required.\n${description ? `Situation: ${description}\n` : ''}${locText}`
    );
    return `sms:${phone}?body=${message}`;
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Official Emergency Dispatch
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            1-tap instant dialing and SMS dispatch with your verified GPS coordinates.
          </p>
        </div>

        {/* Region Selector */}
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="US" className="dark:bg-slate-800 dark:text-slate-200">United States / Canada (911)</option>
            <option value="IN" className="dark:bg-slate-800 dark:text-slate-200">India (112 / 108)</option>
            <option value="UK" className="dark:bg-slate-800 dark:text-slate-200">United Kingdom (999 / 111)</option>
            <option value="EU" className="dark:bg-slate-800 dark:text-slate-200">European Union (112)</option>
            <option value="GLOBAL" className="dark:bg-slate-800 dark:text-slate-200">International Standard</option>
          </select>
        </div>
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {loading ? (
          <div className="col-span-2 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            Loading emergency directory...
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col justify-between gap-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs shrink-0">
                    {getServiceIcon(contact.service_type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {contact.name}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                      {contact.service_type} Service
                    </span>
                  </div>
                </div>

                <span className="text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {contact.phone || '—'}
                </span>
              </div>

              {contact.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                  {contact.description}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2">
                {contact.verified ? (
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Verified</span>
                ) : (
                  <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">Unverified</span>
                )}
                {contact.is_demo && (
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">DEMO DATA</span>
                )}
              </div>

              {/* Action Buttons: Call and SMS */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                {contact.phone ? (
                  <>
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {contact.phone}</span>
                    </a>

                    <a
                      href={generateSmsLink(contact.phone)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                      title="Send Emergency SMS with Location"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">SMS SOS</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(contact.phone, contact.id)}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Copy Phone Number"
                    >
                      {copiedId === contact.id ? (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </>
                ) : (
                  <div className="col-span-2 text-xs text-slate-500">No phone number provided (DEMO or unlisted).</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
