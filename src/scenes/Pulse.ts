import type p5 from 'p5';
import { Scene } from '../core/Scene';
import type { EventBus } from '../core/EventBus';

interface Particle {
    x: number;
    y: number;
    size: number;
    alpha: number;
    velocity: number;
}

export class Pulse extends Scene {
    private particles: Particle[] = [];
    private readonly maxParticles = 100;
    private currentVolume = 0;
    private currentFrequency = 440;

    constructor(p5: p5, eventBus: EventBus) {
        super(p5, eventBus);
    }

    public async initialize(): Promise<void> {
        // Initialize with some particles
        for (let i = 0; i < this.maxParticles / 2; i++) {
            this.addParticle();
        }
    }

    private addParticle(): void {
        const angle = this.p5.random(this.p5.TWO_PI);
        const radius = this.p5.random(50, 200);
        
        this.particles.push({
            x: this.p5.width / 2 + this.p5.cos(angle) * radius,
            y: this.p5.height / 2 + this.p5.sin(angle) * radius,
            size: this.p5.random(4, 12),
            alpha: this.p5.random(100, 200),
            velocity: this.p5.random(0.5, 2)
        });
    }

    public handleAudio(volume: number, frequency: number): void {
        this.currentVolume = volume;
        this.currentFrequency = frequency;

        // Add particles based on volume
        if (this.currentVolume > 0.5 && this.particles.length < this.maxParticles) {
            this.addParticle();
        }
    }

    public draw(p: p5): void {
        // Clear with fade effect
        p.background(0, 20);

        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            // Move towards center
            const dx = p.width / 2 - particle.x;
            const dy = p.height / 2 - particle.y;
            const dist = p.sqrt(dx * dx + dy * dy);
            
            // Scale velocity based on audio
            const speedMultiplier = p.map(this.currentFrequency, 220, 880, 0.5, 2);
            const baseSpeed = particle.velocity * speedMultiplier;
            
            if (dist > 1) {
                particle.x += (dx / dist) * baseSpeed;
                particle.y += (dy / dist) * baseSpeed;
            }

            // Pulse size based on volume
            const sizeMultiplier = 1 + this.currentVolume * 2;
            const currentSize = particle.size * sizeMultiplier;

            // Draw particle
            p.noStroke();
            p.fill(33, 150, 243, particle.alpha);
            p.circle(particle.x, particle.y, currentSize);

            // Draw connecting lines to nearby particles
            this.particles.forEach((other, j) => {
                if (i !== j) {
                    const d = p.dist(particle.x, particle.y, other.x, other.y);
                    if (d < 50) {
                        p.stroke(33, 150, 243, p.map(d, 0, 50, 100, 0));
                        p.line(particle.x, particle.y, other.x, other.y);
                    }
                }
            });

            // Fade out particles near center
            if (dist < 10) {
                particle.alpha -= 5;
            }

            // Remove faded particles
            if (particle.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    public handleResize(): void {
        // Reset particles on resize
        this.particles = [];
        this.initialize();
    }

    public cleanup(): void {
        this.particles = [];
    }
}
