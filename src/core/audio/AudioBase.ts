import type { IAudioManager, AudioMetrics } from '../../types/audio';
import type { AudioMode } from '../../types/scene';

declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext;
    }
}

export class AudioBase implements IAudioManager {
    protected _context: AudioContext | null;
    protected masterGain: GainNode | null;
    protected compressor: DynamicsCompressorNode | null;
    protected limiter: DynamicsCompressorNode | null;
    protected _currentTempo: number;
    public isStarted: boolean;
    public isPlaying: boolean;
    protected readonly fadeOutDuration: number;
    private _initialized: boolean;
    private _hasUserInteraction: boolean;
    protected _mode: AudioMode;

    constructor() {
        this._context = null;
        this.masterGain = null;
        this.compressor = null;
        this.limiter = null;
        this._currentTempo = 120;
        this.isStarted = false;
        this.isPlaying = false;
        this.fadeOutDuration = 0.1;
        this._initialized = false;
        this._hasUserInteraction = false;
        this._mode = 'oscillator';
        
        // Add user interaction listener to document instead of window
        document.addEventListener('click', async () => {
            this._hasUserInteraction = true;
            if (this._context?.state === 'suspended') {
                try {
                    await this._context.resume();
                    console.log('AudioContext resumed after user interaction');
                    // Try to initialize again after successful resume
                    if (!this._initialized) {
                        await this.setupAudioContext();
                    }
                } catch (error) {
                    console.error('Error resuming audio context:', error);
                }
            }
        }, { once: true });
    }

    get context(): AudioContext | null {
        return this._context;
    }

    get currentTempo(): number {
        return this._currentTempo;
    }

    get currentPattern(): string {
        return '';
    }

    get frequency(): number {
        return 440;
    }

    protected get mode(): AudioMode {
        return this._mode;
    }

    protected set mode(value: AudioMode) {
        this._mode = value;
    }

    async setupAudioContext(): Promise<boolean> {
        try {
            console.log('Setting up AudioContext...');
            
            // Create audio context if it doesn't exist
            if (!this._context) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) {
                    throw new Error('Web Audio API not supported');
                }
                this._context = new AudioContext();
                console.log('New AudioContext created, state:', this._context.state);
            }

            // Try to resume the context if suspended
            if (this._context.state === 'suspended') {
                if (this._hasUserInteraction) {
                    try {
                        await this._context.resume();
                        console.log('AudioContext resumed, new state:', this._context.state);
                    } catch (resumeError) {
                        console.warn('Could not resume AudioContext:', resumeError);
                        return false;
                    }
                } else {
                    console.log('Waiting for user interaction to resume AudioContext');
                    return false;
                }
            }

            // Setup audio chain if not already set up
            if (!this.masterGain || !this.compressor || !this.limiter) {
                const success = await this.setupMasterChain();
                if (!success) {
                    throw new Error('Failed to setup master audio chain');
                }
            }

            // Only mark as initialized if context is running and chain is setup
            this._initialized = this._context.state === 'running' && 
                              this.masterGain !== null && 
                              this.compressor !== null && 
                              this.limiter !== null;

