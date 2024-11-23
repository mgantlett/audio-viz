import { AudioBase } from './AudioBase';
import type { AudioMode } from '../../types/scene';

export class BasicAudioManager extends AudioBase {
    protected oscillator: OscillatorNode | null;
    protected gainNode: GainNode | null;
    protected amplitude: number;
    protected _frequency: number;
    private initializationInProgress: boolean;

    constructor() {
        super();
        this.oscillator = null;
        this.gainNode = null;
        this.amplitude = 1.0;
        this._frequency = 440;
        this.mode = 'oscillator';
        this.initializationInProgress = false;
    }

    override get frequency(): number {
        return this._frequency;
    }

    private async ensureContextRunning(): Promise<boolean> {
        if (!this.context) {
            console.warn('Audio context not available');
            return false;
        }

        if (this.context.state === 'suspended') {
            try {
                console.log('Resuming audio context...');
                await this.context.resume();
                // Wait a bit to ensure the context is fully resumed
                await new Promise(resolve => setTimeout(resolve, 100));
                console.log('Audio context resumed successfully');
            } catch (error) {
                console.error('Failed to resume audio context:', error);
                return false;
            }
        }

        if (this.context.state !== 'running') {
            console.warn(`Audio context not running (state: ${this.context.state})`);
            return false;
        }

        return true;
    }

    private async setupAudioNodes(): Promise<boolean> {
        try {
            if (!this.context) {
                console.warn('Cannot setup audio nodes - context not available');
                return false;
            }

            // Ensure context is running
            const contextReady = await this.ensureContextRunning();
            if (!contextReady) {
                console.warn('Context not ready for node setup');
                return false;
            }

            // Clean up existing nodes if they exist
            if (this.oscillator || this.gainNode) {
                await this.cleanup(false);
            }

            // Wait a small amount of time after cleanup
            await new Promise(resolve => setTimeout(resolve, 50));

            // Create new nodes
            this.oscillator = this.context.createOscillator();
            this.gainNode = this.context.createGain();

            // Configure oscillator
            this.oscillator.type = 'sine';
            this.oscillator.frequency.setValueAtTime(this._frequency, this.context.currentTime);
            
            // Configure gain with current amplitude
            this.gainNode.gain.setValueAtTime(0, this.context.currentTime); // Start with 0 gain
            
            // Connect nodes
            this.oscillator.connect(this.gainNode);
            if (this.masterGain) {
                this.gainNode.connect(this.masterGain);
            } else {
                throw new Error('Master gain node not available');
            }
            
            // Start oscillator
            this.oscillator.start();
            console.log('Audio nodes setup successfully');
            return true;
        } catch (error) {
            console.error('Error setting up audio nodes:', error);
            // Clean up any partially initialized nodes
            await this.cleanup(false);
            return false;
        }
    }

    async initializeWithMode(mode: AudioMode = 'oscillator'): Promise<boolean> {
        try {
            if (this.initializationInProgress) {
                console.warn('Initialization already in progress');
                return false;
            }

            this.initializationInProgress = true;

            if (mode === 'tracker') {
                throw new Error('BasicAudioManager does not support tracker mode');
            }

            this.mode = mode;
            console.log(`Initializing basic audio in ${mode} mode`);

            if (!this.context) {
                const success = await this.setupAudioContext();
                if (!success || !this.context) {
                    console.log('Audio context setup failed');
                    return false;
                }
            }

            // Ensure context is running
            const contextReady = await this.ensureContextRunning();
            if (!contextReady) {
                console.log('Audio context not ready - initialization incomplete');
                return false;
            }

            // Setup initial audio nodes
            const nodesReady = await this.setupAudioNodes();
            if (!nodesReady) {
                console.log('Audio nodes setup failed');
                return false;
            }

            console.log(`${mode} mode initialized successfully`);
            this.isStarted = true;
            return true;
        } catch (error) {
            console.error('Error initializing basic audio:', error);
            await this.cleanup(false);
            return false;
        } finally {
            this.initializationInProgress = false;
        }
    }

    override async start(): Promise<void> {
        try {
            if (!this.context) {
                throw new Error('Cannot start audio - context not available');
            }

            // Ensure context is running
            const contextReady = await this.ensureContextRunning();
            if (!contextReady) {
                throw new Error('Audio context not ready');
            }

            if (this.isPlaying) {
                console.log('Audio already playing');
                return;
            }

            // Setup nodes if they don't exist
            if (!this.oscillator || !this.gainNode) {
                console.log('Setting up audio nodes...');
                const success = await this.setupAudioNodes();
                if (!success) {
                    throw new Error('Failed to setup audio nodes');
                }
            }

            if (!this.gainNode) {
                throw new Error('Required audio components not available');
            }

            // Ramp up the gain
            this.gainNode.gain.cancelScheduledValues(this.context.currentTime);
            this.gainNode.gain.setValueAtTime(0, this.context.currentTime);
            this.gainNode.gain.linearRampToValueAtTime(
                this.amplitude,
                this.context.currentTime + 0.1
            );
            
            this.isPlaying = true;
            console.log('Audio started successfully');
        } catch (error) {
            console.error('Error starting basic audio:', error);
            this.isPlaying = false;
            throw error;
        }
    }

