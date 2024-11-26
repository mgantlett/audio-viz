import { createSceneManager, SceneManager } from './SceneManager';
import { createKeyboardManager, KeyboardManager } from './KeyboardManager';
import { createAudioManager, AudioManager } from './audio/AudioManager';
import { createUIManager, UIManager } from './UIManager';
import { EventBus } from './EventBus';

class App {
    private sceneManager!: SceneManager;
    private uiManager!: UIManager;
    private keyboardManager!: KeyboardManager;
    private audioManager!: AudioManager;
    private eventBus: EventBus;

    constructor() {
        this.eventBus = EventBus.create();
    }

    public async initialize(): Promise<void> {
        console.log('[App] Initializing application...');

        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise<void>(resolve => {
                    document.addEventListener('DOMContentLoaded', () => resolve());
                });
            }

            // Wait for p5 instance to be available
            console.log('[App] Waiting for p5 instance...');
            while (!window.p5Instance) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Wait for #app element to be available
            while (!document.getElementById('app')) {
                console.log('[App] Waiting for #app element...');
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Initialize Audio Manager
            this.audioManager = createAudioManager(this.eventBus);
            window.audioManager = this.audioManager;

            // Initialize UI Manager first
            console.log('[App] Initializing UI Manager...');
            this.uiManager = createUIManager(this.eventBus, this.audioManager);
            await this.uiManager.initialize();

            // Initialize Keyboard Manager
            console.log('[App] Initializing Keyboard Manager...');
            this.keyboardManager = createKeyboardManager(this.eventBus);
            await this.keyboardManager.initialize();

            // Initialize Scene Manager last
            console.log('[App] Initializing Scene Manager...');
            this.sceneManager = createSceneManager(this.eventBus);
            window.sceneManager = this.sceneManager;
            await this.sceneManager.initialize();

            console.log('[App] Application initialized successfully');
        } catch (error) {
            console.error('[App] Error initializing application:', error);
            throw error;
        }
    }

    public cleanup(): void {
        this.sceneManager.cleanup();
        this.uiManager.cleanup();
        this.keyboardManager.cleanup();
        this.audioManager.cleanup();
    }
}

export const app = new App();
