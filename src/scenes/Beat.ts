import type p5 from 'p5';
import { Scene } from '../core/Scene';
import { audioManager } from '../core/audio';
import type { AudioMetrics } from '../types/audio';
import type {
    Particle,
    WaveformRing,
    GeometricPattern,
    SampleVisualizer,
    TrackerEvent,
    AudioTracker
} from '../types/beat-scene';

export class Beat extends Scene {
    private tracker: AudioTracker | null;
    private particles: Particle[];
    private waveformRings: WaveformRing[];
    private geometricPatterns: GeometricPattern[];
    private sampleVisualizers: Map<number, SampleVisualizer>;
    private audioInitialized: boolean;
    private _boundTrackerEventHandler: ((event: TrackerEvent) => void) | null;
    private AudioTrackerClass: any | null = null;
    private _isInitialized: boolean = false;
    private lastBeatTime: number = 0;
    private beatInterval: number = 500; // Default 120 BPM

    constructor(p5: p5) {
        super(p5);
        this.tracker = null;
        this.particles = [];
        this.waveformRings = [];
        this.geometricPatterns = [];
        this.sampleVisualizers = new Map();
        this.audioInitialized = false;
        this._boundTrackerEventHandler = null;
    }

    async setup(): Promise<boolean> {
        try {
            console.log('Initializing beat scene');

            // Import AudioTracker dynamically
            const AudioTrackerModule = await import('../components/AudioTracker');
            this.AudioTrackerClass = AudioTrackerModule.default;

            // Initialize core components first
            await this.initializeCoreComponents();

            // Initialize visual elements after core components are ready
            this.setupVisualElements();

            // Setup event listeners
            this.setupEventListeners();
            
            console.log('Beat scene initialized successfully');
            this._isInitialized = true;

            // Start playback automatically
            if (audioManager.isInitialized() && !audioManager.isPlaying) {
                console.log('Starting automatic playback...');
                audioManager.start();
            }

            return true;
        } catch (error) {
            console.error('Error initializing beat scene:', error);
            await this.cleanup();
            return false;
        }
    }

    private async initializeCoreComponents(): Promise<void> {
        try {
            // Initialize audio manager in tracker mode if not already initialized
            if (!audioManager.isInitialized() || (audioManager as any).mode !== 'tracker') {
                console.log('Initializing audio for scene: scene3');
                const success = await audioManager.initializeWithMode('tracker');
                if (!success) {
                    throw new Error('Failed to initialize audio manager in tracker mode');
                }

                if (!audioManager.isInitialized()) {
                    throw new Error('Failed to initialize audio manager');
                }
            }
            // Initialize tracker
            if (!this.tracker && this.AudioTrackerClass) {
                console.log('Initializing audio tracker...');
                this.tracker = new this.AudioTrackerClass(this.p5);
            }

            // Verify tracker initialization
            if (!this.tracker) {
                throw new Error('Failed to create audio tracker');
            }

            this.audioInitialized = true;
            console.log('Core components initialized successfully');
        } catch (error) {
            console.error('Error initializing core components:', error);
            throw error;
        }
    }

