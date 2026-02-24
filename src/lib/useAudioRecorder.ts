import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);

  const startTimer = useCallback(() => {
    timerRef.current = window.setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000));
    }, 200);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(1000); // collect data every second
      startTimeRef.current = Date.now();
      pausedDurationRef.current = 0;
      setDuration(0);
      setIsRecording(true);
      setIsPaused(false);
      startTimer();
    } catch (err) {
      throw new Error('Kan microfoon niet openen. Geef toestemming in je browser.');
    }
  }, [startTimer]);

  const pause = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
      pausedDurationRef.current -= Date.now(); // will add back on resume
    }
  }, [stopTimer]);

  const resume = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      pausedDurationRef.current += Date.now();
      startTimer();
    }
  }, [startTimer]);

  const stop = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) return;

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        resolve(blob);

        // stop all tracks
        mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current = null;
      };

      mediaRecorderRef.current.stop();
      stopTimer();
      setIsRecording(false);
      setIsPaused(false);
    });
  }, [stopTimer]);

  return { isRecording, isPaused, duration, start, pause, resume, stop };
}
