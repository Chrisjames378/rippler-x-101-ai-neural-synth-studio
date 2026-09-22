import React, { useState } from 'react';
import { FloatingWindow } from './FloatingWindow';
import { AI_MODELS } from '../../data/aiModels';
import { Preset } from '../../types';
import { audioEngine } from '../../utils/audioEngine';

interface AiBankWindowProps {
  isOpen: boolean;
  onClose: () => void;
  activePreset: Preset;
  setActivePreset: React.Dispatch<React.SetStateAction<Preset>>;
}

export const AiBankWindow: React.FC<AiBankWindowProps> = ({
  isOpen,
  onClose,
  activePreset,
  setActivePreset
}) => {
  const [search, setSearch] = useState('');
  const [targetLayer, setTargetLayer] = useState<'A' | 'B'>('A');

  const filteredModels = AI_MODELS.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase()) ||
    m.desc.toLowerCase().includes(search.toLowerCase())
  );

  const activeModelId = targetLayer === 'A' ? activePreset.modelAId : activePreset.modelBId;

  const handleSelectModel = (modelId: number, freq: number = 220) => {
    if (targetLayer === 'A') {
      audioEngine.layerAModelId = modelId;
      setActivePreset(prev => ({ ...prev, modelAId: modelId }));
    } else {
      audioEngine.layerBModelId = modelId;
      setActivePreset(prev => ({ ...prev, modelBId: modelId }));
    }
    // Audition sound note
    audioEngine.triggerNote(freq, modelId);
  };

  return (
    <FloatingWindow
      title="🧬 101 AI NEURAL SYNTHESIZER MODELS BANK DRAWER"
      isOpen={isOpen}
      onClose={onClose}
      initialX={50}
      initialY={70}
      width="820px"
      height="520px"
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Assign Target:</span>
          <button
            onClick={() => setTargetLayer('A')}
            className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
              targetLayer === 'A'
                ? 'bg-[#00ffaa] text-[#05070c] led-glow'
                : 'bg-[#101726] text-slate-400 border border-slate-800'
            }`}
          >
            Layer A (Primary)
          </button>
          <button
            onClick={() => setTargetLayer('B')}
            className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
              targetLayer === 'B'
                ? 'bg-[#06b6d4] text-[#05070c] led-cyan'
                : 'bg-[#101726] text-slate-400 border border-slate-800'
            }`}
          >
            Layer B (Sub)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search 101 models..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#05070c] text-xs px-3 py-1.5 rounded-xl border border-slate-800 text-white outline-none w-52 font-mono focus:border-[#00ffaa]"
          />
          <span className="text-xs bg-[#00ffaa]/20 text-[#00ffaa] px-2.5 py-1 rounded-full border border-[#00ffaa]/40 font-mono">
            {filteredModels.length} Models
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 overflow-y-auto flex-1 pr-1">
        {filteredModels.map((model) => {
          const isActive = model.id === activeModelId;
          return (
            <div
              key={model.id}
              onClick={() => handleSelectModel(model.id)}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-[#00ffaa]/15 border-[#00ffaa] shadow-lg scale-[1.02]'
                  : 'bg-[#05070c]/80 border-slate-800 hover:border-[#06b6d4]/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono text-cyan-400 font-bold">#{model.id}</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono truncate max-w-[80px]">
                    {model.category}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white mb-0.5 truncate">{model.name}</h3>
                <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight">{model.desc}</p>
              </div>

              <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-800/60">
                <span className={`text-[9px] font-mono ${isActive ? 'text-[#00ffaa] font-bold' : 'text-slate-500'}`}>
                  {isActive ? '● ACTIVE' : 'Click to Load'}
                </span>
                <span className="text-[9px] text-slate-400 hover:text-white font-mono">▶ Audition</span>
              </div>
            </div>
          );
        })}
      </div>
    </FloatingWindow>
  );
};
