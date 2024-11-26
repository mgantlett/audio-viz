import { BasicAudioManager } from './BasicAudioManager';
import { EnhancedAudioManager } from './EnhancedAudioManager';
import type { IAudioManager } from '../../types/audio';
import type { AudioType } from '../../types/scene';
import type { EventBus } from '../EventBus';

// Factory functions to create audio managers
export const createBasicAudioManager = (eventBus: EventBus): BasicAudioManager => {
    return new BasicAudioManager(eventBus);
};

export const createEnhancedAudioManager = (eventBus: EventBus): EnhancedAudioManager => {
    const manager = new EnhancedAudioManager(eventBus);
    void manager.initializeWithMode('tracker');
    return manager;
};

// Function to get appropriate audio manager factory
export const getAudioManagerFactory = (type: AudioType): (eventBus: EventBus) => IAudioManager => {
    switch (type) {
        case 'enhanced':
            return createEnhancedAudioManager;
        case 'basic':
        default:
            return createBasicAudioManager;
    }
};

// Export types
export type { BasicAudioManager, EnhancedAudioManager };
