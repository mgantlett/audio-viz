import type p5 from 'p5';
import { Scene } from '../core/Scene';
import { audioManager } from '../core/audio';
import { MagentaPatternGenerator } from '../core/audio/MagentaPatternGenerator';
import type {
    Particle,
    WaveformRing,
    GeometricPattern,
    MagentaEvent
} from '../types/beat-scene';
import { EventBus } from '../core/EventBus';

export { Beat as default };

export class Beat extends Scene {
    private magentaGenerator: MagentaPatternGenerator | null;
    private particles: Particle[];
    private waveformRings: WaveformRing[];
    private geometricPatterns: GeometricPattern[];
    private audioInitialized: boolean;
    private _boundEventHandler: ((event: MagentaEvent) => void) | null;
    private _isInitialized: boolean = false;
    private lastBeatTime: number = 0;
    private beatHistory: number[] = [];
    private lastBeatEnergy: number = 0;
    private energyHistory: number[] = [];
    private readonly MAX_HISTORY = 30;
    private initializationAttempts: number = 0;
    private readonly MAX_INIT_ATTEMPTS = 3;
    private eventBus: EventBus;

    constructor(p5: p5) {
        super(p5);
        this.magentaGenerator = null;
        this.particles = [];
        this.waveformRings = [];
        this.geometricPatterns = [];
        this.audioInitialized = false;
        this._boundEventHandler = null;
        this.eventBus = EventBus.getInstance();
    }

    async setup(): Promise<boolean> {
        try {
            console.log('Initializing beat scene');

            // Initialize visual elements first
            this.setupVisualElements();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Mark as partially initialized - waiting for audio
            this._isInitialized = true;
            console.log('Beat scene base initialization complete');
            return true;
        } catch (error) {
            console.error('Error initializing beat scene:', error);
            await this.cleanup();
            return false;
        }
    }

    private setupEventListeners(): void {
        try {
            console.log('Setting up event listeners...');
            
            // Listen for audio initialization events
            this.eventBus.on('audio:started', async () => {
                console.log('Audio system started, initializing Magenta...');
                await this.initializeMagenta();
            });

            // Setup Magenta event handler
            const handler = this.handleMagentaEvent.bind(this);
            window.addEventListener('magenta-event', handler as EventListener);
            this._boundEventHandler = handler;
            
            // Add keyboard event listener for pattern generation
            window.addEventListener('keydown', (event: KeyboardEvent) => {
                if (event.key === 'g' || event.key === 'G') {
                    this.generateNewPattern();
                }
            });
            
            console.log('Event listeners setup complete');
        } catch (error) {
            console.error('Error setting up event listeners:', error);
            throw error;
        }
    }

    private async initializeMagenta(): Promise<void> {
        try {
            if (!audioManager.context || audioManager.context.state !== 'running') {
                throw new Error('Audio context not running');
            }

            // Initialize Magenta pattern generator
            console.log('Initializing Magenta pattern generator...');
            this.magentaGenerator = new MagentaPatternGenerator(120); // Start with default tempo
            await this.magentaGenerator.initialize();

            // Generate initial pattern after Magenta is ready
            try {
                const pattern = await this.magentaGenerator.generateDeepHouse();
                if (pattern && audioManager.isInitialized()) {
                    audioManager.setPattern(pattern);
                    this.audioInitialized = true;
                    console.log('Initial pattern set successfully');
                    this.eventBus.emit({ type: 'beat:initialized', success: true });
                } else {
                    throw new Error('Failed to set initial pattern');
                }
            } catch (error) {
                console.error('Error generating initial pattern:', error);
                // Continue initialization with a basic pattern
                const basicPattern = this.magentaGenerator.getCurrentPattern();
                if (basicPattern) {
                    audioManager.setPattern(basicPattern);
                    this.audioInitialized = true;
                    console.log('Fallback pattern set successfully');
                    this.eventBus.emit({ type: 'beat:initialized', success: true });
                }
            }

            console.log('Magenta initialization complete');
        } catch (error) {
            console.error('Error initializing Magenta:', error);
            this.eventBus.emit({ type: 'beat:error', error: error as Error });
            throw error;
        }
    }

    private async generateNewPattern(): Promise<void> {
        if (this.magentaGenerator && this.audioInitialized) {
            try {
                const pattern = await this.magentaGenerator.generateDeepHouse();
                if (pattern && audioManager.isInitialized()) {
                    audioManager.setPattern(pattern);
                    console.log('Generated new Deep House pattern');
                }
            } catch (error) {
                console.error('Error generating new pattern:', error);
                // Use current pattern as fallback
                const currentPattern = this.magentaGenerator.getCurrentPattern();
                if (currentPattern) {
                    audioManager.setPattern(currentPattern);
                }
            }
        }
    }

