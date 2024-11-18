import Scene from '../core/Scene.js';

class Particle {
    constructor(p) {
        this.p = p;
        this.reset();
        this.baseY = this.p.random(this.p.height);
    }

    reset() {
        this.x = this.p.random(this.p.width);
        this.y = this.baseY || this.p.random(this.p.height);
        this.size = this.p.random(4, 12);
        this.speedX = this.p.random(-1, 1);
        this.hue = this.p.random(360);
        this.brightness = this.p.random(80, 100);
        this.phase = this.p.random(this.p.TWO_PI);
    }

    update(energy, freq) {
        // Create wave motion
        let wave = this.p.sin(this.p.frameCount * 0.02 + this.x * 0.02 + this.phase);
        this.y = this.baseY + wave * 40 * energy;
        
        // Move particles horizontally
        this.x += this.speedX * energy * 2;
        
        // Wrap around screen
        if (this.x < 0) this.x = this.p.width;
        if (this.x > this.p.width) this.x = 0;

        // Update color based on frequency and energy
        this.hue = (this.hue + this.p.map(freq, 200, 800, 0.5, 2)) % 360;
        this.brightness = this.p.map(energy, 0, 1, 60, 100);
    }

    draw(energy) {
        this.p.push();
        this.p.colorMode(this.p.HSB);
        this.p.noStroke();
        let alpha = this.p.map(energy, 0, 1, 0.3, 0.8);
        
        // Draw glow effect
        for (let i = 3; i >= 0; i--) {
            let size = this.size * (1 + energy) * (1 + i * 0.8);
            let glowAlpha = alpha / (i + 1);
            this.p.fill(this.hue, 80, this.brightness, glowAlpha);
            this.p.circle(this.x, this.y, size);
        }
        this.p.pop();
    }
}

export class ParticleWaveScene extends Scene {
    constructor() {
        super();
        this.particles = [];
        this.NUM_PARTICLES = 300;
    }

    initialize() {
        console.log('Initializing particle wave scene');
        this.setupParticles();
    }

    setupParticles() {
        this.particles = [];
        for (let i = 0; i < this.NUM_PARTICLES; i++) {
            this.particles.push(new Particle(this.p));
        }
    }

    draw(amplitude, frequency) {
        // Clear background
        this.p.background(0);
        
        // Enable additive blending for glow effect
        this.p.blendMode(this.p.ADD);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            particle.update(amplitude, frequency);
            particle.draw(amplitude);
        });
        
        // Reset blend mode
        this.p.blendMode(this.p.BLEND);
    }

    windowResized() {
        this.setupParticles();
    }

    cleanup() {
        // Reset blend mode when leaving scene
        this.p.blendMode(this.p.BLEND);
    }
}
