import { BasicAudioManager } from './BasicAudioManager';
import { EnhancedAudioManager } from './EnhancedAudioManager';
import type { AudioMetrics } from '../../types/audio';

declare global {
    interface Window {
        enhancedAudioManager: AudioManager;
    }
}

type AudioMode = 'basic' | 'enhanced';

export class AudioManager {
    private basicManager: BasicAudioManager;
    private enhancedManager: EnhancedAudioManager;
    private currentManager: BasicAudioManager | EnhancedAudioManager | null;
    private mode: AudioMode | null;
    private isTransitioning: boolean;

    constructor() {
        this.basicManager = new BasicAudioManager();
        this.enhancedManager = new EnhancedAudioManager();
        this.currentManager = null;
        this.mode = null;
        this.isTransitioning = false;
    }

    async initialize(mode: AudioMode = 'basic'): Promise<boolean> {
        console.log(`Initializing audio manager in ${mode} mode`);
        
        try {
            if (this.isTransitioning) {
                console.warn('Audio manager is already transitioning');
                return false;
            }

            this.isTransitioning = true;

            // If we're already in the requested mode and initialized, do nothing
            if (this.mode === mode && this.currentManager?.isInitialized()) {
                this.isTransitioning = false;
                return true;
            }

            // Cleanup existing manager if it exists
            if (this.currentManager) {
                console.log('Cleaning up current audio manager...');
                await this.cleanup(false); // Don't reset mode yet
                await new Promise(resolve => setTimeout(resolve, 100)); // Wait for cleanup
            }

            // Initialize the new manager
            console.log(`Setting up ${mode} audio manager...`);
            this.mode = mode;
            this.currentManager = mode === 'enhanced' ? this.enhancedManager : this.basicManager;
            
            // Ensure clean state before initialization
            this.currentManager.isStarted = false;

            const success = await this.currentManager.initialize();
            if (!success) {
                throw new Error('Failed to initialize audio manager');
            }

            // Set initial state
            this.currentManager.isStarted = true;
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

    // Basic audio methods
    setFrequency(freq: number): void {
        if (this.mode === 'basic' && !this.isTransitioning) {
            (this.currentManager as BasicAudioManager).setFrequency(freq);
        }
    }

    setAmplitude(amp: number): void {
        if (this.mode === 'basic' && !this.isTransitioning) {
            (this.currentManager as BasicAudioManager).setAmplitude(amp);
        }
    }

    getAmplitude(): number {
        return (this.mode === 'basic' && !this.isTransitioning) ? 
            (this.currentManager as BasicAudioManager).getAmplitude() : 0;
    }

    getFrequency(): number {
        return (this.mode === 'basic' && !this.isTransitioning) ? 
            (this.currentManager as BasicAudioManager).getFrequency() : 440;
    }

    mapMouseToAudio(mouseX: number, mouseY: number, width: number, height: number): void {
        if (this.mode === 'basic' && !this.isTransitioning) {
            (this.currentManager as BasicAudioManager).mapMouseToAudio(mouseX, mouseY, width, height);
        }
    }

    // Enhanced audio methods
    setTempo(tempo: number): void {
        if (this.mode === 'enhanced' && !this.isTransitioning) {
            (this.currentManager as EnhancedAudioManager).setTempo(tempo);
        }
    }

    getAudioMetrics(): AudioMetrics | null {
        return (this.mode === 'enhanced' && !this.isTransitioning) ? 
            (this.currentManager as EnhancedAudioManager).getAudioMetrics() : null;
    }

    getWaveform(): Float32Array {
        return (this.mode === 'enhanced' && !this.isTransitioning) ? 
            (this.currentManager as EnhancedAudioManager).getWaveform() : new Float32Array(1024);
    }

    getCurrentPattern(): any | null {
        return (this.mode === 'enhanced' && !this.isTransitioning) ? 
            (this.currentManager as EnhancedAudioManager).getCurrentPattern() : null;
    }

    // Common methods
    isInitialized(): boolean {
        return !this.isTransitioning && this.currentManager?.isInitialized() || false;
    }

    get isStarted(): boolean {
        return this.currentManager?.isStarted || false;
    }

    get isPlaying(): boolean {
        return this.currentManager?.isPlaying || false;
    }

    start(): void {
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
            this.currentManager.start();
        } catch (error) {
            console.error('Error starting audio:', error);
            throw error;
        }
    }

    stop(): void {
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

            console.log('Stopping audio playback...');
            this.currentManager.stop();
        } catch (error) {
            console.error('Error stopping audio:', error);
            throw error;
        }
    }

    getVolume(): number {
        try {
            if (!this.isInitialized()) {
                throw new Error('Audio not initialized');
            }
            if (!this.currentManager) {
                throw new Error('No audio manager available');
            }
            return this.currentManager.getVolume();
        } catch (error) {
            console.error('Error getting volume:', error);
            return 0;
        }
    }

    setVolume(value: number): boolean {
        try {
            if (!this.isInitialized()) {
                throw new Error('Audio not initialized');
            }
            if (!this.currentManager) {
                throw new Error('No audio manager available');
            }
            return this.currentManager.setVolume(value);
        } catch (error) {
            console.error('Error setting volume:', error);
            return false;
        }
    }

    async cleanup(resetMode = true): Promise<void> {
        try {
            if (this.currentManager) {
                await this.currentManager.cleanup();
                this.currentManager = null;
            }
            if (resetMode) {
                this.mode = null;
            }
            this.isTransitioning = false;
        } catch (error) {
            console.warn('Error during audio manager cleanup:', error);
            this.isTransitioning = false;
        }
    }
}

// Create and export global instance
export const audioManager = new AudioManager();

// For backward compatibility with window.enhancedAudioManager
window.enhancedAudioManager = audioManager;
