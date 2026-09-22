import React, { useState } from 'react';
import { FloatingWindow } from './FloatingWindow';
import { audioEngine } from '../../utils/audioEngine';

interface TrackComposerWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackComposerWindow: React.FC<TrackComposerWindowProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [genre, setGenre] = useState('witchhouse');
  const [duration, setDuration] = useState('180');
  const [userPrompt, setUserPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputLog, setOutputLog] = useState('Gemini AI Engine ready. Click Generate to compose extended track breakdown.');
  const [statusBadge, setStatusBadge] = useState('Ready');

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerateTrack = async () => {
    setIsGenerating(true);
    setStatusBadge('Connecting to Gemini 3.8 Flash...');
    setOutputLog('Analyzing 101 AI neural synth models and generating extended song arrangement breakdown...');

    try {
      const res = await fetch('/api/gemini/generate-track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          genre,
          duration,
          prompt: userPrompt,
          userApiKey: apiKey.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server request failed');
      }

      setOutputLog(data.text);
      setStatusBadge('Arrangement Ready');
    } catch (err: any) {
      setOutputLog(`API Error: ${err.message || 'Failed to communicate with Gemini AI API.'}`);
      setStatusBadge('Error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayTrack = () => {
    audioEngine.init();
    setIsPlaying(true);
    setStatusBadge('Playing Track...');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
          setStatusBadge('Playback Complete');
          return 100;
        }
        return prev + 1;
      });
    }, (parseInt(duration) * 10)); // simulated progress
  };

  const handleStopTrack = () => {
    setIsPlaying(false);
    setProgress(0);
    setStatusBadge('Stopped');
  };

  return (
    <FloatingWindow
      title="🤖 AI SONG & TRACK COMPOSER (GEMINI SDK)"
      isOpen={isOpen}
      onClose={onClose}
      initialX={100}
      initialY={80}
      width="820px"
      height="500px"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
        {/* Config Inputs */}
        <div className="lg:col-span-5 bg-[#05070c]/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3 overflow-y-auto">
          <div className="space-y-2.5">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono">
                API Key (Optional Client Override)
              </label>
              <input
                type="password"
                placeholder="AIzaSy... (Uses server key if empty)"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full bg-[#0a0e17] text-xs text-[#00ffaa] px-3 py-2 rounded-xl border border-slate-800 font-bold font-mono outline-none focus:border-[#00ffaa]"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono">Genre Style</label>
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="w-full bg-[#0a0e17] text-xs text-[#00ffaa] px-3 py-2 rounded-xl border border-slate-800 font-bold font-mono outline-none cursor-pointer"
              >
                <option value="witchhouse">Witch House (120 BPM)</option>
                <option value="psytrance">Progressive Psytrance (142 BPM)</option>
                <option value="darkfuturist">Dark Futurist (130 BPM)</option>
                <option value="industrialebm">Industrial EBM (128 BPM)</option>
                <option value="ambientdrone">Ambient Drone (60 BPM)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono">Duration</label>
              <select
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full bg-[#0a0e17] text-xs text-cyan-300 px-3 py-2 rounded-xl border border-slate-800 font-mono font-bold outline-none cursor-pointer"
              >
                <option value="120">2:00 Minutes</option>
                <option value="180">3:00 Minutes</option>
                <option value="240">4:00 Minutes</option>
                <option value="300">5:00+ Minutes</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-mono">Additional Prompt Details</label>
              <input
                type="text"
                placeholder="e.g. Heavy occult sub-bass drop at 1:15..."
                value={userPrompt}
                onChange={e => setUserPrompt(e.target.value)}
                className="w-full bg-[#0a0e17] text-xs text-white px-3 py-2 rounded-xl border border-slate-800 font-mono outline-none focus:border-[#00ffaa]"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleGenerateTrack}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-[#00ffaa] text-[#05070c] font-black text-xs shadow-xl flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              <span>{isGenerating ? '⏳ GENERATING ARRANGEMENT...' : '✨ GENERATE EXTENDED TRACK'}</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={handlePlayTrack}
                disabled={isPlaying}
                className="flex-1 py-1.5 rounded-lg bg-[#00ffaa] text-[#05070c] text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                ▶ Play Track
              </button>
              <button
                onClick={handleStopTrack}
                disabled={!isPlaying}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                ⏹ Stop
              </button>
            </div>
          </div>
        </div>

        {/* Timeline & Output */}
        <div className="lg:col-span-7 bg-[#05070c]/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Timeline Arrangement & Multi-Stem Mixer</span>
              <span className="text-[10px] text-[#00ffaa] font-mono bg-[#0a0e17] px-2.5 py-1 rounded-lg border border-slate-800">
                {statusBadge}
              </span>
            </div>

            <div className="bg-[#0a0e17] p-3 rounded-xl border border-slate-800 mb-3">
              <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-slate-400">
                <span>0:00</span>
                <span className="text-[#00ffaa] font-bold">SECTION: ARRANGEMENT TIMELINE</span>
                <span>{Math.floor(parseInt(duration) / 60)}:00</span>
              </div>
              <div className="w-full h-2 bg-[#05070c] rounded-full overflow-hidden border border-slate-800 relative">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-[#06b6d4] to-[#00ffaa] transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-[#0a0e17] p-3 rounded-lg border border-slate-800 text-[11px] text-cyan-300 font-mono h-[190px] overflow-y-auto whitespace-pre-wrap">
              {outputLog}
            </div>
          </div>
        </div>
      </div>
    </FloatingWindow>
  );
};
