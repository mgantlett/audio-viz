import { MusicVAE } from '@magenta/music/esm/music_vae';
import { MusicRNN } from '@magenta/music/esm/music_rnn';
import type { INoteSequence } from '@magenta/music/esm/protobuf';

interface Note {
    note?: string;
    pos: number;
    vel: number;
}

interface DrumPattern {
    kick: Note[];
    snare: Note[];
    hihat: Note[];
}

interface MelodicPattern {
    bass: Note[];
    lead: Note[];
    pad?: Note[];
}

interface MagentaNote {
    pitch: number;
    quantizedStartStep?: number;
    quantizedEndStep?: number;
    velocity?: number;
}

interface NoteSequence {
    notes: MagentaNote[];
    totalQuantizedSteps?: number;
    quantizationInfo?: {
        stepsPerQuarter: number;
    };
}

export interface GeneratedPattern {
    drums: DrumPattern;
    melodic: MelodicPattern;
}

export class MagentaPatternGenerator {
    private musicVAE: MusicVAE | null = null;
    private musicRNN: MusicRNN | null = null;
    private initialized: boolean = false;
    private tempo: number;
    private currentPattern: GeneratedPattern | null = null;

    constructor(tempo: number = 124) {
        this.tempo = tempo;
    }

    async initialize(): Promise<void> {
        try {
            console.log('Loading Magenta models...');
            
            // Initialize models sequentially to avoid memory issues
            console.log('Initializing MusicVAE...');
            this.musicVAE = new MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/drums_2bar_lokl_small');
            await this.musicVAE.initialize();
            console.log('MusicVAE initialized');
            
            console.log('Initializing MusicRNN...');
            this.musicRNN = new MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
            await this.musicRNN.initialize();
            console.log('MusicRNN initialized');
            
            this.initialized = true;
            console.log('Magenta models loaded successfully');
        } catch (error) {
            console.error('Error initializing Magenta models:', error);
            // Return a basic pattern even if initialization fails
            this.initialized = true;
            return;
        }
    }

    async generateDeepHouse(): Promise<GeneratedPattern> {
        try {
            // Generate drum patterns
            console.log('Generating drum patterns...');
            const drumSequence = await this.generateDrumPattern();
            const drums = this.convertDrumSequence(drumSequence);

            // Generate melodic patterns
            console.log('Generating melodic patterns...');
            const melodicSequence = await this.generateMelodicPattern();
            const melodic = this.convertMelodicSequence(melodicSequence);

            // Store and return the generated pattern
            this.currentPattern = { drums, melodic };
            
            // Dispatch event with new pattern
            window.dispatchEvent(new CustomEvent('magenta-event', {
                detail: {
                    type: 'pattern_generate',
                    pattern: this.currentPattern
                }
            }));

            return this.currentPattern;
        } catch (error) {
            console.error('Error generating Deep House pattern:', error);
            // Return a basic pattern if generation fails
            return this.createBasicPattern();
        }
    }

    private async generateDrumPattern(): Promise<NoteSequence> {
        try {
            if (this.musicVAE) {
                const sequences = await this.musicVAE.sample(1, 0.5);
                const sequence = sequences[0];

                const notes: MagentaNote[] = [];
                sequence.notes?.forEach(note => {
                    if (note.pitch != null && note.quantizedStartStep != null) {
                        notes.push({
                            pitch: note.pitch,
                            quantizedStartStep: note.quantizedStartStep,
                            quantizedEndStep: note.quantizedEndStep ?? note.quantizedStartStep + 1,
                            velocity: note.velocity ?? 100
                        });
                    }
                });

                // Add four-on-the-floor kick pattern
                const kickSteps = [0, 8, 16, 24];
                kickSteps.forEach(step => {
                    notes.push({
                        pitch: 36,
                        quantizedStartStep: step,
                        quantizedEndStep: step + 1,
                        velocity: 100
                    });
                });

                return {
                    notes,
                    totalQuantizedSteps: 32,
                    quantizationInfo: { stepsPerQuarter: 4 }
                };
            }
            throw new Error('MusicVAE not initialized');
        } catch (error) {
            console.error('Error generating drum pattern:', error);
            // Return a basic four-on-the-floor pattern
            return this.createBasicDrumPattern();
        }
    }

