import { Component } from '../Component';
import { EventBus } from '../EventBus';
import type { SceneName } from '../../types/scene';
import type { IUIManager } from '../UIManager';

export class UIController extends Component implements IUIManager {
    private eventBus: EventBus;
    elements: {
        startButton: HTMLElement | null;
        stopButton: HTMLElement | null;
    };

    constructor() {
        super();
        this.eventBus = EventBus.getInstance();
        this.elements = {
            startButton: null,
            stopButton: null
        };
    }

    protected async initializeComponent(): Promise<void> {
        await this.initialize();
        this.setupEventListeners();
    }

    async initialize(): Promise<void> {
        this.elements.startButton = document.getElementById('startButton');
        this.elements.stopButton = document.getElementById('stopButton');

        if (!this.elements.startButton || !this.elements.stopButton) {
            console.warn('Audio control buttons not found');
            return;
        }

        this.elements.startButton.addEventListener('click', () => this.handleStartClick());
        this.elements.stopButton.addEventListener('click', () => this.handleStopClick());
    }

    private setupEventListeners(): void {
        // Listen for keyboard shortcuts
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.elements.startButton?.classList.contains('hidden')) {
                    this.handleStopClick();
                } else {
                    this.handleStartClick();
                }
            }
        });

        // Listen for audio state changes
        this.eventBus.on('audio:started', () => {
            this.handleStartClick();
        });

        this.eventBus.on('audio:stopped', () => {
            this.handleStopClick();
        });

        this.eventBus.on('audio:error', () => {
            this.resetAudioButton();
        });
    }

    async handleStartClick(): Promise<void> {
        if (this.elements.startButton && this.elements.stopButton) {
            this.elements.startButton.classList.add('hidden');
            this.elements.stopButton.classList.remove('hidden');
            this.eventBus.emit({ type: 'audio:start' });
        }
    }

    handleStopClick(): void {
        if (this.elements.startButton && this.elements.stopButton) {
            this.elements.stopButton.classList.add('hidden');
            this.elements.startButton.classList.remove('hidden');
            this.eventBus.emit({ type: 'audio:stop' });
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

export const uiController = new UIController();
export default uiController;
