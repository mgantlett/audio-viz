import type p5 from 'p5';
import type { EventBus } from './EventBus';
import type { IAudioManager } from '../types/audio';
import { getAudioManagerFactory } from './audio';
import type { AudioType } from '../types/scene';

/**
 * Base Scene class that handles the core visualization functionality.
 * Each scene only needs to worry about:
 * 1. Initialization (setup)
 * 2. Drawing (visualization)
 * 3. Audio response (how it reacts to audio)
 * 4. Cleanup
 */
export abstract class Scene {
    protected p5: p5;
    protected eventBus: EventBus;
    protected audioManager: IAudioManager;

    constructor(p5: p5, eventBus: EventBus, audioType: AudioType = 'basic') {
        this.p5 = p5;
        this.eventBus = eventBus;
        
        // Create scene-specific audio manager
        const factory = getAudioManagerFactory(audioType);
        this.audioManager = factory(eventBus);
    }

    /**
     * Initialize scene resources and state
     */
    abstract initialize(): Promise<void>;

    /**
     * Draw the scene
     * @param p p5 instance for drawing
     */
    abstract draw(p: p5): void;

    /**
     * Handle audio input
     * @param volume Current audio volume (0-1)
     * @param frequency Current frequency (Hz)
     */
    abstract handleAudio(volume: number, frequency: number): void;

    /**
     * Get the scene's audio manager
     */
    public getAudioManager(): IAudioManager {
        return this.audioManager;
    }

    /**
     * Clean up scene resources
     */
    public cleanup(): void {
        // Clean up audio manager
        if (this.audioManager) {
            this.audioManager.cleanup();
        }
        
        // Allow scenes to perform additional cleanup
        this.onCleanup();
    }

    /**
     * Additional cleanup specific to each scene
     */
    protected abstract onCleanup(): void;

    /**
     * Handle window resize
     * Default implementation - can be overridden by scenes
     */
    public handleResize(): void {
        // Default resize behavior
    }

    /**
     * Handle mouse/touch interaction
     * Default implementation - can be overridden by scenes
     */
    public handleInteraction(x: number, y: number, width: number, height: number): void {
        // Map x to frequency (pitch)
        const minFreq = 220; // A3
        const maxFreq = 880; // A5
        const frequency = this.p5.map(x, 0, width, minFreq, maxFreq);
        this.audioManager.setFrequency(frequency);

        // Map y to volume
        const volume = this.p5.map(y, height, 0, 0, 1);
        this.audioManager.setVolume(volume);
    }
}
