import React from 'react';
import { CheckCircle, ShieldCheck } from 'lucide-react';

interface ConfidenceMeterProps {
  confidence: number;
  ragGrounded?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  ragGrounded = true,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round(confidence * 100)));

  let color = 'bg-blue-600 dark:bg-blue-500';
  let textColor = 'text-blue-700 dark:text-blue-400';

  if (percentage >= 90) {
    color = 'bg-emerald-600 dark:bg-emerald-500';
    textColor = 'text-emerald-700 dark:text-emerald-400';
  } else if (percentage >= 75) {
    color = 'bg-blue-600 dark:bg-blue-500';
    textColor = 'text-blue-700 dark:text-blue-400';
  } else {
    color = 'bg-amber-500 dark:bg-amber-400';
    textColor = 'text-amber-700 dark:text-amber-400';
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            AI Triage Confidence
          </span>
        </div>
        <div className="flex items-center gap-2">
          {ragGrounded && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/60">
              <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              RAG Verified Knowledge
            </span>
          )}
          <span className={`text-sm font-black ${textColor}`}>{percentage}%</span>
        </div>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
        Classified against official emergency dispatch guidelines and clinical protocols.
      </p>
    </div>
  );
};
