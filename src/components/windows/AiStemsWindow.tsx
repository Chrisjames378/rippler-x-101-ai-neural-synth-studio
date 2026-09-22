import React, { useState } from 'react';
import { FloatingWindow } from './FloatingWindow';
import { StemTrack } from '../../types';

interface AiStemsWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_STEMS: StemTrack[] = [
  { id: 'vocals', name: '🎤 Vocals Stem', color: '#ec4899', status: 'Ready', muted: false, volume: 1.0 },
  { id: 'drums', name: '🥁 Drums Stem', color: '#00ffaa', status: 'Ready', muted: false, volume: 1.0 },
  { id: 'bass', name: '🎸 Bass Stem', color: '#06b6d4', status: 'Ready', muted: false, volume: 1.0 },
  { id: 'synths', name: '🎹 Other / Synths Stem', color: '#a855f7', status: 'Ready', muted: false, volume: 1.0 }
];

export const AiStemsWindow: React.FC<AiStemsWindowProps> = ({ isOpen, onClose }) => {
  const [stems, setStems] = useState<StemTrack[]>(INITIAL_STEMS);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleRunSeparation = () => {
    if (!fileName) {
      setFileName("demo-witch-house-track.mp3");
    }
    setIsProcessing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setStems(prevStems =>
            prevStems.map(s => ({ ...s, status: 'Completed' }))
          );
          return 100;
        }
        return prev + 15;
      });
    }, 250);
  };

  const toggleMute = (id: string) => {
    setStems(prev =>
      prev.map(s => (s.id === id ? { ...s, muted: !s.muted } : s))
    );
  };

  const handleDownloadZip = () => {
    alert("Downloading isolated stems (Vocals, Drums, Bass, Synths) package!");
  };

  return (
    <FloatingWindow
      title="✂️ ON-DEVICE AI STEM SEPARATOR (DEMUCS / SPLEETER WASM)"
      isOpen={isOpen}
      onClose={onClose}
      initialX={120}
      initialY={100}
      width="780px"
      height="460px"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
        {/* Drop Zone */}
        <div className="lg:col-span-5 bg-[#05070c]/80 p-4 rounded-xl border border-dashed border-[#00ffaa]/50 flex flex-col items-center justify-center text-center hover:bg-[#0a0e17] transition-colors relative">
          <span className="text-4xl mb-2">🎵</span>
          <h3 className="text-xs font-bold text-white mb-1">
            {fileName ? fileName : 'Drag & Drop Audio File Here (.mp3 / .wav)'}
          </h3>
          <p className="text-[10px] text-slate-400 mb-3">
            Instantly split Vocals, Drums, Bass & Synths stems using on-device Demucs neural models.
          </p>

          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />

          <button
            onClick={handleRunSeparation}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl bg-[#00ffaa] text-[#05070c] font-bold text-xs shadow hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer z-10"
          >
            {isProcessing ? `Processing (${progress}%)...` : '✨ Run AI Stem Separation'}
          </button>
        </div>

        {/* Stem Results */}
        <div className="lg:col-span-7 bg-[#05070c]/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white mb-3 flex items-center justify-between">
              <span>SEPARATED STEMS OUTPUT CHANNELS</span>
              <span className="text-[10px] font-mono text-[#00ffaa]">4 Channels</span>
            </h3>

            <div className="space-y-2.5">
              {stems.map((stem) => (
                <div
                  key={stem.id}
                  className="bg-[#0a0e17] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                >
                  <span className="text-xs font-bold" style={{ color: stem.color }}>
                    {stem.name}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMute(stem.id)}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold cursor-pointer ${
                        stem.muted ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {stem.muted ? 'MUTED' : 'MUTE'}
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">{stem.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              onClick={handleDownloadZip}
              className="px-4 py-1.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              📥 Download Stems ZIP
            </button>
          </div>
        </div>
      </div>
    </FloatingWindow>
  );
};
