import { AI_MODELS } from '../data/aiModels';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private recordDest: MediaStreamAudioDestinationNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;

  // Synthesis Parameters
  public pitchBend: number = 0; // semitones
  public modWheel: number = 0; // 0 to 1
  public vinylNoiseEnabled: boolean = true;
  public vinylNoiseCutoff: number = 5500;

  // Layer settings
  public layerAEnabled: boolean = true;
  public layerAModelId: number = 1;
  public layerAGainVal: number = 0.8;

  public layerBEnabled: boolean = true;
  public layerBModelId: number = 42;
  public layerBGainVal: number = 0.5;

  // ADSR
  public attack: number = 0.01;
  public decay: number = 0.75;
  public sustain: number = 0.7;
  public release: number = 0.4;

  public init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;

      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 128;

      this.masterGain.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);

      this.recordDest = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.recordDest);

      this.setupVinylNoise();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  public getRecordStream(): MediaStream | null {
    return this.recordDest ? this.recordDest.stream : null;
  }

  public setMasterVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }

  private setupVinylNoise() {
    if (!this.ctx || !this.masterGain) return;

    // Create 5 seconds of pink/vinyl crackle noise buffer
    const bufferSize = this.ctx.sampleRate * 5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Filter towards pink noise + occasional crackle pops
      lastOut = (lastOut * 0.95) + (white * 0.05);
      const crackle = Math.random() > 0.998 ? (Math.random() * 0.4 - 0.2) : 0;
      data[i] = (lastOut * 0.03) + crackle;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = this.vinylNoiseCutoff;

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = this.vinylNoiseEnabled ? 0.03 : 0;

    this.noiseNode.connect(noiseFilter);
    noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);

    this.noiseNode.start();
  }

  public toggleVinylNoise(enabled: boolean) {
    this.vinylNoiseEnabled = enabled;
    if (this.noiseGain && this.ctx) {
      this.noiseGain.gain.setValueAtTime(enabled ? 0.03 : 0, this.ctx.currentTime);
    }
  }

  public triggerNote(baseFreq: number, modelAOverride?: number): { stop: () => void } {
    this.init();
    if (!this.ctx || !this.masterGain) return { stop: () => {} };

    const now = this.ctx.currentTime;
    const freq = baseFreq * Math.pow(2, this.pitchBend / 12);

    const modelAId = modelAOverride || this.layerAModelId;
    const modelA = AI_MODELS.find(m => m.id === modelAId) || AI_MODELS[0];
    const modelB = AI_MODELS.find(m => m.id === this.layerBModelId) || AI_MODELS[41];

    const noteGainNode = this.ctx.createGain();
    noteGainNode.gain.setValueAtTime(0, now);
    noteGainNode.gain.linearRampToValueAtTime(0.4, now + Math.max(0.005, this.attack));
    noteGainNode.gain.exponentialRampToValueAtTime(
      Math.max(0.001, 0.4 * this.sustain),
      now + Math.max(0.005, this.attack + this.decay)
    );

    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(
      modelA.category === 'Psytrance' ? 5000 + (this.modWheel * 3000) : 3200 + (this.modWheel * 2000),
      now
    );
    filter1.Q.value = 4.5 + (this.modWheel * 6);

    // Layer A Oscillators
    if (this.layerAEnabled) {
      const oscA1 = this.ctx.createOscillator();
      const oscA2 = this.ctx.createOscillator();

      oscA1.type = modelA.category === 'Witch House' ? 'triangle' : modelA.category === 'Psytrance' ? 'sawtooth' : 'square';
      oscA2.type = 'sawtooth';

      oscA1.frequency.setValueAtTime(freq, now);
      oscA2.frequency.setValueAtTime(freq * 1.006, now);

      const layerAGain = this.ctx.createGain();
      layerAGain.gain.value = this.layerAGainVal;

      oscA1.connect(layerAGain);
      oscA2.connect(layerAGain);
      layerAGain.connect(filter1);

      oscA1.start(now);
      oscA2.start(now);
    }

    // Layer B Oscillators (Sub / Harmonic)
    if (this.layerBEnabled) {
      const oscB = this.ctx.createOscillator();
      oscB.type = 'sine';
      oscB.frequency.setValueAtTime(freq * 0.5, now); // 1 Octave Down Sub

      const layerBGain = this.ctx.createGain();
      layerBGain.gain.value = this.layerBGainVal;

      oscB.connect(layerBGain);
      layerBGain.connect(filter1);

      oscB.start(now);
    }

    filter1.connect(noteGainNode);
    noteGainNode.connect(this.masterGain);

    let isStopped = false;
    const stopNote = () => {
      if (isStopped || !this.ctx) return;
      isStopped = true;
      const releaseTime = this.ctx.currentTime;
      noteGainNode.gain.cancelScheduledValues(releaseTime);
      noteGainNode.gain.setValueAtTime(noteGainNode.gain.value, releaseTime);
      noteGainNode.gain.exponentialRampToValueAtTime(0.0001, releaseTime + Math.max(0.05, this.release));
    };

    // Auto release after 3 seconds max if held
    setTimeout(stopNote, 3000);

    return { stop: stopNote };
  }
}

export const audioEngine = new AudioEngine();
