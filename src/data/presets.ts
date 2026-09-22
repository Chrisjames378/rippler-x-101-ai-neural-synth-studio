import { Preset } from '../types';

export const FACTORY_PRESETS: Preset[] = [
  {
    id: "preset-1",
    name: "Witch House // 01. Necro Crypt Pluck",
    modelAId: 1,
    modelBId: 3,
    resonatorType: "AI Spectral String",
    filter1Cutoff: 4200,
    filter2Cutoff: 110,
    attack: 0.01,
    decay: 0.75,
    sustain: 0.7,
    release: 0.4,
    lfoRate: 142,
    lfoShape: "Saw Down"
  },
  {
    id: "preset-2",
    name: "Psytrance // 21. Rolling Acid Drive",
    modelAId: 21,
    modelBId: 22,
    resonatorType: "Psytrance Acid Resonator",
    filter1Cutoff: 6500,
    filter2Cutoff: 350,
    attack: 0.005,
    decay: 0.35,
    sustain: 0.4,
    release: 0.2,
    lfoRate: 142,
    lfoShape: "Square"
  },
  {
    id: "preset-3",
    name: "Dark Futurist // 41. Plasma Horizon",
    modelAId: 41,
    modelBId: 45,
    resonatorType: "Dark Futurist Plasma Tube",
    filter1Cutoff: 8000,
    filter2Cutoff: 200,
    attack: 0.05,
    decay: 1.2,
    sustain: 0.8,
    release: 0.8,
    lfoRate: 130,
    lfoShape: "Triangle"
  },
  {
    id: "preset-4",
    name: "Industrial // 71. Stahlwerk Pulse",
    modelAId: 71,
    modelBId: 75,
    resonatorType: "Dark Futurist Plasma Tube",
    filter1Cutoff: 5000,
    filter2Cutoff: 150,
    attack: 0.002,
    decay: 0.4,
    sustain: 0.5,
    release: 0.3,
    lfoRate: 128,
    lfoShape: "Square"
  },
  {
    id: "preset-5",
    name: "Ambient // 81. Void Granular Space",
    modelAId: 81,
    modelBId: 83,
    resonatorType: "AI Spectral String",
    filter1Cutoff: 3000,
    filter2Cutoff: 80,
    attack: 0.5,
    decay: 2.5,
    sustain: 0.9,
    release: 2.0,
    lfoRate: 60,
    lfoShape: "Sine"
  }
];
