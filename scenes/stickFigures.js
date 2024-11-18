import Scene from '../core/Scene.js';

class StickFigure {
    constructor(p, x, y) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.scale = 1;
        this.rotation = 0;
        this.baseY = y;
    }

    draw(energy) {
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
        let armAngle = this.p.sin(this.p.frameCount * 0.1 + this.x) * energy;
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
        
        // Legs
        let legAngle = this.p.sin(this.p.frameCount * 0.1 + this.x) * energy;
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

    update(energy) {
        this.scale = this.p.map(energy, 0, 1, 0.8, 1.2);
        this.rotation = this.p.map(this.p.sin(this.p.frameCount * 0.05 + this.x), -1, 1, -0.2, 0.2);
        this.y = this.baseY + this.p.sin(this.p.frameCount * 0.05 + this.x) * 20 * energy;
    }
}

export class StickFiguresScene extends Scene {
    constructor() {
        super();
        this.figures = [];
        this.NUM_FIGURES = 3;
    }

    initialize() {
        console.log('Initializing stick figures scene');
        this.setupFigures();
    }

    setupFigures() {
        this.figures = [];
        for (let i = 0; i < this.NUM_FIGURES; i++) {
            let x = this.p.map(i, 0, this.NUM_FIGURES-1, this.p.width*0.2, this.p.width*0.8);
            this.figures.push(new StickFigure(this.p, x, this.p.height/2));
        }
    }

    draw(amplitude, frequency) {
        // Clear background
        this.p.background(0);
        
        // Update and draw figures
        this.figures.forEach(figure => {
            figure.update(amplitude);
            figure.draw(amplitude);
        });
    }

    windowResized() {
        this.setupFigures();
    }

    cleanup() {
        // Nothing to clean up for this scene
    }
}
