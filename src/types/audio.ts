import type { AudioMode } from './scene';

export interface AudioMetrics {
    pattern: any | null;
    currentPattern: number;
    currentRow: number;
    isPlaying: boolean;
    bpm: number;
    bassIntensity: string;
    midIntensity: string;
    highIntensity: string;
    waveform: Float32Array;
    samples: string[];
    rows: number;
    channels: number;
    sequence: number[];
}

export interface Sample {
    name: string;
    url: string;
    baseNote: string;
}

export interface SampleManager {
    loadSample(name: string, url: string, options?: any): Promise<boolean>;
    listSamples(): Sample[];
}

export interface TrackerState {
    currentPattern: number;
    currentRow: number;
    bpm: number;
    sequence: number[];
}

export interface TrackerSequencer {
    start(): void;
    stop(): void;
    setBPM(bpm: number): boolean;
    setAudioDestination(destination: AudioNode): boolean;
    getCurrentState(): TrackerState;
    patterns: Map<number, any>;
    addPattern(index: number, pattern: any): boolean;
    setSequence(sequence: number[]): boolean;
    cleanup(): void;
}

export interface ImportedModules {
    SampleManager: any;
    TrackerPattern: any;
    TrackerSequencer: any;
}

export interface IAudioManager {
    context: AudioContext | null;
    isPlaying: boolean;
    isInitialized(): boolean;
    initialize(): Promise<void>;
    initializeWithMode(mode: AudioMode): Promise<boolean>;
    start(): void;
    stop(): void;
    cleanup(closeContext?: boolean): Promise<void>;
    setVolume(value: number): void;
    getVolume(): number;
    setTempo(tempo: number): void;
    setPattern(pattern: string): void;
    getAudioMetrics(): AudioMetrics | null;
    getWaveform(): Float32Array;
    getCurrentPattern(): any | null;
    setFrequency(freq: number): void;
    setAmplitude(amp: number): void;
    getAmplitude(): number;
    getFrequency(): number;
    mapMouseToAudio(mouseX: number, mouseY: number, width: number, height: number): void;
}
