import React, { useState, useEffect, useRef } from 'react';
import { FloatingWindow } from './FloatingWindow';
import { audioEngine } from '../../utils/audioEngine';

interface AudacityWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudacityWindow: React.FC<AudacityWindowProps> = ({ isOpen, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleStartRecord = () => {
    audioEngine.init();
    const stream = audioEngine.getRecordStream();
    if (!stream) return;

    setRecordedChunks([]);
    setAudioUrl(null);

    try {
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    } catch {
      mediaRecorderRef.current = new MediaRecorder(stream);
    }

    const chunks: Blob[] = [];
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setRecordedChunks(chunks);
      setAudioUrl(URL.createObjectURL(blob));
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    setRecTime(0);

    timerRef.current = window.setInterval(() => {
      setRecTime(prev => prev + 1);
    }, 1000);
  };

  const handleStopRecord = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const handlePlayRecording = () => {
    if (audioUrl) {
      new Audio(audioUrl).play();
    }
  };

  // Waveform oscilloscope loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animId = requestAnimationFrame(draw);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.fillStyle = '#030407';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = isRecording ? '#ef4444' : '#00ffaa';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < 150; i++) {
        const v = Math.sin(i * 0.15 + Date.now() * (isRecording ? 0.01 : 0.003)) * (isRecording ? 35 : 12);
        const cy = (height / 2) + v;
        const x = i * (width / 150);
        if (i === 0) ctx.moveTo(x, cy);
        else ctx.lineTo(x, cy);
      }

      ctx.stroke();
    };

    draw();

    return () => cancelAnimationFrame(animId);
  }, [isRecording]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}.0`;
  };

  return (
    <FloatingWindow
      title="🎙️ AUDACITY-STYLE MULTI-TRACK WORKSTATION"
      isOpen={isOpen}
      onClose={onClose}
      initialX={130}
      initialY={120}
      width="740px"
      height="440px"
    >
      <div className="flex flex-col h-full justify-between">
        <div className="bg-[#05070c]/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center space-x-2">
            {!isRecording ? (
              <button
                onClick={handleStartRecord}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse inline-block"></span>
                <span>⏺ RECORD SPEAKER OUTPUT</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecord}
                className="px-4 py-2 rounded-xl bg-slate-700 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>⏹ STOP RECORDING</span>
              </button>
            )}

            <button
              onClick={handlePlayRecording}
              disabled={!audioUrl}
              className="px-3.5 py-2 rounded-xl bg-[#00ffaa] text-[#05070c] font-bold text-xs disabled:opacity-50 cursor-pointer"
            >
              ▶ PLAY MIX
            </button>
          </div>

          <div className="text-xs font-mono text-red-400 font-bold bg-[#0a0e17] px-3 py-1.5 rounded-lg border border-red-500/30">
            {formatTimer(recTime)}
          </div>
        </div>

        <div className="flex-1 bg-[#05070c] rounded-xl border border-slate-800 p-3 relative flex flex-col justify-between mb-3 overflow-hidden">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-1">
            <span>WAVEFORM TIMELINE OSCILLOSCOPE</span>
            <span className="text-[#00ffaa]">{isRecording ? '● RECORDING IN PROGRESS' : 'DAW READY'}</span>
          </div>

          <div className="flex-1 bg-[#030407] rounded-lg border border-slate-800 relative overflow-hidden mb-2">
            <canvas ref={canvasRef} className="w-full h-full block"></canvas>
          </div>

          <div className="flex justify-end">
            {audioUrl && (
              <a
                href={audioUrl}
                download="rippler-master-daw-mix.webm"
                className="px-4 py-1.5 rounded-xl bg-[#00ffaa] text-[#05070c] text-xs font-bold cursor-pointer hover:scale-105 transition-transform"
              >
                📥 Download Master Recording
              </a>
            )}
          </div>
        </div>
      </div>
    </FloatingWindow>
  );
};
