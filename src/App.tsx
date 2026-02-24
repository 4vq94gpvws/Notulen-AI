import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, ArrowLeft, Mic, Plus } from 'lucide-react';
import type { Meeting, ApiKeys } from './types/meeting';
import { AudioRecorder } from './lib/recorder';
import { transcribeAudio, analyzeTranscript } from './lib/api';
import ApiKeyModal from './components/ApiKeyModal';
import RecordButton from './components/RecordButton';
import ProcessingStatus from './components/ProcessingStatus';
import MeetingResults from './components/MeetingResults';
import MeetingList from './components/MeetingList';

const STORAGE_KEYS = { api: 'notulen_api_keys', meetings: 'notulen_meetings' };

function loadKeys(): ApiKeys | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.api);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadMeetings(): Meeting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.meetings);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [keys, setKeys] = useState<ApiKeys | null>(loadKeys);
  const [showKeyModal, setShowKeyModal] = useState(!keys);
  const [meetings, setMeetings] = useState<Meeting[]>(loadMeetings);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'record' | 'detail'>('home');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [title, setTitle] = useState('');

  const recorderRef = useRef(new AudioRecorder());
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Persist meetings
  useEffect(() => {
    const toSave = meetings.map(({ audioBlob, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEYS.meetings, JSON.stringify(toSave));
  }, [meetings]);

  const currentMeeting = meetings.find((m) => m.id === currentId);

  const updateMeeting = useCallback(
    (updated: Meeting) => setMeetings((prev) => prev.map((m) => (m.id === updated.id ? updated : m))),
    []
  );

  const startRecording = async () => {
    if (!keys) {
      setShowKeyModal(true);
      return;
    }
    const id = `mtg-${Date.now()}`;
    const meeting: Meeting = {
      id,
      title: title || `Vergadering ${new Date().toLocaleString('nl-NL')}`,
      date: new Date().toISOString(),
      duration: 0,
      decisions: [],
      actionItems: [],
      followUps: [],
      status: 'recording',
    };
    setMeetings((prev) => [meeting, ...prev]);
    setCurrentId(id);
    setView('record');
    setElapsed(0);

    try {
      await recorderRef.current.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setElapsed(recorderRef.current.getElapsed());
      }, 500);
    } catch (err) {
      updateMeeting({ ...meeting, status: 'error', error: 'Kan microfoon niet openen. Geef toestemming.' });
    }
  };

  const stopRecording = async () => {
    clearInterval(timerRef.current);
    setIsRecording(false);
    const blob = await recorderRef.current.stop();
    const dur = elapsed;

    if (!currentMeeting || !keys) return;
    const updated: Meeting = { ...currentMeeting, duration: dur, audioBlob: blob, status: 'transcribing' };
    updateMeeting(updated);

    try {
      // Step 1: transcribe
      const transcript = await transcribeAudio(blob, keys.groqKey);
      const afterTranscript: Meeting = { ...updated, transcript, status: 'analyzing' };
      updateMeeting(afterTranscript);

      // Step 2: analyze
      const analysis = await analyzeTranscript(transcript, keys.openRouterKey);
      const final: Meeting = { ...afterTranscript, ...analysis, status: 'done' };
      updateMeeting(final);
      setView('detail');
    } catch (err: any) {
      updateMeeting({ ...updated, status: 'error', error: err.message });
    }
  };

  const saveKeys = (newKeys: ApiKeys) => {
    localStorage.setItem(STORAGE_KEYS.api, JSON.stringify(newKeys));
    setKeys(newKeys);
    setShowKeyModal(false);
  };

  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    if (currentId === id) {
      setCurrentId(null);
      setView('home');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view !== 'home' && (
              <button
                onClick={() => {
                  setView('home');
                  setCurrentId(null);
                  setTitle('');
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                <Mic className="w-5 h-5 text-indigo-400" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Notulen AI
              </h1>
            </div>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* HOME VIEW */}
        {view === 'home' && (
          <div className="space-y-8 fade-in">
            {/* New recording card */}
            <div className="glass-card p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Nieuwe vergadering</h2>
              <p className="text-gray-500 mb-6">
                Neem op, transcribeer en krijg automatisch een samenvatting, beslismomenten en actiepunten.
              </p>

              <div className="max-w-sm mx-auto mb-6">
                <input
                  type="text"
                  className="input-field text-center"
                  placeholder="Naam van de vergadering (optioneel)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <button onClick={startRecording} className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
                <Plus className="w-5 h-5" />
                Start opname
              </button>

              {!keys && (
                <p className="text-amber-400/80 text-sm mt-4">
                  ⚠️ Stel eerst je API keys in via het tandwiel-icoon.
                </p>
              )}
            </div>

            {/* History */}
            <div>
              <h2 className="text-lg font-semibold text-gray-300 mb-4">Eerdere vergaderingen</h2>
              <MeetingList
                meetings={meetings}
                onSelect={(id) => {
                  setCurrentId(id);
                  setView('detail');
                }}
                onDelete={deleteMeeting}
              />
            </div>
          </div>
        )}

        {/* RECORD VIEW */}
        {view === 'record' && currentMeeting && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 fade-in">
            <h2 className="text-xl font-semibold text-gray-300">{currentMeeting.title}</h2>

            {currentMeeting.status === 'recording' && (
              <RecordButton
                isRecording={isRecording}
                onStart={startRecording}
                onStop={stopRecording}
                elapsed={elapsed}
              />
            )}

            <div className="w-full max-w-md">
              <ProcessingStatus status={currentMeeting.status} error={currentMeeting.error} />
            </div>

            {currentMeeting.status === 'error' && (
              <button onClick={() => setView('home')} className="btn-ghost">
                Terug naar home
              </button>
            )}
          </div>
        )}

        {/* DETAIL VIEW */}
        {view === 'detail' && currentMeeting && currentMeeting.status === 'done' && (
          <div className="fade-in">
            <MeetingResults meeting={currentMeeting} onUpdate={updateMeeting} />
          </div>
        )}
      </main>

      {/* API Key Modal */}
      {showKeyModal && (
        <ApiKeyModal
          initial={keys || undefined}
          onSave={saveKeys}
          onClose={() => {
            if (keys) setShowKeyModal(false);
          }}
        />
      )}
    </div>
  );
}
