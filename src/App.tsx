import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Platform } from 'react-native';
import type { Meeting, ApiKeys } from './types/meeting';
import { AudioRecorder } from './lib/recorder';
import { transcribeAudio, analyzeTranscript } from './lib/api';
import { fetchMeetings, insertMeeting, updateMeeting as updateMeetingRow, deleteMeetingRow } from './lib/supabase';
import { loadKeys, saveKeys } from './lib/storage';
import { rowToMeeting } from './lib/helpers';
import ApiKeyModal from './components/ApiKeyModal';
import RecordingView from './components/RecordingView';
import ProcessingStatus from './components/ProcessingStatus';
import MeetingResults from './components/MeetingResults';
import MeetingList from './components/MeetingList';

type ViewType = 'home' | 'record' | 'detail';

export default function App() {
  const [keys, setKeys] = useState<ApiKeys | null>(loadKeys);
  const [showKeyModal, setShowKeyModal] = useState(!loadKeys());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [view, setView] = useState<ViewType>('home');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const recorderRef = useRef(new AudioRecorder());
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const currentMeeting = meetings.find((m) => m.id === currentId);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await fetchMeetings();
      setMeetings(rows.map(rowToMeeting));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateLocal = useCallback(
    (m: Meeting) => setMeetings((prev) => prev.map((x) => x.id === m.id ? m : x)), []
  );

  const startRecording = async () => {
    if (!keys) { setShowKeyModal(true); return; }
    try {
      const row = await insertMeeting({
        title: title || `Vergadering ${new Date().toLocaleString('nl-NL')}`,
        meeting_date: new Date().toISOString(),
        status: 'recording',
      });
      const meeting = rowToMeeting(row);
      setMeetings((prev) => [meeting, ...prev]);
      setCurrentId(row.id);
      setView('record');
      setElapsed(0);
      await recorderRef.current.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => setElapsed(recorderRef.current.getElapsed()), 500);
    } catch (err: any) {
      alert('Fout: ' + err.message);
    }
  };

  const stopRecording = async () => {
    clearInterval(timerRef.current);
    setIsRecording(false);
    const blob = await recorderRef.current.stop();
    const dur = elapsed;
    if (!currentMeeting || !keys) return;

    const updated: Meeting = { ...currentMeeting, duration: dur, status: 'transcribing' };
    updateLocal(updated);

    try {
      await updateMeetingRow(currentMeeting.id, { duration_seconds: dur, status: 'transcribing' });
      const transcript = await transcribeAudio(blob, keys.groqKey);
      const step2: Meeting = { ...updated, transcript, status: 'analyzing' };
      updateLocal(step2);
      await updateMeetingRow(currentMeeting.id, { transcript, status: 'analyzing' });

      const analysis = await analyzeTranscript(transcript, keys.openRouterKey);
      const final: Meeting = { ...step2, ...analysis, status: 'done' };
      updateLocal(final);
      await updateMeetingRow(currentMeeting.id, {
        summary: analysis.summary,
        key_decisions: analysis.decisions,
        action_items: analysis.actionItems,
        follow_ups: analysis.followUps,
        status: 'completed',
      });
      setView('detail');
    } catch (err: any) {
      updateLocal({ ...updated, status: 'error', error: err.message });
      try { await updateMeetingRow(currentMeeting.id, { status: 'error', error_message: err.message }); } catch {}
    }
  };

  const handleUpdate = async (m: Meeting) => {
    updateLocal(m);
    try { await updateMeetingRow(m.id, { action_items: m.actionItems, follow_ups: m.followUps }); } catch {}
  };

  const handleDelete = async (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    if (currentId === id) { setCurrentId(null); setView('home'); }
    try { await deleteMeetingRow(id); } catch {}
  };

  const handleSaveKeys = (k: ApiKeys) => {
    saveKeys(k);
    setKeys(k);
    setShowKeyModal(false);
  };

  // Detail view
  if (view === 'detail' && currentMeeting && currentMeeting.status === 'done') {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" />
        <MeetingResults meeting={currentMeeting} onUpdate={handleUpdate} onBack={() => { setView('home'); setCurrentId(null); }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        {view !== 'home' && (
          <TouchableOpacity onPress={() => { setView('home'); setCurrentId(null); setTitle(''); }} style={s.backBtn}>
            <Text style={s.backTxt}>←</Text>
          </TouchableOpacity>
        )}
        <View style={s.logoRow}>
          <View style={s.logoBadge}><Text style={s.logoIcon}>🎙</Text></View>
          <Text style={s.logoText}>Notulen AI</Text>
        </View>
        <TouchableOpacity onPress={() => setShowKeyModal(true)} style={s.settingsBtn}>
          <Text style={s.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Home */}
      {view === 'home' && (
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
          <View style={s.heroCard}>
            <Text style={s.heroTitle}>Nieuwe vergadering</Text>
            <Text style={s.heroSub}>Neem op, transcribeer en krijg automatisch een samenvatting, beslismomenten en actiepunten.</Text>

            <TextInput
              style={s.titleInput}
              placeholder="Naam van de vergadering (optioneel)"
              placeholderTextColor="#555"
              value={title}
              onChangeText={setTitle}
            />

            <TouchableOpacity style={s.startBtn} onPress={startRecording} activeOpacity={0.8}>
              <Text style={s.startIcon}>+</Text>
              <Text style={s.startTxt}>Start opname</Text>
            </TouchableOpacity>

            {!keys && <Text style={s.warning}>Stel eerst je API keys in via het tandwiel-icoon.</Text>}
          </View>

          <View style={s.historyHeader}>
            <Text style={s.historyTitle}>Eerdere vergaderingen</Text>
            <TouchableOpacity onPress={load} style={s.refreshBtn}>
              {loading ? <ActivityIndicator size="small" color="#888" /> : <Text style={s.refreshTxt}>↻ Vernieuw</Text>}
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={s.loadingContainer}><ActivityIndicator color="#666" /><Text style={s.loadingTxt}>Laden...</Text></View>
          ) : (
            <MeetingList
              meetings={meetings}
              onSelect={(id) => { setCurrentId(id); setView('detail'); }}
              onDelete={handleDelete}
            />
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Record */}
      {view === 'record' && currentMeeting && (
        <View style={s.recordContainer}>
          <Text style={s.recordTitle}>{currentMeeting.title}</Text>

          {currentMeeting.status === 'recording' && (
            <RecordingView isRecording={isRecording} elapsed={elapsed} onStop={stopRecording} />
          )}

          <View style={s.statusContainer}>
            <ProcessingStatus status={currentMeeting.status} error={currentMeeting.error} />
          </View>

          {currentMeeting.status === 'error' && (
            <TouchableOpacity style={s.ghostBtn} onPress={() => setView('home')}>
              <Text style={s.ghostTxt}>Terug naar home</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ApiKeyModal
        visible={showKeyModal}
        initial={keys || undefined}
        onSave={handleSaveKeys}
        onClose={() => { if (keys) setShowKeyModal(false); }}
        canClose={!!keys}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a1a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  backBtn: { padding: 8, marginRight: 4 },
  backTxt: { color: '#888', fontSize: 22 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  logoBadge: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(99,102,241,0.2)', alignItems: 'center', justifyContent: 'center' },
  logoIcon: { fontSize: 16 },
  logoText: { fontSize: 18, fontWeight: '700', color: '#a5b4fc' },
  settingsBtn: { padding: 8 },
  settingsIcon: { fontSize: 20 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  heroCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  heroSub: { color: '#666', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  titleInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 15, width: '100%', textAlign: 'center', marginBottom: 16 },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#4f46e5', paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14 },
  startIcon: { color: '#fff', fontSize: 20, fontWeight: '700' },
  startTxt: { color: '#fff', fontSize: 17, fontWeight: '600' },
  warning: { color: '#f59e0b', fontSize: 13, marginTop: 12, textAlign: 'center' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  historyTitle: { color: '#ccc', fontSize: 16, fontWeight: '600' },
  refreshBtn: { padding: 8 },
  refreshTxt: { color: '#888', fontSize: 14 },
  loadingContainer: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  loadingTxt: { color: '#555', fontSize: 14 },
  recordContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 24 },
  recordTitle: { color: '#ccc', fontSize: 18, fontWeight: '600' },
  statusContainer: { width: '100%', maxWidth: 400 },
  ghostBtn: { backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  ghostTxt: { color: '#aaa', fontSize: 15 },
});
