import React, { useEffect, useRef } from 'react';
import { AiModel, Preset } from '../types';
import { AI_MODELS } from '../data/aiModels';
import { audioEngine } from '../utils/audioEngine';

interface MainWorkspaceProps {
  activePreset: Preset;
  setActivePreset: React.Dispatch<React.SetStateAction<Preset>>;
  onOpenAiBank: () => void;
}

export const MainWorkspace: React.FC<MainWorkspaceProps> = ({
  activePreset,
  setActivePreset,
  onOpenAiBank
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const modelA: AiModel = AI_MODELS.find(m => m.id === activePreset.modelAId) || AI_MODELS[0];
  const modelB: AiModel = AI_MODELS.find(m => m.id === activePreset.modelBId) || AI_MODELS[20];

  // Visualizer loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.fillStyle = '#030407';
      ctx.fillRect(0, 0, width, height);

      const analyser = audioEngine.getAnalyser();
      const barWidth = 4;
      const gap = 3;
      const totalBars = Math.floor(width / (barWidth + gap));

      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        for (let i = 0; i < totalBars; i++) {
          const index = Math.floor((i / totalBars) * bufferLength);
          const val = dataArray[index] || 15;
          const barHeight = Math.max(12, (val / 255) * (height * 0.85));
          const x = i * (barWidth + gap);
          const y = height - barHeight;

          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, '#00ffaa');
          gradient.addColorStop(0.5, '#06b6d4');
          gradient.addColorStop(1, '#8b5cf6');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      } else {
        // Subtle ambient wave
        for (let i = 0; i < totalBars; i++) {
          const h = Math.abs(Math.sin(i * 0.16 + Date.now() * 0.005) * 35 + Math.cos(i * 0.1) * 20 + 15);
          const x = i * (barWidth + gap);
          const y = height - h;

          ctx.fillStyle = '#00ffaa';
          ctx.fillRect(x, y, barWidth, h);
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <main className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
      {/* Left Column: Layer A & Layer B */}
      <div className="lg:col-span-3 flex flex-col gap-3">
        <div className="plugin-panel p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3 pb-1.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  audioEngine.layerAEnabled = !audioEngine.layerAEnabled;
                }}
                className="w-6 h-6 rounded bg-[#00ffaa] text-[#05070c] flex items-center justify-center font-bold text-xs led-glow cursor-pointer"
              >
                ✓
              </button>
              <span className="text-xs font-bold tracking-wide text-white">Layer A (Primary AI)</span>
            </div>
            <span className="text-[10px] text-[#00ffaa] font-mono">Gain: 0.0dB</span>
          </div>

          <div className="bg-[#05070c]/80 p-3 rounded-xl border border-slate-800/80 mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-cyan-400">⚡ AI Exciter Model</span>
              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40 font-mono truncate max-w-[130px]">
                #{modelA.id} {modelA.name}
              </span>
            </div>

            <div className="flex items-center justify-between mt-3 pt-1">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full knob-track flex items-center justify-center border border-slate-800 relative cursor-pointer">
                  <div className="w-1 h-3.5 bg-[#00ffaa] absolute top-1 origin-bottom transform rotate-45"></div>
                  <span className="text-[9px] font-bold text-white font-mono">{modelA.defaultPitch || 0}</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-1">Pitch</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full knob-track flex items-center justify-center border border-slate-800 relative cursor-pointer">
                  <div className="w-1 h-3.5 bg-[#06b6d4] absolute top-1 origin-bottom transform -rotate-12"></div>
                  <span className="text-[9px] font-bold text-white font-mono">{modelA.defaultColor || 82}</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-1">Color</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full knob-track flex items-center justify-center border border-slate-800 relative cursor-pointer">
                  <div className="w-1 h-3.5 bg-pink-500 absolute top-1 origin-bottom transform rotate-30"></div>
                  <span className="text-[9px] font-bold text-white font-mono">{modelA.defaultDrive || 90}</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-1">Drive</span>
              </div>
            </div>
          </div>

          <div className="bg-[#05070c]/80 p-3 rounded-xl border border-slate-800/80">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-bold text-pink-400">🌊 Crypt Vinyl Noise</span>
              <button
                onClick={() => {
                  audioEngine.toggleVinylNoise(!audioEngine.vinylNoiseEnabled);
                }}
                className="text-[9px] bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded border border-pink-500/40 font-mono cursor-pointer"
              >
                {audioEngine.vinylNoiseEnabled ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="text-[9px] text-slate-400 block mb-0.5 font-mono">Cutoff</label>
                <input
                  type="range"
                  min="500"
                  max="12000"
                  defaultValue="5500"
                  onChange={(e) => {
                    audioEngine.vinylNoiseCutoff = parseFloat(e.target.value);
                  }}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 block mb-0.5 font-mono">Crackles</label>
                <input type="range" min="0" max="100" defaultValue="40" className="w-full accent-pink-500 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        <div className="plugin-panel p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  audioEngine.layerBEnabled = !audioEngine.layerBEnabled;
                }}
                className="w-6 h-6 rounded bg-[#06b6d4] text-[#05070c] flex items-center justify-center font-bold text-xs led-cyan cursor-pointer"
              >
                ✓
              </button>
              <span className="text-xs font-bold tracking-wide text-white">Layer B (Neural Sub)</span>
            </div>
            <span className="text-[10px] text-[#06b6d4] font-mono">#{modelB.id} {modelB.name}</span>
          </div>
          <button
            onClick={onOpenAiBank}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-transform transform active:scale-95 cursor-pointer"
          >
            <span>🧬 Open 101 AI Neural Bank</span>
          </button>
        </div>
      </div>

      {/* Center Column: Dual Resonators & Canvas Visualizer */}
      <div className="lg:col-span-6 flex flex-col gap-3">
        <div className="plugin-panel p-3.5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00ffaa] inline-block led-glow"></span>
                Resonator: {activePreset.resonatorType}
              </span>
              <span className="text-[10px] bg-[#00ffaa]/10 text-[#00ffaa] px-2 py-0.5 rounded border border-[#00ffaa]/30 font-mono">128 Partials</span>
            </div>
            <select
              value={activePreset.resonatorType}
              onChange={(e) => setActivePreset(prev => ({ ...prev, resonatorType: e.target.value }))}
              className="bg-[#05070c] text-xs text-[#00ffaa] px-2.5 py-1 rounded-lg border border-slate-800 outline-none font-mono cursor-pointer"
            >
              <option value="AI Spectral String">AI Spectral String</option>
              <option value="Witch House Crypt Bell">Witch House Crypt Bell</option>
              <option value="Psytrance Acid Resonator">Psytrance Acid Resonator</option>
              <option value="Dark Futurist Plasma Tube">Dark Futurist Plasma Tube</option>
            </select>
          </div>

          <div className="w-full h-36 screen-display rounded-xl border border-slate-800 relative mb-3 overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full block"></canvas>
            <div className="absolute bottom-2.5 left-3 text-[10px] text-[#00ffaa] font-mono bg-[#05070c]/95 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-2 shadow">
              <span className="w-2 h-2 rounded-full bg-[#00ffaa] animate-ping"></span>
              <span>AI NEURAL FREQ SPECTRUM: 101 MODELS ACTIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center">
            <div className="bg-[#05070c]/70 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-xs font-bold text-white mb-1 font-mono">{activePreset.decay}s</div>
              <span className="text-[9px] text-slate-400">Decay</span>
            </div>
            <div className="bg-[#05070c]/70 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-xs font-bold text-white mb-1 font-mono">{Math.round(activePreset.sustain * 100)}%</div>
              <span className="text-[9px] text-slate-400">Sustain</span>
            </div>
            <div className="bg-[#05070c]/70 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-xs font-bold text-[#06b6d4] mb-1 font-mono">0.96</div>
              <span className="text-[9px] text-slate-400">AI Material</span>
            </div>
            <div className="bg-[#05070c]/70 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-xs font-bold text-white mb-1 font-mono">0.35</div>
              <span className="text-[9px] text-slate-400">Hit Force</span>
            </div>
            <div className="bg-[#05070c]/70 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-xs font-bold text-[#00ffaa] mb-1 font-mono">+4.2</div>
              <span className="text-[9px] text-slate-400">Inharm</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="plugin-panel p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Filter 1: Comb FF+ (Witch House)</span>
              <span className="text-[10px] text-[#00ffaa] font-mono">Active</span>
            </div>
            <div className="h-10 bg-[#05070c] rounded-xl border border-slate-800/60 mb-2 relative flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full text-[#00ffaa] opacity-85" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path d="M0 25 Q 25 25, 45 8 T 100 4" fill="none" stroke="currentColor" strokeWidth="2.5"/>
              </svg>
            </div>
            <div className="flex justify-between text-center text-[9px] text-slate-400 font-mono">
              <span>Drive: 3.2</span>
              <span>Freq: {activePreset.filter1Cutoff} Hz</span>
              <span>Q: 4.8</span>
            </div>
          </div>

          <div className="plugin-panel p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Filter 2: Acid LP 24dB</span>
              <span className="text-[10px] text-[#06b6d4] font-mono">Active</span>
            </div>
            <div className="h-10 bg-[#05070c] rounded-xl border border-slate-800/60 mb-2 relative flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full text-[#06b6d4] opacity-85" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path d="M0 5 Q 50 5, 85 26 T 100 28" fill="none" stroke="currentColor" strokeWidth="2.5"/>
              </svg>
            </div>
            <div className="flex justify-between text-center text-[9px] text-slate-400 font-mono">
              <span>Drive: 2.1</span>
              <span>Freq: {activePreset.filter2Cutoff} Hz</span>
              <span>Q: 7.2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: ADSR Envelope & LFO */}
      <div className="lg:col-span-3 flex flex-col gap-3">
        <div className="plugin-panel p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1">
              <button className="px-2.5 py-1 rounded-lg bg-[#00ffaa] text-[#05070c] text-[10px] font-bold">Env1</button>
              <button className="px-2.5 py-1 rounded-lg bg-[#101726] text-slate-400 text-[10px]">Env2</button>
            </div>
            <span className="text-[10px] text-[#00ffaa] font-mono">ADSR Curve</span>
          </div>

          <div className="h-24 screen-display rounded-xl border border-slate-800 mb-3 p-2 relative flex items-center justify-center overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
              <path
                d="M 0 75 L 25 8 L 85 28 L 140 28 L 200 75"
                fill="rgba(0,255,170,0.12)"
                stroke="#00ffaa"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <input
                type="range"
                min="0.001"
                max="1.0"
                step="0.01"
                value={activePreset.attack}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  audioEngine.attack = v;
                  setActivePreset(p => ({ ...p, attack: v }));
                }}
                className="w-full accent-[#00ffaa] mb-1 cursor-pointer"
              />
              <span className="text-[9px] text-slate-400 block font-mono">Att: {Math.round(activePreset.attack * 1000)}ms</span>
            </div>

            <div>
              <input
                type="range"
                min="0.05"
                max="2.0"
                step="0.05"
                value={activePreset.decay}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  audioEngine.decay = v;
                  setActivePreset(p => ({ ...p, decay: v }));
                }}
                className="w-full accent-[#00ffaa] mb-1 cursor-pointer"
              />
              <span className="text-[9px] text-slate-400 block font-mono">Dec: {Math.round(activePreset.decay * 1000)}ms</span>
            </div>

            <div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={activePreset.sustain}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  audioEngine.sustain = v;
                  setActivePreset(p => ({ ...p, sustain: v }));
                }}
                className="w-full accent-[#00ffaa] mb-1 cursor-pointer"
              />
              <span className="text-[9px] text-slate-400 block font-mono">Sus: {Math.round(activePreset.sustain * 100)}%</span>
            </div>

            <div>
              <input
                type="range"
                min="0.05"
                max="2.5"
                step="0.05"
                value={activePreset.release}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  audioEngine.release = v;
                  setActivePreset(p => ({ ...p, release: v }));
                }}
                className="w-full accent-[#00ffaa] mb-1 cursor-pointer"
              />
              <span className="text-[9px] text-slate-400 block font-mono">Rel: {Math.round(activePreset.release * 1000)}ms</span>
            </div>
          </div>
        </div>

        <div className="plugin-panel p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white">Psytrance LFO Mod</span>
            <span className="text-[10px] text-[#06b6d4] font-mono">Synced 1/16</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#05070c]/70 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-[9px] text-slate-400">Rate / Tempo</div>
              <div className="text-white font-bold text-xs mt-0.5 font-mono">{activePreset.lfoRate} BPM</div>
            </div>
            <div className="bg-[#05070c]/70 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-[9px] text-slate-400">Mod Shape</div>
              <div className="text-[#00ffaa] font-bold text-xs mt-0.5 font-mono">{activePreset.lfoShape}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