    private async generateMelodicPattern(): Promise<NoteSequence> {
        try {
            if (this.musicRNN) {
                // Create a more house-music oriented seed sequence with valid pitch range
                const seed: INoteSequence = {
                    notes: [
                        // Bass note (moved up 2 octaves for RNN, will be transposed down later)
                        { pitch: 60, quantizedStartStep: 0, quantizedEndStep: 4, velocity: 100 },
                        // Chord notes
                        { pitch: 64, quantizedStartStep: 4, quantizedEndStep: 8, velocity: 80 },
                        { pitch: 67, quantizedStartStep: 4, quantizedEndStep: 8, velocity: 80 },
                        { pitch: 71, quantizedStartStep: 4, quantizedEndStep: 8, velocity: 80 }
                    ],
                    totalQuantizedSteps: 8,
                    quantizationInfo: { stepsPerQuarter: 4 }
                };

                const rnnSteps = 32;
                const rnnTemp = 0.9;
                const sequence = await this.musicRNN.continueSequence(
                    seed,
                    rnnSteps,
                    rnnTemp
                );

                // Post-process the sequence to ensure house music characteristics
                const processedNotes = sequence.notes?.map(note => {
                    const pitch = note.pitch ?? 60;
                    // Transpose bass notes down two octaves
                    const adjustedPitch = pitch < 64 ? pitch - 24 : pitch;
                    return {
                        pitch: adjustedPitch,
                        quantizedStartStep: note.quantizedStartStep ?? 0,
                        quantizedEndStep: note.quantizedEndStep ?? 1,
                        velocity: note.velocity ?? 80
                    };
                }) ?? [];

                // Ensure we have some bass notes
                const bassNotes = processedNotes.filter(note => note.pitch < 48);
                if (bassNotes.length < 4) {
                    [0, 8, 16, 24].forEach(step => {
                        processedNotes.push({
                            pitch: 36,
                            quantizedStartStep: step,
                            quantizedEndStep: step + 4,
                            velocity: 100
                        });
                    });
                }

                return {
                    notes: processedNotes,
                    totalQuantizedSteps: 32,
                    quantizationInfo: { stepsPerQuarter: 4 }
                };
            }
            throw new Error('MusicRNN not initialized');
        } catch (error) {
            console.error('Error generating melodic pattern:', error);
            // Return a basic melodic pattern
            return this.createBasicMelodicPattern();
        }
    }

    private createBasicDrumPattern(): NoteSequence {
        const kickSteps = [0, 8, 16, 24];
        const snareSteps = [8, 24];
        const hihatSteps = [0, 4, 8, 12, 16, 20, 24, 28];

        const notes: MagentaNote[] = [
            ...kickSteps.map(step => ({
                pitch: 36,
                quantizedStartStep: step,
                quantizedEndStep: step + 1,
                velocity: 100
            })),
            ...snareSteps.map(step => ({
                pitch: 38,
                quantizedStartStep: step,
                quantizedEndStep: step + 1,
                velocity: 80
            })),
            ...hihatSteps.map(step => ({
                pitch: 42,
                quantizedStartStep: step,
                quantizedEndStep: step + 1,
                velocity: 60
            }))
        ];

        return {
            notes,
            totalQuantizedSteps: 32,
            quantizationInfo: { stepsPerQuarter: 4 }
        };
    }

