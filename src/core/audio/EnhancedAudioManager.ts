import { AudioBase } from './AudioBase';
import { SampleManager } from './SampleManager';
import { PatternSequencer } from './PatternSequencer';
import { AudioAnalyzer } from './AudioAnalyzer';
import type { GeneratedPattern, AudioMetrics } from '../../types/audio';
import type { EventBus } from '../EventBus';

export class EnhancedAudioManager extends AudioBase {
    private sampleManager: SampleManager | null = null;
    private patternSequencer: PatternSequencer | null = null;
    private audioAnalyzer: AudioAnalyzer | null = null;
    private masterGain: GainNode | null = null;
    private compressor: DynamicsCompressorNode | null = null;
    private initializationPromise: Promise<boolean> | null = null;

    constructor(eventBus: EventBus) {
        super(eventBus);
        this.setTempo(124); // Set initial tempo for Afro house
    }

    async initializeWithMode(): Promise<boolean> {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = (async () => {
            try {
                await this.initialize();
                return true;
            } catch (error) {
                console.error('Error initializing enhanced audio:', error);
                return false;
            } finally {
                this.initializationPromise = null;
            }
        })();

        return this.initializationPromise;
    }

    protected async setupAudioNodes(): Promise<void> {
        if (!this.context) throw new Error('Audio context not initialized');

        // Create master gain node
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = this.volume * this.getAmplitude();

        // Create compressor node
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.value = -50;
        this.compressor.knee.value = 40;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0;
        this.compressor.release.value = 0.25;

        // Create analyzer
        this.audioAnalyzer = new AudioAnalyzer(this.context, this.eventBus);

        // Set up audio chain
        this.masterGain.connect(this.compressor);
        this.audioAnalyzer.connectInput(this.compressor);
        this.audioAnalyzer.connectOutput(this.context.destination);

        // Create sample manager
        this.sampleManager = new SampleManager(this.context, this.masterGain, this.eventBus);
        await this.sampleManager.loadSamples();

        // Create pattern sequencer
        this.patternSequencer = new PatternSequencer(
            this.context,
            this.sampleManager,
            this.eventBus,
            this.amplitude
        );
    }

    protected updateVolume(): void {
        if (!this.context || this.context.state !== 'running') return;

        const currentTime = this.context.currentTime;

        // Update master gain
        if (this.masterGain) {
            this.masterGain.gain.cancelScheduledValues(currentTime);
            this.masterGain.gain.setValueAtTime(this.amplitude, currentTime);
        }

        // Update sample volumes
        if (this.sampleManager) {
            this.sampleManager.updateVolume(this.volume, this.amplitude);
        }
    }

    protected getCurrentWaveform(): Float32Array {
        if (!this.audioAnalyzer) {
            return new Float32Array(1024).fill(0);
        }
        return this.audioAnalyzer.getWaveform();
    }

    async start(): Promise<void> {
        if (!this.isInitialized()) {
            throw new Error('Audio manager not initialized');
        }

        if (this.isPlaying) {
            console.log('Audio already playing');
            return;
        }

        try {
            // Ensure audio context is running
            if (this.context?.state === 'suspended') {
                console.log('Resuming audio context...');
                await this.context.resume();
                // Wait a bit for the context to fully resume
                await new Promise(resolve => setTimeout(resolve, 100));
                if (this.context.state as AudioContextState !== 'running') {
                    throw new Error('Failed to resume audio context');
                }
            }

            // Start pattern playback
            if (this.patternSequencer) {
                this.patternSequencer.start();
            }

            this.setIsPlaying(true);
        } catch (error) {
            console.error('Error starting audio playback:', error);
            throw error;
        }
    }

    async stop(): Promise<void> {
        if (!this.isInitialized()) {
            throw new Error('Audio manager not initialized');
        }

        if (!this.isPlaying) {
            console.log('Audio already stopped');
            return;
        }

        try {
            // Stop pattern playback
            if (this.patternSequencer) {
                this.patternSequencer.stop();
            }

            // Ramp down volume
            if (this.masterGain && this.context) {
                const currentTime = this.context.currentTime;
                this.masterGain.gain.linearRampToValueAtTime(0, currentTime + 0.1);
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            this.setIsPlaying(false);
        } catch (error) {
            console.error('Error stopping audio playback:', error);
            throw error;
        }
    }

    override setPattern(pattern: GeneratedPattern): void {
        super.setPattern(pattern);
        if (this.patternSequencer) {
            this.patternSequencer.setPattern(pattern);
        }
    }

    override setTempo(tempo: number): void {
        super.setTempo(tempo);
        if (this.patternSequencer) {
            this.patternSequencer.setTempo(tempo);
        }
    }

    override getAudioMetrics(): AudioMetrics {
        const metrics = this.audioAnalyzer?.getAudioMetrics() || {
            bassIntensity: '0.000',
            midIntensity: '0.000',
            highIntensity: '0.000'
        };

        return {
            volume: this.amplitude,
            frequency: this.frequency,
            waveform: this.getWaveform(),
            pattern: this.currentPattern,
            currentPattern: 0,
            currentRow: this.patternSequencer?.getCurrentStep() ?? 0,
            isPlaying: this.isPlaying,
            bpm: this.currentTempo,
            ...metrics,
            samples: this.sampleManager?.getSampleNames() || [],
            rows: 64,
            channels: 8,
            sequence: [0]
        };
    }

    override async cleanup(closeContext: boolean = true): Promise<void> {
        try {
            await this.stop();
            
            this.sampleManager?.cleanup();
            this.patternSequencer?.cleanup();
            this.audioAnalyzer?.cleanup();

            if (this.compressor) {
                this.compressor.disconnect();
                this.compressor = null;
            }

            if (this.masterGain) {
                this.masterGain.disconnect();
                this.masterGain = null;
            }

            this.sampleManager = null;
            this.patternSequencer = null;
            this.audioAnalyzer = null;

            await super.cleanup(closeContext);
        } catch (error) {
            console.warn('Error during audio cleanup:', error);
        }
    }
}
