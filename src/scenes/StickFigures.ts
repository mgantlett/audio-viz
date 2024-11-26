import type p5 from 'p5';
import { Scene } from '../core/Scene';
import type { EventBus } from '../core/EventBus';

interface StickFigure {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    velocity: number;
    armAngle: number;
    legAngle: number;
    targetArmAngle: number;
    targetLegAngle: number;
}

export class StickFigures extends Scene {
    private figures: StickFigure[] = [];
    private readonly numFigures = 3;
    private readonly baseScale = 120; // Increased from 50 to 120
    private currentVolume = 0;
    private currentFrequency = 440;
    private time = 0;

    constructor(p5: p5, eventBus: EventBus) {
        super(p5, eventBus);
    }

    public async initialize(): Promise<void> {
        // Initialize stick figures with vertical spacing
        const verticalSpacing = this.p5.height / (this.numFigures + 1);
        
        for (let i = 0; i < this.numFigures; i++) {
            this.figures.push({
                x: this.p5.width / 2, // Center horizontally
                y: verticalSpacing * (i + 1), // Space evenly vertically
                scale: this.baseScale,
                rotation: 0,
                velocity: 0,
                armAngle: 0,
                legAngle: 0,
                targetArmAngle: 0,
                targetLegAngle: 0
            });
        }
    }

    public handleAudio(volume: number, frequency: number): void {
        this.currentVolume = volume;
        this.currentFrequency = frequency;
    }

    public draw(p: p5): void {
        // Update time
        this.time += 0.05;

        // Clear background
        p.background(0);

        // Update and draw each figure
        this.figures.forEach((figure, index) => {
            // Calculate velocity based on frequency
            const targetVelocity = p.map(this.currentFrequency, 220, 880, -8, 8);
            figure.velocity = p.lerp(figure.velocity, targetVelocity, 0.1);
            
            // Update position with wider movement range
            figure.x += figure.velocity;
            
            // Keep figure in bounds with padding based on scale
            const padding = figure.scale * 0.5;
            if (figure.x < padding) {
                figure.x = padding;
                figure.velocity *= -0.8;
            } else if (figure.x > p.width - padding) {
                figure.x = p.width - padding;
                figure.velocity *= -0.8;
            }
            
            // Update scale and rotation based on volume
            figure.scale = this.baseScale * (1 + this.currentVolume * 0.5);
            figure.rotation = p.sin(this.time + index) * this.currentVolume * 0.3;

            // Update limb angles
            const baseFreq = p.map(this.currentFrequency, 220, 880, 0.5, 2);
            const armPhase = this.time * baseFreq + index * p.PI / 2;
            const legPhase = this.time * baseFreq + index * p.PI / 2 + p.PI;
            
            figure.targetArmAngle = p.sin(armPhase) * this.currentVolume * p.PI / 2;
            figure.targetLegAngle = p.sin(legPhase) * this.currentVolume * p.PI / 3;
            
            figure.armAngle = p.lerp(figure.armAngle, figure.targetArmAngle, 0.2);
            figure.legAngle = p.lerp(figure.legAngle, figure.targetLegAngle, 0.2);

            // Draw stick figure
            p.push();
            p.translate(figure.x, figure.y);
            p.rotate(figure.rotation);
            p.scale(figure.scale / this.baseScale);
            
            p.stroke(255);
            p.strokeWeight(3); // Increased line thickness
            p.noFill();
            
            // Head
            p.circle(0, -20, 25); // Slightly larger head
            
            // Body
            p.line(0, -10, 0, 25); // Slightly longer body
            
            // Arms
            p.push();
            p.translate(0, 0);
            p.rotate(figure.armAngle);
            p.line(-20, 0, 20, 0); // Longer arms
            
            // Draw hands
            p.push();
            p.translate(-20, 0);
            p.rotate(-figure.armAngle * 0.5);
            p.line(0, 0, 0, 10);
            p.pop();
            
            p.push();
            p.translate(20, 0);
            p.rotate(figure.armAngle * 0.5);
            p.line(0, 0, 0, 10);
            p.pop();
            p.pop();
            
            // Legs
            p.push();
            p.translate(0, 25);
            
            // Left leg
            p.push();
            p.rotate(-figure.legAngle);
            p.line(0, 0, -15, 25); // Longer legs
            // Foot
            p.translate(-15, 25);
            p.rotate(figure.legAngle * 0.5);
            p.line(0, 0, -8, 0);
            p.pop();
            
            // Right leg
            p.push();
            p.rotate(figure.legAngle);
            p.line(0, 0, 15, 25);
            // Foot
            p.translate(15, 25);
            p.rotate(-figure.legAngle * 0.5);
            p.line(0, 0, 8, 0);
            p.pop();
            
            p.pop();
            
            p.pop();
        });
    }

    public handleResize(): void {
        // Update figure positions on resize
        const verticalSpacing = this.p5.height / (this.numFigures + 1);
        this.figures.forEach((figure, i) => {
            figure.x = this.p5.width / 2;
            figure.y = verticalSpacing * (i + 1);
        });
    }

    public cleanup(): void {
        this.figures = [];
    }
}
