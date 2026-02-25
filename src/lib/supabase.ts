const SUPABASE_URL = 'https://prhglprmdolbjapizmok.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByaGdscHJtZG9sYmphcGl6bW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MTMxNDAsImV4cCI6MjA4NzI4OTE0MH0.fK7umnSBXwJjOtOkz6D-d8eVfRo9N5j-zlzhVLC5tP0';

const headers: Record<string, string> = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

const rest = (path: string) => `${SUPABASE_URL}/rest/v1/${path}`;

export interface MeetingRow {
  id: string;
  title: string;
  meeting_date: string;
  duration_seconds: number | null;
  status: string;
  error_message: string | null;
  transcript: string | null;
  summary: string | null;
  key_decisions: any[] | null;
  action_items: any[] | null;
  follow_ups: any[] | null;
  created_at: string;
  updated_at: string;
}

export async function fetchMeetings(): Promise<MeetingRow[]> {
  const res = await fetch(rest('meetings?select=*&order=created_at.desc'), { headers });
  if (!res.ok) throw new Error('Kan vergaderingen niet ophalen');
  return res.json();
}

export async function insertMeeting(meeting: Partial<MeetingRow>): Promise<MeetingRow> {
  const res = await fetch(rest('meetings'), {
    method: 'POST',
    headers,
    body: JSON.stringify(meeting),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Opslaan mislukt: ${err}`);
  }
  const rows = await res.json();
  return rows[0];
}

export async function updateMeeting(id: string, data: Partial<MeetingRow>): Promise<MeetingRow> {
  const res = await fetch(rest(`meetings?id=eq.${id}`), {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error('Bijwerken mislukt');
  const rows = await res.json();
  return rows[0];
}

export async function deleteMeetingRow(id: string): Promise<void> {
  await fetch(rest(`meetings?id=eq.${id}`), { method: 'DELETE', headers });
}
