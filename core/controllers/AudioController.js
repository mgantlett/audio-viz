import audioManager from '../audio/index.js';
import EventBus from './EventBus.js';

export class AudioController {
    constructor() {
        this.audioManager = audioManager;
        this.mode = 'basic';
        this.wasPlaying = false; // Track if audio was playing before cleanup
        this.eventBus = EventBus.getInstance();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventBus.on('audio:initialize', async (mode) => {
            await this.initialize(mode);
        });
        this.eventBus.on('audio:start', () => this.startAudio());
        this.eventBus.on('audio:stop', () => this.stopAudio());
        this.eventBus.on('audio:cleanup', async () => await this.cleanup());
    }

    async initialize(mode = 'basic') {
        try {
            this.mode = mode;
            const success = await this.audioManager.initialize(mode);
            
            if (!success) {
                throw new Error('Failed to initialize audio manager');
            }

            this.eventBus.emit('audio:initialized', { success: true, mode });

            // Only start audio if it was playing before cleanup
            if (this.wasPlaying) {
                this.startAudio();
                this.wasPlaying = false;
            }

            return true;
        } catch (error) {
            console.error('Error initializing audio:', error);
            this.eventBus.emit('audio:error', { 
                type: 'initialization',
                error: error.message 
            });
            return false;
        }
    }

    startAudio() {
        if (!this.isAudioInitialized()) {
            this.eventBus.emit('audio:error', {
                type: 'start',
                error: 'Audio not initialized'
            });
            return;
        }

        try {
            this.audioManager.start();
            this.eventBus.emit('audio:started');
        } catch (error) {
            console.error('Error starting audio:', error);
            this.eventBus.emit('audio:error', {
                type: 'start',
                error: error.message
            });
        }
    }

    stopAudio() {
        if (!this.isAudioInitialized()) {
            this.eventBus.emit('audio:error', {
                type: 'stop',
                error: 'Audio not initialized'
            });
            return;
        }

        try {
            this.audioManager.stop();
            this.eventBus.emit('audio:stopped');
        } catch (error) {
            console.error('Error stopping audio:', error);
            this.eventBus.emit('audio:error', {
                type: 'stop',
                error: error.message
            });
        }
    }

    async cleanup() {
        try {
            // Store audio state before cleanup
            this.wasPlaying = this.isPlaying;
            
            await this.audioManager.cleanup();
            this.eventBus.emit('audio:cleaned');
        } catch (error) {
            console.error('Error cleaning up audio:', error);
            this.eventBus.emit('audio:error', {
                type: 'cleanup',
                error: error.message
            });
        }
    }

    // Audio state getters
    isAudioInitialized() {
        return this.audioManager.isInitialized();
    }

    get isPlaying() {
        return this.audioManager?.isPlaying || false;
    }

    get isEnhancedMode() {
        return this.mode === 'enhanced';
    }

    // Basic mode methods
    getCurrentPitch() {
        if (!this.isAudioInitialized() || this.isEnhancedMode) return 1;
        return this.audioManager.getFrequency() / 440;
    }

    getCurrentVolume() {
        if (!this.isAudioInitialized()) return 0;
        return this.isEnhancedMode ? 
            this.audioManager.getVolume() : 
            this.audioManager.getAmplitude();
    }

    // Enhanced mode methods
    setTempo(tempo) {
        if (this.isAudioInitialized() && this.isEnhancedMode) {
            this.audioManager.setTempo(tempo);
            this.eventBus.emit('audio:tempo_changed', { tempo });
        }
    }

    setPattern(pattern) {
        if (this.isAudioInitialized() && this.isEnhancedMode) {
            this.audioManager.setPattern(pattern);
            this.eventBus.emit('audio:pattern_changed', { pattern });
        }
    }

    setProgression(progression) {
        if (this.isAudioInitialized() && this.isEnhancedMode) {
            this.audioManager.setProgression(progression);
            this.eventBus.emit('audio:progression_changed', { progression });
        }
    }

    // Audio metrics
    getAudioMetrics() {
        if (!this.isAudioInitialized() || !this.isEnhancedMode) {
            return null;
        }
        return {
            beatIntensity: this.audioManager.getBeatIntensity(),
            midFrequency: this.audioManager.getMidFrequencyIntensity(),
            highFrequency: this.audioManager.getHighFrequencyIntensity(),
            activeNotes: this.audioManager.getActiveNotes(),
            waveform: this.audioManager.getWaveform()
        };
    }
}

// Export singleton instance
export default new AudioController();