    private setupVisualElements(): void {
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

    private setupEventListeners(): void {
        try {
            console.log('Setting up event listeners...');
            const handler = this.handleTrackerEvent.bind(this);
            window.addEventListener('tracker-event', handler as EventListener);
            this._boundTrackerEventHandler = handler;
            console.log('Event listeners setup complete');
        } catch (error) {
            console.error('Error setting up event listeners:', error);
            throw error;
        }
    }

    private handleTrackerEvent(event: TrackerEvent): void {
        if (!this._isInitialized || !this.audioInitialized) return;
        
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
                    if (data.channel !== undefined) {
                        this.createWaveformRing(data.channel);
                    }
                    break;

                case 'sample_select':
                    if (data.sample !== undefined) {
                        this.updateSampleVisualizer(data.sample);
                    }
                    break;
            }
        } catch (error) {
            console.error('Error handling tracker event:', error);
        }
    }

    private setupParticles(): void {
        try {
            this.particles = [];
            const numParticles = 150;
            for (let i = 0; i < numParticles; i++) {
                this.particles.push({
                    x: this.p5.random(this.p5.width),
                    y: this.p5.random(this.p5.height),
                    size: this.p5.random(2, 6),
                    speedX: this.p5.random(-2, 2),
                    speedY: this.p5.random(-2, 2),
                    hue: this.p5.random(360),
                    alpha: this.p5.random(0.3, 0.8),
                    energy: 0
                });
            }
        } catch (error) {
            console.error('Error setting up particles:', error);
            this.particles = [];
        }
    }

    private setupGeometricPatterns(): void {
        try {
            this.geometricPatterns = [];
            const numPatterns = 8;
            const centerX = this.p5.width / 2;
            const centerY = this.p5.height / 2;
            
            for (let i = 0; i < numPatterns; i++) {
                const angle = (i / numPatterns) * this.p5.TWO_PI;
                const radius = 150;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                this.geometricPatterns.push({
                    x,
                    y,
                    rotation: angle,
                    size: 40,
                    baseSize: 40,
                    sides: Math.floor(this.p5.random(3, 8)),
                    hue: (i / numPatterns) * 360,
                    pulsePhase: this.p5.random(this.p5.TWO_PI),
                    energy: 0,
                    orbitAngle: angle,
                    orbitSpeed: 0.001
                });
            }
        } catch (error) {
            console.error('Error setting up geometric patterns:', error);
            this.geometricPatterns = [];
        }
    }

    private createWaveformRing(channel: number): void {
        try {
            const centerX = this.p5.width / 2;
            const centerY = this.p5.height / 2;
            this.waveformRings.push({
                x: centerX,
                y: centerY,
                radius: 50,
                maxRadius: 200,
                channel: channel,
                alpha: 1,
                rotation: this.p5.random(this.p5.TWO_PI)
            });
        } catch (error) {
            console.error('Error creating waveform ring:', error);
        }
    }

    private updateSampleVisualizer(sampleIndex: number): void {
        try {
            const samples = (audioManager as any).samples;
            const sample = samples?.[sampleIndex];
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

    private updateParticles(midFreq: number, bassIntensity: number): void {
        try {
            const centerX = this.p5.width / 2;
            const centerY = this.p5.height / 2;
            
            this.particles.forEach(p => {
                // Update particle energy
                p.energy = this.p5.lerp(p.energy, bassIntensity, 0.1);
                
                // Calculate direction to center
                const dx = centerX - p.x;
                const dy = centerY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // Add circular motion
                const rotationSpeed = 0.02 * (1 + p.energy);
                const angle = Math.atan2(dy, dx) + rotationSpeed;
                
                // Update velocities with both circular motion and center attraction
                const attraction = 0.02 * bassIntensity;
                p.speedX = p.speedX * 0.95 + (Math.cos(angle) * dist * 0.01 + dx * attraction) * midFreq;
                p.speedY = p.speedY * 0.95 + (Math.sin(angle) * dist * 0.01 + dy * attraction) * midFreq;
                
                // Apply speed limits
                const maxSpeed = 5 * (1 + p.energy);
                const currentSpeed = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);
                if (currentSpeed > maxSpeed) {
                    p.speedX = (p.speedX / currentSpeed) * maxSpeed;
                    p.speedY = (p.speedY / currentSpeed) * maxSpeed;
                }
                
                // Update position
                p.x += p.speedX;
                p.y += p.speedY;
                
                // Wrap around screen edges with smooth transition
                const buffer = 50;
                if (p.x < -buffer) p.x = this.p5.width + buffer;
                if (p.x > this.p5.width + buffer) p.x = -buffer;
                if (p.y < -buffer) p.y = this.p5.height + buffer;
                if (p.y > this.p5.height + buffer) p.y = -buffer;
                
                // Update visual properties
                p.hue = (p.hue + p.energy * 2) % 360;
                p.alpha = this.p5.map(p.energy, 0, 1, 0.3, 0.8);
                p.size = this.p5.map(p.energy, 0, 1, 2, 8);
            });
        } catch (error) {
            console.error('Error updating particles:', error);
        }
    }

    private updateWaveformRings(): void {
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

    private detectBeat(bassIntensity: number, currentTime: number): boolean {
        const threshold = 0.35; // Lower threshold to catch kicks better
        const minInterval = this.beatInterval / 2; // Sync with our pattern's timing
        
        // Detect strong bass hits (kicks)
        if (bassIntensity > threshold && (currentTime - this.lastBeatTime) > minInterval) {
            this.lastBeatTime = currentTime;
            // Update beat interval based on tempo (if needed)
            const tempo = audioManager.getAudioMetrics()?.bpm || 120;
            this.beatInterval = (60 / tempo) * 1000 / 2; // Convert BPM to ms per half-beat
            return true;
        }
        return false;
    }

    draw(_amplitude: number = 0, _frequency: number = 440): void {
        if (!this._isInitialized) {
            this.drawLoadingState();
            return;
        }

        try {
            // Draw background with fade effect
            this.p5.push();
            this.p5.fill(0, 30);
            this.p5.noStroke();
            this.p5.rect(0, 0, this.p5.width, this.p5.height);
            this.p5.pop();

            // Get audio metrics with error handling
            let metrics: AudioMetrics;
            try {
                metrics = audioManager.getAudioMetrics() || {} as AudioMetrics;
            } catch (error) {
                console.error('Error getting audio metrics:', error);
                metrics = {} as AudioMetrics;
            }

            // Update and draw visual elements
            const midFreq = parseFloat(metrics.midIntensity) || 0;
            const highFreq = parseFloat(metrics.highIntensity) || 0;
            const bassIntensity = parseFloat(metrics.bassIntensity) || 0;
            const waveform = metrics.waveform || new Float32Array(1024);
            const currentTime = Date.now();
            const isBeat = this.detectBeat(bassIntensity, currentTime);

            this.updateParticles(midFreq, bassIntensity);
            this.updateWaveformRings();
            this.updateGeometricPatterns(highFreq, bassIntensity, isBeat);
            
            this.drawParticles();
            this.drawGeometricPatterns();
            this.drawWaveformRings(waveform);

            // Draw tracker if available
            if (this.tracker && this.audioInitialized) {
                this.tracker.draw(metrics);
            }
        } catch (error) {
            console.error('Error in beat scene draw:', error);
            this.drawErrorState(error as Error);
        }
    }

    private updateGeometricPatterns(highFreq: number, bassIntensity: number, isBeat: boolean): void {
        const centerX = this.p5.width / 2;
        const centerY = this.p5.height / 2;
        
        this.geometricPatterns.forEach((pattern, index) => {
            // Update energy with smooth transition
            pattern.energy = this.p5.lerp(pattern.energy, bassIntensity, 0.1);
            
            // Update orbit
            pattern.orbitSpeed = 0.001 + pattern.energy * 0.01;
            pattern.orbitAngle += pattern.orbitSpeed;
            
            // Calculate new position based on orbit
            const orbitRadius = 150 * (1 + pattern.energy * 0.2);
            pattern.x = centerX + Math.cos(pattern.orbitAngle) * orbitRadius;
            pattern.y = centerY + Math.sin(pattern.orbitAngle) * orbitRadius;
            
            // Update rotation based on high frequencies
            pattern.rotation += 0.02 + highFreq * 0.1;
            
            // Update size with pulse effect
            pattern.pulsePhase += 0.05;
            const basePulse = Math.sin(pattern.pulsePhase) * 10;
            const beatPulse = isBeat ? 20 : 0;
            pattern.size = pattern.baseSize * (1 + pattern.energy) + basePulse + beatPulse;
            
            // Update color based on energy
            pattern.hue = (index * 45 + pattern.energy * 30) % 360;
        });
    }

    private drawLoadingState(): void {
        this.p5.push();
        this.p5.background(0);
        this.p5.fill(255);
        this.p5.noStroke();
        this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
        this.p5.text('Loading...', this.p5.width / 2, this.p5.height / 2);
        this.p5.pop();
    }

    private drawErrorState(error: Error): void {
        this.p5.push();
        this.p5.background(0);
        this.p5.fill(255, 0, 0);
        this.p5.noStroke();
        this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
        this.p5.text('Error: ' + error.message, this.p5.width / 2, this.p5.height / 2);
        this.p5.pop();
    }

    private drawParticles(): void {
        try {
            this.p5.push();
            this.p5.colorMode(this.p5.HSB);
            this.p5.blendMode(this.p5.ADD);
            this.p5.noStroke();
            
            this.particles.forEach(p => {
                const glowSize = p.size * 2;
                
                // Draw particle glow
                this.p5.fill(p.hue, 80, 100, p.alpha * 0.3);
                this.p5.circle(p.x, p.y, glowSize);
                
                // Draw particle core
                this.p5.fill(p.hue, 80, 100, p.alpha);
                this.p5.circle(p.x, p.y, p.size);
                
                // Draw energy trail
                if (p.energy > 0.5) {
                    const trailLength = p.energy * 10;
                    this.p5.stroke(p.hue, 80, 100, p.alpha * 0.5);
                    this.p5.strokeWeight(1);
                    this.p5.line(
                        p.x, p.y,
                        p.x - p.speedX * trailLength,
                        p.y - p.speedY * trailLength
                    );
                }
            });
            
            this.p5.blendMode(this.p5.BLEND);
            this.p5.pop();
        } catch (error) {
            console.error('Error drawing particles:', error);
        }
    }

    private drawWaveformRings(waveform: Float32Array): void {
        try {
            this.p5.push();
            this.p5.colorMode(this.p5.HSB);
            this.p5.blendMode(this.p5.ADD);
            this.p5.noFill();
            
            this.waveformRings.forEach(ring => {
                const channelHue = (ring.channel * 30 + 180) % 360;
                
                // Draw outer glow
                this.p5.stroke(channelHue, 80, 100, ring.alpha * 0.3);
                this.p5.strokeWeight(4);
                this.drawWaveformRing(ring, waveform, 1.1);
                
                // Draw main ring
                this.p5.stroke(channelHue, 80, 100, ring.alpha);
                this.p5.strokeWeight(2);
                this.drawWaveformRing(ring, waveform, 1.0);
            });
            
            this.p5.blendMode(this.p5.BLEND);
            this.p5.pop();
        } catch (error) {
            console.error('Error drawing waveform rings:', error);
        }
    }

    private drawWaveformRing(ring: WaveformRing, waveform: Float32Array, scale: number): void {
        this.p5.push();
        this.p5.translate(ring.x, ring.y);
        this.p5.rotate(ring.rotation);
        
        this.p5.beginShape();
        for (let i = 0; i < waveform.length; i++) {
            const angle = (i / waveform.length) * this.p5.TWO_PI;
            const r = ring.radius * scale + waveform[i] * 50;
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            this.p5.vertex(x, y);
        }
        this.p5.endShape(this.p5.CLOSE);
        this.p5.pop();
    }

    private drawGeometricPatterns(): void {
        try {
            this.p5.push();
            this.p5.colorMode(this.p5.HSB);
            this.p5.blendMode(this.p5.ADD);
            this.p5.noFill();
            
            this.geometricPatterns.forEach(pattern => {
                this.p5.push();
                this.p5.translate(pattern.x, pattern.y);
                this.p5.rotate(pattern.rotation);
                
                // Draw outer glow
                this.p5.stroke(pattern.hue, 80, 100, 0.3);
                this.p5.strokeWeight(3);
                this.drawPolygon(pattern.size * 1.1, pattern.sides);
                
                // Draw main shape
                this.p5.stroke(pattern.hue, 80, 100, 0.6);
                this.p5.strokeWeight(2);
                this.drawPolygon(pattern.size, pattern.sides);
                
                // Draw energy lines
                if (pattern.energy > 0.3) {
                    this.p5.stroke(pattern.hue, 80, 100, pattern.energy * 0.5);
                    this.p5.strokeWeight(1);
                    for (let i = 0; i < pattern.sides; i++) {
                        const angle = (i * this.p5.TWO_PI) / pattern.sides;
                        const x = Math.cos(angle) * pattern.size;
                        const y = Math.sin(angle) * pattern.size;
                        this.p5.line(0, 0, x, y);
                    }
                }
                
                this.p5.pop();
            });
            
            this.p5.blendMode(this.p5.BLEND);
            this.p5.pop();
        } catch (error) {
            console.error('Error drawing geometric patterns:', error);
        }
    }

    private drawPolygon(size: number, sides: number): void {
        this.p5.beginShape();
        for (let i = 0; i < sides; i++) {
            const angle = (i * this.p5.TWO_PI) / sides;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            this.p5.vertex(x, y);
        }
        this.p5.endShape(this.p5.CLOSE);
    }

    windowResized(): void {
        this.setupParticles();
        this.setupGeometricPatterns();
    }

    async cleanup(): Promise<void> {
        try {
            console.log('Starting beat scene cleanup');
            this.audioInitialized = false;
            this._isInitialized = false;
            
            // Remove event listeners
            if (this._boundTrackerEventHandler) {
                window.removeEventListener('tracker-event', this._boundTrackerEventHandler as EventListener);
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
            this.p5.blendMode(this.p5.BLEND);
            
            // Wait for cleanup to settle
            await new Promise(resolve => setTimeout(resolve, 200));
            
            console.log('Beat scene cleaned up successfully');
        } catch (error) {
            console.error('Error during beat scene cleanup:', error);
        }
    }
}

export default Beat;
