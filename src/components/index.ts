import type { AudioManager } from '../core/audio/AudioManager';
import type { EventBus } from '../core/EventBus';
import { createMenu } from './Menu';

export const initializeComponents = async (audioManager: AudioManager, eventBus: EventBus): Promise<void> => {
    try {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise<void>(resolve => {
                document.addEventListener('DOMContentLoaded', () => resolve());
            });
        }

        // Wait for #app element to be available
        while (!document.getElementById('app')) {
            console.log('[Components] Waiting for #app element...');
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Create and initialize menu
        const menu = createMenu(audioManager, eventBus);
        await menu.initialize();
        
        console.log('[Components] Menu initialized successfully');
    } catch (error) {
        console.error('[Components] Error initializing components:', error);
        throw error;
    }
};
