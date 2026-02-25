import type { Meeting } from '../types/meeting';
import type { MeetingRow } from './supabase';

export function rowToMeeting(r: MeetingRow): Meeting {
  return {
    id: r.id,
    title: r.title,
    date: r.meeting_date,
    duration: r.duration_seconds || 0,
    transcript: r.transcript || undefined,
    summary: r.summary || undefined,
    decisions: (r.key_decisions || []).map((d: any, i: number) => ({
      id: d.id || `dec-${i}`, text: d.text || d, context: d.context || '',
    })),
    actionItems: (r.action_items || []).map((a: any, i: number) => ({
      id: a.id || `act-${i}`, text: a.text || a, assignee: a.assignee || 'Onbekend', done: a.done || false,
    })),
    followUps: (r.follow_ups || []).map((f: any, i: number) => ({
      id: f.id || `fup-${i}`, text: f.text || f, deadline: f.deadline || 'Nader te bepalen', responsible: f.responsible || 'Onbekend', done: f.done || false,
    })),
    status: r.status === 'completed' ? 'done' : (r.status as Meeting['status']),
    error: r.error_message || undefined,
  };
}

export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}
