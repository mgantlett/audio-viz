import type { EventBus } from './EventBus';
import type { AudioManager } from './audio/AudioManager';
import { initializeComponents } from '../components';

export class UIManager {
    constructor(
        private eventBus: EventBus,
        private audioManager: AudioManager
    ) {}

    public async initialize(): Promise<void> {
        try {
            console.log('[UIManager] Initializing UI...');

            // Initialize all UI components
            await initializeComponents(this.audioManager, this.eventBus);

            console.log('[UIManager] UI initialized successfully');
        } catch (error) {
            console.error('[UIManager] Error initializing UI:', error);
            throw error;
        }
    }

    public cleanup(): void {
        // Cleanup code here if needed
    }
}

export const createUIManager = (eventBus: EventBus, audioManager: AudioManager): UIManager => {
    return new UIManager(eventBus, audioManager);
};
