import type p5 from 'p5';
import { Scene } from '../core/Scene';

class StickFigure {
    private p: p5;
    private x: number;
    private y: number;
    private scale: number;
    private rotation: number;
    private baseY: number;
    private phaseOffset: number;

    constructor(p: p5, x: number, y: number, phaseOffset: number = 0) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.scale = 1;
        this.rotation = 0;
        this.baseY = y;
        this.phaseOffset = phaseOffset;
    }

    draw(energy: number): void {
        // Ensure energy is a valid number and not NaN, with minimum value
        energy = isNaN(energy) ? 0.1 : Math.max(energy, 0.1);
        
        this.p.push();
        this.p.translate(this.x, this.y);
        this.p.rotate(this.rotation);
        this.p.scale(this.scale);

        this.p.stroke(255);
        this.p.strokeWeight(2);
        this.p.noFill();

        // Head
        this.p.circle(0, -50, 20);

        // Body
        this.p.line(0, -40, 0, 10);

        // Arms
        // Slower base movement speed that scales with energy
        const baseSpeed = 0.03;
        const armSpeed = baseSpeed + (energy * 0.07);  // ranges from 0.03 to 0.1
        const armAngle = this.p.sin(this.p.frameCount * armSpeed + this.phaseOffset) * energy;
        this.p.push();
        this.p.translate(0, -30);
        this.p.rotate(armAngle);
        this.p.line(0, 0, 30, 0);
        this.p.pop();

        this.p.push();
        this.p.translate(0, -30);
        this.p.rotate(-armAngle);
        this.p.line(0, 0, -30, 0);
        this.p.pop();

        // Legs with same speed scaling as arms
        const legAngle = this.p.sin(this.p.frameCount * armSpeed + this.phaseOffset) * energy;
        this.p.push();
        this.p.translate(0, 10);
        this.p.rotate(legAngle);
        this.p.line(0, 0, 20, 30);
        this.p.pop();

        this.p.push();
        this.p.translate(0, 10);
        this.p.rotate(-legAngle);
        this.p.line(0, 0, -20, 30);
        this.p.pop();

        this.p.pop();
    }

    update(energy: number): void {
        // Ensure energy is a valid number and not NaN, with minimum value
        energy = isNaN(energy) ? 0.1 : Math.max(energy, 0.1);
        
        // Scale slightly even at low energy
        this.scale = this.p.map(energy, 0, 1, 0.9, 1.1);
        
        // Slower body rotation with energy-based speed
        const bodySpeed = baseSpeed + (energy * 0.04);  // ranges from 0.03 to 0.07
        this.rotation = this.p.map(
            this.p.sin(this.p.frameCount * bodySpeed + this.phaseOffset),
            -1,
            1,
            -0.15,
            0.15
        );
        
        // Smoother vertical movement
        this.y = this.baseY + this.p.sin(this.p.frameCount * bodySpeed + this.phaseOffset) * 15 * energy;
    }
}

export class StickFigures extends Scene {
    private figures: StickFigure[] = [];
    private readonly NUM_FIGURES = 3;

    constructor(p5: p5) {
        super(p5);
    }

    async setup(): Promise<boolean> {
        try {
            console.log('Initializing stick figures scene');
            this.setupFigures();
            return true;
        } catch (error) {
            console.error('Error initializing stick figures scene:', error);
            return false;
        }
    }

    private setupFigures(): void {
        this.figures = [];
        for (let i = 0; i < this.NUM_FIGURES; i++) {
            const x = this.p5.map(i, 0, this.NUM_FIGURES - 1, this.p5.width * 0.2, this.p5.width * 0.8);
            // Add phase offset property to create smooth wave-like movement
            const phaseOffset = (i * Math.PI * 0.33);  // Each figure is 1/6 cycle out of phase
            this.figures.push(new StickFigure(this.p5, x, this.p5.height / 2, phaseOffset));
        }
    }

    draw(amplitude: number = 0, _frequency: number = 440): void {
        try {
            // Clear background
            this.p5.background(0);

            // Ensure amplitude is a valid number and not NaN, with a minimum value for default animation
            amplitude = isNaN(amplitude) ? 0.1 : Math.max(amplitude, 0.1);

            // Update and draw figures
            this.figures.forEach(figure => {
                figure.update(amplitude);
                figure.draw(amplitude);
            });
        } catch (error) {
            console.error('Error in StickFigures draw:', error);
            // Draw figures with minimum animation if there's an error
            this.p5.background(0);
            this.figures.forEach(figure => {
                figure.update(0.1);
                figure.draw(0.1);
            });
        }
    }

    windowResized(): void {
        this.setupFigures();
    }

    async cleanup(): Promise<void> {
        // Reset figures array
        this.figures = [];
    }
}

export default StickFigures;
