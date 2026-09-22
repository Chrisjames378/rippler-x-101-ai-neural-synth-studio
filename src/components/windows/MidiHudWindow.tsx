import React, { useEffect, useState } from 'react';
import { FloatingWindow } from './FloatingWindow';
import { MidiDevice, MidiEventLog } from '../../types';
import { audioEngine } from '../../utils/audioEngine';

interface MidiHudWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MidiHudWindow: React.FC<MidiHudWindowProps> = ({ isOpen, onClose }) => {
  const [devices, setDevices] = useState<MidiDevice[]>([]);
  const [logs, setLogs] = useState<MidiEventLog[]>([]);

  useEffect(() => {
    if ((navigator as any).requestMIDIAccess) {
      (navigator as any).requestMIDIAccess().then((midiAccess: any) => {
        const devList: MidiDevice[] = [];
        const inputs = midiAccess.inputs.values();

        for (const input of inputs) {
          devList.push({
            id: input.id,
            name: input.name || 'USB MIDI Keyboard',
            manufacturer: input.manufacturer || 'Generic',
            state: input.state
          });

          input.onmidimessage = (message: any) => {
            const [command, note, velocity] = message.data;
            if (command === 144 && velocity > 0) {
              const freq = 440 * Math.pow(2, (note - 69) / 12);
              audioEngine.triggerNote(freq);

              const newLog: MidiEventLog = {
                id: Math.random().toString(36).substr(2, 9),
                time: new Date().toLocaleTimeString(),
                type: 'NoteOn',
                note,
                velocity
              };
              setLogs(prev => [newLog, ...prev.slice(0, 15)]);
            }
          };
        }

        setDevices(devList);
      }).catch(() => {
        console.log('WebMIDI access unavailable or rejected.');
      });
    }
  }, []);

  return (
    <FloatingWindow
      title="🎚️ REAL-TIME MIDI HARDWARE & WEBMIDI HUD"
      isOpen={isOpen}
      onClose={onClose}
      initialX={110}
      initialY={110}
      width="680px"
      height="420px"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        <div className="bg-[#05070c]/80 p-4 rounded-xl border border-slate-800 flex flex-col">
          <h3 className="text-xs font-bold text-[#00ffaa] mb-2 font-mono flex items-center justify-between">
            <span>CONNECTED MIDI DEVICES</span>
            <span className="text-[10px] text-slate-400 font-normal">{devices.length} Found</span>
          </h3>

          <div className="space-y-2 text-xs text-slate-300 font-mono bg-[#0a0e17] p-3 rounded-lg border border-slate-800 flex-1 overflow-y-auto">
            {devices.length > 0 ? (
              devices.map(dev => (
                <div key={dev.id} className="p-2 bg-[#101726] rounded border border-slate-800">
                  <div className="font-bold text-white">{dev.name}</div>
                  <div className="text-[10px] text-slate-400">
                    Manufacturer: {dev.manufacturer} | Status: <span className="text-[#00ffaa]">{dev.state}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-[11px] p-2 text-center">
                Plug in any USB or Bluetooth MIDI controller keyboard. Live note events will play through the 101 AI synth models automatically.
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#05070c]/80 p-4 rounded-xl border border-slate-800 flex flex-col">
          <h3 className="text-xs font-bold text-[#06b6d4] mb-2 font-mono">LIVE VELOCITY & CC EVENT LOG</h3>

          <div className="space-y-1.5 text-[11px] text-cyan-300 font-mono bg-[#0a0e17] p-3 rounded-lg border border-slate-800 flex-1 overflow-y-auto">
            {logs.length > 0 ? (
              logs.map(log => (
                <div key={log.id} className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-500 text-[9px]">{log.time}</span>
                  <span className="font-bold text-white">{log.type}</span>
                  <span>Note: {log.note}</span>
                  <span className="text-[#00ffaa]">Vel: {log.velocity}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-[11px] text-center pt-8">
                Waiting for MIDI note messages or virtual keyboard keypresses...
              </div>
            )}
          </div>
        </div>
      </div>
    </FloatingWindow>
  );
};
