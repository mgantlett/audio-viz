import type { ISceneManager } from './scene';
import type { IUIManager } from '../core/UIManager';
import type { IAudioManager } from './audio';
import type p5 from 'p5';

declare global {
    interface Window {
        sceneManager: ISceneManager;
        uiManager: IUIManager;
        audioManager: IAudioManager;
        p5Instance: p5;
    }
}
