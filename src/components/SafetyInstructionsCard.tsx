import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  AlertCircle, 
  ThumbsUp, 
  ThumbsDown 
} from 'lucide-react';
import { SafetyInstruction } from '../types';

interface SafetyInstructionsCardProps {
  instructions: SafetyInstruction[];
  dos?: string[];
  donts?: string[];
  disclaimer?: string;
  sourceProtocols?: string[];
}

export const SafetyInstructionsCard: React.FC<SafetyInstructionsCardProps> = ({
  instructions,
  dos = [],
  donts = [],
  disclaimer,
  sourceProtocols = [],
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const fullSpeech = instructions
      .map((item, idx) => `Step ${idx + 1}: ${item.title}. ${item.instruction}`)
      .join('. ');

    const utterance = new SpeechSynthesisUtterance(fullSpeech);
    utterance.rate = 0.95; // Slightly slower for clarity in emergencies
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      {/* Top Header of Instructions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Immediate Safety Instructions
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Follow these life-safety actions immediately in order of priority.
          </p>
        </div>

        {/* Audio narration button */}
        <button
          onClick={handleSpeak}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isPlayingAudio
              ? 'bg-red-600 text-white shadow-md shadow-red-500/30 animate-pulse'
              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800'
          }`}
          title="Read instructions aloud hands-free"
        >
          {isPlayingAudio ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span>Stop Audio</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Read Instructions Aloud</span>
            </>
          )}
        </button>
      </div>

      {/* Numbered Step Cards */}
      <div className="space-y-3.5">
        {instructions.map((item, index) => {
          const isDone = completedSteps.includes(item.step || index + 1);
          return (
            <div
              key={index}
              onClick={() => toggleStep(item.step || index + 1)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                isDone
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-xs opacity-85'
                  : index === 0
                  ? 'bg-white dark:bg-slate-900 border-red-300 dark:border-red-800 shadow-md ring-1 ring-red-100 dark:ring-red-950'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Number Badge */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0 shadow-xs ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : index === 0
                      ? 'bg-red-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {item.step || index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`text-base sm:text-lg font-bold leading-snug ${
                        isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </h3>
                    {item.urgency === 'critical' && !isDone && (
                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                        Critical Action
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-1.5 text-sm sm:text-base leading-relaxed ${
                      isDone ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.instruction}
                  </p>
                </div>

                {/* Checkbox toggle */}
                <button
                  type="button"
                  className="shrink-0 p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                  aria-label="Toggle step done"
                >
                  {isDone ? (
                    <CheckSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Square className="w-6 h-6 text-slate-300 dark:text-slate-600 hover:text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Critical Dos and Don'ts */}
      {(dos.length > 0 || donts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dos.length > 0 && (
            <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold mb-3">
                <ThumbsUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-sm uppercase tracking-wider font-extrabold">
                  Crucial Actions (Do)
                </h4>
              </div>
              <ul className="space-y-2">
                {dos.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-2 shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {donts.length > 0 && (
            <div className="bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold mb-3">
                <ThumbsDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h4 className="text-sm uppercase tracking-wider font-extrabold">
                  Hazardous Pitfalls (Do Not)
                </h4>
              </div>
              <ul className="space-y-2">
                {donts.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-red-900 dark:text-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 mt-2 shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer & Citation Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 flex items-start gap-3 text-amber-900 dark:text-amber-200">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm space-y-1">
          <p className="font-semibold">
            {disclaimer ||
              'Official Disclaimer: AI guidance is an informational aid, NOT a replacement for professional emergency services.'}
          </p>
          {sourceProtocols.length > 0 && (
            <p className="text-xs text-amber-800/90 dark:text-amber-300/90">
              Grounded in verified protocols:{' '}
              <span className="font-medium underline">{sourceProtocols.join(', ')}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
