import { AudioBase } from './AudioBase';
import type { 
    AudioMetrics,
    Sample,
    SampleManager,
    TrackerSequencer,
    TrackerState,
    ImportedModules
} from '../../types/audio';
import type { AudioMode } from '../../types/scene';

// Dynamic imports for modules that haven't been converted to TypeScript yet
const importDeps = async (): Promise<ImportedModules> => {
    const { SampleManager } = await import('./SampleManager');
    const { TrackerPattern } = await import('./TrackerPattern');
    const { TrackerSequencer } = await import('./TrackerSequencer');
    
    return {
        SampleManager,
        TrackerPattern,
        TrackerSequencer
    };
};

export class EnhancedAudioManager extends AudioBase {
    private sampleManager: SampleManager | null;
    private sequencer: TrackerSequencer | null;
    private analyser: AnalyserNode | null;
    private dataArray: Uint8Array | null;
    private waveformArray: Uint8Array | null;
    private readonly defaultSamples: Sample[];
    private TrackerPattern: ImportedModules['TrackerPattern'] | null = null;

    constructor() {
        super();
        this.sampleManager = null;
        this.sequencer = null;
        this.analyser = null;
        this.dataArray = null;
        this.waveformArray = null;
        this._currentTempo = 135;

        // Default samples to load
        this.defaultSamples = [
            { name: 'kick', url: '/audio-viz/samples/kick.wav', baseNote: 'C3' },
            { name: 'snare', url: '/audio-viz/samples/snare.wav', baseNote: 'D3' },
            { name: 'hihat', url: '/audio-viz/samples/hihat.wav', baseNote: 'F#3' },
            { name: 'bass', url: '/samples/bass.wav', baseNote: 'C2' },
            { name: 'lead', url: '/audio-viz/samples/lead.wav', baseNote: 'C4' }
        ];
    }

