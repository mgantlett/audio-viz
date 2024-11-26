import type { IAudioManager, AudioMetrics, AudioConfig, GeneratedPattern } from '../../types/audio';
import type { EventBus } from '../EventBus';

export class AudioManager implements IAudioManager {
    private context: AudioContext;
    private oscillator: OscillatorNode | null = null;
    public masterGain: GainNode;
    public analyzer: AnalyserNode;
    private compressor: DynamicsCompressorNode;
    public waveformData: Float32Array;
    private currentVolume: number = 0.5;
    private currentFrequency: number = 440;
    private currentPattern: GeneratedPattern | undefined;
    public isPlaying: boolean = false;

    constructor(private eventBus: EventBus) {
        // Initialize audio context
        this.context = new window.AudioContext();
        console.log('[AudioManager] Audio context initialized');

        // Create master gain node
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = this.currentVolume;

        // Create analyzer node
        this.analyzer = this.context.createAnalyser();
        this.analyzer.fftSize = 2048;
        this.waveformData = new Float32Array(this.analyzer.frequencyBinCount);

        // Create compressor node
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.value = -50;
        this.compressor.knee.value = 40;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0;
        this.compressor.release.value = 0.25;

        // Connect nodes
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.analyzer);
        this.analyzer.connect(this.context.destination);
    }

    public configure(config: AudioConfig): void {
        if (config.initialVolume !== undefined) {
            this.setVolume(config.initialVolume);
            this.currentVolume = config.initialVolume;
        }

        if (config.initialPattern) {
            this.currentPattern = config.initialPattern;
        }
    }

    public start(): void {
        if (this.isPlaying) return;

        try {
            this.oscillator = this.context.createOscillator();
            this.oscillator.type = 'sine';
            this.oscillator.frequency.value = this.currentFrequency;
            this.oscillator.connect(this.masterGain);
            this.oscillator.start();
            this.isPlaying = true;

            // Resume audio context if suspended
            if (this.context.state === 'suspended') {
                this.context.resume();
            }

            // Emit audio state change
            this.emitAudioStateChange();
        } catch (error) {
            console.error('[AudioManager] Error starting audio:', error);
        }
    }

    public stop(): void {
        if (!this.isPlaying) return;

        try {
            if (this.oscillator) {
                this.oscillator.stop();
                this.oscillator.disconnect();
                this.oscillator = null;
            }
            this.isPlaying = false;

            // Emit audio state change
            this.emitAudioStateChange();
        } catch (error) {
            console.error('[AudioManager] Error stopping audio:', error);
        }
    }

    public setVolume(volume: number): void {
        this.currentVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.currentVolume;
        }
        // Emit audio state change
        this.emitAudioStateChange();
    }

    public getCurrentVolume(): number {
        return this.currentVolume;
    }

    public getVolume(): number {
        return this.currentVolume;
    }

    public setFrequency(frequency: number): void {
        this.currentFrequency = Math.max(20, Math.min(20000, frequency));
        if (this.oscillator) {
            this.oscillator.frequency.value = this.currentFrequency;
        }
        // Emit audio state change
        this.emitAudioStateChange();
    }

    public getCurrentFrequency(): number {
        return this.currentFrequency;
    }

    public getFrequency(): number {
        return this.currentFrequency;
    }

    public getWaveform(): Float32Array {
        this.analyzer.getFloatTimeDomainData(this.waveformData);
        return this.waveformData;
    }

    public getMetrics(): AudioMetrics {
        return {
            volume: this.currentVolume,
            frequency: this.currentFrequency,
            waveform: this.getWaveform(),
            pattern: this.currentPattern
        };
    }

    private emitAudioStateChange(): void {
        this.eventBus.emit({
            type: 'audio:state_changed',
            metrics: this.getMetrics(),
            isPlaying: this.isPlaying
        });
    }

    public cleanup(): void {
        this.stop();
        if (this.context.state !== 'closed') {
            this.context.close();
        }
    }
}

export const createAudioManager = (eventBus: EventBus): AudioManager => {
    return new AudioManager(eventBus);
};
