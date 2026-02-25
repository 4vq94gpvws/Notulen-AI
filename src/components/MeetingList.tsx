import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Meeting } from '../types/meeting';
import { formatDuration, formatDate } from '../lib/helpers';

interface Props {
  meetings: Meeting[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function MeetingList({ meetings, onSelect, onDelete }: Props) {
  const sorted = [...meetings].filter((m) => m.status === 'done').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <Text style={s.emptyIcon}>📅</Text>
        <Text style={s.emptyTitle}>Nog geen vergaderingen</Text>
        <Text style={s.emptySub}>Start een opname om te beginnen.</Text>
      </View>
    );
  }

  return (
    <View style={s.list}>
      {sorted.map((m) => (
        <TouchableOpacity key={m.id} style={s.card} onPress={() => onSelect(m.id)} activeOpacity={0.7}>
          <View style={s.cardContent}>
            <Text style={s.cardTitle} numberOfLines={1}>{m.title}</Text>
            <View style={s.metaRow}>
              <Text style={s.meta}>{formatDate(m.date)}</Text>
              <Text style={s.metaDot}>•</Text>
              <Text style={s.meta}>{formatDuration(m.duration)}</Text>
              <Text style={s.metaDot}>•</Text>
              <Text style={s.metaGreen}>{m.actionItems.filter((a) => a.done).length}/{m.actionItems.length} acties</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => onDelete(m.id)} style={s.deleteBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={s.deleteTxt}>🗑</Text>
          </TouchableOpacity>
          <Text style={s.arrow}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  list: { gap: 8 },
  card: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center' },
  cardContent: { flex: 1 },
  cardTitle: { color: '#f3f4f6', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { color: '#666', fontSize: 13 },
  metaDot: { color: '#444', fontSize: 13 },
  metaGreen: { color: '#10b981', fontSize: 13 },
  deleteBtn: { padding: 8 },
  deleteTxt: { fontSize: 16 },
  arrow: { color: '#555', fontSize: 24, marginLeft: 4 },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: '#666', fontSize: 16, fontWeight: '500' },
  emptySub: { color: '#444', fontSize: 14, marginTop: 4 },
});
