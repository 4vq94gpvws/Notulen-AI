import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { formatTime } from '../lib/helpers';

interface Props {
  isRecording: boolean;
  elapsed: number;
  onStop: () => void;
}

function WaveBar({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(8)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 32, duration: 400, delay, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 8, duration: 400, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[s.waveBar, { height: anim }]} />;
}

export default function RecordingView({ isRecording, elapsed, onStop }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isRecording]);

  if (!isRecording) return null;

  return (
    <View style={s.container}>
      <View style={s.waveContainer}>
        {[0, 80, 160, 240, 120, 200, 40].map((d, i) => (
          <WaveBar key={i} delay={d} />
        ))}
      </View>

      <View style={s.timerRow}>
        <Animated.View style={[s.dot, { opacity: pulseAnim }]} />
        <Text style={s.timer}>{formatTime(elapsed)}</Text>
      </View>

      <TouchableOpacity style={s.stopBtn} onPress={onStop} activeOpacity={0.8}>
        <View style={s.stopIcon} />
        <Text style={s.stopTxt}>Stop opname</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { alignItems: 'center', gap: 24 },
  waveContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40 },
  waveBar: { width: 6, backgroundColor: '#f87171', borderRadius: 3 },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ef4444' },
  timer: { fontSize: 32, fontWeight: '700', color: '#f87171', fontVariant: ['tabular-nums'] },
  stopBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#dc2626', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
  stopIcon: { width: 18, height: 18, backgroundColor: '#fff', borderRadius: 3 },
  stopTxt: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
