import audioManager from './core/audio/index.js';
import Scene from './core/Scene.js';
import { StickFiguresScene } from './scenes/stickFigures.js';
import { ParticleWaveScene } from './scenes/particleWave.js';
import { BeatScene } from './scenes/beatScene.js';
import './core/sceneManager.js';  // Import SceneManager to ensure it's loaded

// Create p5 instance
const sketch = (p) => {
    p.setup = function() {
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
            window.sceneManager.registerScene('scene1', new StickFiguresScene());
            window.sceneManager.registerScene('scene2', new ParticleWaveScene());
            window.sceneManager.registerScene('scene3', new BeatScene());
            
            // Then initialize managers
            window.uiManager.initialize();
            window.sceneManager.initialize();
            
            console.log('Managers initialized successfully');
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    };

    p.draw = function() {
        try {
            // Clear background
            p.background(0);

            // Safely check for sceneManager
            if (!window.sceneManager) {
                throw new Error('SceneManager not initialized');
            }

            const audioInitialized = audioManager.isInitialized();
            const isEnhancedMode = window.sceneManager.isEnhancedMode;

            // Update audio parameters based on mouse position if audio is active
            if (!isEnhancedMode && audioInitialized) {
                audioManager.mapMouseToAudio(p.mouseX, p.mouseY, p.width, p.height);
            }

            // Draw current scene
            window.sceneManager.draw();

            // Draw instructions
            if (!audioInitialized) {
                // Show start audio instruction
                p.fill(255);
                p.noStroke();
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(16);
                p.text("Click the button to start audio", p.width/2, p.height - 50);
            } else {
                // Show scene-specific controls
                p.fill(255, 100);
                p.noStroke();
                p.textAlign(p.LEFT, p.BOTTOM);
                p.textSize(14);
                
                if (isEnhancedMode) {
                    // Beat scene controls
                    p.text("Use + / - keys or mouse wheel to adjust tempo", 20, p.height - 20);
                } else {
                    // Original scene controls
                    p.text("Move mouse left/right to change pitch", 20, p.height - 40);
                    p.text("Move mouse up/down to change volume", 20, p.height - 20);
                }

                // Show scene switching hint
                p.textAlign(p.RIGHT, p.BOTTOM);
                p.text("Press 1, 2, or 3 to switch scenes", p.width - 20, p.height - 20);
            }
        } catch (error) {
            // If there's an error in the draw loop, show it on screen
            p.background(0);
            p.fill(255, 0, 0);
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(16);
            p.text("Error: " + error.message, p.width/2, p.height/2);
            console.error('Error in draw loop:', error);
        }
    };

    p.windowResized = function() {
        try {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
            if (window.sceneManager) {
                window.sceneManager.windowResized();
            }
        } catch (error) {
            console.error('Error handling window resize:', error);
        }
    };
};

// Initialize everything after the page loads
window.addEventListener('load', () => {
    try {
        // Create p5 instance
        new p5(sketch);
        
        // Error handling for p5.js
        window.addEventListener('error', function(e) {
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
        console.error('Error creating p5 instance:', error);
    }
});
