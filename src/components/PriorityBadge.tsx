import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { EmergencyPriority } from '../types';

interface PriorityBadgeProps {
  priority: EmergencyPriority | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showIcon = true,
}) => {
  const norm = (priority || 'HIGH').toUpperCase();

  let config = {
    bg: 'bg-red-500/10 text-red-700 border-red-200',
    dot: 'bg-red-500',
    icon: AlertCircle,
    label: 'CRITICAL',
    pulse: true,
  };

  if (norm === 'CRITICAL') {
    config = {
      bg: 'bg-red-600 text-white border-red-700 shadow-md shadow-red-500/30 dark:shadow-red-950/50',
      dot: 'bg-white',
      icon: AlertCircle,
      label: 'CRITICAL PRIORITY',
      pulse: true,
    };
  } else if (norm === 'HIGH') {
    config = {
      bg: 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800',
      dot: 'bg-red-600 dark:bg-red-400',
      icon: AlertTriangle,
      label: 'HIGH PRIORITY',
      pulse: false,
    };
  } else if (norm === 'MEDIUM') {
    config = {
      bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      dot: 'bg-amber-500 dark:bg-amber-400',
      icon: Info,
      label: 'MEDIUM PRIORITY',
      pulse: false,
    };
  } else {
    config = {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      dot: 'bg-emerald-500 dark:bg-emerald-400',
      icon: CheckCircle2,
      label: 'LOW PRIORITY',
      pulse: false,
    };
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-bold',
    md: 'text-xs px-3 py-1 gap-2 font-bold',
    lg: 'text-sm px-4 py-1.5 gap-2.5 font-extrabold tracking-wide',
  }[size];

  const IconComp = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses} transition-all`}
    >
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}
          ></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
      </span>
      {showIcon && <IconComp className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </span>
  );
};
