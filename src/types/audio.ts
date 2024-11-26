// Audio Manager Interface
export interface IAudioManager {
    isPlaying: boolean;
    start(): void;
    stop(): void;
    setVolume(volume: number): void;
    getCurrentVolume(): number;
    getVolume(): number;
    setFrequency(frequency: number): void;
    getCurrentFrequency(): number;
    getFrequency(): number;
    cleanup(): void;
}

// Enhanced Audio Manager Interface
export interface IEnhancedAudioManager extends IAudioManager {
    setPattern(pattern: GeneratedPattern): void;
    getAudioMetrics(): AudioMetrics;
    initializeWithMode(mode?: AudioMode): Promise<boolean>;
}

// Audio Mode
export type AudioMode = 'basic' | 'tracker' | 'synth';

// Audio State
export interface AudioState {
    isPlaying: boolean;
    volume: number;
    frequency: number;
}

// Audio Metrics
export interface AudioMetrics {
    volume: number;
    frequency: number;
    waveform: Float32Array;
    pattern?: GeneratedPattern;
    currentPattern?: number;
    currentRow?: number;
    isPlaying?: boolean;
    bpm?: number;
    bassIntensity?: string;
    midIntensity?: string;
    highIntensity?: string;
    samples?: string[];
    rows?: number;
    channels?: number;
    sequence?: number[];
}

// Pattern Types
export type PatternType = 'drum' | 'melodic' | 'basic' | 'deephouse' | 'complex' | 'syncopated' | 'drums' | 'melody';

// Note Interface
export interface Note {
    pitch: number;
    startTime: number;
    endTime: number;
    velocity?: number;
    duration?: number;
    pos?: number;
}

// Pattern Base Interface
interface BasePattern {
    id: string;
    name: string;
    notes: Note[];
    data: number[];
    totalTime: number;
}

// Pattern Parts
export interface DrumPart {
    kick?: Note[];
    snare?: Note[];
    hihat?: Note[];
}

export interface MelodicPart {
    bass?: Note[];
    lead?: Note[];
}

// Pattern Interfaces
export interface DrumPattern extends BasePattern {
    type: 'drum';
    drums: DrumPart;
}

export interface MelodicPattern extends BasePattern {
    type: 'melodic';
    melodic: MelodicPart;
}

export type GeneratedPattern = DrumPattern | MelodicPattern;

// Audio Configuration
export interface AudioConfig {
    bpm?: number;
    baseFrequency?: number;
    volume?: number;
    waveform?: OscillatorType;
    initialVolume?: number;
    initialPattern?: GeneratedPattern;
    mode?: AudioMode;
    patterns?: {
        drums: DrumPattern[];
        melody: MelodicPattern[];
    };
}

// Audio Events
export interface AudioEvent {
    type: string;
    time: number;
    data: any;
}
