import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { EmergencyProvider } from './context/EmergencyContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { EmergencyAnalysis } from './pages/EmergencyAnalysis';
import { EmergencyResponse } from './pages/EmergencyResponse';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { ShieldAlert, Heart, Radio } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <EmergencyProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 transition-colors duration-200">
              {/* Navigation Header */}
              <Header />

              {/* Main Content Viewport */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/analyze/:id" element={<EmergencyAnalysis />} />
                  <Route path="/response/:id" element={<EmergencyResponse />} />
                  <Route path="/response" element={<EmergencyResponse />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/login" element={<Login />} />
                </Routes>
              </main>

              {/* Professional Command Center Footer */}
              <footer className="bg-white/80 dark:bg-[#0c121e]/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 mt-auto py-7 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold shadow-xs">
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">AI Emergency Assistant</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Radio className="w-3 h-3 animate-pulse" />
                        Live RAG Emergency Dispatch Engine
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                      <span>Emergency Helplines: <strong className="text-red-600 dark:text-red-400">112 / 108 / 911</strong></span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span>WHO & Red Cross Grounded</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                      <span>Rapid emergency response</span>
                      <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </EmergencyProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
