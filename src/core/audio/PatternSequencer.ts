import type { GeneratedPattern } from '../../types/audio';
import type { EventBus } from '../EventBus';
import type { SampleManager } from './SampleManager';

export class PatternSequencer {
    private currentPattern: GeneratedPattern | undefined;
    private currentStep: number = 0;
    private nextNoteTime: number = 0;
    private timerID: number | null = null;
    private readonly scheduleAheadTime = 0.1;
    private readonly patternLength = 64; // 32 steps * 2 for higher resolution
    private tempo: number = 124;
    private isPlaying: boolean = false;

    constructor(
        private context: AudioContext,
        private sampleManager: SampleManager,
        private eventBus: EventBus,
        private amplitude: number
    ) {}

    setPattern(pattern: GeneratedPattern): void {
        this.currentPattern = pattern;
        console.log('Pattern set:', pattern);
    }

    setTempo(tempo: number): void {
        this.tempo = tempo;
    }

    start(): void {
        if (this.isPlaying || !this.currentPattern) return;

        this.currentStep = 0;
        this.nextNoteTime = this.context.currentTime;
        this.isPlaying = true;
        this.scheduleSamples();
    }

    stop(): void {
        if (!this.isPlaying) return;

        if (this.timerID !== null) {
            window.clearTimeout(this.timerID);
            this.timerID = null;
        }

        this.isPlaying = false;
    }

    private scheduleSamples(): void {
        if (!this.currentPattern || !this.isPlaying) return;

        while (this.nextNoteTime < this.context.currentTime + this.scheduleAheadTime) {
            const { drums, melodic } = this.currentPattern;
            const currentTime = this.nextNoteTime;

            // Schedule drums
            if (drums) {
                if (drums.kick?.some(note => note.pos === this.currentStep)) {
                    this.sampleManager.playSample('kick', currentTime, this.amplitude);
                }
                if (drums.snare?.some(note => note.pos === this.currentStep)) {
                    this.sampleManager.playSample('snare', currentTime, this.amplitude);
                }
                if (drums.hihat?.some(note => note.pos === this.currentStep)) {
                    this.sampleManager.playSample('hihat', currentTime, this.amplitude);
                }
            }

            // Schedule melodic parts
            if (melodic) {
                if (melodic.bass?.some(note => note.pos === this.currentStep)) {
                    this.sampleManager.playSample('bass', currentTime, this.amplitude);
                }
                if (melodic.lead?.some(note => note.pos === this.currentStep)) {
                    this.sampleManager.playSample('lead', currentTime, this.amplitude);
                }
            }

            // Calculate time for next step
            const secondsPerBeat = 60.0 / this.tempo;
            const secondsPerStep = secondsPerBeat / 4; // 4 steps per beat
            this.nextNoteTime += secondsPerStep;
            this.currentStep = (this.currentStep + 1) % this.patternLength;

            // Emit step update
            this.eventBus.emit({
                type: 'audio:step',
                step: this.currentStep,
                time: currentTime
            });
        }

        this.timerID = window.setTimeout(() => this.scheduleSamples(), 25);
    }

    getCurrentStep(): number {
        return this.currentStep;
    }

    getPattern(): GeneratedPattern | undefined {
        return this.currentPattern;
    }

    cleanup(): void {
        this.stop();
        this.currentPattern = undefined;
        this.currentStep = 0;
    }
}
