import type p5 from 'p5';
import type { AudioManager } from '../core/audio/AudioManager';
import type { SceneManager } from '../core/SceneManager';

declare global {
    interface Window {
        p5Instance: p5;
        audioManager: AudioManager;
        sceneManager: SceneManager;
    }
}

export {};
