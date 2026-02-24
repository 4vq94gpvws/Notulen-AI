import React from 'react';
import { Calendar, Clock, ChevronRight, Trash2 } from 'lucide-react';
import type { Meeting } from '../types/meeting';

interface Props {
  meetings: Meeting[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function MeetingList({ meetings, onSelect, onDelete }: Props) {
  const sorted = [...meetings].filter((m) => m.status === 'done').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
          <Calendar className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-500">Nog geen vergaderingen opgenomen.</p>
        <p className="text-gray-600 text-sm mt-1">Start een opname om te beginnen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((m) => (
        <div
          key={m.id}
          className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors group"
          onClick={() => onSelect(m.id)}
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-100 truncate">{m.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(m.date).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(m.duration)}
              </span>
              <span className="flex items-center gap-1 text-emerald-500">
                {m.actionItems.filter((a) => a.done).length}/{m.actionItems.length} acties
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(m.id);
            }}
            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
        </div>
      ))}
    </div>
  );
}
