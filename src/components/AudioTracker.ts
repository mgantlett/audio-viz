import type p5 from 'p5';
import type { AudioMetrics } from '../types/audio';

export class AudioTracker {
    private p5: p5;
    public display: any; // TODO: Add proper type once display component is implemented

    constructor(p5: p5) {
        this.p5 = p5;
        this.display = {}; // TODO: Initialize display component
    }

    draw(metrics: AudioMetrics): void {
        // TODO: Implement tracker visualization
        console.log('Drawing tracker with metrics:', metrics);
    }

    cleanup(): void {
        // TODO: Implement cleanup
        console.log('Cleaning up tracker');
    }
}

export default AudioTracker;
