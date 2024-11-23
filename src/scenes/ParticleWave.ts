import type p5 from 'p5';
import { Scene } from '../core/Scene';

class Particle {
    private p: p5;
    private x: number;
    private y: number;
    private baseY: number;
    private size: number;
    private speedX: number;
    private hue: number;
    private saturation: number;
    private brightness: number;
    private phase: number;

    constructor(p: p5) {
        this.p = p;
        this.x = this.p.random(this.p.width);
        this.y = 0;
        this.baseY = this.p.random(this.p.height);
        this.size = this.p.random(4, 12);
        this.speedX = this.p.random(-1, 1);
        this.hue = this.p.random(360);
        this.saturation = 80;
        this.brightness = this.p.random(80, 100);
        this.phase = this.p.random(this.p.TWO_PI);
    }

    update(energy: number, _freq: number): void {
        // Create wave motion
        const wave = this.p.sin(this.p.frameCount * 0.02 + this.x * 0.02 + this.phase);
        this.y = this.baseY + wave * 40 * energy;
        
        // Move particles horizontally
        this.x += this.speedX * energy * 2;
        
        // Wrap around screen
        if (this.x < 0) this.x = this.p.width;
        if (this.x > this.p.width) this.x = 0;

        // Update color based on energy
        this.hue = (this.hue + 0.5) % 360;
        this.brightness = this.p.map(energy, 0, 1, 60, 100);
    }

    draw(energy: number): void {
        this.p.push();
        this.p.colorMode(this.p.HSB);
        this.p.noStroke();
        const alpha = this.p.map(energy, 0, 1, 0.3, 0.8);
        
        // Draw glow effect
        for (let i = 3; i >= 0; i--) {
            const size = this.size * (1 + energy) * (1 + i * 0.8);
            const glowAlpha = alpha / (i + 1);
            this.p.fill(this.hue, this.saturation, this.brightness, glowAlpha);
            this.p.circle(this.x, this.y, size);
        }
        this.p.pop();
    }
}

export class ParticleWave extends Scene {
    private particles: Particle[];
    private readonly NUM_PARTICLES = 300;

    constructor(p5: p5) {
        super(p5);
        this.particles = [];
    }

    async setup(): Promise<boolean> {
        try {
            console.log('Initializing particle wave scene');
            this.setupParticles();
            return true;
        } catch (error) {
            console.error('Error initializing particle wave scene:', error);
            return false;
        }
    }

    private setupParticles(): void {
        this.particles = [];
        for (let i = 0; i < this.NUM_PARTICLES; i++) {
            this.particles.push(new Particle(this.p5));
        }
    }

    draw(amplitude: number = 0, frequency: number = 440): void {
        // Clear background
        this.p5.background(0);
        
        // Enable additive blending for glow effect
        this.p5.blendMode(this.p5.ADD);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            particle.update(amplitude, frequency);
            particle.draw(amplitude);
        });
        
        // Reset blend mode
        this.p5.blendMode(this.p5.BLEND);
    }

    windowResized(): void {
        this.setupParticles();
    }

    async cleanup(): Promise<void> {
        // Reset blend mode when leaving scene
        this.p5.blendMode(this.p5.BLEND);
        this.particles = [];
    }
}

export default ParticleWave;
