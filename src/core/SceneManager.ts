import type p5 from 'p5';
import type { Scene } from './Scene';
import type { EventBus } from './EventBus';
import type { SceneName } from '../types/scene';
import { SCENES } from '../types/scene';
import type { IAudioManager } from '../types/audio';
import { Beat } from '../scenes/Beat';

export class SceneManager {
    private scenes: Map<SceneName, Scene> = new Map();
    private currentScene: Scene | null = null;
    private currentSceneName: SceneName | null = null;
    private currentAudioManager: IAudioManager | null = null;

    constructor(private eventBus: EventBus) {
        // Listen for scene switch events
        this.eventBus.on('scene:switch', async (event) => {
            try {
                await this.switchScene(event.sceneId as SceneName);
            } catch (error) {
                console.error(`[SceneManager] Error switching scene:`, error);
                this.eventBus.emit({
                    type: 'scene:error',
                    error: error as Error,
                    sceneName: event.sceneId
                });
            }
        });
    }

    public getEventBus(): EventBus {
        return this.eventBus;
    }

    public async initialize(): Promise<void> {
        console.log('[SceneManager] Initializing...');
        
        try {
            // Set default scene
            const defaultScene = this.scenes.get(SCENES.STICK_FIGURES);
            if (defaultScene) {
                await this.switchScene(SCENES.STICK_FIGURES);
            }

            console.log('[SceneManager] Initialized successfully');
        } catch (error) {
            console.error('[SceneManager] Error initializing:', error);
            this.eventBus.emit({
                type: 'scene:error',
                error: error as Error,
                sceneName: 'initialization'
            });
            throw error;
        }
    }

    public registerScene(name: SceneName, scene: Scene): void {
        if (this.scenes.has(name)) {
            console.warn(`[SceneManager] Scene ${name} already registered`);
            return;
        }

        this.scenes.set(name, scene);
        console.log(`[SceneManager] Registered scene: ${name}`);
    }

    public async switchScene(name: SceneName): Promise<void> {
        try {
            console.log(`[SceneManager] Switching to scene: ${name}`);
            const scene = this.scenes.get(name);
            if (!scene) {
                throw new Error(`Scene ${name} not found`);
            }

            // Clean up current scene if exists
            if (this.currentScene) {
                this.currentScene.cleanup();
            }

            // Set and initialize new scene
            this.currentScene = scene;
            this.currentSceneName = name;
            await scene.initialize();

            // Update current audio manager
            if (scene instanceof Beat) {
                this.currentAudioManager = scene.audioManager;
            } else {
                this.currentAudioManager = window.audioManager;
            }

            // Notify scene switch
            this.eventBus.emit({
                type: 'scene:switched',
                to: name
            });

            // Notify scene ready
            this.eventBus.emit({
                type: 'scene:ready',
                sceneName: name
            });

            // Emit audio manager change event
            this.eventBus.emit({
                type: 'audio:manager_changed',
                manager: this.currentAudioManager
            });

            console.log(`[SceneManager] Successfully switched to scene: ${name}`);
        } catch (error) {
            console.error(`[SceneManager] Error switching to scene ${name}:`, error);
            this.eventBus.emit({
                type: 'scene:error',
                error: error as Error,
                sceneName: name
            });
            throw error;
        }
    }

    public draw(p: p5): void {
        if (this.currentScene && this.currentAudioManager) {
            this.currentScene.draw(p);

            // Update scene with current audio state
            const volume = this.currentAudioManager.getCurrentVolume();
            const frequency = this.currentAudioManager.getCurrentFrequency();
            this.currentScene.handleAudio(volume, frequency);
        }
    }

    public handleInteraction(x: number, y: number, width: number, height: number): void {
        if (this.currentScene) {
            this.currentScene.handleInteraction(x, y, width, height);
        }
    }

    public handleResize(): void {
        if (this.currentScene) {
            this.currentScene.handleResize();
        }
    }

    public getCurrentScene(): Scene | null {
        return this.currentScene;
    }

    public getCurrentSceneName(): SceneName | null {
        return this.currentSceneName;
    }

    public cleanup(): void {
        if (this.currentScene) {
            this.currentScene.cleanup();
        }
        this.scenes.clear();
    }
}

export const createSceneManager = (eventBus: EventBus): SceneManager => {
    return new SceneManager(eventBus);
};