    override async initializeWithMode(mode: AudioMode = 'tracker'): Promise<boolean> {
        try {
            if (mode !== 'tracker') {
                throw new Error('EnhancedAudioManager only supports tracker mode');
            }

            this.mode = mode;
            console.log(`Initializing audio in ${mode} mode`);
            
            if (!this.context) {
                const success = await this.setupAudioContext();
                if (!success || !this.context) {
                    throw new Error('Failed to setup audio context');
                }
            }

            // Import dependencies
            const { SampleManager, TrackerPattern, TrackerSequencer } = await importDeps();
            this.TrackerPattern = TrackerPattern;

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
            if (!this.sampleManager) {
                throw new Error('Sample manager not initialized');
            }

            const sampleLoadResults = await Promise.all(
                this.defaultSamples.map(sample => 
                    this.sampleManager?.loadSample(
                        sample.name,
                        sample.url,
                        { baseNote: sample.baseNote }
                    ) ?? Promise.resolve(false)
                )
            );

            if (sampleLoadResults.some((result: boolean) => !result)) {
                throw new Error('Some samples failed to load');
            }

            // Setup audio chain
            console.log('Setting up audio chain...');
            if (this.masterGain && this.compressor && this.analyser) {
                this.masterGain.connect(this.analyser);
                this.analyser.connect(this.compressor);
                this.compressor.connect(this.context.destination);
            }

            // Initialize sequencer
            console.log('Initializing sequencer...');
            this.sequencer = new TrackerSequencer(this.context, this.sampleManager);
            if (!this.sequencer) {
                throw new Error('Failed to create sequencer');
            }

            // Set sequencer audio destination
            if (this.masterGain && !this.sequencer.setAudioDestination(this.masterGain)) {
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
            this.setBPM(this._currentTempo);

            this.isStarted = true;
            console.log('Tracker mode initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing tracker mode:', error);
            return false;
        }
    }

    override start(): void {
        if (!this.isInitialized()) {
            throw new Error('Audio manager not initialized');
        }

        if (this.isPlaying) {
            console.log('Audio already playing');
            return;
        }

        try {
            if (!this.sequencer) {
                throw new Error('Sequencer not initialized');
            }

            console.log('Starting tracker audio playback...');
            this.isPlaying = true;
            this.sequencer.start();
        } catch (error) {
            console.error('Error starting tracker playback:', error);
            this.isPlaying = false;
            throw error;
        }
    }

    override stop(): void {
        if (!this.isInitialized()) {
            throw new Error('Audio manager not initialized');
        }

        if (!this.isPlaying) {
            console.log('Audio already stopped');
            return;
        }

        try {
            console.log('Stopping tracker audio playback...');
            if (this.sequencer) {
                this.sequencer.stop();
            }
            this.isPlaying = false;
        } catch (error) {
            console.error('Error stopping tracker playback:', error);
            throw error;
        }
    }

    override getAudioMetrics(): AudioMetrics {
        try {
            const data = this.getSpectralData();
            const state = this.sequencer?.getCurrentState() || {} as TrackerState;
            const pattern = this.getCurrentPattern();
            
            // Calculate frequency band intensities
            const bassIntensity = data.slice(0, 10).reduce((a, b) => a + b, 0) / 2550;
            const midIntensity = data.slice(10, 100).reduce((a, b) => a + b, 0) / 22950;
            const highIntensity = data.slice(100, 200).reduce((a, b) => a + b, 0) / 25500;

            // Get sample list and map to names only
            const sampleList = this.sampleManager?.listSamples().map(s => s.name) || [];

            return {
                pattern: pattern || (this.TrackerPattern ? new this.TrackerPattern(64, 8) : null), 
                currentPattern: state.currentPattern || 0,
                currentRow: state.currentRow || 0,
                isPlaying: this.isPlaying,
                bpm: state.bpm || this._currentTempo,
                bassIntensity: bassIntensity.toFixed(3),
                midIntensity: midIntensity.toFixed(3),
                highIntensity: highIntensity.toFixed(3),
                waveform: this.getWaveform(),
                samples: sampleList,
                rows: pattern ? pattern.rows : 64,
                channels: pattern ? pattern.channels : 8,
                sequence: state.sequence || [0]
            };
        } catch (error) {
            console.warn('Error getting audio metrics:', error);
            return {
                pattern: this.TrackerPattern ? new this.TrackerPattern(64, 8) : null,
                currentPattern: 0,
                currentRow: 0,
                isPlaying: false,
                bpm: this._currentTempo,
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

    override getSpectralData(): Uint8Array {
        try {
            if (!this.analyser || !this.dataArray) return new Uint8Array(1024);
            this.analyser.getByteFrequencyData(this.dataArray);
            return this.dataArray;
        } catch (error) {
            console.error('Error getting spectral data:', error);
            return new Uint8Array(1024);
        }
    }

    override getWaveform(): Float32Array {
        try {
            if (!this.analyser || !this.waveformArray) return new Float32Array(1024);
            this.analyser.getByteTimeDomainData(this.waveformArray);
            return new Float32Array(Array.from(this.waveformArray).map(v => (v - 128) / 128));
        } catch (error) {
            console.error('Error getting waveform:', error);
            return new Float32Array(1024);
        }
    }

    override getCurrentPattern(): any | null {
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

    override async cleanup(closeContext: boolean = true): Promise<void> {
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

            await super.cleanup(closeContext);
        } catch (error) {
            console.warn('Error during audio cleanup:', error);
        }
    }

    setBPM(bpm: number): boolean {
        try {
            if (!this.isInitialized()) {
                throw new Error('Audio manager not initialized');
            }
            if (this.sequencer) {
                this._currentTempo = Math.max(60, Math.min(200, bpm));
                return this.sequencer.setBPM(this._currentTempo);
            }
            return false;
        } catch (error) {
            console.error('Error setting BPM:', error);
            return false;
        }
    }

    private createDefaultPattern(): any {
        try {
            if (!this.TrackerPattern) {
                throw new Error('TrackerPattern class not initialized');
            }

            console.log('Creating default pattern...');
            const pattern = new this.TrackerPattern(64, 8);
            if (!pattern.data) {
                throw new Error('Pattern data not initialized');
            }

            // Define musical elements
            const bassline = [
                // First bar - C
                { note: 'C2', pos: 0, vel: 64 },   // Strong root
                { note: 'C3', pos: 4, vel: 48 },   // Octave up
                { note: 'G2', pos: 8, vel: 56 },   // Fifth
                { note: 'E2', pos: 12, vel: 48 },  // Third
                
                // Second bar - G
                { note: 'G2', pos: 16, vel: 64 },  // Strong root
                { note: 'D3', pos: 20, vel: 48 },  // Fifth up
                { note: 'B2', pos: 24, vel: 56 },  // Third
                { note: 'G2', pos: 28, vel: 48 },  // Root again
                
                // Third bar - Am
                { note: 'A2', pos: 32, vel: 64 },  // Strong root
                { note: 'E3', pos: 36, vel: 48 },  // Fifth up
                { note: 'C3', pos: 40, vel: 56 },  // Minor third
                { note: 'A2', pos: 44, vel: 48 },  // Root again
                
                // Fourth bar - F
                { note: 'F2', pos: 48, vel: 64 },  // Strong root
                { note: 'C3', pos: 52, vel: 48 },  // Fifth up
                { note: 'A2', pos: 56, vel: 56 },  // Third
                { note: 'F2', pos: 60, vel: 48 }   // Root again
            ];

            // Basic drum pattern (4/4 time)
            for (let i = 0; i < 64; i++) {
                // Kick on 1 and 3
                if (i % 16 === 0 || i % 16 === 8) {
                    pattern.setNote(i, 0, 'C3', 'kick', 64);
                }
                // Snare on 2 and 4
                if (i % 16 === 4 || i % 16 === 12) {
                    pattern.setNote(i, 1, 'D3', 'snare', 64);
                }
                // Hihat on every other 8th note
                if (i % 4 === 0) {
                    pattern.setNote(i, 2, 'F#3', 'hihat', 48);
                }
                // Bass line
                const bassNote = bassline.find(note => note.pos === i);
                if (bassNote) {
                    pattern.setNote(i, 3, bassNote.note, 'bass', bassNote.vel);
                }
            }

            console.log('Default pattern created successfully');
            return pattern;
        } catch (error) {
            console.error('Error creating default pattern:', error);
            return this.TrackerPattern ? new this.TrackerPattern(64, 8) : null;
        }
    }
}
