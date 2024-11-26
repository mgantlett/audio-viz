import './style.css';
import p5 from 'p5';
import { app } from './core/App';
import { registerScenes } from './scenes';

// Create p5 instance
const sketch = (p: p5): void => {
    p.setup = async function(): Promise<void> {
        console.log('[p5] Setting up visualization');
        
        // Create canvas inside container
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent('canvas-container');
        canvas.style('display', 'block');
        canvas.style('cursor', 'crosshair');

        // Store p5 instance globally
        window.p5Instance = p;

        try {
            // Initialize app first to set up core systems
            console.log('[p5] Initializing app...');
            await app.initialize();

            // Register scenes after core systems are ready
            console.log('[p5] Registering scenes...');
            await registerScenes(p);

            console.log('[p5] Setup completed successfully');
        } catch (error) {
            console.error('[p5] Error in setup:', error);
        }
    };

    p.draw = function(): void {
        try {
            // Clear background
            p.background(0);

            // Draw current scene through SceneManager
            if (window.sceneManager) {
                window.sceneManager.draw(p);
            }
        } catch (error) {
            console.error('[p5] Error in draw loop:', error);
            // If there's an error in the draw loop, show it on screen
            p.background(0);
            p.fill(255, 0, 0);
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(16);
            if (error instanceof Error) {
                p.text("Error: " + error.message, p.width/2, p.height/2);
            }
        }
    };

    p.windowResized = function(): void {
        try {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
            if (window.sceneManager) {
                window.sceneManager.handleResize();
            }
        } catch (error) {
            console.error('[p5] Error handling window resize:', error);
        }
    };

    const handleInteraction = function(x: number, y: number): void {
        try {
            if (window.sceneManager && window.audioManager?.isPlaying) {
                // Map mouse coordinates to canvas dimensions
                const canvasX = p.constrain(x, 0, p.width);
                const canvasY = p.constrain(y, 0, p.height);
                
                window.sceneManager.handleInteraction(canvasX, canvasY, p.width, p.height);
            }
        } catch (error) {
            console.error('[p5] Error handling interaction:', error);
        }
    };

    // Add mouse move handler
    p.mouseMoved = function(event: MouseEvent): void {
        handleInteraction(p.mouseX, p.mouseY);
        event.preventDefault();
    };

    // Add mouse drag handler (for better mobile support)
    p.mouseDragged = function(event: MouseEvent): void {
        handleInteraction(p.mouseX, p.mouseY);
        event.preventDefault();
    };

    // Add touch move handler
    p.touchMoved = function(event: TouchEvent): void {
        if (p.touches.length > 0) {
            const touch = p.touches[0] as { x: number; y: number };
            handleInteraction(touch.x, touch.y);
        }
        event.preventDefault();
    };

    // Add touch start handler (for initial touch)
    p.touchStarted = function(event: TouchEvent): void {
        if (p.touches.length > 0) {
            const touch = p.touches[0] as { x: number; y: number };
            handleInteraction(touch.x, touch.y);
        }
        event.preventDefault();
    };

    // Prevent default touch behavior
    document.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
};

// Create app structure before initializing p5
const appContainer = document.createElement('div');
appContainer.id = 'app';
appContainer.className = 'w-screen h-screen relative';
document.body.appendChild(appContainer);

const canvasContainer = document.createElement('main');
canvasContainer.id = 'canvas-container';
canvasContainer.className = 'w-full h-full';
appContainer.appendChild(canvasContainer);

// Wait for DOMContentLoaded before creating p5 instance
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('[Main] Creating p5 instance...');
        new p5(sketch);
    } catch (error) {
        console.error('[Main] Error initializing application:', error);
    }
});
