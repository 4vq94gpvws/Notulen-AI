import React from 'react';
import { Mic, Square } from 'lucide-react';

interface Props {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  elapsed: number;
  disabled?: boolean;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function RecordButton({ isRecording, onStart, onStop, elapsed, disabled }: Props) {
  if (isRecording) {
    return (
      <div className="flex flex-col items-center gap-5">
        {/* Waveform */}
        <div className="flex items-center gap-1.5 h-10">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="waveform-bar w-1.5 bg-red-400 rounded-full"
              style={{ height: 8 }}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="recording-dot w-3 h-3 rounded-full bg-red-500" />
          <span className="text-2xl font-mono font-semibold text-red-400">
            {formatTime(elapsed)}
          </span>
        </div>

        <button onClick={onStop} className="btn-danger flex items-center gap-2 text-lg px-8 py-3">
          <Square className="w-5 h-5" />
          Stop opname
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onStart}
      disabled={disabled}
      className="group relative flex items-center justify-center"
    >
      <div className="absolute w-24 h-24 rounded-full bg-indigo-500/20 pulse-ring" />
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 group-hover:scale-105 group-active:scale-95 transition-transform">
        <Mic className="w-10 h-10 text-white" />
      </div>
    </button>
  );
}
