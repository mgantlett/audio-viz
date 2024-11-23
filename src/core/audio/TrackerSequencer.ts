import type { SampleManager } from '../../types/audio';
import { TrackerPattern } from './TrackerPattern';

interface SequencerState {
    isPlaying: boolean;
    currentPattern: number;
    currentRow: number;
    bpm: number;
    sequence: number[];
}

interface NoteData {
    note: string | null;
    sample: string | number | null;
    volume: number | null;
}

export class TrackerSequencer {
    private context: AudioContext;
    private sampleManager: SampleManager;
    private destination: AudioNode | null;
    public patterns: Map<number, TrackerPattern>;
    private sequence: number[];
    private currentPattern: number;
    private currentRow: number;
    private nextNoteTime: number;
    private isPlaying: boolean;
    private bpm: number;
    private readonly scheduleAheadTime: number;
    private timerID: number | null;
    private readonly lookahead: number;

    constructor(audioContext: AudioContext, sampleManager: SampleManager) {
        if (!audioContext || !sampleManager) {
            throw new Error('TrackerSequencer requires audioContext and sampleManager');
        }

        this.context = audioContext;
        this.sampleManager = sampleManager;
        this.destination = null;
        this.patterns = new Map();
        this.sequence = [0];
        this.currentPattern = 0;
        this.currentRow = 0;
        this.nextNoteTime = 0;
        this.isPlaying = false;
        this.bpm = 125;
        this.scheduleAheadTime = 0.1;
        this.timerID = null;
        this.lookahead = 25.0;

        // Bind methods
        this.scheduler = this.scheduler.bind(this);
        this.nextNote = this.nextNote.bind(this);
        this.playNote = this.playNote.bind(this);
        this.scheduleNote = this.scheduleNote.bind(this);
    }

    setAudioDestination(destination: AudioNode): boolean {
        try {
            if (!destination) {
                throw new Error('Invalid audio destination');
            }
            this.destination = destination;
            return true;
        } catch (error) {
            console.error('Error setting audio destination:', error);
            return false;
        }
    }

    addPattern(index: number, pattern: TrackerPattern): boolean {
        try {
            if (typeof index !== 'number' || index < 0) {
                throw new Error('Invalid pattern index');
            }
            if (!pattern || !pattern.data) {
                throw new Error('Invalid pattern data');
            }

            this.patterns.set(index, pattern);
            console.log(`Pattern ${index} added successfully`);
            return true;
        } catch (error) {
            console.error('Error adding pattern:', error);
            return false;
        }
    }

    setSequence(sequence: number[]): boolean {
        try {
            if (!Array.isArray(sequence) || sequence.length === 0) {
                throw new Error('Invalid sequence');
            }

            // Validate all pattern indices exist
            for (const index of sequence) {
                if (!this.patterns.has(index)) {
                    throw new Error(`Pattern ${index} not found`);
                }
            }

            this.sequence = sequence;
            this.currentPattern = 0;
            console.log('Sequence set successfully:', sequence);
            return true;
        } catch (error) {
            console.error('Error setting sequence:', error);
            return false;
        }
    }

    setBPM(bpm: number): boolean {
        try {
            if (typeof bpm !== 'number' || bpm < 60 || bpm > 200) {
                throw new Error('Invalid BPM value');
            }
            this.bpm = bpm;
            return true;
        } catch (error) {
            console.error('Error setting BPM:', error);
            return false;
        }
    }

    start(): void {
        try {
            if (this.isPlaying) return;
            if (!this.destination) {
                throw new Error('Audio destination not set');
            }
            if (this.patterns.size === 0) {
                throw new Error('No patterns loaded');
            }

            this.isPlaying = true;
            this.currentRow = 0;
            this.nextNoteTime = this.context.currentTime;
            this.scheduler();
            console.log('Sequencer started');
        } catch (error) {
            console.error('Error starting sequencer:', error);
            this.stop();
        }
    }

    stop(): void {
        try {
            this.isPlaying = false;
            this.currentRow = 0;
            if (this.timerID !== null) {
                clearTimeout(this.timerID);
                this.timerID = null;
            }
            console.log('Sequencer stopped');
        } catch (error) {
            console.error('Error stopping sequencer:', error);
        }
    }

    private nextNote(): void {
        try {
            const secondsPerBeat = 60.0 / this.bpm;
            this.nextNoteTime += 0.25 * secondsPerBeat;

            const pattern = this.patterns.get(this.sequence[this.currentPattern]);
            if (!pattern) return;

            this.currentRow++;
            if (this.currentRow >= pattern.rows) {
                this.currentRow = 0;
                this.currentPattern = (this.currentPattern + 1) % this.sequence.length;
            }
        } catch (error) {
            console.error('Error in nextNote:', error);
            this.stop();
        }
    }

    private scheduleNote(beatNumber: number, time: number): void {
        try {
            const pattern = this.patterns.get(this.sequence[this.currentPattern]);
            if (!pattern) return;

            for (let channel = 0; channel < pattern.channels; channel++) {
                const note = pattern.getNote(beatNumber, channel);
                if (note && note.note && note.sample !== null) {
                    this.playNote(note, time);
                }
            }
        } catch (error) {
            console.error('Error scheduling note:', error);
        }
    }

    private playNote(note: NoteData, time: number): void {
        try {
            const sample = this.sampleManager.getSample(note.sample as string);
            if (!sample || !sample.buffer) return;

            const source = this.context.createBufferSource();
            source.buffer = sample.buffer;

            // Create gain node for volume control
            const gainNode = this.context.createGain();
            gainNode.gain.value = note.volume ? note.volume / 64 : 1;

            // Connect nodes
            source.connect(gainNode);
            if (this.destination) {
                gainNode.connect(this.destination);
            }

            // Calculate playback rate for pitch
            if (note.note && sample.baseNote) {
                const semitones = this.getNoteDistance(sample.baseNote, note.note);
                source.playbackRate.value = Math.pow(2, semitones / 12);
            }

            // Start playback
            source.start(time);
        } catch (error) {
            console.error('Error playing note:', error);
        }
    }

    private getNoteDistance(baseNote: string, targetNote: string): number {
        try {
            const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            
            const getNumericNote = (note: string): number => {
                const noteName = note.slice(0, -1);
                const octave = parseInt(note.slice(-1));
                return octave * 12 + notes.indexOf(noteName);
            };

            return getNumericNote(targetNote) - getNumericNote(baseNote);
        } catch (error) {
            console.error('Error calculating note distance:', error);
            return 0;
        }
    }

    private scheduler(): void {
        try {
            while (this.nextNoteTime < this.context.currentTime + this.scheduleAheadTime) {
                this.scheduleNote(this.currentRow, this.nextNoteTime);
                this.nextNote();
            }
            this.timerID = window.setTimeout(this.scheduler, this.lookahead);
        } catch (error) {
            console.error('Error in scheduler:', error);
            this.stop();
        }
    }

    getCurrentState(): SequencerState {
        try {
            return {
                isPlaying: this.isPlaying,
                currentPattern: this.currentPattern,
                currentRow: this.currentRow,
                bpm: this.bpm,
                sequence: this.sequence
            };
        } catch (error) {
            console.error('Error getting sequencer state:', error);
            return {
                isPlaying: false,
                currentPattern: 0,
                currentRow: 0,
                bpm: 125,
                sequence: [0]
            };
        }
    }

    cleanup(): void {
        try {
            this.stop();
            this.patterns.clear();
            this.sequence = [0];
            this.destination = null;
            console.log('Sequencer cleaned up successfully');
        } catch (error) {
            console.error('Error cleaning up sequencer:', error);
        }
    }
}
