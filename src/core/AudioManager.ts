import { BasicAudioManager } from './audio/BasicAudioManager';
import { EnhancedAudioManager } from './audio/EnhancedAudioManager';
import type { AudioMetrics, IAudioManager } from '../types/audio';
import type { AudioMode } from '../types/scene';
import { EventBus } from './EventBus';

declare global {
    interface Window {
        enhancedAudioManager: AudioManager;
    }
}

export class AudioManager implements IAudioManager {
    private basicManager: BasicAudioManager;
    private enhancedManager: EnhancedAudioManager;
    private currentManager: BasicAudioManager | EnhancedAudioManager | null;
    private mode: AudioMode | null;
    private isTransitioning: boolean;
    private eventBus: EventBus;
    private startStopLock: boolean;

    constructor() {
        this.basicManager = new BasicAudioManager();
        this.enhancedManager = new EnhancedAudioManager();
        this.currentManager = null;
        this.mode = null;
        this.isTransitioning = false;
        this.startStopLock = false;
        this.eventBus = EventBus.getInstance();
        this.setupEventListeners();
    }

    get context(): AudioContext | null {
        return this.currentManager?.context || null;
    }

    private setupEventListeners(): void {
        this.eventBus.on('audio:stop', async () => {
            try {
                await this.stop();
            } catch (error) {
                console.error('Error stopping audio:', error);
                this.eventBus.emit({ 
                    type: 'audio:error', 
                    error: error instanceof Error ? error : new Error('Unknown error stopping audio') 
                });
            }
        });

        this.eventBus.on('audio:start', async () => {
            try {
                await this.start();
            } catch (error) {
                console.error('Error starting audio:', error);
                this.eventBus.emit({ 
                    type: 'audio:error', 
                    error: error instanceof Error ? error : new Error('Unknown error starting audio') 
                });
            }
        });
    }

    get isPlaying(): boolean {
        return this.currentManager?.isPlaying || false;
    }

    get isEnhancedMode(): boolean {
        return this.mode === 'tracker';
    }

    get currentTempo(): number {
        if (this.mode === 'tracker' && this.currentManager) {
            const metrics = (this.currentManager as EnhancedAudioManager).getAudioMetrics();
            return metrics.bpm;
        }
        return 125;
    }

    get currentPattern(): string {
        if (this.mode === 'tracker' && this.currentManager) {
            const pattern = (this.currentManager as EnhancedAudioManager).getCurrentPattern();
            return pattern ? 'basic' : '';
        }
        return '';
    }

    get volume(): number {
        return this.currentManager?.getVolume() || 0;
    }

    get frequency(): number {
        return (this.mode === 'oscillator' || this.mode === 'wave') && this.currentManager ? 
            (this.currentManager as BasicAudioManager).getFrequency() : 440;
    }

    async initialize(): Promise<void> {
        await this.initializeWithMode('oscillator');
    }

    async initializeWithMode(mode: AudioMode = 'oscillator'): Promise<boolean> {
        console.log(`Initializing audio manager in ${mode} mode`);
        
        try {
            if (this.isTransitioning) {
                console.warn('Audio manager is already transitioning');
                return false;
            }

            this.isTransitioning = true;

            // Stop any current playback
            if (this.currentManager?.isPlaying) {
                await this.stop();
            }

            // Cleanup existing manager if it exists and mode is different
            if (this.currentManager && this.mode !== mode) {
                console.log('Cleaning up current audio manager...');
                await this.cleanup(true);
                await new Promise(resolve => setTimeout(resolve, 100)); // Wait for cleanup
            }

            // Initialize the new manager if needed
            if (!this.currentManager || this.mode !== mode) {
                console.log(`Setting up ${mode} audio manager...`);
                this.mode = mode;
                
                // Use enhanced manager for tracker mode, basic manager for others
                if (mode === 'tracker') {
                    this.currentManager = this.enhancedManager;
                } else {
                    this.currentManager = this.basicManager;
                }

                const success = await this.currentManager.initializeWithMode(mode);
                if (!success) {
                    throw new Error('Failed to initialize audio manager');
                }
            }

            // Ensure clean state
            if (!this.currentManager.isInitialized()) {
                console.warn('Audio manager initialization incomplete - waiting for user interaction');
                this.isTransitioning = false;
                return true; // Return true to allow UI to show initialize button
            }

            this.isTransitioning = false;
            return true;
        } catch (error) {
            console.error('Error initializing audio manager:', error);
            // Reset state on error
            this.isTransitioning = false;
            this.mode = null;
            this.currentManager = null;
            return false;
        }
    }

    setFrequency(freq: number): void {
        if ((this.mode === 'oscillator' || this.mode === 'wave') && !this.isTransitioning && this.currentManager?.isInitialized()) {
            (this.currentManager as BasicAudioManager).setFrequency(freq);
        }
    }

    setVolume(value: number): void {
        try {
            if (!this.isInitialized() || !this.currentManager) {
                throw new Error('Audio not initialized');
            }
            this.currentManager.setVolume(value);
        } catch (error) {
            console.error('Error setting volume:', error);
        }
    }

    getVolume(): number {
        return this.currentManager?.getVolume() || 0;
    }