    override async stop(): Promise<void> {
        if (!this.isInitialized()) {
            console.warn('Cannot stop audio - system not initialized');
            return;
        }

        if (!this.isPlaying) {
            console.log('Audio already stopped');
            return;
        }

        try {
            if (!this.context || !this.gainNode) {
                console.warn('Required audio components not available');
                this.isPlaying = false;
                return;
            }

            // Ramp down the gain
            this.gainNode.gain.cancelScheduledValues(this.context.currentTime);
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.context.currentTime);
            this.gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.1);
            
            // Reset amplitude
            this.amplitude = 0;
            
            // Stop and disconnect the oscillator after gain ramp
            await new Promise<void>((resolve) => {
                setTimeout(async () => {
                    if (this.oscillator) {
                        try {
                            this.oscillator.stop();
                            this.oscillator.disconnect();
                            this.oscillator = null;
                        } catch (error) {
                            console.warn('Error cleaning up oscillator:', error);
                        }
                    }
                    // Clean up nodes
                    if (this.gainNode) {
                        try {
                            this.gainNode.disconnect();
                            this.gainNode = null;
                        } catch (error) {
                            console.warn('Error cleaning up gain node:', error);
                        }
                    }
                    resolve();
                }, 150);
            });
            
            this.isPlaying = false;
            console.log('Audio stopped successfully');
        } catch (error) {
            console.error('Error stopping basic audio:', error);
            // Force stop even if there was an error
            this.isPlaying = false;
            // Clean up resources
            await this.cleanup(false);
        }
    }

    override setFrequency(freq: number): void {
        if (!this.oscillator || !this.context) {
            console.warn('Cannot set frequency - audio system not ready');
            return;
        }

        try {
            this._frequency = Math.max(20, Math.min(freq, 2000));
            this.oscillator.frequency.cancelScheduledValues(this.context.currentTime);
            this.oscillator.frequency.setValueAtTime(this.oscillator.frequency.value, this.context.currentTime);
            this.oscillator.frequency.linearRampToValueAtTime(
                this._frequency,
                this.context.currentTime + 0.05
            );
        } catch (error) {
            console.warn('Error setting frequency:', error);
        }
    }

    override setAmplitude(amp: number): void {
        if (!this.gainNode || !this.context) {
            console.warn('Cannot set amplitude - audio system not ready');
            return;
        }

        try {
            this.amplitude = Math.max(0, Math.min(amp, 1));
            this.gainNode.gain.cancelScheduledValues(this.context.currentTime);
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.context.currentTime);
            this.gainNode.gain.linearRampToValueAtTime(
                this.amplitude,
                this.context.currentTime + 0.05
            );
        } catch (error) {
            console.warn('Error setting amplitude:', error);
        }
    }

    override setVolume(value: number): void {
        console.log('Setting volume to:', value);
        this.setAmplitude(value);
    }

    override getAmplitude(): number {
        return this.amplitude;
    }

    override getFrequency(): number {
        return this._frequency;
    }

    override getCurrentVolume(): number {
        return this.amplitude;
    }

    override getVolume(): number {
        return this.amplitude;
    }

    override mapMouseToAudio(mouseX: number, mouseY: number, width: number, height: number): void {
        try {
            if (!this.isInitialized()) {
                console.warn('Cannot map mouse - audio system not initialized');
                return;
            }

            const freq = 200 + (mouseX / width) * 600;
            this.setFrequency(freq);

            const amp = 1 - (mouseY / height);
            this.setAmplitude(Math.max(0, Math.min(amp, 1)));
        } catch (error) {
            console.warn('Error mapping mouse to audio:', error);
        }
    }

    override async cleanup(closeContext: boolean = true): Promise<void> {
        try {
            if (this.isPlaying) {
                await this.stop();
            }
            
            if (this.oscillator) {
                try {
                    this.oscillator.stop();
                    this.oscillator.disconnect();
                } catch (error) {
                    console.warn('Error disconnecting oscillator:', error);
                }
                this.oscillator = null;
            }

            if (this.gainNode) {
                try {
                    this.gainNode.disconnect();
                } catch (error) {
                    console.warn('Error disconnecting gain node:', error);
                }
                this.gainNode = null;
            }

            this.amplitude = 0;

            await super.cleanup(closeContext);
        } catch (error) {
            console.warn('Error during audio cleanup:', error);
        }
    }
}
