import { Scene } from './Scene';
import { audioManager } from './audio';
import { EventBus } from './EventBus';
import type { SceneName, AudioMode, ISceneManager } from '../types/scene';
import { SCENES, SCENE_CONFIG } from '../types/scene';
import type { SceneSwitchEvent } from '../types/events';
import type { IAudioManager } from '../types/audio';

// Utility function for delays
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export class SceneManager implements ISceneManager {
    scenes: Map<SceneName, Scene>;
    currentScene: SceneName | null;
    defaultScene: SceneName | null;
    currentTempo: number;
    lastTempoUpdate: number;
    tempoUpdateThrottle: number;
    isTransitioning: boolean;
    currentAudioMode: AudioMode | null;
    private eventBus: EventBus;

    constructor() {
        this.scenes = new Map();
        this.currentScene = null;
        this.defaultScene = SCENES.STICK_FIGURES; // Set default scene explicitly
        this.currentTempo = 120;
        this.lastTempoUpdate = 0;
        this.tempoUpdateThrottle = 50;
        this.isTransitioning = false;
        this.currentAudioMode = null;
        this.eventBus = EventBus.getInstance();
        
        // Listen for scene switch events
        this.eventBus.on('scene:switch', async (event: SceneSwitchEvent) => {
            console.log('Scene switch event received:', event.sceneId);
            const success = await this.switchToScene(event.sceneId);
            if (success) {
                this.eventBus.emit({ type: 'scene:switched', to: event.sceneId });
            }
        });
    }

    get isPlaying(): boolean {
        return audioManager.isPlaying;
    }

    get isEnhancedMode(): boolean {
        if (!this.currentScene) return false;
        return SCENE_CONFIG[this.currentScene].audioMode === 'tracker';
    }

    private getAudioModeForScene(sceneName: SceneName): AudioMode {
        return SCENE_CONFIG[sceneName].audioMode;
    }

    registerScene(name: SceneName, scene: Scene): void {
        if (!(scene instanceof Scene)) {
            throw new Error('Scene must extend the Scene base class');
        }
        scene.id = name;
        this.scenes.set(name, scene);
    }

    private async initializeAudio(mode: AudioMode): Promise<boolean> {
        try {
            // If already initialized in correct mode, do nothing
            if (this.currentAudioMode === mode && audioManager.isInitialized()) {
                return true;
            }

            // Cleanup existing audio if mode is different
            if (this.currentAudioMode !== mode) {
                await this.cleanupAudio();
            }

            // Initialize audio manager with the correct mode
            const success = await (audioManager as IAudioManager).initializeWithMode(mode);
            if (!success) {
                throw new Error('Failed to initialize audio manager');
            }

            this.currentAudioMode = mode;

            if (mode === 'tracker') {
                audioManager.setTempo(this.currentTempo);
            }

            this.updateUI(() => window.uiManager?.resetAudioButton());
            return true;
        } catch (error) {
            console.error('Error initializing audio:', error);
            return false;
        }
    }

    private async cleanupAudio(): Promise<void> {
        if (audioManager.isInitialized()) {
            if (audioManager.isPlaying) {
                this.eventBus.emit({ type: 'audio:stop' });
            }
            await audioManager.cleanup();
            this.currentAudioMode = null;
            this.updateUI(() => window.uiManager?.resetAudioButton());
        }
    }

    startAudio(): void {
        this.validateAudioState();
        this.eventBus.emit({ type: 'audio:start' });
        this.updateUI(() => window.uiManager?.resetAudioButton());
    }

    stopAudio(): void {
        this.validateAudioState();
        this.eventBus.emit({ type: 'audio:stop' });
        this.updateUI(() => window.uiManager?.resetAudioButton());
    }

    private validateAudioState(): void {
        if (!this.isAudioInitialized()) {
            throw new Error('Audio not initialized');
        }
        if (this.isTransitioning) {
            throw new Error('Cannot modify audio during scene transition');
        }
    }

    private async cleanupCurrentScene(): Promise<void> {
        if (this.currentScene && this.scenes.get(this.currentScene)?.cleanup) {
            await this.scenes.get(this.currentScene)?.cleanup();
            await delay(200);
        }
    }

    private async initializeNewScene(name: SceneName): Promise<void> {
        const scene = this.scenes.get(name);
        if (!scene) {
            throw new Error(`Scene ${name} not found`);
        }

        const setupSuccess = await scene.setup();
        if (!setupSuccess) {
            throw new Error('Scene setup failed');
        }

        await delay(200);
    }

    async switchToScene(name: SceneName): Promise<boolean> {
        if (this.isTransitioning || !this.scenes.has(name)) {
            return false;
        }

        try {
            this.isTransitioning = true;
            console.log(`Switching to scene: ${SCENE_CONFIG[name].name}`);

            // Get the audio mode for the new scene
            const newMode = this.getAudioModeForScene(name);

            // If audio is initialized and playing, and mode is changing, stop audio
            if (audioManager.isInitialized() && audioManager.isPlaying && this.currentAudioMode !== newMode) {
                await this.cleanupAudio();
            }

            await this.cleanupCurrentScene();
            this.currentScene = name;
            await this.initializeNewScene(name);

            // Initialize audio with the new mode
            await this.initializeAudio(newMode);

            // Restart audio if it was playing before
            if (audioManager.isPlaying) {
                this.startAudio();
            }

            this.updateUI(() => {
                window.uiManager?.updateSceneButtons(name);
                window.uiManager?.updateControlsForScene(name);
                window.uiManager?.resetAudioButton();
            });

            return true;
        } catch (error) {
            console.error('Error switching scene:', error);
            this.updateUI(() => window.uiManager?.resetAudioButton());
            return false;
        } finally {
            this.isTransitioning = false;
        }
    }

    private updateUI(callback: () => void): void {
        if (window.uiManager) {
            callback();
        }
    }

    private isAudioInitialized(): boolean {
        return audioManager.isInitialized();
    }

    draw(): void {
        if (this.isTransitioning) return;

        const scene = this.getCurrentScene();
        if (!scene?.draw) return;

        try {
            if (this.currentAudioMode === 'tracker') {
                scene.draw();
            } else {
                const amplitude = audioManager.getAmplitude() || 0;
                const frequency = audioManager.getFrequency() || 440;
                scene.draw(amplitude, frequency);
            }
        } catch (error) {
            console.error('Error in scene draw:', error);
        }
    }

    private getCurrentScene(): Scene | undefined {
        return this.currentScene ? this.scenes.get(this.currentScene) : undefined;
    }

    windowResized(): void {
        if (!this.isTransitioning) {
            this.getCurrentScene()?.windowResized?.();
        }
    }

    updateTempo(delta: number): void {
        if (this.isTransitioning || this.currentAudioMode !== 'tracker') return;

        const now = Date.now();
        if (now - this.lastTempoUpdate < this.tempoUpdateThrottle) return;
        
        this.lastTempoUpdate = now;
        const newTempo = Math.max(60, Math.min(200, this.currentTempo + delta));
        
        if (newTempo !== this.currentTempo) {
            this.currentTempo = newTempo;
            
            if (audioManager.isInitialized()) {
                audioManager.setTempo(this.currentTempo);
            }
        }
    }

    getCurrentPitch(): number {
        if (!this.isAudioInitialized() || this.currentAudioMode === 'tracker') return 1;
        return audioManager.getFrequency() / 440;
    }

    getCurrentVolume(): number {
        if (!this.isAudioInitialized()) return 0;
        // Use audioManager's getCurrentVolume instead of getAmplitude
        return audioManager.getCurrentVolume();
    }

    async initialize(): Promise<void> {
        if (this.defaultScene) {
            await this.switchToScene(this.defaultScene);
        }
    }

    async initializeAudioForCurrentScene(): Promise<boolean> {
        if (!this.currentScene) return false;
        const mode = this.getAudioModeForScene(this.currentScene);
        return this.initializeAudio(mode);
    }
}

// Create and export singleton instance
export const sceneManager = new SceneManager();
export default sceneManager;

// Assign to window for global access
window.sceneManager = sceneManager;
