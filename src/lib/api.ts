import type { Meeting } from '../types/meeting';

export async function transcribeAudio(audioBlob: Blob, groqKey: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', 'whisper-large-v3-turbo');
  formData.append('response_format', 'text');

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${groqKey}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Transcriptie mislukt: ${err}`);
  }

  return res.text();
}

const ANALYSIS_PROMPT = `Je bent een AI-assistent die vergadernotities analyseert.
BELANGRIJK: Antwoord ALTIJD in het Nederlands, ongeacht de taal van het transcript.
Vertaal alles naar het Nederlands als het in een andere taal is.

Analyseer het volgende transcript en geef een gestructureerd antwoord in JSON-formaat.

Geef terug:
1. "summary": Een beknopte samenvatting in het Nederlands (max 200 woorden)
2. "decisions": Een array van beslismomenten in het Nederlands, elk met "text" (de beslissing) en "context" (korte context)
3. "actionItems": Een array van actiepunten in het Nederlands, elk met "text" (het actiepunt) en "assignee" (wie verantwoordelijk is, of "Onbekend")
4. "followUps": Een array van vervolgpunten in het Nederlands, elk met "text" (wat opgepakt moet worden), "responsible" (wie) en "deadline" (geschatte deadline of "Nader te bepalen")

Antwoord ALLEEN met valid JSON, geen markdown, geen uitleg eromheen. Alles MOET in het Nederlands zijn.

TRANSCRIPT:
`;

export async function analyzeTranscript(
  transcript: string,
  openRouterKey: string
): Promise<Pick<Meeting, 'summary' | 'decisions' | 'actionItems' | 'followUps'>> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openRouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        { role: 'system', content: 'Je bent een Nederlandstalige vergaderassistent. Al je output is ALTIJD in het Nederlands, ongeacht de invoertaal.' },
        { role: 'user', content: ANALYSIS_PROMPT + transcript },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Analyse mislukt: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '';

  const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      summary: parsed.summary || 'Geen samenvatting beschikbaar.',
      decisions: (parsed.decisions || []).map((d: any, i: number) => ({
        id: `dec-${Date.now()}-${i}`,
        text: d.text || d,
        context: d.context || '',
      })),
      actionItems: (parsed.actionItems || parsed.action_items || []).map((a: any, i: number) => ({
        id: `act-${Date.now()}-${i}`,
        text: a.text || a,
        assignee: a.assignee || 'Onbekend',
        done: false,
      })),
      followUps: (parsed.followUps || parsed.follow_ups || []).map((f: any, i: number) => ({
        id: `fup-${Date.now()}-${i}`,
        text: f.text || f,
        deadline: f.deadline || 'Nader te bepalen',
        responsible: f.responsible || 'Onbekend',
        done: false,
      })),
    };
  } catch {
    throw new Error('Kon het AI-antwoord niet parsen als JSON.');
  }
}
