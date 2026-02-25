import type { Meeting } from '../types/meeting';

const SUPABASE_URL = 'https://prhglprmdolbjapizmok.supabase.co';

export async function transcribeAudio(audioBlob: Blob, groqKey: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/transcribe`, {
    method: 'POST',
    headers: { 'x-groq-key': groqKey },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Transcriptie mislukt: ${data.error || 'Onbekende fout'}`);
  return data.transcript;
}

export async function analyzeTranscript(
  transcript: string,
  openRouterKey: string
): Promise<Pick<Meeting, 'summary' | 'decisions' | 'actionItems' | 'followUps'>> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-openrouter-key': openRouterKey,
    },
    body: JSON.stringify({ transcript }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Analyse mislukt: ${data.error || 'Onbekende fout'}`);

  return {
    summary: data.summary || 'Geen samenvatting beschikbaar.',
    decisions: (data.decisions || []).map((d: any, i: number) => ({
      id: `dec-${Date.now()}-${i}`,
      text: d.text || d,
      context: d.context || '',
    })),
    actionItems: (data.actionItems || data.action_items || []).map((a: any, i: number) => ({
      id: `act-${Date.now()}-${i}`,
      text: a.text || a,
      assignee: a.assignee || 'Onbekend',
      done: false,
    })),
    followUps: (data.followUps || data.follow_ups || []).map((f: any, i: number) => ({
      id: `fup-${Date.now()}-${i}`,
      text: f.text || f,
      deadline: f.deadline || 'Nader te bepalen',
      responsible: f.responsible || 'Onbekend',
      done: false,
    })),
  };
}
