import BasicAudioManager from './BasicAudioManager.js';
import EnhancedAudioManager from './EnhancedAudioManager.js';

class AudioManager {
    constructor() {
        this.basicManager = new BasicAudioManager();
        this.enhancedManager = new EnhancedAudioManager();
        this.currentManager = null;
        this.mode = null;
        this.isTransitioning = false;
    }

    async initialize(mode = 'basic') {
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
            this.currentManager.isPlaying = false;

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
    setFrequency(freq) {
        if (this.mode === 'basic' && !this.isTransitioning) {
            this.basicManager.setFrequency(freq);
        }
    }

    setAmplitude(amp) {
        if (this.mode === 'basic' && !this.isTransitioning) {
            this.basicManager.setAmplitude(amp);
        }
    }

    getAmplitude() {
        return (this.mode === 'basic' && !this.isTransitioning) ? this.basicManager.getAmplitude() : 0;
    }

    getFrequency() {
        return (this.mode === 'basic' && !this.isTransitioning) ? this.basicManager.getFrequency() : 440;
    }

    mapMouseToAudio(mouseX, mouseY, width, height) {
        if (this.mode === 'basic' && !this.isTransitioning) {
            this.basicManager.mapMouseToAudio(mouseX, mouseY, width, height);
        }
    }

    // Enhanced audio methods
    setTempo(tempo) {
        if (this.mode === 'enhanced' && !this.isTransitioning) {
            this.enhancedManager.setTempo(tempo);
        }
    }

    getAudioMetrics() {
        return (this.mode === 'enhanced' && !this.isTransitioning) ? this.enhancedManager.getAudioMetrics() : null;
    }

    getBeatIntensity() {
        return (this.mode === 'enhanced' && !this.isTransitioning) ? this.enhancedManager.getBeatIntensity() : 0;
    }

    getMidFrequencyIntensity() {
        return (this.mode === 'enhanced' && !this.isTransitioning) ? this.enhancedManager.getMidFrequencyIntensity() : 0;
    }

    getHighFrequencyIntensity() {
        return (this.mode === 'enhanced' && !this.isTransitioning) ? this.enhancedManager.getHighFrequencyIntensity() : 0;
    }

    getActiveNotes() {
        return (this.mode === 'enhanced' && !this.isTransitioning) ? this.enhancedManager.getActiveNotes() : new Array(5).fill(0);
    }

    getCurrentPattern() {
        return (this.mode === 'enhanced' && !this.isTransitioning) ? this.enhancedManager.getCurrentPattern() : null;
    }

    getWaveform() {
        return (this.mode === 'enhanced' && !this.isTransitioning) ? this.enhancedManager.getWaveform() : new Float32Array(1024);
    }

    // Common methods
    isInitialized() {
        return !this.isTransitioning && this.currentManager?.isInitialized();
    }

    get isStarted() {
        return this.currentManager?.isStarted || false;
    }

    get isPlaying() {
        return this.currentManager?.isPlaying || false;
    }

    start() {
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

    stop() {
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
            this.currentManager.stop();
        } catch (error) {
            console.error('Error stopping audio:', error);
            throw error;
        }
    }

    getVolume() {
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

    setVolume(value) {
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

    async cleanup(resetMode = true) {
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
const audioManager = new AudioManager();
export default audioManager;

// For backward compatibility with window.enhancedAudioManager
window.enhancedAudioManager = audioManager;
