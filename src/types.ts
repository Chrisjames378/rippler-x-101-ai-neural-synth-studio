export type ModelCategory =
  | 'Witch House'
  | 'Psytrance'
  | 'Dark Futurist'
  | 'Industrial EBM'
  | 'Ambient Drone'
  | 'Witch House Lo-Fi';

export interface AiModel {
  id: number;
  name: string;
  category: ModelCategory;
  desc: string;
  defaultPitch?: number;
  defaultColor?: number;
  defaultDrive?: number;
}

export interface Preset {
  id: string;
  name: string;
  modelAId: number;
  modelBId: number;
  resonatorType: string;
  filter1Cutoff: number;
  filter2Cutoff: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  lfoRate: number;
  lfoShape: string;
}

export interface SeqTrack {
  id: string;
  name: string;
  steps: boolean[];
  note: number; // MIDI note
  color: string;
}

export interface MidiDevice {
  id: string;
  name: string;
  manufacturer?: string;
  state: string;
}

export interface MidiEventLog {
  id: string;
  time: string;
  type: 'NoteOn' | 'NoteOff' | 'CC' | 'PitchBend';
  note?: number;
  noteName?: string;
  velocity?: number;
  channel?: number;
}

export interface StemTrack {
  id: 'vocals' | 'drums' | 'bass' | 'synths';
  name: string;
  color: string;
  status: 'Ready' | 'Processing' | 'Completed';
  muted: boolean;
  volume: number;
  audioBlobUrl?: string;
}

export type CloudProvider = 'Google Drive' | 'OneDrive' | 'Dropbox';

export interface FloatingWindowState {
  aiBank: boolean;
  stepSeq: boolean;
  midiHud: boolean;
  stems: boolean;
  cloud: boolean;
  composer: boolean;
  audacity: boolean;
}

export interface WindowPosition {
  x: number;
  y: number;
}
