import Scene from '../Scene.js';
import EventBus from './EventBus.js';
import audioController from './AudioController.js';

export class SceneController {
    constructor() {
        this.scenes = new Map();
        this.currentScene = null;
        this.defaultScene = null;
        this.isTransitioning = false;
        this.transitionAttempts = 0;
        this.maxTransitionAttempts = 3;
        this.eventBus = EventBus.getInstance();
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventBus.on('scene:switch', async (sceneName) => {
            await this.switchToScene(sceneName);
        });
        this.eventBus.on('scene:register', ({ name, scene }) => {
            this.registerScene(name, scene);
        });
    }

    registerScene(name, scene) {
        if (!(scene instanceof Scene)) {
            throw new Error('Scene must extend the Scene base class');
        }
        
        this.scenes.set(name, scene);
        
        // Set first registered scene as default
        if (!this.defaultScene) {
            this.defaultScene = name;
        }

        this.eventBus.emit('scene:registered', { name });
    }

    async cleanupCurrentScene() {
        if (this.currentScene && this.scenes.get(this.currentScene).cleanup) {
            await this.scenes.get(this.currentScene).cleanup();
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    async initializeNewScene(name) {
        const scene = this.scenes.get(name);
        const setupSuccess = await scene.setup();
        
        if (!setupSuccess) {
            throw new Error('Scene setup failed');
        }

        await new Promise(resolve => setTimeout(resolve, 200));
    }

    async switchToScene(name) {
        if (this.isTransitioning) {
            return false;
        }

        if (!this.scenes.has(name)) {
            this.eventBus.emit('scene:error', {
                type: 'switch',
                error: `Scene '${name}' not found`
            });
            return false;
        }

        try {
            this.isTransitioning = true;
            this.transitionAttempts++;

            const previousScene = this.currentScene;
            const isChangingAudioType = (previousScene === 'scene3' && name !== 'scene3') || 
                                      (previousScene !== 'scene3' && name === 'scene3');

            // If we're changing audio type, we need to handle audio transition
            if (isChangingAudioType) {
                await audioController.cleanup();
                const mode = name === 'scene3' ? 'enhanced' : 'basic';
                await audioController.initialize(mode);
            }

            await this.cleanupCurrentScene();
            this.currentScene = name;
            await this.initializeNewScene(name);

            this.eventBus.emit('scene:switched', { 
                from: previousScene, 
                to: name 
            });

            this.transitionAttempts = 0;
            return true;
        } catch (error) {
            console.error('Error switching scene:', error);
            this.eventBus.emit('scene:error', {
                type: 'switch',
                error: error.message
            });

            if (this.transitionAttempts < this.maxTransitionAttempts) {
                this.isTransitioning = false;
                await new Promise(resolve => setTimeout(resolve, 500));
                return this.switchToScene(name);
            }

            return false;
        } finally {
            this.isTransitioning = false;
        }
    }

    getCurrentScene() {
        return this.currentScene ? this.scenes.get(this.currentScene) : null;
    }

    draw() {
        if (this.isTransitioning) return;

        const scene = this.getCurrentScene();
        if (!scene || !scene.draw) return;

        try {
            if (audioController.isEnhancedMode) {
                scene.draw();
            } else {
                const amplitude = audioController.getCurrentVolume() || 0;
                const frequency = audioController.getCurrentPitch() || 1;
                scene.draw(amplitude, frequency);
            }
        } catch (error) {
            console.error('Error in scene draw:', error);
            this.eventBus.emit('scene:error', {
                type: 'draw',
                error: error.message
            });
        }
    }

    windowResized() {
        if (!this.isTransitioning) {
            const scene = this.getCurrentScene();
            if (scene?.windowResized) {
                scene.windowResized();
            }
        }
    }

    async initialize() {
        if (this.defaultScene) {
            await this.switchToScene(this.defaultScene);
        }
    }
}

// Export singleton instance
export default new SceneController();