    private handleMagentaEvent(event: MagentaEvent): void {
        if (!this._isInitialized || !this.audioInitialized) return;
        
        try {
            const { type, pattern } = event.detail;
            
            if (type === 'pattern_generate' && pattern) {
                this.createWaveformRing(0);
            }
        } catch (error) {
            console.error('Error handling Magenta event:', error);
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

    draw(_amplitude: number = 0, _frequency: number = 440): void {
        if (!this._isInitialized) {
            this.drawLoadingState();
            return;
        }

        if (!this.audioInitialized) {
            this.drawWaitingForAudioState();
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
            const metrics = audioManager.getAudioMetrics() || {
                midIntensity: '0',
                highIntensity: '0',
                bassIntensity: '0',
                waveform: new Float32Array(1024)
            };

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
        } catch (error) {
            console.error('Error in beat scene draw:', error);
            this.drawErrorState(error as Error);
        }
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

    private drawWaitingForAudioState(): void {
        this.p5.push();
        this.p5.background(0);
        this.p5.fill(255);
        this.p5.noStroke();
        this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
        this.p5.text('Click "Initialize Audio System" to start', this.p5.width / 2, this.p5.height / 2);
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

    private detectBeat(bassIntensity: number, currentTime: number): boolean {
        // Add current energy to history
        this.energyHistory.push(bassIntensity);
        if (this.energyHistory.length > this.MAX_HISTORY) {
            this.energyHistory.shift();
        }

        // Calculate average energy and variance
        const averageEnergy = this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length;
        const variance = this.energyHistory.reduce((a, b) => a + Math.pow(b - averageEnergy, 2), 0) / this.energyHistory.length;
        
        // Dynamic threshold based on recent history and variance
        const dynamicThreshold = averageEnergy + Math.sqrt(variance) * 1.5;

        // Sync with current tempo and add some flexibility
        const tempo = audioManager.currentTempo;
        const minInterval = Math.min(60000 / (tempo * 1.1), 60000 / (tempo * 2));
        const timeSinceLastBeat = currentTime - this.lastBeatTime;
        
        if (bassIntensity > dynamicThreshold && timeSinceLastBeat > minInterval) {
            this.lastBeatTime = currentTime;
            this.lastBeatEnergy = bassIntensity;
            this.beatHistory.push(currentTime);
            
            // Keep only recent beats for visualization
            while (this.beatHistory.length > 0 && currentTime - this.beatHistory[0] > 2000) {
                this.beatHistory.shift();
            }
            
            return true;
        }
        return false;
    }

    private updateGeometricPatterns(highFreq: number, bassIntensity: number, isBeat: boolean): void {
        const centerX = this.p5.width / 2;
        const centerY = this.p5.height / 2;
        const currentTime = Date.now();
        
        this.geometricPatterns.forEach((pattern, index) => {
            // Enhanced energy calculation with beat influence
            const beatEnergy = isBeat ? this.lastBeatEnergy * 2 : 0;
            pattern.energy = this.p5.lerp(pattern.energy, bassIntensity + beatEnergy, 0.2);
            
            // Dynamic orbit behavior
            const beatPhase = this.beatHistory.length > 0 ? 
                Math.sin((currentTime - this.beatHistory[0]) / 500 * Math.PI) : 0;
            pattern.orbitSpeed = 0.001 + pattern.energy * 0.01 + beatPhase * 0.005;
            pattern.orbitAngle += pattern.orbitSpeed;
            
            // Enhanced position calculation with wobble
            const orbitRadius = 150 * (1 + pattern.energy * 0.3 + beatPhase * 0.2);
            const wobble = Math.sin(currentTime * 0.003 + index) * 20 * pattern.energy;
            pattern.x = centerX + Math.cos(pattern.orbitAngle) * (orbitRadius + wobble);
            pattern.y = centerY + Math.sin(pattern.orbitAngle) * (orbitRadius + wobble);
            
            // Enhanced rotation with beat influence
            pattern.rotation += 0.02 + highFreq * 0.1 + (isBeat ? 0.2 : 0);
            
            // Dynamic size modulation
            pattern.pulsePhase += 0.05 + pattern.energy * 0.02;
            const basePulse = Math.sin(pattern.pulsePhase) * 10;
            const beatPulse = isBeat ? 30 * this.lastBeatEnergy : 0;
            const energyPulse = pattern.energy * 20;
            pattern.size = pattern.baseSize * (1 + pattern.energy) + basePulse + beatPulse + energyPulse;
            
            // Enhanced color modulation
            const hueShift = beatPhase * 30 + pattern.energy * 60;
            pattern.hue = (index * 45 + hueShift) % 360;
        });
    }

    private updateParticles(midFreq: number, bassIntensity: number): void {
        const centerX = this.p5.width / 2;
        const centerY = this.p5.height / 2;
        const currentTime = Date.now();
        
        this.particles.forEach(p => {
            // Enhanced energy calculation with beat influence
            const beatInfluence = this.beatHistory.length > 0 ? 
                Math.exp(-(currentTime - this.beatHistory[this.beatHistory.length - 1]) / 500) : 0;
            p.energy = this.p5.lerp(p.energy, bassIntensity + beatInfluence, 0.15);
            
            // Calculate direction with enhanced movement
            const dx = centerX - p.x;
            const dy = centerY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Enhanced circular motion
            const rotationSpeed = 0.02 * (1 + p.energy * 2);
            const angle = Math.atan2(dy, dx) + rotationSpeed;
            
            // Add wave motion
            const wavePhase = currentTime * 0.001 + p.hue * 0.1;
            const waveAmplitude = 2 * p.energy;
            const waveX = Math.sin(wavePhase) * waveAmplitude;
            const waveY = Math.cos(wavePhase) * waveAmplitude;
            
            // Update velocities with enhanced movement
            const attraction = 0.02 * (bassIntensity + beatInfluence);
            p.speedX = p.speedX * 0.95 + (Math.cos(angle) * dist * 0.01 + dx * attraction) * midFreq + waveX;
            p.speedY = p.speedY * 0.95 + (Math.sin(angle) * dist * 0.01 + dy * attraction) * midFreq + waveY;
            
            // Enhanced speed limits
            const maxSpeed = 5 * (1 + p.energy * 2);
            const currentSpeed = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);
            if (currentSpeed > maxSpeed) {
                p.speedX = (p.speedX / currentSpeed) * maxSpeed;
                p.speedY = (p.speedY / currentSpeed) * maxSpeed;
            }
            
            // Update position
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Enhanced screen wrapping
            const buffer = 50;
            if (p.x < -buffer) p.x = this.p5.width + buffer;
            if (p.x > this.p5.width + buffer) p.x = -buffer;
            if (p.y < -buffer) p.y = this.p5.height + buffer;
            if (p.y > this.p5.height + buffer) p.y = -buffer;
            
            // Enhanced visual properties
            const beatColorShift = beatInfluence * 60;
            p.hue = (p.hue + p.energy * 2 + beatColorShift) % 360;
            p.alpha = this.p5.map(p.energy + beatInfluence, 0, 1, 0.3, 0.9);
            p.size = this.p5.map(p.energy + beatInfluence, 0, 1, 2, 10);
        });
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

    private drawParticles(): void {
        try {
            this.p5.push();
            this.p5.colorMode(this.p5.HSB);
            this.p5.blendMode(this.p5.ADD);
            this.p5.noStroke();
            
            const currentTime = Date.now();
            const beatActive = this.beatHistory.length > 0 && 
                             currentTime - this.beatHistory[this.beatHistory.length - 1] < 200;
            
            this.particles.forEach(p => {
                const glowSize = p.size * (beatActive ? 3 : 2);
                const energyScale = 1 + p.energy * (beatActive ? 2 : 1);
                
                // Enhanced particle glow
                this.p5.fill(p.hue, 80, 100, p.alpha * 0.3 * energyScale);
                this.p5.circle(p.x, p.y, glowSize);
                
                // Enhanced particle core
                this.p5.fill(p.hue, 80, 100, p.alpha * energyScale);
                this.p5.circle(p.x, p.y, p.size);
                
                // Enhanced energy trail
                if (p.energy > 0.3) {
                    const trailLength = p.energy * (beatActive ? 15 : 10);
                    this.p5.stroke(p.hue, 80, 100, p.alpha * 0.5 * energyScale);
                    this.p5.strokeWeight(beatActive ? 2 : 1);
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
            if (this._boundEventHandler) {
                window.removeEventListener('magenta-event', this._boundEventHandler as EventListener);
                this._boundEventHandler = null;
            }
            
            // Clean up Magenta generator
            this.magentaGenerator = null;
            
            // Clear visual elements
            this.particles = [];
            this.waveformRings = [];
            this.geometricPatterns = [];
            
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
