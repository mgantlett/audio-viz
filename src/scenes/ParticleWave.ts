import type p5 from 'p5';
import { Scene } from '../core/Scene';
import type { EventBus } from '../core/EventBus';

interface Particle {
    x: number;
    y: number;
    baseY: number;
    size: number;
    phase: number;
    speed: number;
    color: number[];
}

export class ParticleWave extends Scene {
    private particles: Particle[] = [];
    private readonly numParticles = 100;
    private readonly baseSize = 8;
    private time = 0;
    private currentVolume = 0;
    private currentFrequency = 440;
    private waveOffset = 0;

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
                phase: i * 0.2,
                speed: 0.05,
                color: [33, 150, 243] // Base color (blue)
            });
        }
    }

    public handleAudio(volume: number, frequency: number): void {
        this.currentVolume = volume;
        this.currentFrequency = frequency;
    }

    public draw(p: p5): void {
        // Clear background with slight fade
        p.background(0, 20);

        // Update time and wave offset
        this.time += 0.02;
        this.waveOffset += p.map(this.currentFrequency, 220, 880, 0.001, 0.005);

        // Draw particle trails
        for (let i = 0; i < this.particles.length - 1; i++) {
            const particle = this.particles[i];
            const nextParticle = this.particles[i + 1];
            
            // Create gradient between particles
            const gradient = p.drawingContext as CanvasRenderingContext2D;
            const gradient_line = gradient.createLinearGradient(
                particle.x, particle.y,
                nextParticle.x, nextParticle.y
            );
            
            const alpha = p.map(this.currentVolume, 0, 1, 0.2, 0.6);
            gradient_line.addColorStop(0, `rgba(${particle.color.join(',')},${alpha})`);
            gradient_line.addColorStop(1, `rgba(${nextParticle.color.join(',')},${alpha})`);
            
            gradient.strokeStyle = gradient_line;
            gradient.lineWidth = p.map(this.currentVolume, 0, 1, 1, 3);
            
            gradient.beginPath();
            gradient.moveTo(particle.x, particle.y);
            gradient.lineTo(nextParticle.x, nextParticle.y);
            gradient.stroke();
        }

        // Update and draw particles
        this.particles.forEach(particle => {
            // Create multiple wave patterns
            const baseAmplitude = p.map(this.currentVolume, 0, 1, 0, 100);
            const primaryWave = p.sin(this.time + particle.phase) * baseAmplitude;
            const secondaryWave = p.cos(this.time * 0.5 + particle.phase + this.waveOffset) * baseAmplitude * 0.5;
            const tertiaryWave = p.sin(this.time * 0.25 - particle.phase * 2) * baseAmplitude * 0.25;
            
            // Combine waves
            particle.y = particle.baseY + primaryWave + secondaryWave + tertiaryWave;
            
            // Update particle properties
            particle.speed = p.map(this.currentFrequency, 220, 880, 0.02, 0.1);
            particle.size = this.baseSize * (1 + this.currentVolume * 0.5);
            
            // Update color based on height and audio
            const heightFactor = p.map(particle.y, particle.baseY - 100, particle.baseY + 100, 0, 1);
            const colorIntensity = p.map(this.currentVolume, 0, 1, 0.5, 1);
            particle.color = [
                33 + heightFactor * 50 * colorIntensity,
                150 + heightFactor * 50 * colorIntensity,
                243
            ];

            // Draw particle with glow effect
            p.noStroke();
            
            // Outer glow
            const glowSize = particle.size * 2;
            const glowAlpha = p.map(this.currentVolume, 0, 1, 10, 30);
            p.fill(particle.color[0], particle.color[1], particle.color[2], glowAlpha);
            p.circle(particle.x, particle.y, glowSize);
            
            // Inner particle
            p.fill(particle.color[0], particle.color[1], particle.color[2]);
            p.circle(particle.x, particle.y, particle.size);
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
