import type { IAudioManager, AudioConfig, AudioMetrics, AudioMode, GeneratedPattern } from '../../types/audio';
import type { EventBus } from '../EventBus';
import type { AudioInitializedEvent, AudioErrorEvent, AudioVolumeEvent, AudioPitchEvent, AudioPatternEvent, AudioTempoEvent, AudioStartedEvent, AudioStoppedEvent } from '../../types/events';

export abstract class AudioBase implements IAudioManager {
    protected initialized: boolean = false;
    protected _isPlaying: boolean = false;
    protected volume: number = 0.5;
    protected _context: AudioContext | null = null;
    protected mode: AudioMode = 'basic';
    protected currentPattern: GeneratedPattern | undefined;
    protected _currentTempo: number = 120;
    protected amplitude: number = 1;
    protected frequency: number = 440;

    constructor(protected eventBus: EventBus) {}

    get isPlaying(): boolean {
        return this._isPlaying;
    }

    get context(): AudioContext | null {
        return this._context;
    }

    get currentTempo(): number {
        return this._currentTempo;
    }

    async initialize(config?: AudioConfig): Promise<void> {
        if (this.initialized) return;

        try {
            // Create audio context
            this._context = new AudioContext();
            
            // Apply configuration
            if (config) {
                if (config.mode) {
                    this.mode = config.mode;
                }
                if (config.initialVolume !== undefined) {
                    this.volume = config.initialVolume;
                    this.amplitude = config.initialVolume;
                }
                if (config.initialPattern) {
                    this.currentPattern = config.initialPattern;
                }
            }

            // Initialize audio nodes
            await this.setupAudioNodes();
            
            this.initialized = true;

            console.log('[AudioBase] Initialized with:', {
                mode: this.mode,
                volume: this.volume,
                amplitude: this.amplitude,
                frequency: this.frequency
            });

            // Emit initialized event
            const event: AudioInitializedEvent = { type: 'audio:initialized', success: true };
            this.eventBus.emit(event);
        } catch (error) {
            console.error('Error initializing audio:', error);
            const errorEvent: AudioErrorEvent = { type: 'audio:error', error: error instanceof Error ? error : new Error('Unknown error') };
            this.eventBus.emit(errorEvent);
            throw error;
        }
    }

    protected abstract setupAudioNodes(): Promise<void>;

    abstract start(): void;

    abstract stop(): void;

    async resume(): Promise<void> {
        if (this._context?.state === 'suspended') {
            try {
                await this._context.resume();
                console.log('[AudioBase] AudioContext resumed');
                if (this._isPlaying) {
                    const event: AudioStartedEvent = { type: 'audio:started' };
                    this.eventBus.emit(event);
                }
            } catch (error) {
                console.error('[AudioBase] Error resuming AudioContext:', error);
                const errorEvent: AudioErrorEvent = { type: 'audio:error', error: error instanceof Error ? error : new Error('Unknown error') };
                this.eventBus.emit(errorEvent);
                throw error;
            }
        }
    }

    async cleanup(closeContext: boolean = false): Promise<void> {
        if (!this.initialized) return;

        try {
            await this.stop();
            if (closeContext && this._context) {
                await this._context.close();
                this._context = null;
            }
            this.initialized = false;
        } catch (error) {
            console.error('Error cleaning up audio:', error);
            const errorEvent: AudioErrorEvent = { type: 'audio:error', error: error instanceof Error ? error : new Error('Unknown error') };
            this.eventBus.emit(errorEvent);
        }
    }

    isInitialized(): boolean {
        return this.initialized;
    }

    getVolume(): number {
        return this.volume;
    }

    getCurrentVolume(): number {
        return this.volume;
    }

    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
        this.updateVolume();
        const event: AudioVolumeEvent = { type: 'audio:volume', value: this.volume };
        this.eventBus.emit(event);
        console.log('[AudioBase] Volume set:', this.volume);
    }

    protected abstract updateVolume(): void;

    getAudioMetrics(): AudioMetrics {
        return {
            volume: this.amplitude,
            frequency: this.frequency,
            waveform: this.getWaveformData(),
            pattern: this.currentPattern
        };
    }

    protected getWaveformData(): Float32Array {
        if (!this._isPlaying) {
            // Return flat line when not playing
            const data = new Float32Array(128);
            data.fill(0);
            return data;
        }

        return this.getCurrentWaveform();
    }

    protected abstract getCurrentWaveform(): Float32Array;

    setPattern(pattern: GeneratedPattern): void {
        this.currentPattern = pattern;
        const event: AudioPatternEvent = { 
            type: 'audio:pattern', 
            pattern: pattern
        };
        this.eventBus.emit(event);
    }

    getWaveform(): Float32Array {
        return this.getWaveformData();
    }

    getCurrentPattern(): GeneratedPattern | null {
        return this.currentPattern || null;
    }

    setTempo(tempo: number): void {
        this._currentTempo = tempo;
        const event: AudioTempoEvent = { type: 'audio:tempo', tempo };
        this.eventBus.emit(event);
    }

    getTempo(): number {
        return this._currentTempo;
    }

    setFrequency(freq: number): void {
        this.frequency = freq;
        const event: AudioPitchEvent = { type: 'audio:pitch', pitch: freq / 440 };
        this.eventBus.emit(event);
        console.log('[AudioBase] Frequency set:', freq, 'pitch:', freq / 440);
    }

    getCurrentFrequency(): number {
        return this.frequency;
    }

    getFrequency(): number {
        return this.frequency;
    }

    setAmplitude(amp: number): void {
        this.amplitude = Math.max(0, Math.min(1, amp));
        this.setVolume(this.amplitude);
        console.log('[AudioBase] Amplitude set:', this.amplitude);
    }

    getAmplitude(): number {
        return this.amplitude;
    }

    mapMouseToAudio(mouseX: number, mouseY: number, width: number, height: number): void {
        // Map X position to frequency (pitch) using exponential mapping
        const minFreq = 220; // A3
        const maxFreq = 880; // A5
        const freqScale = Math.exp(Math.log(maxFreq / minFreq) * (mouseX / width));
        const newFreq = minFreq * freqScale;
        
        // Map Y position to amplitude (volume)
        // Invert Y axis so higher = louder
        const newAmp = 1 - (mouseY / height);

        console.log('[AudioBase] Mouse mapping:', {
            x: mouseX,
            y: mouseY,
            width,
            height,
            newFrequency: newFreq,
            newAmplitude: newAmp
        });

        this.setFrequency(newFreq);
        this.setAmplitude(newAmp);
    }

    protected setIsPlaying(value: boolean): void {
        if (this._isPlaying !== value) {
            this._isPlaying = value;
            if (value) {
                const event: AudioStartedEvent = { type: 'audio:started' };
                this.eventBus.emit(event);
                console.log('[AudioBase] Audio started');
            } else {
                const event: AudioStoppedEvent = { type: 'audio:stopped' };
                this.eventBus.emit(event);
                console.log('[AudioBase] Audio stopped');
            }
        }
    }
}