            console.log('Audio initialization complete, initialized:', this._initialized);
            return this._initialized;
        } catch (error) {
            console.error('Error in setupAudioContext:', error);
            this._initialized = false;
            return false;
        }
    }

    async setupMasterChain(): Promise<boolean> {
        try {
            if (!this._context) {
                throw new Error('Audio context not initialized');
            }

            // Create master gain node with lower initial volume
            this.masterGain = this._context.createGain();
            this.masterGain.gain.value = 0.4; // Reduced from 0.7

            // Create compressor node with more aggressive settings
            this.compressor = this._context.createDynamicsCompressor();
            this.compressor.threshold.value = -24;  // Start compression earlier
            this.compressor.knee.value = 12;       // Sharper knee for more precise compression
            this.compressor.ratio.value = 16;      // More aggressive compression
            this.compressor.attack.value = 0.002;  // Faster attack
            this.compressor.release.value = 0.1;   // Faster release

            // Create limiter (another compressor with extreme settings)
            this.limiter = this._context.createDynamicsCompressor();
            this.limiter.threshold.value = -6;    // Start limiting at -6dB
            this.limiter.knee.value = 0;          // Hard knee for true limiting
            this.limiter.ratio.value = 20;        // Very aggressive ratio
            this.limiter.attack.value = 0.001;    // Very fast attack
            this.limiter.release.value = 0.1;     // Fast release

            // Connect nodes: masterGain -> compressor -> limiter -> destination
            this.masterGain.connect(this.compressor);
            this.compressor.connect(this.limiter);
            this.limiter.connect(this._context.destination);

            console.log('Master audio chain connected successfully');
            return true;
        } catch (error) {
            console.error('Error setting up master chain:', error);
            return false;
        }
    }

    isInitialized(): boolean {
        return this._initialized && 
               this._context !== null && 
               this._context.state === 'running' &&
               this.masterGain !== null && 
               this.compressor !== null &&
               this.limiter !== null;
    }

    async initialize(): Promise<void> {
        await this.setupAudioContext();
    }

    async initializeWithMode(mode: AudioMode): Promise<boolean> {
        this._mode = mode;
        return this.setupAudioContext();
    }

    get isEnhancedMode(): boolean {
        return this._mode === 'tracker';
    }

    get volume(): number {
        return this.getVolume();
    }

    setFrequency(_frequency: number): void {
        // Implemented by child classes
    }

    setTempo(_delta: number): void {
        // Implemented by child classes
    }

    setPattern(_pattern: string): void {
        // Implemented by child classes
    }

    getAmplitude(): number {
        return 0;
    }

    setAmplitude(_amplitude: number): void {
        // Implemented by child classes
    }

    getFrequency(): number {
        return 440;
    }

    getCurrentPitch(): number {
        return 1;
    }

    getCurrentVolume(): number {
        return this.getVolume();
    }

    mapMouseToAudio(_mouseX: number, _mouseY: number, _width: number, _height: number): void {
        // Implemented by child classes
    }

    getVolume(): number {
        try {
            if (!this.isInitialized() || !this.masterGain) return 0;
            // Convert back from scaled volume
            return Math.sqrt(this.masterGain.gain.value / 0.4);
        } catch (error) {
            console.error('Error getting volume:', error);
            return 0;
        }
    }

    setVolume(value: number): void {
        try {
            if (!this.isInitialized() || !this.masterGain || !this._context) {
                throw new Error('Audio not initialized');
            }
            
            // Clamp value between 0 and 1
            const volume = Math.max(0, Math.min(1, value));
            
            // Apply volume curve for better control
            const scaledVolume = volume * volume * 0.4; // Square curve with max 0.4
            
            // Smoothly transition to new volume
            const now = this._context.currentTime;
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            this.masterGain.gain.linearRampToValueAtTime(scaledVolume, now + 0.1);
        } catch (error) {
            console.error('Error setting volume:', error);
        }
    }

    start(): void {
        if (!this._hasUserInteraction) {
            console.warn('Cannot start audio without user interaction');
            return;
        }

        if (!this.isInitialized()) {
            console.warn('Audio not fully initialized, attempting to initialize...');
            this.setupAudioContext().then(success => {
                if (success) {
                    this.isPlaying = true;
                    console.log('Audio initialized and started successfully');
                } else {
                    console.error('Failed to initialize audio');
                }
            });
            return;
        }

        this.isPlaying = true;
        console.log('Audio started successfully');
    }

    stop(): void {
        if (!this.isInitialized()) {
            console.warn('Audio not initialized');
            return;
        }

        if (!this.isPlaying) {
            console.log('Audio already stopped');
            return;
        }

        this.isPlaying = false;
        console.log('Audio stopped successfully');
    }

    getAudioMetrics(): AudioMetrics | null {
        return null;
    }

    getWaveform(): Float32Array {
        return new Float32Array(1024);
    }

    getCurrentPattern(): any | null {
        return null;
    }

    getSpectralData(): Uint8Array {
        return new Uint8Array(1024);
    }

    async cleanup(closeContext: boolean = true): Promise<void> {
        try {
            if (this.masterGain) {
                this.masterGain.disconnect();
                this.masterGain = null;
            }

            if (this.compressor) {
                this.compressor.disconnect();
                this.compressor = null;
            }

            if (this.limiter) {
                this.limiter.disconnect();
                this.limiter = null;
            }

            if (closeContext && this._context) {
                await this._context.close();
                this._context = null;
            }

            this.isStarted = false;
            this.isPlaying = false;
            this._initialized = false;
            console.log('Audio cleanup complete');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}
