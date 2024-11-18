import AudioBase from './AudioBase.js';
import SampleManager from './SampleManager.js';
import TrackerPattern from './TrackerPattern.js';
import TrackerSequencer from './TrackerSequencer.js';

class EnhancedAudioManager extends AudioBase {
    constructor() {
        super();
        this.sampleManager = null;
        this.sequencer = null;
        this.analyser = null;
        this.dataArray = null;
        this.waveformArray = null;
        this.isPlaying = false;
        this.mode = 'enhanced';
        this.currentTempo = 125;

        // Default samples to load
        this.defaultSamples = [
            { name: 'kick', url: 'samples/kick.wav', baseNote: 'C3' },
            { name: 'snare', url: 'samples/snare.wav', baseNote: 'D3' },
            { name: 'hihat', url: 'samples/hihat.wav', baseNote: 'F#3' },
            { name: 'bass', url: 'samples/bass.wav', baseNote: 'C2' },
            { name: 'lead', url: 'samples/lead.wav', baseNote: 'C4' }
        ];
    }

    createDefaultPattern() {
        try {
            console.log('Creating default pattern...');
            const pattern = new TrackerPattern(64, 8);
            if (!pattern.data) {
                throw new Error('Pattern data not initialized');
            }
            
            // Basic rhythm pattern
            for (let i = 0; i < 64; i += 4) {
                // Kick on every 4th row
                if (!pattern.setNote(i, 0, 'C3', 'kick', 64)) {
                    console.warn(`Failed to set kick note at row ${i}`);
                }
                
                // Snare on every 8th row
                if (i % 8 === 0) {
                    if (!pattern.setNote(i, 1, 'D3', 'snare', 64)) {
                        console.warn(`Failed to set snare note at row ${i}`);
                    }
                }
                
                // Hihat pattern
                if (!pattern.setNote(i, 2, 'F#3', 'hihat', 48)) {
                    console.warn(`Failed to set hihat note at row ${i}`);
                }
                if (!pattern.setNote(i + 2, 2, 'F#3', 'hihat', 32)) {
                    console.warn(`Failed to set hihat note at row ${i + 2}`);
                }
                
                // Bass line
                if (i % 16 === 0) {
                    if (!pattern.setNote(i, 3, 'C2', 'bass', 64)) {
                        console.warn(`Failed to set bass C2 note at row ${i}`);
                    }
                }
                if (i % 16 === 8) {
                    if (!pattern.setNote(i, 3, 'G2', 'bass', 64)) {
                        console.warn(`Failed to set bass G2 note at row ${i}`);
                    }
                }
                
                // Lead melody
                if (i % 32 === 0) {
                    if (!pattern.setNote(i, 4, 'C4', 'lead', 64)) {
                        console.warn(`Failed to set lead C4 note at row ${i}`);
                    }
                }
                if (i % 32 === 8) {
                    if (!pattern.setNote(i, 4, 'E4', 'lead', 64)) {
                        console.warn(`Failed to set lead E4 note at row ${i}`);
                    }
                }
                if (i % 32 === 16) {
                    if (!pattern.setNote(i, 4, 'G4', 'lead', 64)) {
                        console.warn(`Failed to set lead G4 note at row ${i}`);
                    }
                }
                if (i % 32 === 24) {
                    if (!pattern.setNote(i, 4, 'B4', 'lead', 64)) {
                        console.warn(`Failed to set lead B4 note at row ${i}`);
                    }
                }
            }

            // Verify pattern data
            if (!pattern.data) {
                throw new Error('Pattern data corrupted after initialization');
            }

            console.log('Default pattern created successfully');
            return pattern;
        } catch (error) {
            console.error('Error creating default pattern:', error);
            // Return a clean empty pattern on error
            return new TrackerPattern(64, 8);
        }
    }

    async initialize() {
        try {
            // Initialize audio context and master chain
            const success = await this.setupAudioContext();
            if (!success) {
                throw new Error('Failed to setup audio context');
            }

            // Wait for context to be ready
            if (this.context.state !== 'running') {
                await this.context.resume();
            }

            // Setup analyzer
            console.log('Setting up analyzer...');
            this.analyser = this.context.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.85;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.waveformArray = new Uint8Array(this.analyser.frequencyBinCount);

            // Initialize sample manager
            console.log('Initializing sample manager...');
            this.sampleManager = new SampleManager(this.context);

            // Load default samples
            console.log('Loading default samples...');
            const sampleLoadResults = await Promise.all(
                this.defaultSamples.map(sample => 
                    this.sampleManager.loadSample(
                        sample.name,
                        sample.url,
                        { baseNote: sample.baseNote }
                    )
                )
            );

            if (sampleLoadResults.some(result => !result)) {
                throw new Error('Some samples failed to load');
            }

            // Setup audio chain
            console.log('Setting up audio chain...');
            // Create chain: masterGain -> analyser -> compressor -> destination
            this.masterGain.connect(this.analyser);
            this.analyser.connect(this.compressor);
            this.compressor.connect(this.context.destination);

            // Initialize sequencer
            console.log('Initializing sequencer...');
            this.sequencer = new TrackerSequencer(this.context, this.sampleManager);
            if (!this.sequencer) {
                throw new Error('Failed to create sequencer');
            }

            // Set sequencer audio destination
            if (!this.sequencer.setAudioDestination(this.masterGain)) {
                throw new Error('Failed to set sequencer audio destination');
            }

            // Create and add default pattern
            console.log('Creating default pattern...');
            const defaultPattern = this.createDefaultPattern();
            if (!defaultPattern || !defaultPattern.data) {
                throw new Error('Failed to create default pattern');
            }
            
            console.log('Loading default pattern...');
            if (!this.sequencer.addPattern(0, defaultPattern)) {
                throw new Error('Failed to add default pattern to sequencer');
            }

            // Set initial sequence
            console.log('Setting initial sequence...');
            if (!this.sequencer.setSequence([0])) {
                throw new Error('Failed to set initial sequence');
            }

            // Set initial tempo
            this.setBPM(this.currentTempo);

            // Wait for everything to settle
            await new Promise(resolve => setTimeout(resolve, 100));

            this.isStarted = true;
            return true;
        } catch (error) {
            console.error('Error initializing enhanced audio:', error);
            await this.cleanup(false); // Don't close context on error
            return false;
        }
    }

