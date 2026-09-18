import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, 
  MapPin, 
  Globe, 
  HelpCircle, 
  History, 
  Settings, 
  User as UserIcon, 
  PhoneCall, 
  RefreshCw,
  AlertTriangle,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Header: React.FC = () => {
  const { location, refreshLocation, language, setLanguage } = useEmergency();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const routeLocation = useLocation();
  const [showHelpModal, setShowHelpModal] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'es', label: 'Español' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#0c121e]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo & Branding */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white block leading-tight">
                    AI Emergency Assistant
                  </span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    Command Center • RAG Verified
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Location indicator pill */}
            <div className="hidden md:flex items-center">
              <button
                onClick={refreshLocation}
                title="Click to refresh GPS location"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-800 transition-colors max-w-xs truncate"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate">{location.address}</span>
                {location.loading ? (
                  <RefreshCw className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                )}
              </button>
            </div>

            {/* Right: Actions (Theme Toggle, Language, Help, Nav Links, Emergency Call, Auth) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Command Center'}
                className="p-2 rounded-xl text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent dark:border-slate-800 transition-all cursor-pointer"
                aria-label="Toggle Theme"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600 hover:text-indigo-600 transition-transform -rotate-12 hover:rotate-0" />
                )}
              </button>

              {/* Language Selector */}
              <div className="relative flex items-center">
                <Globe className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-2.5 pointer-events-none" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code} className="dark:bg-slate-900 dark:text-slate-200">
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Help / About Modal Trigger */}
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Emergency Disclaimer & Guide"
              >
                <HelpCircle className="w-5 h-5" />
              </button>

              {/* History link */}
              <Link
                to="/history"
                className={`p-2 rounded-xl transition-colors ${
                  routeLocation.pathname === '/history'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Emergency Incident History"
              >
                <History className="w-5 h-5" />
              </Link>

              {/* Settings link */}
              <Link
                to="/settings"
                className={`p-2 rounded-xl transition-colors ${
                  routeLocation.pathname === '/settings'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Settings & Emergency Contacts"
              >
                <Settings className="w-5 h-5" />
              </Link>

              {/* Direct Emergency Call Button */}
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black shadow-md shadow-red-600/25 transition-all cursor-pointer animate-pulse"
                title="Direct Dial Emergency Services (112 / 911)"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>SOS 112 / 911</span>
              </a>

              {/* Auth / Profile */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
                  <span className="hidden lg:inline text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-24">
                    {user?.name || user?.email}
                  </span>
                  <button
                    onClick={logout}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 underline font-medium cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Help & Official Emergency Disclaimer Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Official Emergency Notice
              </h3>
            </div>

            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 p-3 rounded-r-xl font-medium text-red-900 dark:text-red-200">
                This application provides AI-assisted situational triage and verified emergency reference guidance. It is <strong>NOT</strong> an official replacement for emergency dispatchers.
              </p>
              <p>
                If you or someone around you is in immediate life-threatening danger, has stopped breathing, is bleeding uncontrollably, or is trapped in a fire:
              </p>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block uppercase font-bold tracking-wide">Universal Emergency</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">Dial 112 / 911 Direct</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="tel:112"
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    112
                  </a>
                  <a
                    href="tel:911"
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    911
                  </a>
                </div>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <li>Grounds instructions on official Red Cross, WHO, and FEMA safety protocols.</li>
                <li>Provides nearest verified hospitals, police departments, and disaster shelters.</li>
                <li>Allows immediate emergency contact notification with your exact GPS location.</li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
