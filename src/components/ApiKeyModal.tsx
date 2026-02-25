import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Linking } from 'react-native';
import type { ApiKeys } from '../types/meeting';

interface Props {
  visible: boolean;
  initial?: ApiKeys;
  onSave: (keys: ApiKeys) => void;
  onClose: () => void;
  canClose: boolean;
}

export default function ApiKeyModal({ visible, initial, onSave, onClose, canClose }: Props) {
  const [groqKey, setGroqKey] = useState(initial?.groqKey || '');
  const [openRouterKey, setOpenRouterKey] = useState(initial?.openRouterKey || '');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.header}>
            <Text style={s.title}>API Keys instellen</Text>
            {canClose && (
              <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                <Text style={s.closeTxt}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={s.label}>Groq API Key</Text>
          <Text style={s.sub}>Voor Whisper transcriptie</Text>
          <TextInput
            style={s.input}
            placeholder="gsk_..."
            placeholderTextColor="#555"
            secureTextEntry
            value={groqKey}
            onChangeText={setGroqKey}
          />
          <TouchableOpacity onPress={() => Linking.openURL('https://console.groq.com/keys')}>
            <Text style={s.link}>Key aanmaken bij Groq →</Text>
          </TouchableOpacity>

          <Text style={[s.label, { marginTop: 20 }]}>OpenRouter API Key</Text>
          <Text style={s.sub}>Voor samenvatting & analyse</Text>
          <TextInput
            style={s.input}
            placeholder="sk-or-..."
            placeholderTextColor="#555"
            secureTextEntry
            value={openRouterKey}
            onChangeText={setOpenRouterKey}
          />
          <TouchableOpacity onPress={() => Linking.openURL('https://openrouter.ai/keys')}>
            <Text style={s.link}>Key aanmaken bij OpenRouter →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.saveBtn, (!groqKey || !openRouterKey) && s.disabled]}
            disabled={!groqKey || !openRouterKey}
            onPress={() => onSave({ groqKey, openRouterKey })}
          >
            <Text style={s.saveTxt}>Opslaan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 20, padding: 24, width: '100%', maxWidth: 420, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  closeBtn: { padding: 8 },
  closeTxt: { color: '#888', fontSize: 18 },
  label: { color: '#e0e0e0', fontSize: 14, fontWeight: '600', marginTop: 4 },
  sub: { color: '#666', fontSize: 12, marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 15 },
  link: { color: '#818cf8', fontSize: 12, marginTop: 6 },
  saveBtn: { backgroundColor: '#4f46e5', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  disabled: { opacity: 0.4 },
  saveTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
