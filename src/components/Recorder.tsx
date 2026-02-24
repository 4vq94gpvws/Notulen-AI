import React, { useState } from 'react';
import { Mic, Square, Pause, Play, Loader2 } from 'lucide-react';
import { useAudioRecorder } from '../lib/useAudioRecorder';
import { Meeting } from '../types/meeting';
import { AppSettings } from '../types/meeting';
import { transcribeAudio, analyzeMeeting } from '../lib/api';

interface Props {
  settings: AppSettings;
  onMeetingCreate: (meeting: Meeting) => void;
  onMeetingUpdate: (meeting: Meeting) => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Recorder({ settings, onMeetingCreate, onMeetingUpdate }: Props) {
  const { isRecording, isPaused, duration, start, pause, resume, stop } = useAudioRecorder();
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState('');

  async function handleStart() {
    if (!settings.groqApiKey || !settings.openRouterApiKey) {
      setError('Stel eerst je API keys in via het ⚙️ icoon rechtsboven.');
      return;
    }
    setError('');
    try {
      await start();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleStop() {
    setProcessing(true);
    setError('');

    const id = crypto.randomUUID();
    const audioBlob = await stop();

    const meeting: Meeting = {
      id,
      title: 'Vergadering wordt verwerkt...',
      date: new Date().toISOString(),
      duration,
      decisions: [],
      actionItems: [],
      followUps: [],
      status: 'transcribing',
    };
    onMeetingCreate(meeting);

    try {
      // Step 1: Transcribe
      setProcessingStep('Spraak omzetten naar tekst via Groq Whisper...');
      meeting.status = 'transcribing';
      onMeetingUpdate({ ...meeting });

      const transcript = await transcribeAudio(audioBlob, settings);
      meeting.transcript = transcript;

      // Step 2: Analyze
      setProcessingStep('Vergadering analyseren met AI...');
      meeting.status = 'analyzing';
      onMeetingUpdate({ ...meeting });

      const analysis = await analyzeMeeting(transcript, settings);

      meeting.title = analysis.title || 'Vergadering';
      meeting.summary = analysis.summary;
      meeting.decisions = (analysis.decisions || []).map((d, i) => ({
        id: `d-${i}`,
        text: d.text,
        context: d.context,
      }));
      meeting.actionItems = (analysis.actionItems || []).map((a, i) => ({
        id: `a-${i}`,
        text: a.text,
        assignee: a.assignee,
        done: false,
      }));
      meeting.followUps = (analysis.followUps || []).map((f, i) => ({
        id: `f-${i}`,
        text: f.text,
        deadline: f.deadline,
        responsible: f.responsible,
      }));
      meeting.status = 'done';
      onMeetingUpdate({ ...meeting });
    } catch (err: any) {
      meeting.status = 'error';
      meeting.error = err.message;
      meeting.title = 'Vergadering (fout)';
      onMeetingUpdate({ ...meeting });
      setError(err.message);
    } finally {
      setProcessing(false);
      setProcessingStep('');
    }
  }

  return (
    <div className="glass-card p-8 flex flex-col items-center gap-6">
      {/* Recording visualization */}
      <div className="relative flex items-center justify-center w-48 h-48">
        {isRecording && !isPaused && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-500/20 pulse-ring" />
            <div className="absolute inset-4 rounded-full bg-red-500/10 pulse-ring" style={{ animationDelay: '0.3s' }} />
          </>
        )}
        {processing && (
          <>
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 pulse-ring" />
            <div className="absolute inset-4 rounded-full bg-indigo-500/10 pulse-ring" style={{ animationDelay: '0.3s' }} />
          </>
        )}
        <div className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-colors duration-300 ${
          isRecording
            ? 'bg-red-600 shadow-lg shadow-red-600/30'
            : processing
            ? 'bg-indigo-600 shadow-lg shadow-indigo-600/30'
            : 'bg-white/10 hover:bg-white/15'
        }`}>
          {processing ? (
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          ) : isRecording ? (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-white recording-dot" />
              <span className="text-white font-mono text-lg ml-2">{formatTime(duration)}</span>
            </div>
          ) : (
            <Mic className="w-12 h-12 text-gray-400" />
          )}
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        {processing ? (
          <p className="text-indigo-300 animate-pulse">{processingStep}</p>
        ) : isRecording ? (
          <p className="text-red-300">
            {isPaused ? 'Gepauzeerd' : 'Opname loopt...'}
          </p>
        ) : (
          <p className="text-gray-500">Klik om een vergadering op te nemen</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isRecording && !processing && (
          <button onClick={handleStart} className="btn-primary flex items-center gap-2 text-lg px-8 py-3">
            <Mic className="w-5 h-5" />
            Opname starten
          </button>
        )}
        {isRecording && (
          <>
            <button
              onClick={isPaused ? resume : pause}
              className="btn-ghost flex items-center gap-2"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              {isPaused ? 'Hervatten' : 'Pauzeren'}
            </button>
            <button onClick={handleStop} className="btn-danger flex items-center gap-2">
              <Square className="w-5 h-5" />
              Stoppen & Verwerken
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm max-w-md text-center">
          {error}
        </div>
      )}
    </div>
  );
}
