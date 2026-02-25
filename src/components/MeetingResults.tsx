import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import type { Meeting } from '../types/meeting';

interface Props {
  meeting: Meeting;
  onUpdate: (m: Meeting) => void;
  onBack: () => void;
}

function Section({ title, emoji, count, color, children, defaultOpen = true }: { title: string; emoji: string; count?: number; color: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={s.section}>
      <TouchableOpacity style={s.sectionHeader} onPress={() => setOpen(!open)} activeOpacity={0.7}>
        <View style={s.sectionLeft}>
          <View style={[s.iconBadge, { backgroundColor: color }]}>
            <Text style={s.emoji}>{emoji}</Text>
          </View>
          <Text style={s.sectionTitle}>{title}</Text>
          {count !== undefined && (
            <View style={s.countBadge}><Text style={s.countTxt}>{count}</Text></View>
          )}
        </View>
        <Text style={s.chevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && <View style={s.sectionBody}>{children}</View>}
    </View>
  );
}

export default function MeetingResults({ meeting, onUpdate, onBack }: Props) {
  const toggleAction = (id: string) => {
    onUpdate({ ...meeting, actionItems: meeting.actionItems.map((a) => a.id === id ? { ...a, done: !a.done } : a) });
  };
  const toggleFollowUp = (id: string) => {
    onUpdate({ ...meeting, followUps: meeting.followUps.map((f) => f.id === id ? { ...f, done: !f.done } : f) });
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <TouchableOpacity onPress={onBack} style={s.backBtn}>
        <Text style={s.backTxt}>← Terug</Text>
      </TouchableOpacity>

      <Text style={s.title}>{meeting.title}</Text>
      <Text style={s.date}>{new Date(meeting.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>

      <Section title="Samenvatting" emoji="📝" color="rgba(59,130,246,0.2)">
        <Text style={s.bodyText}>{meeting.summary}</Text>
      </Section>

      <Section title="Beslismomenten" emoji="💡" count={meeting.decisions.length} color="rgba(245,158,11,0.2)">
        {meeting.decisions.length === 0 ? (
          <Text style={s.emptyTxt}>Geen beslismomenten gedetecteerd.</Text>
        ) : meeting.decisions.map((d) => (
          <View key={d.id} style={s.itemCard}>
            <Text style={s.itemText}>{d.text}</Text>
            {d.context ? <Text style={s.itemSub}>{d.context}</Text> : null}
          </View>
        ))}
      </Section>

      <Section title="Actiepunten" emoji="✅" count={meeting.actionItems.length} color="rgba(16,185,129,0.2)">
        {meeting.actionItems.length === 0 ? (
          <Text style={s.emptyTxt}>Geen actiepunten gedetecteerd.</Text>
        ) : meeting.actionItems.map((a) => (
          <TouchableOpacity key={a.id} style={s.checkItem} onPress={() => toggleAction(a.id)} activeOpacity={0.7}>
            <View style={[s.checkbox, a.done && s.checkboxDone]}>
              {a.done && <Text style={s.checkMark}>✓</Text>}
            </View>
            <Text style={[s.checkText, a.done && s.checkedText]}>{a.text}</Text>
            {a.assignee && <View style={s.assigneeBadge}><Text style={s.assigneeTxt}>{a.assignee}</Text></View>}
          </TouchableOpacity>
        ))}
      </Section>

      <Section title="Vervolgpunten" emoji="➡️" count={meeting.followUps.length} color="rgba(139,92,246,0.2)" defaultOpen={false}>
        {meeting.followUps.length === 0 ? (
          <Text style={s.emptyTxt}>Geen vervolgpunten gedetecteerd.</Text>
        ) : meeting.followUps.map((f) => (
          <TouchableOpacity key={f.id} style={s.checkItem} onPress={() => toggleFollowUp(f.id)} activeOpacity={0.7}>
            <View style={[s.checkbox, f.done && s.checkboxPurple]}>
              {f.done && <Text style={s.checkMark}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.checkText, f.done && s.checkedText]}>{f.text}</Text>
              <View style={s.metaRow}>
                {f.responsible && <Text style={s.metaTxt}>{f.responsible}</Text>}
                {f.deadline && <Text style={s.metaTxt}>{f.deadline}</Text>}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </Section>

      {meeting.transcript && (
        <Section title="Transcript" emoji="📋" color="rgba(107,114,128,0.2)" defaultOpen={false}>
          <Text style={s.transcript}>{meeting.transcript}</Text>
        </Section>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  content: { padding: 20 },
  backBtn: { marginBottom: 16 },
  backTxt: { color: '#818cf8', fontSize: 16, fontWeight: '500' },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  date: { color: '#666', fontSize: 14, marginBottom: 24 },
  section: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBadge: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 18 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
  countBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countTxt: { color: '#ccc', fontSize: 12, fontWeight: '600' },
  chevron: { color: '#666', fontSize: 10 },
  sectionBody: { paddingHorizontal: 16, paddingBottom: 16 },
  bodyText: { color: '#d1d5db', fontSize: 15, lineHeight: 24 },
  emptyTxt: { color: '#555', fontSize: 14 },
  itemCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, marginBottom: 8 },
  itemText: { color: '#e5e7eb', fontSize: 15, fontWeight: '500' },
  itemSub: { color: '#777', fontSize: 13, marginTop: 4 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, marginBottom: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#555', alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: '#10b981', borderColor: '#10b981' },
  checkboxPurple: { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  checkText: { flex: 1, color: '#e5e7eb', fontSize: 15 },
  checkedText: { textDecorationLine: 'line-through', color: '#555' },
  assigneeBadge: { backgroundColor: 'rgba(99,102,241,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  assigneeTxt: { color: '#a5b4fc', fontSize: 12 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  metaTxt: { color: '#777', fontSize: 12 },
  transcript: { color: '#888', fontSize: 13, lineHeight: 22 },
});