    private createBasicMelodicPattern(): NoteSequence {
        const notes: MagentaNote[] = [
            // Bass line
            { pitch: 36, quantizedStartStep: 0, quantizedEndStep: 4, velocity: 100 },
            { pitch: 36, quantizedStartStep: 8, quantizedEndStep: 12, velocity: 100 },
            { pitch: 36, quantizedStartStep: 16, quantizedEndStep: 20, velocity: 100 },
            { pitch: 36, quantizedStartStep: 24, quantizedEndStep: 28, velocity: 100 },
            
            // Chord progression
            { pitch: 48, quantizedStartStep: 4, quantizedEndStep: 8, velocity: 80 },
            { pitch: 52, quantizedStartStep: 4, quantizedEndStep: 8, velocity: 80 },
            { pitch: 55, quantizedStartStep: 4, quantizedEndStep: 8, velocity: 80 },
            
            { pitch: 50, quantizedStartStep: 12, quantizedEndStep: 16, velocity: 80 },
            { pitch: 53, quantizedStartStep: 12, quantizedEndStep: 16, velocity: 80 },
            { pitch: 57, quantizedStartStep: 12, quantizedEndStep: 16, velocity: 80 },
            
            { pitch: 48, quantizedStartStep: 20, quantizedEndStep: 24, velocity: 80 },
            { pitch: 52, quantizedStartStep: 20, quantizedEndStep: 24, velocity: 80 },
            { pitch: 55, quantizedStartStep: 20, quantizedEndStep: 24, velocity: 80 },
            
            { pitch: 50, quantizedStartStep: 28, quantizedEndStep: 32, velocity: 80 },
            { pitch: 53, quantizedStartStep: 28, quantizedEndStep: 32, velocity: 80 },
            { pitch: 57, quantizedStartStep: 28, quantizedEndStep: 32, velocity: 80 }
        ];

        return {
            notes,
            totalQuantizedSteps: 32,
            quantizationInfo: { stepsPerQuarter: 4 }
        };
    }

    private createBasicPattern(): GeneratedPattern {
        const drums = this.convertDrumSequence(this.createBasicDrumPattern());
        const melodic = this.convertMelodicSequence(this.createBasicMelodicPattern());
        return { drums, melodic };
    }

    private convertDrumSequence(sequence: NoteSequence): DrumPattern {
        const drums: DrumPattern = {
            kick: [],
            snare: [],
            hihat: []
        };

        sequence.notes.forEach(note => {
            const pos = Math.floor((note.quantizedStartStep ?? 0) * 2);
            const vel = Math.floor(((note.velocity ?? 100) / 127) * 64);

            switch (note.pitch) {
                case 36:  // Kick
                    drums.kick.push({ pos, vel });
                    break;
                case 38:  // Snare
                    drums.snare.push({ pos, vel });
                    break;
                case 42:  // Closed Hi-hat
                    drums.hihat.push({ pos, vel });
                    break;
            }
        });

        return drums;
    }

    private convertMelodicSequence(sequence: NoteSequence): MelodicPattern {
        const melodic: MelodicPattern = {
            bass: [],
            lead: [],
            pad: []
        };

        sequence.notes.forEach(note => {
            const pos = Math.floor((note.quantizedStartStep ?? 0) * 2);
            const vel = Math.floor(((note.velocity ?? 80) / 127) * 64);
            const noteStr = this.midiToNote(note.pitch);

            if (note.pitch < 48) {  // Bass notes
                melodic.bass.push({ note: noteStr, pos, vel });
            } else if (note.pitch < 72) {  // Pad notes
                melodic.pad?.push({ note: noteStr, pos, vel });
            } else {  // Lead notes
                melodic.lead.push({ note: noteStr, pos, vel });
            }
        });

        return melodic;
    }

    private midiToNote(midi: number): string {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(midi / 12) - 1;
        const note = notes[midi % 12];
        return `${note}${octave}`;
    }

    getCurrentPattern(): GeneratedPattern | null {
        return this.currentPattern;
    }

    getTempo(): number {
        return this.tempo;
    }

    setTempo(tempo: number): void {
        this.tempo = Math.max(60, Math.min(200, tempo));
    }
}
