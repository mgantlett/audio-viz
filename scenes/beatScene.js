import Scene from '../core/Scene.js';
import audioManager from '../core/audio/index.js';
import AudioTracker from '../core/components/AudioTracker.js';

export class BeatScene extends Scene {
    constructor() {
        super();
        this.tracker = null;
        this.particles = [];
        this.waveformRings = [];
        this.geometricPatterns = [];
        this.sampleVisualizers = new Map();
        this.isInitialized = false;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 3;
        this.audioInitialized = false;
    }

    async initialize() {
        try {
            console.log('Initializing beat scene');
            this.initializationAttempts++;

            // Initialize core components first
            await this.initializeCoreComponents();

            // Initialize visual elements after core components are ready
            this.setupVisualElements();

            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('Beat scene initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing beat scene:', error);
            this.isInitialized = false;
            
            // Retry initialization if under max attempts
            if (this.initializationAttempts < this.maxInitializationAttempts) {
                console.log(`Retrying initialization (attempt ${this.initializationAttempts + 1}/${this.maxInitializationAttempts})...`);
                await new Promise(resolve => setTimeout(resolve, 500));
                return this.initialize();
            }
            
            await this.cleanup();
            return false;
        }
    }

    async initializeCoreComponents() {
        try {
            // Initialize audio manager in enhanced mode if not already initialized
            if (!audioManager.isInitialized() || audioManager.mode !== 'enhanced') {
                console.log('Initializing audio for scene: scene3');
                const audioInitResult = await audioManager.initialize('enhanced');
                if (!audioInitResult) {
                    throw new Error('Failed to initialize audio in enhanced mode');
                }

                // Wait for audio manager to be ready
                while (!audioManager.isInitialized()) {
                    console.log('Waiting for audio manager...');
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

            // Initialize tracker
            if (!this.tracker) {
                console.log('Initializing audio tracker...');
                this.tracker = new AudioTracker(this.p);
                // Wait for tracker initialization
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            // Verify tracker initialization
            if (!this.tracker || !this.tracker.display) {
                throw new Error('Failed to initialize audio tracker');
            }

            this.audioInitialized = true;
            console.log('Core components initialized successfully');
        } catch (error) {
            console.error('Error initializing core components:', error);
            throw error;
        }
    }

    setupVisualElements() {
        try {
            console.log('Setting up visual elements...');
            this.setupParticles();
            this.setupGeometricPatterns();
            console.log('Visual elements setup complete');
        } catch (error) {
            console.error('Error setting up visual elements:', error);
            throw error;
        }
    }

    setupEventListeners() {
        try {
            console.log('Setting up event listeners...');
            const handler = this.handleTrackerEvent.bind(this);
            window.addEventListener('tracker-event', handler);
            this._boundTrackerEventHandler = handler; // Store for cleanup
            console.log('Event listeners setup complete');
        } catch (error) {
            console.error('Error setting up event listeners:', error);
            throw error;
        }
    }

    handleTrackerEvent(event) {
        if (!this.isInitialized || !this.audioInitialized) return;
        
        try {
            const { type, ...data } = event.detail;
            
            switch (type) {
                case 'transport_toggle':
                    if (audioManager.isPlaying) {
                        audioManager.stop();
                    } else {
                        audioManager.start();
                    }
                    break;

                case 'note_input':
                    this.createWaveformRing(data.channel);
                    break;

                case 'sample_select':
                    this.updateSampleVisualizer(data.sample);
                    break;
            }
        } catch (error) {
            console.error('Error handling tracker event:', error);
        }
    }

    setupParticles() {
        try {
            this.particles = [];
            const numParticles = 150;
            for (let i = 0; i < numParticles; i++) {
                this.particles.push({
                    x: this.p.random(this.p.width),
                    y: this.p.random(this.p.height),
                    size: this.p.random(2, 6),
                    speedX: this.p.random(-2, 2),
                    speedY: this.p.random(-2, 2),
                    hue: this.p.random(360),
                    alpha: this.p.random(0.3, 0.8)
                });
            }
        } catch (error) {
            console.error('Error setting up particles:', error);
            this.particles = [];
        }
    }

    setupGeometricPatterns() {
        try {
            this.geometricPatterns = [];
            const numPatterns = 8;
            for (let i = 0; i < numPatterns; i++) {
                this.geometricPatterns.push({
                    x: this.p.random(this.p.width),
                    y: this.p.random(this.p.height),
                    rotation: this.p.random(this.p.TWO_PI),
                    size: this.p.random(30, 80),
                    sides: Math.floor(this.p.random(3, 8)),
                    hue: this.p.random(360),
                    pulsePhase: this.p.random(this.p.TWO_PI)
                });
            }
        } catch (error) {
            console.error('Error setting up geometric patterns:', error);
            this.geometricPatterns = [];
        }
    }

    createWaveformRing(channel) {
        try {
            const centerX = this.p.width / 2;
            const centerY = this.p.height / 2;
            this.waveformRings.push({
                x: centerX,
                y: centerY,
                radius: 50,
                maxRadius: 200,
                channel: channel,
                alpha: 1,
                rotation: this.p.random(this.p.TWO_PI)
            });
        } catch (error) {
            console.error('Error creating waveform ring:', error);
        }
    }

    updateSampleVisualizer(sampleIndex) {
        try {
            const sample = audioManager.samples[sampleIndex];
            if (sample && sample.data) {
                this.sampleVisualizers.set(sampleIndex, {
                    data: sample.data,
                    offset: 0,
                    speed: 1,
                    active: true
                });
            }
        } catch (error) {
            console.error('Error updating sample visualizer:', error);
        }
    }

    updateParticles(midFreq, bassIntensity) {
        try {
            this.particles.forEach(p => {
                const acceleration = bassIntensity * 0.5;
                p.speedX += this.p.random(-acceleration, acceleration);
                p.speedY += this.p.random(-acceleration, acceleration);
                
                p.speedX = this.p.constrain(p.speedX, -4, 4);
                p.speedY = this.p.constrain(p.speedY, -4, 4);
                
                p.x += p.speedX * midFreq * 2;
                p.y += p.speedY * midFreq * 2;
                
                if (p.x < 0) p.x = this.p.width;
                if (p.x > this.p.width) p.x = 0;
                if (p.y < 0) p.y = this.p.height;
                if (p.y > this.p.height) p.y = 0;
                
                p.hue = (p.hue + bassIntensity * 5) % 360;
                p.alpha = this.p.map(midFreq, 0, 1, 0.3, 0.8);
            });
        } catch (error) {
            console.error('Error updating particles:', error);
        }
    }

    updateWaveformRings() {
        try {
            for (let i = this.waveformRings.length - 1; i >= 0; i--) {
                const ring = this.waveformRings[i];
                ring.radius += 2;
                ring.alpha -= 0.02;
                ring.rotation += 0.02;
                
                if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) {
                    this.waveformRings.splice(i, 1);
                }
            }
        } catch (error) {
            console.error('Error updating waveform rings:', error);
        }
    }

    draw() {
        if (!this.isInitialized) {
            this.drawInitializingState();
            return;
        }

        try {
            // Draw background
            this.p.push();
            this.p.fill(0, 40);
            this.p.noStroke();
            this.p.rect(0, 0, this.p.width, this.p.height);
            this.p.pop();

            // Get audio metrics with error handling
            let metrics;
            try {
                metrics = audioManager.getAudioMetrics() || {};
            } catch (error) {
                console.error('Error getting audio metrics:', error);
                metrics = {};
            }

            // Update and draw visual elements
            const midFreq = parseFloat(metrics.midIntensity) || 0;
            const highFreq = parseFloat(metrics.highIntensity) || 0;
            const bassIntensity = parseFloat(metrics.bassIntensity) || 0;
            const waveform = metrics.waveform || new Float32Array(1024);

            this.updateParticles(midFreq, bassIntensity);
            this.updateWaveformRings();
            
            this.drawParticles();
            this.drawGeometricPatterns(highFreq, bassIntensity);
            this.drawWaveformRings(waveform);

            // Draw tracker if available
            if (this.tracker && this.audioInitialized) {
                this.tracker.draw(metrics);
            }
        } catch (error) {
            console.error('Error in beat scene draw:', error);
            this.drawErrorState(error);
        }
    }

    drawParticles() {
        try {
            this.p.push();
            this.p.colorMode(this.p.HSB);
            this.p.blendMode(this.p.ADD);
            this.p.noStroke();
            
            this.particles.forEach(p => {
                for (let i = 0; i < 3; i++) {
                    const size = p.size * (1 + i);
                    const alpha = p.alpha * (1 - i * 0.3);
                    this.p.fill(p.hue, 80, 100, alpha);
                    this.p.circle(p.x, p.y, size);
                }
            });
            
            this.p.blendMode(this.p.BLEND);
            this.p.pop();
        } catch (error) {
            console.error('Error drawing particles:', error);
        }
    }

    drawWaveformRings(waveform) {
        try {
            this.p.push();
            this.p.colorMode(this.p.HSB);
            this.p.blendMode(this.p.ADD);
            this.p.noFill();
            
            this.waveformRings.forEach(ring => {
                const channelHue = (ring.channel * 30 + 180) % 360;
                this.p.stroke(channelHue, 80, 100, ring.alpha);
                this.p.strokeWeight(2);
                
                this.p.push();
                this.p.translate(ring.x, ring.y);
                this.p.rotate(ring.rotation);
                
                this.p.beginShape();
                for (let i = 0; i < waveform.length; i++) {
                    const angle = (i / waveform.length) * this.p.TWO_PI;
                    const r = ring.radius + waveform[i] * 50;
                    const x = r * Math.cos(angle);
                    const y = r * Math.sin(angle);
                    this.p.vertex(x, y);
                }
                this.p.endShape(this.p.CLOSE);
                this.p.pop();
            });
            
            this.p.blendMode(this.p.BLEND);
            this.p.pop();
        } catch (error) {
            console.error('Error drawing waveform rings:', error);
        }
    }

    drawGeometricPatterns(highFreq, bassIntensity) {
        try {
            this.p.push();
            this.p.colorMode(this.p.HSB);
            this.p.blendMode(this.p.ADD);
            this.p.noFill();
            
            this.geometricPatterns.forEach(pattern => {
                const pulseSize = Math.sin(pattern.pulsePhase) * 20;
                const size = pattern.size * (1 + highFreq) + pulseSize;
                const rotation = pattern.rotation + bassIntensity * 0.2;
                pattern.pulsePhase += 0.05;
                
                this.p.push();
                this.p.translate(pattern.x, pattern.y);
                this.p.rotate(rotation);
                
                for (let i = 0; i < 3; i++) {
                    const alpha = this.p.map(i, 0, 2, 0.6, 0.2);
                    this.p.strokeWeight(1 + i);
                    this.p.stroke(pattern.hue, 80, 100, alpha);
                    
                    this.p.beginShape();
                    for (let j = 0; j < pattern.sides; j++) {
                        const angle = (j * this.p.TWO_PI) / pattern.sides;
                        const r = size * (1 + i * 0.3);
                        const x = Math.cos(angle) * r;
                        const y = Math.sin(angle) * r;
                        this.p.vertex(x, y);
                    }
                    this.p.endShape(this.p.CLOSE);
                    
                    if (i === 0) {
                        for (let j = 0; j < pattern.sides; j++) {
                            const angle = (j * this.p.TWO_PI) / pattern.sides;
                            const x = Math.cos(angle) * size;
                            const y = Math.sin(angle) * size;
                            this.p.line(0, 0, x, y);
                        }
                    }
                }
                this.p.pop();
            });
            
            this.p.blendMode(this.p.BLEND);
            this.p.pop();
        } catch (error) {
            console.error('Error drawing geometric patterns:', error);
        }
    }

    async cleanup() {
        try {
            console.log('Starting beat scene cleanup');
            this.isInitialized = false;
            this.audioInitialized = false;
            
            // Remove event listeners
            if (this._boundTrackerEventHandler) {
                window.removeEventListener('tracker-event', this._boundTrackerEventHandler);
                this._boundTrackerEventHandler = null;
            }
            
            // Clean up tracker
            if (this.tracker) {
                this.tracker.cleanup();
                this.tracker = null;
            }
            
            // Clear visual elements
            this.particles = [];
            this.waveformRings = [];
            this.geometricPatterns = [];
            this.sampleVisualizers.clear();
            
            // Reset blend mode
            this.p.blendMode(this.p.BLEND);
            
            // Wait for cleanup to settle
            await new Promise(resolve => setTimeout(resolve, 200));
            
            console.log('Beat scene cleaned up successfully');
        } catch (error) {
            console.error('Error during beat scene cleanup:', error);
        }
    }
}

export default BeatScene;