    start() {
        try {
            if (!this.isInitialized()) {
                throw new Error('Audio manager not initialized');
            }
            if (!this.sequencer) {
                throw new Error('Sequencer not initialized');
            }
            if (this.isPlaying) {
                console.log('Audio already playing');
                return;
            }

            // Resume audio context if needed
            if (this.context.state !== 'running') {
                console.log('Resuming audio context...');
                this.context.resume();
            }

            console.log('Starting audio playback...');
            this.isPlaying = true;
            this.sequencer.start();
        } catch (error) {
            console.error('Error starting playback:', error);
            this.isPlaying = false;
            throw error; // Re-throw to let UI handle the error
        }
    }

    stop() {
        try {
            if (!this.isInitialized()) {
                throw new Error('Audio manager not initialized');
            }
            if (!this.isPlaying) {
                console.log('Audio already stopped');
                return;
            }

            console.log('Stopping audio playback...');
            if (this.sequencer) {
                this.sequencer.stop();
            }
            this.isPlaying = false;
        } catch (error) {
            console.error('Error stopping playback:', error);
            throw error; // Re-throw to let UI handle the error
        }
    }

    setTempo(tempo) {
        try {
            if (!this.isInitialized()) {
                throw new Error('Audio manager not initialized');
            }
            this.currentTempo = Math.max(60, Math.min(200, tempo));
            return this.setBPM(this.currentTempo);
        } catch (error) {
            console.error('Error setting tempo:', error);
            return false;
        }
    }

    setBPM(bpm) {
        try {
            if (!this.isInitialized()) {
                throw new Error('Audio manager not initialized');
            }
            if (this.sequencer) {
                return this.sequencer.setBPM(bpm);
            }
            return false;
        } catch (error) {
            console.error('Error setting BPM:', error);
            return false;
        }
    }

    getCurrentPattern() {
        try {
            if (!this.sequencer) return null;
            const state = this.sequencer.getCurrentState();
            const patternNumber = state.sequence[state.currentPattern];
            return this.sequencer.patterns.get(patternNumber);
        } catch (error) {
            console.error('Error getting current pattern:', error);
            return null;
        }
    }

    getSpectralData() {
        try {
            if (!this.analyser || !this.dataArray) return new Uint8Array(1024);
            this.analyser.getByteFrequencyData(this.dataArray);
            return this.dataArray;
        } catch (error) {
            console.error('Error getting spectral data:', error);
            return new Uint8Array(1024);
        }
    }

    getWaveform() {
        try {
            if (!this.analyser || !this.waveformArray) return new Float32Array(1024);
            this.analyser.getByteTimeDomainData(this.waveformArray);
            return Array.from(this.waveformArray).map(v => (v - 128) / 128);
        } catch (error) {
            console.error('Error getting waveform:', error);
            return new Float32Array(1024);
        }
    }

    getAudioMetrics() {
        try {
            const data = this.getSpectralData();
            const state = this.sequencer?.getCurrentState() || {};
            const pattern = this.getCurrentPattern();
            
            // Calculate frequency band intensities
            const bassIntensity = data.slice(0, 10).reduce((a, b) => a + b, 0) / 2550;
            const midIntensity = data.slice(10, 100).reduce((a, b) => a + b, 0) / 22950;
            const highIntensity = data.slice(100, 200).reduce((a, b) => a + b, 0) / 25500;

            // Ensure all required properties for TrackerDisplay are present
            return {
                pattern: pattern || new TrackerPattern(64, 8), // Always provide a pattern
                currentPattern: state.currentPattern || 0,
                currentRow: state.currentRow || 0,
                isPlaying: this.isPlaying,
                bpm: state.bpm || this.currentTempo,
                bassIntensity: bassIntensity.toFixed(3),
                midIntensity: midIntensity.toFixed(3),
                highIntensity: highIntensity.toFixed(3),
                waveform: this.getWaveform(),
                samples: this.sampleManager?.listSamples() || [],
                // Additional properties required by TrackerDisplay
                rows: pattern ? pattern.rows : 64,
                channels: pattern ? pattern.channels : 8,
                sequence: state.sequence || [0]
            };
        } catch (error) {
            console.warn('Error getting audio metrics:', error);
            // Return default state with all required properties
            return {
                pattern: new TrackerPattern(64, 8),
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

    async cleanup(closeContext = true) {
        try {
            this.stop();
            
            if (this.sequencer) {
                this.sequencer.cleanup();
                this.sequencer = null;
            }

            if (this.analyser) {
                this.analyser.disconnect();
                this.analyser = null;
            }

            this.dataArray = null;
            this.waveformArray = null;
            this.sampleManager = null;
            this.isPlaying = false;

            await super.cleanup(closeContext);
        } catch (error) {
            console.warn('Error during enhanced audio cleanup:', error);
        }
    }
}

export default EnhancedAudioManager;
