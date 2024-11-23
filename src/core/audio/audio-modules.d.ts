import type { SampleManager, TrackerSequencer } from '../../types/audio';

declare module 'c:/Users/mgant/Desktop/audio-viz/core/audio/SampleManager.js' {
    const SampleManager: new (context: AudioContext) => SampleManager;
    export default SampleManager;
}

declare module 'c:/Users/mgant/Desktop/audio-viz/core/audio/TrackerPattern.js' {
    interface TrackerPattern {
        rows: number;
        channels: number;
        data: any[];
        setNote(row: number, channel: number, note: string, sample: string, velocity: number): boolean;
    }
    const TrackerPattern: new (rows: number, channels: number) => TrackerPattern;
    export default TrackerPattern;
}

declare module 'c:/Users/mgant/Desktop/audio-viz/core/audio/TrackerSequencer.js' {
    const TrackerSequencer: new (context: AudioContext, sampleManager: SampleManager) => TrackerSequencer;
    export default TrackerSequencer;
}
