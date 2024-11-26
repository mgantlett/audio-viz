import type p5 from 'p5';
import { Scene } from '../core/Scene';
import type { EventBus } from '../core/EventBus';

interface Particle {
    x: number;
    y: number;
    baseY: number;
    size: number;
    phase: number;
}

export class ClassicWave extends Scene {
    private particles: Particle[] = [];
    private readonly numParticles = 50;
    private readonly baseSize = 6;
    private time = 0;
    private currentVolume = 0;
    private currentFrequency = 440;

    constructor(p5: p5, eventBus: EventBus) {
        super(p5, eventBus);
    }

    public async initialize(): Promise<void> {
        // Initialize particles
        const spacing = this.p5.width / (this.numParticles - 1);
        
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push({
                x: i * spacing,
                y: this.p5.height / 2,
                baseY: this.p5.height / 2,
                size: this.baseSize,
                phase: i * 0.2
            });
        }
    }

    public handleAudio(volume: number, frequency: number): void {
        this.currentVolume = volume;
        this.currentFrequency = frequency;
    }

    public draw(p: p5): void {
        // Clear background
        p.background(0);

        // Update time
        this.time += 0.05;

        // Draw connecting lines first
        p.stroke(33, 150, 243, 100);
        p.strokeWeight(2);
        p.noFill();
        p.beginShape();
        
        this.particles.forEach(particle => {
            p.vertex(particle.x, particle.y);
        });
        
        p.endShape();

        // Update and draw particles
        this.particles.forEach(particle => {
            // Calculate wave motion
            const amplitude = p.map(this.currentVolume, 0, 1, 0, 100);
            const frequency = p.map(this.currentFrequency, 220, 880, 0.5, 2);
            
            particle.y = particle.baseY + 
                p.sin(this.time * frequency + particle.phase) * amplitude;

            // Draw particle
            p.noStroke();
            p.fill(33, 150, 243);
            const size = this.baseSize * (1 + this.currentVolume);
            p.circle(particle.x, particle.y, size);

            // Optional glow effect
            if (this.currentVolume > 0.5) {
                p.fill(33, 150, 243, 50);
                p.circle(particle.x, particle.y, size * 2);
            }
        });
    }

    public handleResize(): void {
        // Update particle positions on resize
        const spacing = this.p5.width / (this.numParticles - 1);
        this.particles.forEach((particle, i) => {
            particle.x = i * spacing;
            particle.baseY = this.p5.height / 2;
            particle.y = particle.baseY;
        });
    }

    public cleanup(): void {
        this.particles = [];
    }
}
