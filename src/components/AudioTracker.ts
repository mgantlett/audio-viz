import type p5 from 'p5';
import type { AudioMetrics } from '../types/audio';

export class AudioTracker {
    private p5: p5;
    private lastBeatTime: number;
    private beatThreshold: number;
    private smoothedBass: number;
    private smoothedMid: number;
    private smoothingFactor: number;

    constructor(p5: p5) {
        this.p5 = p5;
        this.lastBeatTime = 0;
        this.beatThreshold = 0.45;
        this.smoothedBass = 0;
        this.smoothedMid = 0;
        this.smoothingFactor = 0.2;
    }

    draw(metrics: AudioMetrics): void {
        if (!metrics) return;

        // Smooth the frequency bands
        this.smoothedBass = this.lerp(this.smoothedBass, metrics.bass || 0, this.smoothingFactor);
        this.smoothedMid = this.lerp(this.smoothedMid, metrics.mid || 0, this.smoothingFactor);

        // Detect beats based on bass intensity
        if (this.smoothedBass > this.beatThreshold) {
            const currentTime = this.p5.millis();
            if (currentTime - this.lastBeatTime > 200) { // Minimum 200ms between beats
                this.lastBeatTime = currentTime;
                this.dispatchBeatEvent(this.smoothedBass);
            }
        }
    }

    private lerp(start: number, end: number, amt: number): number {
        return start * (1 - amt) + end * amt;
    }

    private dispatchBeatEvent(intensity: number): void {
        const event = new CustomEvent('tracker-event', {
            detail: {
                type: 'beat',
                intensity: intensity,
                time: this.p5.millis()
            }
        });
        window.dispatchEvent(event);
    }

    cleanup(): void {
        // Reset all values
        this.smoothedBass = 0;
        this.smoothedMid = 0;
        this.lastBeatTime = 0;
        console.log('AudioTracker cleaned up');
    }
}

export default AudioTracker;
