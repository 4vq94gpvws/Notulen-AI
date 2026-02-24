import React, { useState } from 'react';
import { Meeting } from '../types/meeting';
import {
  ArrowLeft, FileText, CheckCircle2, Gavel, RotateCcw,
  ChevronDown, ChevronRight, Clock, User, Calendar, Loader2, AlertCircle, Trash2, Copy, Check
} from 'lucide-react';

interface Props {
  meeting: Meeting;
  onBack: () => void;
  onUpdate: (m: Meeting) => void;
  onDelete: (id: string) => void;
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  return `${m}m ${sec}s`;
}

export default function MeetingDetail({ meeting, onBack, onUpdate, onDelete }: Props) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function toggleAction(actionId: string) {
    const updated = {
      ...meeting,
      actionItems: meeting.actionItems.map((a) =>
        a.id === actionId ? { ...a, done: !a.done } : a
      ),
    };
    onUpdate(updated);
  }

  function copyToClipboard() {
    const text = [
      `# ${meeting.title}`,
      `Datum: ${new Date(meeting.date).toLocaleDateString('nl-NL', { dateStyle: 'full' })}`,
      `Duur: ${formatDuration(meeting.duration)}`,
      '',
      '## Samenvatting',
      meeting.summary || '',
      '',
      '## Beslissingen',
      ...meeting.decisions.map((d, i) => `${i + 1}. ${d.text}${d.context ? ` (${d.context})` : ''}`),
      '',
      '## Actiepunten',
      ...meeting.actionItems.map((a, i) => `${i + 1}. [${a.done ? 'x' : ' '}] ${a.text}${a.assignee ? ` → ${a.assignee}` : ''}`),
      '',
      '## Vervolgpunten',
      ...meeting.followUps.map((f, i) => `${i + 1}. ${f.text}${f.responsible ? ` → ${f.responsible}` : ''}${f.deadline ? ` (deadline: ${f.deadline})` : ''}`),
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isProcessing = meeting.status === 'transcribing' || meeting.status === 'analyzing';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={onBack} className="btn-ghost p-2 mt-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{meeting.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(meeting.date).toLocaleDateString('nl-NL', { dateStyle: 'long' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDuration(meeting.duration)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={copyToClipboard} className="btn-ghost flex items-center gap-2 text-sm">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Gekopieerd!' : 'Kopiëren'}
          </button>
          {confirmDelete ? (
            <div className="flex gap-2">
              <button onClick={() => { onDelete(meeting.id); onBack(); }} className="btn-danger text-sm">
                Bevestig
              </button>
              <button onClick={() => setConfirmDelete(false)} className="btn-ghost text-sm">
                Annuleer
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="btn-ghost p-2 text-red-400 hover:text-red-300">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Processing state */}
      {isProcessing && (
        <div className="glass-card p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          <p className="text-indigo-300">
            {meeting.status === 'transcribing' ? 'Transcript wordt gegenereerd...' : 'AI analyseert de vergadering...'}
          </p>
        </div>
      )}

      {/* Error state */}
      {meeting.status === 'error' && (
        <div className="glass-card p-6 border-red-500/20">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-medium">Er is een fout opgetreden</p>
              <p className="text-sm text-red-300/70 mt-1">{meeting.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {meeting.summary && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold">Samenvatting</h2>
          </div>
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {meeting.summary}
          </div>
        </div>
      )}

      {/* Decisions */}
      {meeting.decisions.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Gavel className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold">Beslissingen</h2>
            <span className="ml-auto text-sm text-gray-500 bg-white/5 px-2.5 py-0.5 rounded-full">
              {meeting.decisions.length}
            </span>
          </div>
          <div className="space-y-3">
            {meeting.decisions.map((d) => (
              <div key={d.id} className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-200 font-medium">{d.text}</p>
                {d.context && (
                  <p className="text-sm text-gray-500 mt-1">{d.context}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      {meeting.actionItems.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-lg font-semibold">Actiepunten</h2>
            <span className="ml-auto text-sm text-gray-500 bg-white/5 px-2.5 py-0.5 rounded-full">
              {meeting.actionItems.filter((a) => a.done).length}/{meeting.actionItems.length}
            </span>
          </div>
          <div className="space-y-2">
            {meeting.actionItems.map((a) => (
              <button
                key={a.id}
                onClick={() => toggleAction(a.id)}
                className="w-full flex items-start gap-3 bg-white/5 rounded-xl p-4 text-left hover:bg-white/10 transition-colors"
              >
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  a.done ? 'bg-green-500 border-green-500' : 'border-gray-600'
                }`}>
                  {a.done && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${a.done ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                    {a.text}
                  </p>
                  {a.assignee && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <User className="w-3 h-3" /> {a.assignee}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Follow-ups */}
      {meeting.followUps.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <RotateCcw className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold">Vervolgpunten</h2>
            <span className="ml-auto text-sm text-gray-500 bg-white/5 px-2.5 py-0.5 rounded-full">
              {meeting.followUps.length}
            </span>
          </div>
          <div className="space-y-3">
            {meeting.followUps.map((f) => (
              <div key={f.id} className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-200">{f.text}</p>
                <div className="flex items-center gap-4 mt-2">
                  {f.responsible && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <User className="w-3 h-3" /> {f.responsible}
                    </span>
                  )}
                  {f.deadline && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" /> {f.deadline}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transcript */}
      {meeting.transcript && (
        <div className="glass-card p-6">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-3 w-full text-left"
          >
            {showTranscript ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
            <div className="p-2 bg-gray-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold">Volledig Transcript</h2>
          </button>
          {showTranscript && (
            <div className="mt-4 bg-black/20 rounded-xl p-4 text-gray-400 text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
              {meeting.transcript}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
