// Core components
import { menu } from './Menu';
import { createOscilloscope } from './Oscilloscope';
import { createAudioControls } from './AudioControls';

// Initialize components
const initializeComponents = async (): Promise<void> => {
    console.log('[Components] Initializing components...');

    try {
        // Wait for DOM to be fully loaded
        await new Promise<void>(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', () => resolve());
            }
        });

        // Initialize menu
        console.log('[Components] Initializing Menu...');
        await menu.initialize();
        
        // Initialize audio controls
        console.log('[Components] Initializing AudioControls...');
        await createAudioControls({
            eventBus: window.eventBus,
            audioManager: window.audioManager
        }).initialize();

        console.log('[Components] All components initialized.');
    } catch (error) {
        console.error('[Components] Error initializing components:', error);
        throw error;
    }
};

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeComponents().catch(error => {
            console.error('[Components] Fatal error during initialization:', error);
        });
    });
} else {
    initializeComponents().catch(error => {
        console.error('[Components] Fatal error during initialization:', error);
    });
}

// Export components
export {
    menu,
    createOscilloscope,
    createAudioControls
};
