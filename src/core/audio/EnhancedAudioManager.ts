import { AudioBase } from './AudioBase';
import type { GeneratedPattern } from './MagentaPatternGenerator';
import type { AudioMetrics } from '../../types/audio';
import type { AudioMode } from '../../types/scene';

export class EnhancedAudioManager extends AudioBase {
    private currentPattern: GeneratedPattern | null;
    private analyser: AnalyserNode | null;
    private compressor: DynamicsCompressorNode | null;
    private dataArray: Uint8Array | null;
    private waveformArray: Uint8Array | null;

    constructor() {
        super();
        this.currentPattern = null;
        this.analyser = null;
        this.compressor = null;
        this.dataArray = null;
        this.waveformArray = null;
        this.setTempo(124); // Set initial tempo for Afro house
    }

    override async initializeWithMode(mode: AudioMode = 'tracker'): Promise<boolean> {
        try {
            if (mode !== 'tracker') {
                throw new Error('EnhancedAudioManager only supports tracker mode');
            }

            this.mode = mode;
            console.log(`Initializing audio in ${mode} mode`);
            
            // Initialize audio context first
            const success = await this.setupAudioContext();
            if (!success) {
                console.log('Waiting for user interaction to initialize audio context');
                return true; // Return true to allow UI to show initialize button
            }

            if (!this.context || this.context.state !== 'running') {
                console.log('Audio context not ready');
                return true; // Return true to allow UI to show initialize button
            }

            // Setup analyzer and compressor
            console.log('Setting up audio nodes...');
            this.analyser = this.context.createAnalyser();
            this.compressor = this.context.createDynamicsCompressor();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.85;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.waveformArray = new Uint8Array(this.analyser.frequencyBinCount);

            // Setup audio chain
            console.log('Setting up audio chain...');
            if (this.masterGain && this.compressor && this.analyser) {
                this.masterGain.connect(this.analyser);
                this.analyser.connect(this.compressor);
                this.compressor.connect(this.context.destination);
            }

            this.isStarted = true;
            console.log('Tracker mode initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing tracker mode:', error);
            await this.cleanup();
            return false;
        }
    }

    override async start(): Promise<void> {
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
                await this.context.resume();
            }

            console.log('Starting audio playback...');
            this.isPlaying = true;
        } catch (error) {
            console.error('Error starting audio playback:', error);
            this.isPlaying = false;
            throw error;
        }
    }

    override async stop(): Promise<void> {
        if (!this.isInitialized()) {
            throw new Error('Audio manager not initialized');
        }

        if (!this.isPlaying) {
            console.log('Audio already stopped');
            return;
        }

        try {
            console.log('Stopping audio playback...');
            this.isPlaying = false;
        } catch (error) {
            console.error('Error stopping audio playback:', error);
            throw error;
        }
    }

    getAudioMetrics(): AudioMetrics {
        try {
            const data = this.getSpectralData();
            
            // Calculate frequency band intensities
            const bassIntensity = data.slice(0, 10).reduce((a, b) => a + b, 0) / 2550;
            const midIntensity = data.slice(10, 100).reduce((a, b) => a + b, 0) / 22950;
            const highIntensity = data.slice(100, 200).reduce((a, b) => a + b, 0) / 25500;

            return {
                pattern: this.currentPattern || null,
                currentPattern: 0,
                currentRow: 0,
                isPlaying: this.isPlaying,
                bpm: this.currentTempo,
                bassIntensity: bassIntensity.toFixed(3),
                midIntensity: midIntensity.toFixed(3),
                highIntensity: highIntensity.toFixed(3),
                waveform: this.getWaveform(),
                samples: [],
                rows: 64,
                channels: 8,
                sequence: [0]
            };
        } catch (error) {
            console.warn('Error getting audio metrics:', error);
            return {
                pattern: null,
                currentPattern: 0,
                currentRow: 0,
                isPlaying: false,
                bpm: this.currentTempo,
                bassIntensity: '0.000',
                midIntensity: '0.000',
                highIntensity: '0.000',
                waveform: new Float32Array(1024),
                samples: [],
                rows: 64,
                channels: 8,
                sequence: [0]
            };
        }
    }

    getSpectralData(): Uint8Array {
        try {
            if (!this.analyser || !this.dataArray) return new Uint8Array(1024);
            this.analyser.getByteFrequencyData(this.dataArray);
            return this.dataArray;
        } catch (error) {
            console.error('Error getting spectral data:', error);
            return new Uint8Array(1024);
        }
    }

    getWaveform(): Float32Array {
        try {
            if (!this.analyser || !this.waveformArray) return new Float32Array(1024);
            this.analyser.getByteTimeDomainData(this.waveformArray);
            return new Float32Array(Array.from(this.waveformArray).map(v => (v - 128) / 128));
        } catch (error) {
            console.error('Error getting waveform:', error);
            return new Float32Array(1024);
        }
    }

    getCurrentPattern(): GeneratedPattern | null {
        return this.currentPattern;
    }

    override async cleanup(closeContext: boolean = true): Promise<void> {
        try {
            await this.stop();
            
            if (this.analyser) {
                this.analyser.disconnect();
                this.analyser = null;
            }
            if (this.compressor) {
                this.compressor.disconnect();
                this.compressor = null;
            }
            this.dataArray = null;
            this.waveformArray = null;
            this.currentPattern = null;

            await super.cleanup(closeContext);
        } catch (error) {
            console.warn('Error during audio cleanup:', error);
        }
    }

    setPattern(pattern: GeneratedPattern | string): void {
        if (typeof pattern === 'string') {
            try {
                // Try to parse string as JSON if it's a stringified GeneratedPattern
                const parsedPattern = JSON.parse(pattern) as GeneratedPattern;
                this.currentPattern = parsedPattern;
            } catch (error) {
                console.error('Error parsing pattern string:', error);
                // Keep current pattern if parsing fails
            }
        } else {
            this.currentPattern = pattern;
        }
    }
}
