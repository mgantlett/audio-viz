import type { GeneratedPattern, PatternType, DrumPattern, MelodicPattern, DrumPart, MelodicPart } from '../../types/audio';

export class MagentaPatternGenerator {
    private static instance: MagentaPatternGenerator;
    private patternCounter = 0;

    private constructor() {}

    public static getInstance(): MagentaPatternGenerator {
        if (!MagentaPatternGenerator.instance) {
            MagentaPatternGenerator.instance = new MagentaPatternGenerator();
        }
        return MagentaPatternGenerator.instance;
    }

    private generatePatternId(): string {
        this.patternCounter++;
        return `pattern_${this.patternCounter}`;
    }

    public generatePattern(type: PatternType): GeneratedPattern {
        switch (type) {
            case 'deephouse':
                return this.generateDeepHousePattern();
            case 'complex':
                return this.generateComplexPattern();
            case 'syncopated':
                return this.generateSyncopatedPattern();
            case 'drums':
                return this.generateDrumPattern();
            case 'melody':
                return this.generateMelodyPattern();
            case 'basic':
            default:
                return this.generateBasicPattern();
        }
    }

    private generateBasicPattern(): MelodicPattern {
        const melodic: MelodicPart = {
            lead: [
                { pitch: 60, startTime: 0, endTime: 0.5, pos: 0 },
                { pitch: 64, startTime: 0.5, endTime: 1.0, pos: 16 },
                { pitch: 67, startTime: 1.0, endTime: 1.5, pos: 32 },
                { pitch: 72, startTime: 1.5, endTime: 2.0, pos: 48 }
            ]
        };

        return {
            id: this.generatePatternId(),
            name: 'Basic Pattern',
            type: 'melodic',
            melodic,
            notes: melodic.lead || [],
            data: melodic.lead?.map(note => note.pitch) || [],
            totalTime: 2.0
        };
    }

    private generateDrumPattern(): DrumPattern {
        const drums: DrumPart = {
            kick: [{ pitch: 36, startTime: 0, endTime: 0.25, pos: 0 }],
            snare: [{ pitch: 38, startTime: 0.5, endTime: 0.75, pos: 16 }],
            hihat: [
                { pitch: 42, startTime: 0.25, endTime: 0.5, pos: 8 },
                { pitch: 42, startTime: 0.75, endTime: 1.0, pos: 24 }
            ]
        };

        const allNotes = [
            ...(drums.kick || []),
            ...(drums.snare || []),
            ...(drums.hihat || [])
        ];

        return {
            id: this.generatePatternId(),
            name: 'Drum Pattern',
            type: 'drum',
            drums,
            notes: allNotes,
            data: allNotes.map(note => note.pitch),
            totalTime: 1.0
        };
    }

    private generateMelodyPattern(): MelodicPattern {
        const melodic: MelodicPart = {
            lead: [
                { pitch: 60, startTime: 0, endTime: 0.5, pos: 0 },
                { pitch: 64, startTime: 0.5, endTime: 1.0, pos: 16 },
                { pitch: 67, startTime: 1.0, endTime: 1.5, pos: 32 },
                { pitch: 71, startTime: 1.5, endTime: 2.0, pos: 48 },
                { pitch: 72, startTime: 2.0, endTime: 2.5, pos: 56 }
            ]
        };

        return {
            id: this.generatePatternId(),
            name: 'Melody Pattern',
            type: 'melodic',
            melodic,
            notes: melodic.lead || [],
            data: melodic.lead?.map(note => note.pitch) || [],
            totalTime: 2.5
        };
    }

    private generateDeepHousePattern(): DrumPattern {
        const drums: DrumPart = {
            kick: [
                { pitch: 36, startTime: 0, endTime: 0.25, pos: 0 },
                { pitch: 36, startTime: 1.0, endTime: 1.25, pos: 32 }
            ],
            snare: [
                { pitch: 38, startTime: 0.5, endTime: 0.75, pos: 16 },
                { pitch: 38, startTime: 1.5, endTime: 1.75, pos: 48 }
            ],
            hihat: [
                { pitch: 42, startTime: 0.25, endTime: 0.5, pos: 8 },
                { pitch: 42, startTime: 0.75, endTime: 1.0, pos: 24 },
                { pitch: 42, startTime: 1.25, endTime: 1.5, pos: 40 },
                { pitch: 42, startTime: 1.75, endTime: 2.0, pos: 56 }
            ]
        };

        const allNotes = [
            ...(drums.kick || []),
            ...(drums.snare || []),
            ...(drums.hihat || [])
        ];

        return {
            id: this.generatePatternId(),
            name: 'Deep House Pattern',
            type: 'drum',
            drums,
            notes: allNotes,
            data: allNotes.map(note => note.pitch),
            totalTime: 2.0
        };
    }

    private generateComplexPattern(): MelodicPattern {
        const melodic: MelodicPart = {
            lead: [
                { pitch: 36, startTime: 0, endTime: 0.25, pos: 0 },
                { pitch: 38, startTime: 0.25, endTime: 0.5, pos: 8 },
                { pitch: 42, startTime: 0.5, endTime: 0.75, pos: 16 },
                { pitch: 45, startTime: 0.75, endTime: 1.0, pos: 24 },
                { pitch: 48, startTime: 1.0, endTime: 1.25, pos: 32 },
                { pitch: 50, startTime: 1.25, endTime: 1.5, pos: 40 },
                { pitch: 53, startTime: 1.5, endTime: 1.75, pos: 48 },
                { pitch: 55, startTime: 1.75, endTime: 2.0, pos: 56 }
            ]
        };

        return {
            id: this.generatePatternId(),
            name: 'Complex Pattern',
            type: 'melodic',
            melodic,
            notes: melodic.lead || [],
            data: melodic.lead?.map(note => note.pitch) || [],
            totalTime: 2.0
        };
    }

    private generateSyncopatedPattern(): MelodicPattern {
        const melodic: MelodicPart = {
            lead: [
                { pitch: 60, startTime: 0, endTime: 0.25, pos: 0 },
                { pitch: 64, startTime: 0.375, endTime: 0.625, pos: 12 },
                { pitch: 67, startTime: 0.75, endTime: 1.0, pos: 24 },
                { pitch: 71, startTime: 1.125, endTime: 1.375, pos: 36 },
                { pitch: 72, startTime: 1.5, endTime: 1.75, pos: 48 }
            ]
        };

        return {
            id: this.generatePatternId(),
            name: 'Syncopated Pattern',
            type: 'melodic',
            melodic,
            notes: melodic.lead || [],
            data: melodic.lead?.map(note => note.pitch) || [],
            totalTime: 2.0
        };
    }
}

export const magentaPatternGenerator = MagentaPatternGenerator.getInstance();
export default magentaPatternGenerator;