    setAmplitude(value: number): void {
        try {
            if ((this.mode === 'oscillator' || this.mode === 'wave') && !this.isTransitioning && this.currentManager?.isInitialized()) {
                (this.currentManager as BasicAudioManager).setAmplitude(value);
            }
        } catch (error) {
            console.error('Error setting amplitude:', error);
        }
    }

    getCurrentPitch(): number {
        return (this.mode === 'oscillator' || this.mode === 'wave') && this.currentManager?.isInitialized() ? 
            (this.currentManager as BasicAudioManager).getFrequency() / 440 : 1;
    }

    getCurrentVolume(): number {
        return this.currentManager?.getVolume() || 0;
    }

    getAmplitude(): number {
        return (this.mode === 'oscillator' || this.mode === 'wave') && !this.isTransitioning && this.currentManager?.isInitialized() ? 
            (this.currentManager as BasicAudioManager).getAmplitude() : 0;
    }

    getFrequency(): number {
        return (this.mode === 'oscillator' || this.mode === 'wave') && !this.isTransitioning && this.currentManager?.isInitialized() ? 
            (this.currentManager as BasicAudioManager).getFrequency() : 440;
    }

    setTempo(tempo: number): void {
        if (this.mode === 'tracker' && !this.isTransitioning && this.currentManager?.isInitialized()) {
            (this.currentManager as EnhancedAudioManager).setBPM(tempo);
        }
    }

    setPattern(_pattern: string): void {
        // Implementation will be added when pattern support is ready
        console.log('Pattern support not yet implemented');
    }

    async start(): Promise<void> {
        if (this.startStopLock) {
            console.log('Start/Stop operation in progress');
            return;
        }

        this.startStopLock = true;
        try {
            if (!this.isInitialized()) {
                throw new Error('Audio not initialized');
            }
            if (this.isTransitioning) {
                throw new Error('Cannot start audio while transitioning');
            }
            if (!this.currentManager) {
                throw new Error('No audio manager available');
            }
            if (this.currentManager.isPlaying) {
                console.log('Audio already playing');
                return;
            }

            console.log('Starting audio playback...');
            await this.currentManager.start();
            console.log('Audio started successfully');
            this.eventBus.emit({ type: 'audio:started' });
        } catch (error) {
            console.error('Error starting audio:', error);
            this.eventBus.emit({ 
                type: 'audio:error', 
                error: error instanceof Error ? error : new Error('Unknown error starting audio')
            });
            throw error;
        } finally {
            this.startStopLock = false;
        }
    }

    async stop(): Promise<void> {
        if (this.startStopLock) {
            console.log('Start/Stop operation in progress');
            return;
        }

        this.startStopLock = true;
        try {
            if (!this.isInitialized()) {
                throw new Error('Audio not initialized');
            }
            if (this.isTransitioning) {
                throw new Error('Cannot stop audio while transitioning');
            }
            if (!this.currentManager) {
                throw new Error('No audio manager available');
            }
            if (!this.currentManager.isPlaying) {
                console.log('Audio already stopped');
                return;
            }

            console.log('Stopping audio playback...');
            await this.currentManager.stop();
            // Wait for cleanup to complete
            await new Promise(resolve => setTimeout(resolve, 200));
            console.log('Audio stopped successfully');
            this.eventBus.emit({ type: 'audio:stopped' });
        } catch (error) {
            console.error('Error stopping audio:', error);
            this.eventBus.emit({ 
                type: 'audio:error', 
                error: error instanceof Error ? error : new Error('Unknown error stopping audio')
            });
            throw error;
        } finally {
            this.startStopLock = false;
        }
    }

    isInitialized(): boolean {
        return !this.isTransitioning && this.currentManager?.isInitialized() || false;
    }

    async cleanup(resetMode = true): Promise<void> {
        try {
            if (this.currentManager) {
                if (this.currentManager.isPlaying) {
                    await this.stop();
                }
                await this.currentManager.cleanup();
                this.currentManager = null;
            }
            if (resetMode) {
                this.mode = null;
            }
            this.isTransitioning = false;
            this.startStopLock = false;
        } catch (error) {
            console.warn('Error during audio cleanup:', error);
            this.isTransitioning = false;
            this.startStopLock = false;
        }
    }

    // Enhanced audio methods
    getAudioMetrics(): AudioMetrics | null {
        return (this.mode === 'tracker' && !this.isTransitioning && this.currentManager?.isInitialized()) ? 
            (this.currentManager as EnhancedAudioManager).getAudioMetrics() : null;
    }

    getWaveform(): Float32Array {
        return (this.mode === 'tracker' && !this.isTransitioning && this.currentManager?.isInitialized()) ? 
            (this.currentManager as EnhancedAudioManager).getWaveform() : new Float32Array(1024);
    }

    getCurrentPattern(): any | null {
        return (this.mode === 'tracker' && !this.isTransitioning && this.currentManager?.isInitialized()) ? 
            (this.currentManager as EnhancedAudioManager).getCurrentPattern() : null;
    }

    mapMouseToAudio(mouseX: number, mouseY: number, width: number, height: number): void {
        if ((this.mode === 'oscillator' || this.mode === 'wave') && !this.isTransitioning && this.currentManager?.isInitialized()) {
            (this.currentManager as BasicAudioManager).mapMouseToAudio(mouseX, mouseY, width, height);
        }
    }
}

// Create and export global instance
export const audioManager = new AudioManager();

// For backward compatibility with window.enhancedAudioManager
window.enhancedAudioManager = audioManager;
