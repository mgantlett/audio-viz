import './style.css';
import p5 from 'p5';
import { app } from './core/App';
import { registerScenes } from './scenes';
import './components'; // This will initialize all components

// Create p5 instance
const sketch = (p: p5): void => {
    p.setup = function(): void {
        console.log('Setting up visualization');
        
        // Create canvas inside container
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent('canvas-container');

        // Store p5 instance globally
        window.p5Instance = p;

        // Initialize scenes first
        try {
            // Wait for SceneManager to be available
            if (!window.sceneManager) {
                throw new Error('SceneManager not initialized');
            }

            // Register scenes
            registerScenes(p);
            
            console.log('Managers initialized successfully');
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    };

    p.draw = function(): void {
        try {
            // Clear background
            p.background(0);

            // Draw current scene through SceneManager
            if (window.sceneManager) {
                window.sceneManager.draw();
            }
        } catch (error) {
            // If there's an error in the draw loop, show it on screen
            p.background(0);
            p.fill(255, 0, 0);
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(16);
            if (error instanceof Error) {
                p.text("Error: " + error.message, p.width/2, p.height/2);
            }
            console.error('Error in draw loop:', error);
        }
    };

    p.windowResized = function(): void {
        try {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
            if (window.sceneManager) {
                window.sceneManager.windowResized();
            }
        } catch (error) {
            console.error('Error handling window resize:', error);
        }
    };

    // Add mouse move handler for audio control
    p.mouseMoved = function(): void {
        try {
            if (window.sceneManager && 
                window.audioManager && 
                window.audioManager.isInitialized() &&
                window.audioManager.isPlaying) {
                const freq = p.map(p.mouseX, 0, p.width, 200, 800);
                const amp = p.map(p.mouseY, 0, p.height, 1, 0);
                window.audioManager.setFrequency(freq);
                window.audioManager.setAmplitude(amp);
            }
        } catch (error) {
            console.error('Error handling mouse move:', error);
        }
    };
};

// Wait for DOMContentLoaded before initializing
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize app first
        await app.initialize();
        
        // Create p5 instance
        new p5(sketch);
        
        // Error handling for p5.js
        window.addEventListener('error', function(e: ErrorEvent) {
            console.error('Global error:', e.error);
            // Show error on canvas if possible
            try {
                const p = window.p5Instance;
                if (p) {
                    p.background(0);
                    p.fill(255, 0, 0);
                    p.noStroke();
                    p.textAlign(p.CENTER, p.CENTER);
                    p.textSize(16);
                    p.text("Error: " + e.error.message, p.width/2, p.height/2);
                }
            } catch (err) {
                console.error('Error displaying error message:', err);
            }
        });
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});
