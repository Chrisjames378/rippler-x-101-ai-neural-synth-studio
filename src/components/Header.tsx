import React from 'react';
import { FloatingWindowState, Preset } from '../types';
import { FACTORY_PRESETS } from '../data/presets';
import { audioEngine } from '../utils/audioEngine';

interface HeaderProps {
  windowState: FloatingWindowState;
  setWindowState: React.Dispatch<React.SetStateAction<FloatingWindowState>>;
  activePreset: Preset;
  setActivePreset: (preset: Preset) => void;
  masterVolume: number;
  setMasterVolume: (val: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  windowState,
  setWindowState,
  activePreset,
  setActivePreset,
  masterVolume,
  setMasterVolume
}) => {
  const toggleWindow = (key: keyof FloatingWindowState) => {
    setWindowState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const currentIdx = FACTORY_PRESETS.findIndex(p => p.id === activePreset.id);

  const handlePrev = () => {
    const prevIdx = (currentIdx - 1 + FACTORY_PRESETS.length) % FACTORY_PRESETS.length;
    setActivePreset(FACTORY_PRESETS[prevIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIdx + 1) % FACTORY_PRESETS.length;
    setActivePreset(FACTORY_PRESETS[nextIdx]);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMasterVolume(val);
    audioEngine.setMasterVolume(val);
  };

  return (
    <header className="plugin-panel p-3 rounded-2xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-2xl mb-3 z-20">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00ffaa] via-[#06b6d4] to-purple-600 flex items-center justify-center font-black text-[#05070c] text-xl shadow-lg led-glow">
          R
        </div>
        <div>
          <h1 className="text-sm font-black tracking-wider text-white flex items-center gap-2">
            <span>RIPPLER <span className="text-[#00ffaa]">x 101 AI NEURAL SYNTH STUDIO</span></span>
            <span className="text-[9px] bg-[#00ffaa]/20 text-[#00ffaa] px-2 py-0.5 rounded-full border border-[#00ffaa]/40 font-mono">PRO DAW v6.0</span>
          </h1>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
            <span>Preset: <strong className="text-[#00ffaa]">{activePreset.name}</strong></span>
            <button onClick={handlePrev} className="hover:text-white px-1 font-bold text-xs">◀</button>
            <button onClick={handleNext} className="hover:text-white px-1 font-bold text-xs">▶</button>
          </div>
        </div>
      </div>

      {/* Floating Window Toggles & Master Volume */}
      <div className="flex flex-wrap items-center gap-1.5 justify-center">
        <button
          onClick={() => toggleWindow('aiBank')}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1 ${
            windowState.aiBank
              ? 'bg-[#00ffaa] text-[#05070c] led-glow'
              : 'bg-[#101726] text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          🧬 AI BANK WIN
        </button>

        <button
          onClick={() => toggleWindow('stepSeq')}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1 ${
            windowState.stepSeq
              ? 'bg-[#00ffaa] text-[#05070c] led-glow'
              : 'bg-[#101726] text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          🎹 STEP WIN
        </button>

        <button
          onClick={() => toggleWindow('midiHud')}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1 ${
            windowState.midiHud
              ? 'bg-yellow-400 text-[#05070c] led-glow'
              : 'bg-[#101726] text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          🎚️ MIDI HUD
        </button>

        <button
          onClick={() => toggleWindow('stems')}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1 ${
            windowState.stems
              ? 'bg-purple-500 text-white led-glow'
              : 'bg-[#101726] text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          ✂️ STEMS WIN
        </button>

        <button
          onClick={() => toggleWindow('cloud')}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1 ${
            windowState.cloud
              ? 'bg-[#06b6d4] text-[#05070c] led-cyan'
              : 'bg-[#101726] text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          ☁️ CLOUD
        </button>

        <button
          onClick={() => toggleWindow('composer')}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1 ${
            windowState.composer
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-[#101726] text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          🤖 COMPOSER
        </button>

        <button
          onClick={() => toggleWindow('audacity')}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1 ${
            windowState.audacity
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-gradient-to-r from-red-600 to-amber-600 text-white'
          }`}
        >
          🎙️ DAW REC
        </button>

        <div className="h-6 w-[1px] bg-slate-800 mx-1"></div>

        <div className="flex items-center gap-2 bg-[#05070c] px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono">MASTER</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVolume}
            onChange={handleVolumeChange}
            className="w-16 accent-[#00ffaa] cursor-pointer"
          />
        </div>
      </div>
    </header>
  );
};
