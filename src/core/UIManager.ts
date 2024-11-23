import { Component } from './Component';
import type { SceneName } from '../types/scene';

export interface IUIManager {
    initialize(): Promise<void>;
    handleStartClick(): Promise<void>;
    handleStopClick(): void;
    resetAudioButton(): void;
    updateSceneButtons(sceneName: SceneName): void;
    updateControlsForScene(sceneName: SceneName): void;
    elements: {
        startButton: HTMLElement | null;
        stopButton: HTMLElement | null;
    };
}

declare global {
    interface Window {
        uiManager: IUIManager;
    }
}

class UIManager extends Component implements IUIManager {
    elements: {
        startButton: HTMLElement | null;
        stopButton: HTMLElement | null;
    };

    constructor() {
        super();
        this.elements = {
            startButton: null,
            stopButton: null
        };
    }

    protected async initializeComponent(): Promise<void> {
        await this.initialize();
    }

    async initialize(): Promise<void> {
        this.elements.startButton = document.getElementById('startButton');
        this.elements.stopButton = document.getElementById('stopButton');
    }

    async handleStartClick(): Promise<void> {
        if (this.elements.startButton && this.elements.stopButton) {
            this.elements.startButton.classList.add('hidden');
            this.elements.stopButton.classList.remove('hidden');
        }
    }

    handleStopClick(): void {
        if (this.elements.startButton && this.elements.stopButton) {
            this.elements.stopButton.classList.add('hidden');
            this.elements.startButton.classList.remove('hidden');
        }
    }

    resetAudioButton(): void {
        if (this.elements.startButton && this.elements.stopButton) {
            this.elements.startButton.classList.remove('hidden');
            this.elements.stopButton.classList.add('hidden');
        }
    }

    updateSceneButtons(sceneName: SceneName): void {
        const sceneButtons = document.querySelectorAll('.scene-btn');
        sceneButtons.forEach(button => {
            const isActive = button.id === sceneName;
            button.classList.toggle('active', isActive);
            button.classList.toggle('bg-primary', isActive);
            button.classList.toggle('text-white', isActive);
        });
    }

    updateControlsForScene(sceneName: SceneName): void {
        const basicControls = document.querySelector('.basic-scene-controls');
        const beatControls = document.querySelector('.beat-scene-controls');
        
        if (basicControls && beatControls) {
            const isBeatScene = sceneName === 'scene3';
            basicControls.classList.toggle('hidden', isBeatScene);
            beatControls.classList.toggle('hidden', !isBeatScene);
        }
    }
}

export const uiManager = new UIManager();
export default uiManager;

// Assign to window for global access
window.uiManager = uiManager;
