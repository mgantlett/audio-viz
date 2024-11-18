class AudioBase {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.compressor = null;
        this.limiter = null;
        this.isStarted = false;
        this.fadeOutDuration = 0.1;
        this._initialized = false;
    }

    async setupAudioContext() {
        try {
            console.log('Creating AudioContext...');
            
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                throw new Error('Web Audio API not supported');
            }

            this.context = new AudioContext();
            console.log('AudioContext created, state:', this.context.state);

            // Resume context if needed
            if (this.context.state !== 'running') {
                await this.context.resume();
                console.log('AudioContext resumed, state:', this.context.state);
            }

            // Setup master gain and compression
            console.log('Setting up master gain and compression...');
            await this.setupMasterChain();

            // Mark as initialized only after everything is set up
            this._initialized = true;
            return true;
        } catch (error) {
            console.error('Error setting up audio context:', error);
            this._initialized = false;
            return false;
        }
    }

    async setupMasterChain() {
        try {
            // Create master gain node with lower initial volume
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = 0.4; // Reduced from 0.7

            // Create compressor node with more aggressive settings
            this.compressor = this.context.createDynamicsCompressor();
            this.compressor.threshold.value = -24;  // Start compression earlier
            this.compressor.knee.value = 12;       // Sharper knee for more precise compression
            this.compressor.ratio.value = 16;      // More aggressive compression
            this.compressor.attack.value = 0.002;  // Faster attack
            this.compressor.release.value = 0.1;   // Faster release

            // Create limiter (another compressor with extreme settings)
            this.limiter = this.context.createDynamicsCompressor();
            this.limiter.threshold.value = -6;    // Start limiting at -6dB
            this.limiter.knee.value = 0;          // Hard knee for true limiting
            this.limiter.ratio.value = 20;        // Very aggressive ratio
            this.limiter.attack.value = 0.001;    // Very fast attack
            this.limiter.release.value = 0.1;     // Fast release

            // Connect nodes: masterGain -> compressor -> limiter -> destination
            this.masterGain.connect(this.compressor);
            this.compressor.connect(this.limiter);
            this.limiter.connect(this.context.destination);

            console.log('Master audio chain connected');
            return true;
        } catch (error) {
            console.error('Error setting up master chain:', error);
            return false;
        }
    }

    isInitialized() {
        try {
            return this._initialized && 
                   this.context !== null && 
                   this.masterGain !== null && 
                   this.compressor !== null &&
                   this.limiter !== null &&
                   this.context.state === 'running';
        } catch (error) {
            console.error('Error checking initialization state:', error);
            return false;
        }
    }

    setAudioParam(param, value, time = 0) {
        try {
            if (!param) {
                throw new Error('Invalid audio parameter');
            }

            if (time > 0) {
                param.setValueAtTime(value, this.context.currentTime + time);
            } else {
                param.setValueAtTime(value, this.context.currentTime);
            }
            return true;
        } catch (error) {
            console.error('Error setting audio parameter:', error);
            return false;
        }
    }

    linearRampToValueAtTime(param, value, time) {
        try {
            if (!param) {
                throw new Error('Invalid audio parameter');
            }

            param.linearRampToValueAtTime(value, time);
            return true;
        } catch (error) {
            console.error('Error setting linear ramp:', error);
            return false;
        }
    }

    setVolume(value) {
        try {
            if (!this.isInitialized()) {
                throw new Error('Audio not initialized');
            }
            
            // Clamp value between 0 and 1
            const volume = Math.max(0, Math.min(1, value));
            
            // Apply volume curve for better control
            const scaledVolume = volume * volume * 0.4; // Square curve with max 0.4
            
            // Smoothly transition to new volume
            const now = this.context.currentTime;
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            this.masterGain.gain.linearRampToValueAtTime(scaledVolume, now + 0.1);
            
            return true;
        } catch (error) {
            console.error('Error setting volume:', error);
            return false;
        }
    }

    getVolume() {
        try {
            if (!this.isInitialized()) return 0;
            // Convert back from scaled volume
            return Math.sqrt(this.masterGain.gain.value / 0.4);
        } catch (error) {
            console.error('Error getting volume:', error);
            return 0;
        }
    }

    async fadeOutMasterGain() {
        try {
            if (!this.masterGain) return;

            const now = this.context.currentTime;
            const currentVolume = this.masterGain.gain.value;

            // Cancel any scheduled values
            this.masterGain.gain.cancelScheduledValues(now);
            
            // Start from current value
            this.masterGain.gain.setValueAtTime(currentVolume, now);
            
            // Fade out with exponential curve for smoother fade
            this.masterGain.gain.exponentialRampToValueAtTime(0.001, now + this.fadeOutDuration);
            this.masterGain.gain.linearRampToValueAtTime(0, now + this.fadeOutDuration + 0.001);
            
            // Wait for fade out to complete
            await new Promise(resolve => setTimeout(resolve, this.fadeOutDuration * 1000));
            
            console.log('Master gain faded out');
        } catch (error) {
            console.error('Error fading out master gain:', error);
        }
    }

    async cleanup(closeContext = true) {
        try {
            console.log('Fading out master gain...');
            await this.fadeOutMasterGain();

            if (this.masterGain) {
                this.masterGain.disconnect();
                this.masterGain = null;
                console.log('Master gain disconnected');
            }

            if (this.compressor) {
                this.compressor.disconnect();
                this.compressor = null;
                console.log('Compressor disconnected');
            }

            if (this.limiter) {
                this.limiter.disconnect();
                this.limiter = null;
                console.log('Limiter disconnected');
            }

            if (closeContext && this.context) {
                await this.context.close();
                this.context = null;
                console.log('Audio context closed');
            }

            this.isStarted = false;
            this._initialized = false;
            console.log('Cleanup complete');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    async suspend() {
        try {
            if (!this.isInitialized()) {
                throw new Error('Audio not initialized');
            }
            if (this.context.state === 'running') {
                await this.context.suspend();
                console.log('Audio context suspended');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error suspending audio context:', error);
            return false;
        }
    }

    async resume() {
        try {
            if (!this.context) {
                throw new Error('No audio context available');
            }
            if (this.context.state === 'suspended') {
                await this.context.resume();
                console.log('Audio context resumed');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error resuming audio context:', error);
            return false;
        }
    }

    getContextState() {
        try {
            return this.context ? this.context.state : 'closed';
        } catch (error) {
            console.error('Error getting context state:', error);
            return 'error';
        }
    }

    getCurrentTime() {
        try {
            if (!this.isInitialized()) return 0;
            return this.context.currentTime;
        } catch (error) {
            console.error('Error getting current time:', error);
            return 0;
        }
    }

    getSampleRate() {
        try {
            if (!this.isInitialized()) return 44100;
            return this.context.sampleRate;
        } catch (error) {
            console.error('Error getting sample rate:', error);
            return 44100;
        }
    }
}

export default AudioBase;
