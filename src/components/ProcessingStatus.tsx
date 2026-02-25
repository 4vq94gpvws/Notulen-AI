import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface Props {
  status: 'recording' | 'transcribing' | 'analyzing' | 'done' | 'error';
  error?: string;
}

const steps = [
  { key: 'transcribing', label: 'Transcriberen met Whisper...' },
  { key: 'analyzing', label: 'Analyseren met AI...' },
  { key: 'done', label: 'Klaar!' },
];

export default function ProcessingStatus({ status, error }: Props) {
  if (status === 'recording') return null;

  if (status === 'error') {
    return (
      <View style={s.errorBox}>
        <Text style={s.errorTxt}>{error || 'Er ging iets mis.'}</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {steps.map((step) => {
        const isActive = status === step.key;
        const isDone =
          (step.key === 'transcribing' && ['analyzing', 'done'].includes(status)) ||
          (step.key === 'analyzing' && status === 'done') ||
          (step.key === 'done' && status === 'done');

        return (
          <View key={step.key} style={[s.step, isActive && s.stepActive, isDone && s.stepDone, !isActive && !isDone && s.stepPending]}>
            {isActive ? (
              <ActivityIndicator size="small" color="#818cf8" />
            ) : isDone ? (
              <Text style={s.checkIcon}>✓</Text>
            ) : (
              <Text style={s.pendingIcon}>○</Text>
            )}
            <Text style={[s.stepLabel, isActive && s.labelActive, isDone && s.labelDone, !isActive && !isDone && s.labelPending]}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 10 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  stepActive: { backgroundColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)' },
  stepDone: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)' },
  stepPending: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)', opacity: 0.4 },
  stepLabel: { fontSize: 14, fontWeight: '500' },
  labelActive: { color: '#a5b4fc' },
  labelDone: { color: '#6ee7b7' },
  labelPending: { color: '#666' },
  checkIcon: { color: '#34d399', fontSize: 18, fontWeight: '700', width: 20, textAlign: 'center' },
  pendingIcon: { color: '#555', fontSize: 16, width: 20, textAlign: 'center' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderRadius: 14, padding: 16 },
  errorTxt: { color: '#fca5a5', fontSize: 14 },
});
