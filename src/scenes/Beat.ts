import type p5 from 'p5';
import { Scene } from '../core/Scene';
import { magentaPatternGenerator } from '../core/audio/MagentaPatternGenerator';
import type { AudioMetrics } from '../types/audio';
import type { EventBus } from '../core/EventBus';

interface BeatParticle {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    size: number;
    targetSize: number;
    alpha: number;
    color: number[];
    velocity: { x: number; y: number };
}

export class Beat extends Scene {
    private particles: BeatParticle[] = [];
    private time = 0;
    private currentMetrics: AudioMetrics | null = null;
    private currentTempo = 124; // Default tempo
    private currentVolume = 0;
    private readonly minTempo = 80;
    private readonly maxTempo = 160;

    constructor(p5: p5, eventBus: EventBus) {
        super(p5, eventBus, 'enhanced');
    }

    public async initialize(): Promise<void> {
        // Generate deep house pattern and set it
        const pattern = magentaPatternGenerator.generatePattern('deephouse');
        this.audioManager.setPattern(pattern);
        
        // Create initial particles
        for (let i = 0; i < 100; i++) {
            this.particles.push(this.createParticle());
        }
    }

    private createParticle(): BeatParticle {
        const angle = this.p5.random(this.p5.TWO_PI);
        const radius = this.p5.random(100, 300);
        const x = this.p5.width / 2 + this.p5.cos(angle) * radius;
        const y = this.p5.height / 2 + this.p5.sin(angle) * radius;

        return {
            x: x,
            y: y,
            targetX: x,
            targetY: y,
            size: this.p5.random(4, 12),
            targetSize: this.p5.random(4, 12),
            alpha: this.p5.random(100, 200),
            color: [33, 150, 243],
            velocity: {
                x: this.p5.random(-2, 2),
                y: this.p5.random(-2, 2)
            }
        };
    }

    public handleAudio(volume: number, _frequency: number): void {
        // Update volume for visualization
        this.currentVolume = volume;
        
        // Get audio metrics from our enhanced audio manager
        this.currentMetrics = this.audioManager.getAudioMetrics();
        if (this.currentMetrics?.bpm) {
            this.currentTempo = this.currentMetrics.bpm;
        }
    }

    public draw(p: p5): void {
        // Update time based on tempo
        const tempoFactor = p.map(this.currentTempo, this.minTempo, this.maxTempo, 0.5, 2);
        this.time += 0.016 * tempoFactor; // Base on 60fps for consistent timing

        // Clear with fade effect
        p.background(0, 20);

        // Apply forces based on tempo and volume
        this.particles.forEach(particle => {
            // Tempo affects movement speed
            const speed = p.map(this.currentTempo, this.minTempo, this.maxTempo, 0.5, 2);
            particle.velocity.x *= speed;
            particle.velocity.y *= speed;

            // Volume affects particle size and color intensity
            if (this.currentVolume > 0.3) {
                particle.targetSize = p.map(this.currentVolume, 0, 1, 4, 16);
                particle.alpha = p.map(this.currentVolume, 0, 1, 100, 255);

                // Add pulsing effect based on beat
                const beatPhase = (this.time * this.currentTempo / 60) % 1;
                if (beatPhase < 0.1) {
                    const force = p.map(this.currentVolume, 0, 1, 2, 8);
                    const angle = p.atan2(particle.y - p.height/2, particle.x - p.width/2);
                    particle.velocity.x += p.cos(angle) * force;
                    particle.velocity.y += p.sin(angle) * force;
                }
            }

            // Update position
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;

            // Apply friction based on tempo
            const friction = p.map(this.currentTempo, this.minTempo, this.maxTempo, 0.98, 0.92);
            particle.velocity.x *= friction;
            particle.velocity.y *= friction;

            // Keep in bounds
            if (particle.x < 0 || particle.x > p.width) particle.velocity.x *= -0.8;
            if (particle.y < 0 || particle.y > p.height) particle.velocity.y *= -0.8;

            // Lerp size
            particle.size = p.lerp(particle.size, particle.targetSize, 0.1);

            // Draw particle with glow effect
            p.noStroke();
            
            // Outer glow
            const glowSize = particle.size * 2;
            p.fill(particle.color[0], particle.color[1], particle.color[2], particle.alpha * 0.5);
            p.circle(particle.x, particle.y, glowSize);
            
            // Inner particle
            p.fill(particle.color[0], particle.color[1], particle.color[2], particle.alpha);
            p.circle(particle.x, particle.y, particle.size);

            // Draw connecting lines to nearby particles
            this.particles.forEach(other => {
                const d = p.dist(particle.x, particle.y, other.x, other.y);
                if (d < 50) {
                    p.stroke(
                        particle.color[0],
                        particle.color[1],
                        particle.color[2],
                        p.map(d, 0, 50, particle.alpha * 0.5, 0)
                    );
                    p.line(particle.x, particle.y, other.x, other.y);
                }
            });
        });

        // Draw beat indicator using current row from tracker
        const currentRow = this.currentMetrics?.currentRow ?? 0;
        const beatPhase = currentRow / (this.currentMetrics?.rows ?? 64);
        p.noFill();
        p.stroke(255, 50);
        p.arc(p.width/2, p.height/2, 200, 200, 0, beatPhase * p.TWO_PI);
    }

    public handleResize(): void {
        // Reset particles on resize
        this.particles = [];
        for (let i = 0; i < 100; i++) {
            this.particles.push(this.createParticle());
        }
    }

    protected onCleanup(): void {
        this.particles = [];
        this.currentMetrics = null;
    }
}
