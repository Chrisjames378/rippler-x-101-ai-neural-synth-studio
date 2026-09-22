import React, { useEffect, useState } from 'react';
import { audioEngine } from '../utils/audioEngine';

const NOTES = [
  { note: 'C3', freq: 130.81, type: 'white', keyChar: 'Z' },
  { note: 'C#3', freq: 138.59, type: 'black', keyChar: 'S', pos: 26 },
  { note: 'D3', freq: 146.83, type: 'white', keyChar: 'X' },
  { note: 'D#3', freq: 155.56, type: 'black', keyChar: 'D', pos: 68 },
  { note: 'E3', freq: 164.81, type: 'white', keyChar: 'C' },
  { note: 'F3', freq: 174.61, type: 'white', keyChar: 'V' },
  { note: 'F#3', freq: 185.00, type: 'black', keyChar: 'G', pos: 150 },
  { note: 'G3', freq: 196.00, type: 'white', keyChar: 'B' },
  { note: 'G#3', freq: 207.65, type: 'black', keyChar: 'H', pos: 192 },
  { note: 'A3', freq: 220.00, type: 'white', keyChar: 'N' },
  { note: 'A#3', freq: 233.08, type: 'black', keyChar: 'J', pos: 234 },
  { note: 'B3', freq: 246.94, type: 'white', keyChar: 'M' },
  { note: 'C4', freq: 261.63, type: 'white', keyChar: 'Q' },
  { note: 'C#4', freq: 277.18, type: 'black', keyChar: '2', pos: 316 },
  { note: 'D4', freq: 293.66, type: 'white', keyChar: 'W' },
  { note: 'D#4', freq: 311.13, type: 'black', keyChar: '3', pos: 358 },
  { note: 'E4', freq: 329.63, type: 'white', keyChar: 'E' },
  { note: 'F4', freq: 349.23, type: 'white', keyChar: 'R' },
  { note: 'F#4', freq: 369.99, type: 'black', keyChar: '5', pos: 440 },
  { note: 'G4', freq: 392.00, type: 'white', keyChar: 'T' },
  { note: 'G#4', freq: 415.30, type: 'black', keyChar: '6', pos: 482 },
  { note: 'A4', freq: 440.00, type: 'white', keyChar: 'Y' },
  { note: 'A#4', freq: 466.16, type: 'black', keyChar: '7', pos: 524 },
  { note: 'B4', freq: 493.88, type: 'white', keyChar: 'U' },
  { note: 'C5', freq: 523.25, type: 'white', keyChar: 'I' }
];

export const VirtualKeyboard: React.FC = () => {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [modValue, setModValue] = useState<number>(0);
  const [pitchValue, setPitchValue] = useState<number>(0);

  const playNote = (noteObj: typeof NOTES[0]) => {
    audioEngine.triggerNote(noteObj.freq);
    setActiveNotes(prev => new Set(prev).add(noteObj.note));
    setTimeout(() => {
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(noteObj.note);
        return next;
      });
    }, 200);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const keyUpper = e.key.toUpperCase();
      const match = NOTES.find(n => n.keyChar === keyUpper);
      if (match) {
        playNote(match);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setPitchValue(val);
    audioEngine.pitchBend = val;
  };

  const handleModChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setModValue(val);
    audioEngine.modWheel = val;
  };

  return (
    <footer className="plugin-panel p-3.5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
      {/* Wheels */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center bg-[#05070c] px-2.5 py-2 rounded-xl border border-slate-800">
          <div className="h-16 w-8 bg-[#101726] rounded-lg border border-slate-800 relative flex items-center justify-center">
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={pitchValue}
              onChange={handlePitchChange}
              className="absolute h-full w-full opacity-0 cursor-pointer"
            />
            <div
              className="w-6 h-4 bg-[#00ffaa]/90 rounded-md absolute shadow transition-all pointer-events-none"
              style={{ top: `${((2 - pitchValue) / 4) * 80}%` }}
            ></div>
          </div>
          <span className="text-[9px] text-slate-400 mt-1 font-mono">Pitch Bend</span>
        </div>

        <div className="flex flex-col items-center bg-[#05070c] px-2.5 py-2 rounded-xl border border-slate-800">
          <div className="h-16 w-8 bg-[#101726] rounded-lg border border-slate-800 relative flex items-center justify-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={modValue}
              onChange={handleModChange}
              className="absolute h-full w-full opacity-0 cursor-pointer"
            />
            <div
              className="w-6 h-4 bg-[#06b6d4]/90 rounded-md absolute shadow transition-all pointer-events-none"
              style={{ top: `${(1 - modValue) * 80}%` }}
            ></div>
          </div>
          <span className="text-[9px] text-slate-400 mt-1 font-mono">AI Mod</span>
        </div>
      </div>

      {/* Piano Keys */}
      <div className="flex-1 overflow-x-auto py-1 flex justify-center">
        <div className="flex relative h-24 bg-[#05070c] p-1.5 rounded-xl border border-slate-800 select-none min-w-[580px]">
          {NOTES.map((item) => {
            const isActive = activeNotes.has(item.note);
            if (item.type === 'white') {
              return (
                <div
                  key={item.note}
                  onClick={() => playNote(item)}
                  className={`w-8 h-20 rounded-b-lg border border-gray-400 cursor-pointer flex flex-col items-center justify-end pb-1 text-[9px] font-bold shadow-sm active:scale-95 transition-all ${
                    isActive
                      ? 'bg-[#00ffaa] text-[#05070c] led-glow'
                      : 'bg-gradient-to-b from-gray-100 to-gray-300 hover:from-white hover:to-[#00ffaa]/40 text-gray-800'
                  }`}
                >
                  <span className="text-[8px] opacity-60">{item.keyChar}</span>
                  <span>{item.note}</span>
                </div>
              );
            } else {
              return (
                <div
                  key={item.note}
                  onClick={() => playNote(item)}
                  style={{ left: `${item.pos}px` }}
                  className={`w-5 h-12 rounded-b-lg absolute z-10 cursor-pointer shadow-lg border border-gray-700 flex flex-col items-center justify-end pb-1 text-[8px] font-bold active:scale-95 transition-all ${
                    isActive
                      ? 'bg-[#06b6d4] text-[#05070c] led-cyan'
                      : 'bg-gradient-to-b from-gray-800 to-gray-900 text-cyan-300 hover:border-[#00ffaa]'
                  }`}
                >
                  <span className="opacity-75">{item.keyChar}</span>
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-4 bg-[#05070c] px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
        <div>
          <span className="text-[9px] text-slate-400 block font-mono">Polyphony</span>
          <span className="font-bold text-white font-mono">16 Voices</span>
        </div>
        <div className="h-6 w-[1px] bg-slate-800"></div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-[#00ffaa] font-bold font-mono">AI CPU: 2.8%</span>
          <span className="text-[9px] text-slate-400 font-mono">48kHz / 24-bit</span>
        </div>
      </div>
    </footer>
  );
};
