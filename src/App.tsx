import React, { useState } from 'react';
import { FloatingWindowState, Preset } from './types';
import { FACTORY_PRESETS } from './data/presets';
import { Header } from './components/Header';
import { MainWorkspace } from './components/MainWorkspace';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { AiBankWindow } from './components/windows/AiBankWindow';
import { StepSequencerWindow } from './components/windows/StepSequencerWindow';
import { MidiHudWindow } from './components/windows/MidiHudWindow';
import { AiStemsWindow } from './components/windows/AiStemsWindow';
import { CloudWindow } from './components/windows/CloudWindow';
import { TrackComposerWindow } from './components/windows/TrackComposerWindow';
import { AudacityWindow } from './components/windows/AudacityWindow';

export default function App() {
  const [activePreset, setActivePreset] = useState<Preset>(FACTORY_PRESETS[0]);
  const [masterVolume, setMasterVolume] = useState<number>(0.8);

  const [windowState, setWindowState] = useState<FloatingWindowState>({
    aiBank: false,
    stepSeq: false,
    midiHud: false,
    stems: false,
    cloud: false,
    composer: false,
    audacity: false
  });

  const closeWindow = (key: keyof FloatingWindowState) => {
    setWindowState(prev => ({ ...prev, [key]: false }));
  };

  return (
    <div className="bg-[#05070c] text-slate-100 min-h-screen flex flex-col justify-between p-2 md:p-4 select-none font-sans relative">
      {/* Header */}
      <Header
        windowState={windowState}
        setWindowState={setWindowState}
        activePreset={activePreset}
        setActivePreset={setActivePreset}
        masterVolume={masterVolume}
        setMasterVolume={setMasterVolume}
      />

      {/* Main Workspace */}
      <MainWorkspace
        activePreset={activePreset}
        setActivePreset={setActivePreset}
        onOpenAiBank={() => setWindowState(prev => ({ ...prev, aiBank: true }))}
      />

      {/* Floating Windows */}
      <AiBankWindow
        isOpen={windowState.aiBank}
        onClose={() => closeWindow('aiBank')}
        activePreset={activePreset}
        setActivePreset={setActivePreset}
      />

      <StepSequencerWindow
        isOpen={windowState.stepSeq}
        onClose={() => closeWindow('stepSeq')}
      />

      <MidiHudWindow
        isOpen={windowState.midiHud}
        onClose={() => closeWindow('midiHud')}
      />

      <AiStemsWindow
        isOpen={windowState.stems}
        onClose={() => closeWindow('stems')}
      />

      <CloudWindow
        isOpen={windowState.cloud}
        onClose={() => closeWindow('cloud')}
      />

      <TrackComposerWindow
        isOpen={windowState.composer}
        onClose={() => closeWindow('composer')}
      />

      <AudacityWindow
        isOpen={windowState.audacity}
        onClose={() => closeWindow('audacity')}
      />

      {/* Virtual Keyboard Footer */}
      <VirtualKeyboard />
    </div>
  );
}
