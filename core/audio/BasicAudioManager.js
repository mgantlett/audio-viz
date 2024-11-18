import AudioBase from './AudioBase.js';

class BasicAudioManager extends AudioBase {
    constructor() {
        super();
        this.basicOscillator = null;
        this.basicGain = null;
        this.basicAmplitude = 0;
        this.basicFrequency = 440;
    }

    async initialize() {
        try {
            const success = await this.setupAudioContext();
            if (!success) return false;

            // Setup basic oscillator
            console.log('Setting up basic oscillator...');
            this.basicOscillator = this.context.createOscillator();
            this.basicGain = this.context.createGain();
            
            this.basicOscillator.type = 'sine';
            this.setAudioParam(this.basicOscillator.frequency, this.basicFrequency);
            // Initialize with gain at 0
            this.setAudioParam(this.basicGain.gain, 0);
            
            this.basicOscillator.connect(this.basicGain);
            this.basicGain.connect(this.masterGain);
            
            // Start oscillator but keep gain at 0
            this.basicOscillator.start();
            console.log('Basic oscillator initialized with zero gain');

            this.isStarted = true;
            this.isPlaying = false;
            return true;
        } catch (error) {
            console.error('Error initializing basic audio:', error);
            return false;
        }
    }

    start() {
        try {
            if (!this.isInitialized()) {
                throw new Error('Audio not initialized');
            }
            if (this.isPlaying) {
                console.log('Audio already playing');
                return;
            }

            console.log('Starting basic audio...');
            // Create new oscillator if needed
            if (!this.basicOscillator) {
                this.basicOscillator = this.context.createOscillator();
                this.basicOscillator.type = 'sine';
                this.setAudioParam(this.basicOscillator.frequency, this.basicFrequency);
                this.basicOscillator.connect(this.basicGain);
                this.basicOscillator.start();
            }
            
            // Ramp up the gain
            this.linearRampToValueAtTime(
                this.basicGain.gain,
                0.5,
                this.context.currentTime + 0.1
            );
            
            this.isPlaying = true;
        } catch (error) {
            console.error('Error starting basic audio:', error);
            throw error;
        }
    }

    stop() {
        try {
            if (!this.isInitialized()) {
                throw new Error('Audio not initialized');
            }
            if (!this.isPlaying) {
                console.log('Audio already stopped');
                return;
            }

            console.log('Stopping basic audio...');
            // Ramp down the gain
            this.linearRampToValueAtTime(
                this.basicGain.gain,
                0,
                this.context.currentTime + 0.1
            );
            
            // Stop and disconnect the oscillator after gain ramp
            setTimeout(() => {
                if (this.basicOscillator) {
                    this.basicOscillator.stop();
                    this.basicOscillator.disconnect();
                    this.basicOscillator = null;
                }
            }, 150);
            
            this.isPlaying = false;
        } catch (error) {
            console.error('Error stopping basic audio:', error);
            throw error;
        }
    }

    setFrequency(freq) {
        if (!this.isInitialized() || !this.basicOscillator) return;
        try {
            this.basicFrequency = Math.max(20, Math.min(freq, 2000));
            this.basicOscillator.frequency.linearRampToValueAtTime(
                this.basicFrequency,
                this.context.currentTime + 0.05
            );
        } catch (error) {
            console.warn('Error setting frequency:', error);
        }
    }

    setAmplitude(amp) {
        if (!this.isInitialized() || !this.basicGain || !this.isPlaying) return;
        try {
            this.basicAmplitude = Math.max(0, Math.min(amp, 1));
            this.basicGain.gain.linearRampToValueAtTime(
                this.basicAmplitude * 0.5,
                this.context.currentTime + 0.05
            );
        } catch (error) {
            console.warn('Error setting amplitude:', error);
        }
    }

    getAmplitude() {
        return this.basicAmplitude;
    }

    getFrequency() {
        return this.basicFrequency;
    }

    mapMouseToAudio(mouseX, mouseY, width, height) {
        if (!this.isInitialized() || !this.basicOscillator || !this.isPlaying) return;

        try {
            const freq = 200 + (mouseX / width) * 600;
            this.setFrequency(freq);

            const amp = 1 - (mouseY / height);
            this.setAmplitude(Math.max(0, Math.min(amp, 1)));
        } catch (error) {
            console.warn('Error mapping mouse to audio:', error);
        }
    }

    async cleanup(closeContext = true) {
        if (this.basicOscillator) {
            try {
                // Ensure gain is zero before cleanup
                if (this.basicGain) {
                    this.basicGain.gain.setValueAtTime(0, this.context.currentTime);
                }
                
                this.basicOscillator.stop();
                this.basicOscillator.disconnect();
                this.basicOscillator = null;
            } catch (e) {
                console.warn('Error cleaning up basic oscillator:', e);
            }
        }

        if (this.basicGain) {
            try {
                this.basicGain.disconnect();
                this.basicGain = null;
            } catch (e) {
                console.warn('Error cleaning up basic gain:', e);
            }
        }

        this.isPlaying = false;
        await super.cleanup(closeContext);
    }
}

export default BasicAudioManager;
