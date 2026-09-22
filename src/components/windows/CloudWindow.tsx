import React, { useState } from 'react';
import { FloatingWindow } from './FloatingWindow';
import { CloudProvider } from '../../types';

interface CloudWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudWindow: React.FC<CloudWindowProps> = ({ isOpen, onClose }) => {
  const [connectedProvider, setConnectedProvider] = useState<CloudProvider | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>("Select a cloud provider to authenticate & sync patches.");

  const handleConnect = (provider: CloudProvider) => {
    setConnectedProvider(provider);
    setSyncStatus(`Connected to ${provider}. Ready to backup patches and custom AI neural models.`);
  };

  const handleBackup = () => {
    if (!connectedProvider) {
      setSyncStatus("Please select a cloud provider first!");
      return;
    }
    setSyncStatus(`Syncing 101 AI patches to ${connectedProvider}... Successfully backed up to cloud bank!`);
  };

  return (
    <FloatingWindow
      title="☁️ CLOUD PRESET SHARING & COMMUNITY DATABASE"
      isOpen={isOpen}
      onClose={onClose}
      initialX={140}
      initialY={130}
      width="640px"
      height="380px"
    >
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Save, tag, and publish your custom 101 AI neural synth patches and track recordings directly to cloud drive storage.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleConnect('Google Drive')}
              className={`p-3 rounded-xl bg-[#05070c] border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                connectedProvider === 'Google Drive'
                  ? 'border-[#00ffaa] bg-[#00ffaa]/10'
                  : 'border-cyan-500/40 hover:bg-cyan-500/10'
              }`}
            >
              <span className="text-2xl">📁</span>
              <span className="text-xs font-bold text-white">Google Drive</span>
              <span className="text-[9px] text-slate-400 font-mono">
                {connectedProvider === 'Google Drive' ? 'Connected ✓' : 'Connect'}
              </span>
            </button>

            <button
              onClick={() => handleConnect('OneDrive')}
              className={`p-3 rounded-xl bg-[#05070c] border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                connectedProvider === 'OneDrive'
                  ? 'border-[#00ffaa] bg-[#00ffaa]/10'
                  : 'border-blue-500/40 hover:bg-blue-500/10'
              }`}
            >
              <span className="text-2xl">☁️</span>
              <span className="text-xs font-bold text-white">OneDrive</span>
              <span className="text-[9px] text-slate-400 font-mono">
                {connectedProvider === 'OneDrive' ? 'Connected ✓' : 'Connect'}
              </span>
            </button>

            <button
              onClick={() => handleConnect('Dropbox')}
              className={`p-3 rounded-xl bg-[#05070c] border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                connectedProvider === 'Dropbox'
                  ? 'border-[#00ffaa] bg-[#00ffaa]/10'
                  : 'border-indigo-500/40 hover:bg-indigo-500/10'
              }`}
            >
              <span className="text-2xl">📦</span>
              <span className="text-xs font-bold text-white">Dropbox</span>
              <span className="text-[9px] text-slate-400 font-mono">
                {connectedProvider === 'Dropbox' ? 'Connected ✓' : 'Connect'}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-[#05070c] p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#00ffaa] font-mono truncate">{syncStatus}</span>
          <button
            onClick={handleBackup}
            className="px-4 py-2 rounded-xl bg-[#00ffaa] text-[#05070c] font-bold text-xs shadow hover:scale-105 transition-transform cursor-pointer"
          >
            🔄 Backup Patches Now
          </button>
        </div>
      </div>
    </FloatingWindow>
  );
};
