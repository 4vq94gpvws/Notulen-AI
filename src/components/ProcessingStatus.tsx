import React from 'react';
import { Loader2, FileText, Brain, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  status: 'recording' | 'transcribing' | 'analyzing' | 'done' | 'error';
  error?: string;
}

const steps = [
  { key: 'transcribing', label: 'Transcriberen met Whisper...', icon: FileText },
  { key: 'analyzing', label: 'Analyseren met AI...', icon: Brain },
  { key: 'done', label: 'Klaar!', icon: CheckCircle2 },
];

export default function ProcessingStatus({ status, error }: Props) {
  if (status === 'recording') return null;

  if (status === 'error') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl fade-in">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
        <span className="text-red-300 text-sm">{error || 'Er ging iets mis.'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 fade-in">
      {steps.map((step) => {
        const isActive = status === step.key;
        const isDone =
          (step.key === 'transcribing' && ['analyzing', 'done'].includes(status)) ||
          (step.key === 'analyzing' && status === 'done') ||
          (step.key === 'done' && status === 'done');
        const isPending = !isActive && !isDone;

        return (
          <div
            key={step.key}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              isActive
                ? 'bg-indigo-500/10 border border-indigo-500/30'
                : isDone
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : 'bg-white/5 border border-white/5 opacity-40'
            }`}
          >
            {isActive ? (
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin flex-shrink-0" />
            ) : isDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <step.icon className="w-5 h-5 text-gray-500 flex-shrink-0" />
            )}
            <span
              className={`text-sm font-medium ${
                isActive ? 'text-indigo-300' : isDone ? 'text-emerald-300' : 'text-gray-500'
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
