import React, { useState } from 'react';
import {
  FileText,
  Lightbulb,
  CheckSquare,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  ClipboardList,
} from 'lucide-react';
import type { Meeting } from '../types/meeting';

interface Props {
  meeting: Meeting;
  onUpdate: (meeting: Meeting) => void;
}

function Section({
  title,
  icon: Icon,
  count,
  color,
  children,
  defaultOpen,
}: {
  title: string;
  icon: React.ElementType;
  count?: number;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);

  return (
    <div className="glass-card overflow-hidden fade-in">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg">{title}</span>
          {count !== undefined && (
            <span className="bg-white/10 text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

export default function MeetingResults({ meeting, onUpdate }: Props) {
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    const text = [
      `# ${meeting.title}`,
      `Datum: ${new Date(meeting.date).toLocaleDateString('nl-NL')}`,
      '',
      '## Samenvatting',
      meeting.summary,
      '',
      '## Beslismomenten',
      ...meeting.decisions.map((d, i) => `${i + 1}. ${d.text}${d.context ? ` (${d.context})` : ''}`),
      '',
      '## Actiepunten',
      ...meeting.actionItems.map((a, i) => `${i + 1}. [${a.done ? 'x' : ' '}] ${a.text} → ${a.assignee}`),
      '',
      '## Vervolgpunten',
      ...meeting.followUps.map((f, i) => `${i + 1}. ${f.text} → ${f.responsible} (${f.deadline})`),
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleAction = (id: string) => {
    onUpdate({
      ...meeting,
      actionItems: meeting.actionItems.map((a) => (a.id === id ? { ...a, done: !a.done } : a)),
    });
  };

  const toggleFollowUp = (id: string) => {
    onUpdate({
      ...meeting,
      followUps: meeting.followUps.map((f) => (f.id === id ? { ...f, done: !f.done } : f)),
    });
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{meeting.title}</h2>
        <button onClick={copyAll} className="btn-ghost flex items-center gap-2 text-sm">
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Gekopieerd!' : 'Kopieer alles'}
        </button>
      </div>

      {/* Summary */}
      <Section title="Samenvatting" icon={FileText} color="bg-blue-500/20 text-blue-400" defaultOpen>
        <p className="text-gray-300 leading-relaxed">{meeting.summary}</p>
      </Section>

      {/* Decisions */}
      <Section
        title="Beslismomenten"
        icon={Lightbulb}
        count={meeting.decisions.length}
        color="bg-amber-500/20 text-amber-400"
        defaultOpen
      >
        {meeting.decisions.length === 0 ? (
          <p className="text-gray-500 text-sm">Geen beslismomenten gedetecteerd.</p>
        ) : (
          <ul className="space-y-3">
            {meeting.decisions.map((d) => (
              <li key={d.id} className="flex gap-3 p-3 bg-white/5 rounded-xl">
                <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-200 font-medium">{d.text}</p>
                  {d.context && <p className="text-gray-500 text-sm mt-1">{d.context}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Action Items */}
      <Section
        title="Actiepunten"
        icon={CheckSquare}
        count={meeting.actionItems.length}
        color="bg-emerald-500/20 text-emerald-400"
        defaultOpen
      >
        {meeting.actionItems.length === 0 ? (
          <p className="text-gray-500 text-sm">Geen actiepunten gedetecteerd.</p>
        ) : (
          <ul className="space-y-2">
            {meeting.actionItems.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => toggleAction(a.id)}
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    a.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500'
                  }`}
                >
                  {a.done && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`flex-1 ${a.done ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                  {a.text}
                </span>
                {a.assignee && (
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-lg">
                    {a.assignee}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Follow-ups */}
      <Section
        title="Vervolgpunten"
        icon={ArrowRight}
        count={meeting.followUps.length}
        color="bg-purple-500/20 text-purple-400"
        defaultOpen={false}
      >
        {meeting.followUps.length === 0 ? (
          <p className="text-gray-500 text-sm">Geen vervolgpunten gedetecteerd.</p>
        ) : (
          <ul className="space-y-2">
            {meeting.followUps.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => toggleFollowUp(f.id)}
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    f.done ? 'bg-purple-500 border-purple-500' : 'border-gray-500'
                  }`}
                >
                  {f.done && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`flex-1 ${f.done ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                  {f.text}
                </span>
                <div className="flex items-center gap-2">
                  {f.responsible && (
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg">
                      {f.responsible}
                    </span>
                  )}
                  {f.deadline && (
                    <span className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded-lg">
                      {f.deadline}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Transcript */}
      {meeting.transcript && (
        <Section title="Transcript" icon={ClipboardList} color="bg-gray-500/20 text-gray-400" defaultOpen={false}>
          <pre className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap font-sans max-h-80 overflow-y-auto">
            {meeting.transcript}
          </pre>
        </Section>
      )}
    </div>
  );
}
