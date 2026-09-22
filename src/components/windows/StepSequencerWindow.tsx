import React, { useState, useEffect, useRef } from 'react';
import { FloatingWindow } from './FloatingWindow';
import { SeqTrack } from '../../types';
import { audioEngine } from '../../utils/audioEngine';

interface StepSequencerWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_TRACKS: SeqTrack[] = [
  { id: 't1', name: 'Stem 1: Kick Drum', steps: Array(32).fill(false), note: 36, color: '#ec4899' },
  { id: 't2', name: 'Stem 2: Acid Bassline', steps: Array(32).fill(false), note: 48, color: '#06b6d4' },
  { id: 't3', name: 'Stem 3: Spectral Lead', steps: Array(32).fill(false), note: 60, color: '#00ffaa' },
  { id: 't4', name: 'Stem 4: Crypt Arpeggio', steps: Array(32).fill(false), note: 72, color: '#a855f7' }
];

// Pre-fill beat pattern
DEFAULT_TRACKS[0].steps[0] = true; DEFAULT_TRACKS[0].steps[8] = true; DEFAULT_TRACKS[0].steps[16] = true; DEFAULT_TRACKS[0].steps[24] = true;
DEFAULT_TRACKS[1].steps[2] = true; DEFAULT_TRACKS[1].steps[6] = true; DEFAULT_TRACKS[1].steps[10] = true; DEFAULT_TRACKS[1].steps[14] = true;
DEFAULT_TRACKS[2].steps[4] = true; DEFAULT_TRACKS[2].steps[12] = true; DEFAULT_TRACKS[2].steps[20] = true; DEFAULT_TRACKS[2].steps[28] = true;

export const StepSequencerWindow: React.FC<StepSequencerWindowProps> = ({ isOpen, onClose }) => {
  const [tracks, setTracks] = useState<SeqTrack[]>(DEFAULT_TRACKS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(142);
  const timerRef = useRef<number | null>(null);

  const toggleStep = (trackIdx: number, stepIdx: number) => {
    setTracks(prev => {
      const copy = [...prev];
      copy[trackIdx] = {
        ...copy[trackIdx],
        steps: [...copy[trackIdx].steps]
      };
      copy[trackIdx].steps[stepIdx] = !copy[trackIdx].steps[stepIdx];
      return copy;
    });
  };

  useEffect(() => {
    if (isPlaying) {
      const stepMs = (60 / bpm / 4) * 1000;
      timerRef.current = window.setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = (prev + 1) % 32;
          tracks.forEach(track => {
            if (track.steps[nextStep]) {
              const freq = 440 * Math.pow(2, (track.note - 69) / 12);
              audioEngine.triggerNote(freq);
            }
          });
          return nextStep;
        });
      }, stepMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, tracks]);

  const handlePlay = () => {
    audioEngine.init();
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleRandomize = () => {
    setTracks(prev =>
      prev.map(tr => ({
        ...tr,
        steps: tr.steps.map(() => Math.random() > 0.7)
      }))
    );
  };

  const handleClear = () => {
    setTracks(prev =>
      prev.map(tr => ({
        ...tr,
        steps: Array(32).fill(false)
      }))
    );
  };

  const handleExportMidi = () => {
    const headerChunk = new Uint8Array([0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01, 0x00, 0x60]);
    const trackEvents = [0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20, 0x00, 0x90, 0x3c, 0x64, 0x60, 0x80, 0x3c, 0x00, 0x00, 0xff, 0x2f, 0x00];
    const trackLen = trackEvents.length;
    const trackHeader = new Uint8Array([0x4d, 0x54, 0x72, 0x6b, (trackLen >> 24) & 0xff, (trackLen >> 16) & 0xff, (trackLen >> 8) & 0xff, trackLen & 0xff]);

    const midiBlob = new Blob([headerChunk, trackHeader, new Uint8Array(trackEvents)], { type: 'audio/midi' });
    const url = URL.createObjectURL(midiBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rippler-32step-sequence.mid';
    a.click();
  };

  return (
    <FloatingWindow
      title="🎹 32-STEP SEQUENCER & PIANO ROLL MATRIX"
      isOpen={isOpen}
      onClose={onClose}
      initialX={80}
      initialY={90}
      width="820px"
      height="480px"
    >
      <div className="flex flex-wrap items-center justify-between mb-3 pb-2 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="px-4 py-1.5 rounded-xl bg-[#00ffaa] text-[#05070c] font-black text-xs shadow-md hover:scale-105 transition-transform cursor-pointer"
            >
              ▶ PLAY
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="px-4 py-1.5 rounded-xl bg-slate-700 text-white font-black text-xs shadow-md hover:scale-105 transition-transform cursor-pointer"
            >
              ⏹ STOP
            </button>
          )}

          <div className="flex items-center gap-2 bg-[#05070c] px-3 py-1 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono">BPM</span>
            <input
              type="number"
              min="60"
              max="220"
              value={bpm}
              onChange={e => setBpm(parseInt(e.target.value) || 120)}
              className="w-12 bg-transparent text-xs text-[#00ffaa] font-bold font-mono outline-none text-center"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRandomize}
            className="px-3 py-1.5 rounded-xl bg-[#101726] text-cyan-300 border border-slate-800 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            🎲 Randomize
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1.5 rounded-xl bg-[#101726] text-slate-400 border border-slate-800 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            🗑️ Clear
          </button>
          <button
            onClick={handleExportMidi}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold text-xs shadow hover:opacity-95 transition-opacity cursor-pointer"
          >
            📥 Export .MIDI
          </button>
        </div>
      </div>

      <div className="bg-[#05070c] p-3 rounded-xl border border-slate-800 overflow-x-auto flex-1 mb-2">
        <div className="min-w-[720px] space-y-2">
          {tracks.map((track, tIdx) => (
            <div key={track.id} className="flex items-center gap-2">
              <div className="w-36 text-xs font-bold text-white font-mono truncate" style={{ color: track.color }}>
                {track.name}
              </div>
              <div className="flex gap-1 flex-1">
                {track.steps.map((active, sIdx) => {
                  const isCurrent = isPlaying && currentStep === sIdx;
                  return (
                    <button
                      key={sIdx}
                      onClick={() => toggleStep(tIdx, sIdx)}
                      style={{
                        backgroundColor: active ? track.color : isCurrent ? '#1e293b' : '#0a0e17'
                      }}
                      className={`w-5 h-7 rounded border transition-all cursor-pointer ${
                        isCurrent ? 'ring-2 ring-white' : ''
                      } ${active ? 'shadow-lg border-white/40' : 'border-slate-800/80 hover:border-slate-600'}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </FloatingWindow>
  );
};
