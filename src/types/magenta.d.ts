declare module '@magenta/music' {
    export interface INoteSequence {
        notes: Array<{
            pitch: number;
            startTime: number;
            endTime: number;
            velocity: number;
            quantizedStartStep?: number;
            quantizedEndStep?: number;
        }>;
        totalTime: number;
        tempos: Array<{
            time: number;
            qpm: number;
        }>;
    }

    export class MusicVAE {
        constructor(checkpointURL: string);
        initialize(): Promise<void>;
        sample(numSamples: number, temperature?: number): Promise<INoteSequence[]>;
    }

    export class MusicRNN {
        constructor(checkpointURL: string);
        initialize(): Promise<void>;
        continueSequence(
            sequence: INoteSequence,
            steps: number,
            temperature?: number,
            chordProgression?: string[]
        ): Promise<INoteSequence>;
    }
}
