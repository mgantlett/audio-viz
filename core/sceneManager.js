import Scene from './Scene.js';
import audioManager from './audio/index.js';

// Scene name constants
const SCENES = {
    STICK_FIGURES: 'scene1',
    PARTICLE_WAVE: 'scene2',
    BEAT_SCENE: 'scene3'
};

// Utility function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class SceneManager {
    constructor() {
        this.scenes = new Map();
        this.currentScene = null;
        this.defaultScene = null;
        this.currentTempo = 120;
        this.lastTempoUpdate = 0;
        this.tempoUpdateThrottle = 50;
        this.isTransitioning = false;
        this.currentAudioMode = null;
    }

    get isPlaying() {
        return audioManager?.isPlaying || false;
    }

    get isEnhancedMode() {
        return this.currentScene === SCENES.BEAT_SCENE;
    }

    getAudioModeForScene(sceneName) {
        return sceneName === SCENES.BEAT_SCENE ? 'enhanced' : 'basic';
    }

    registerScene(name, scene) {
        if (!(scene instanceof Scene)) {
            throw new Error('Scene must extend the Scene base class');
        }
        scene.id = name;
        this.scenes.set(name, scene);
        
        if (!this.defaultScene) {
            this.defaultScene = name;
        }
    }

    async initializeAudio(mode) {
        try {
            // If changing modes, cleanup first
            if (this.currentAudioMode !== mode && audioManager.isInitialized()) {
                await this.cleanupAudio();
                await delay(200);
            }

            // If already initialized in correct mode, do nothing
            if (this.currentAudioMode === mode && audioManager.isInitialized()) {
                return true;
            }

            const success = await audioManager.initialize(mode);
            if (!success) {
                throw new Error('Failed to initialize audio manager');
            }

            // Ensure audio is stopped after initialization
            if (audioManager.isPlaying) {
                audioManager.stop();
            }

            this.currentAudioMode = mode;

            if (mode === 'enhanced') {
                audioManager.setTempo(this.currentTempo);
            }

            this.updateUI(() => this.uiManager?.resetAudioButton());
            return true;
        } catch (error) {
            console.error('Error initializing audio:', error);
            return false;
        }
    }

    async cleanupAudio() {
        if (audioManager.isInitialized()) {
            if (audioManager.isPlaying) {
                audioManager.stop();
            }
            await audioManager.cleanup();
            this.currentAudioMode = null;
            this.updateUI(() => this.uiManager?.resetAudioButton());
        }
    }

    startAudio() {
        this.validateAudioState();
        audioManager.start();
        this.updateUI(() => this.uiManager?.updateAudioButtonState(true));
    }

    stopAudio() {
        this.validateAudioState();
        audioManager.stop();
        this.updateUI(() => this.uiManager?.updateAudioButtonState(false));
    }

    validateAudioState() {
        if (!this.isAudioInitialized()) {
            throw new Error('Audio not initialized');
        }
        if (this.isTransitioning) {
            throw new Error('Cannot modify audio during scene transition');
        }
    }

    async cleanupCurrentScene() {
        if (this.currentScene && this.scenes.get(this.currentScene).cleanup) {
            await this.scenes.get(this.currentScene).cleanup();
            await delay(200);
        }
    }

    async initializeNewScene(name, isChangingAudioType) {
        if (isChangingAudioType) {
            const mode = this.getAudioModeForScene(name);
            const audioSuccess = await this.initializeAudio(mode);
            if (!audioSuccess) {
                throw new Error('Audio initialization failed');
            }
        }

        const scene = this.scenes.get(name);
        const setupSuccess = await scene.setup();
        
        if (!setupSuccess) {
            throw new Error('Scene setup failed');
        }

        await delay(200);
    }

    async switchToScene(name) {
        if (this.isTransitioning || !this.scenes.has(name)) {
            return false;
        }

        try {
            this.isTransitioning = true;

            const prevAudioMode = this.getAudioModeForScene(this.currentScene);
            const newAudioMode = this.getAudioModeForScene(name);
            const isChangingAudioType = prevAudioMode !== newAudioMode;

            await this.cleanupCurrentScene();
            
            if (isChangingAudioType) {
                await this.cleanupAudio();
            }

            this.currentScene = name;
            await this.initializeNewScene(name, isChangingAudioType);

            this.updateUI(() => {
                this.uiManager?.updateSceneButtons(name);
                this.uiManager?.updateControlsForScene(name);
                this.uiManager?.resetAudioButton();
            });

            return true;
        } catch (error) {
            console.error('Error switching scene:', error);
            this.updateUI(() => this.uiManager?.resetAudioButton());
            await this.cleanupAudio();
            return false;
        } finally {
            this.isTransitioning = false;
        }
    }

    updateUI(callback) {
        if (window.uiManager) {
            callback();
        }
    }

    get uiManager() {
        return window.uiManager;
    }

    isAudioInitialized() {
        return audioManager && audioManager.isInitialized();
    }

    draw() {
        if (this.isTransitioning) return;

        const scene = this.getCurrentScene();
        if (!scene?.draw) return;

        try {
            if (this.isEnhancedMode && audioManager.mode === 'enhanced') {
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

    getCurrentScene() {
        return this.currentScene ? this.scenes.get(this.currentScene) : null;
    }

    windowResized() {
        if (!this.isTransitioning) {
            this.getCurrentScene()?.windowResized?.();
        }
    }

    updateTempo(delta) {
        if (this.isTransitioning) return;

        const now = Date.now();
        if (now - this.lastTempoUpdate < this.tempoUpdateThrottle) return;
        
        this.lastTempoUpdate = now;
        const newTempo = Math.max(60, Math.min(200, this.currentTempo + delta));
        
        if (newTempo !== this.currentTempo) {
            this.currentTempo = newTempo;
            
            if (this.isEnhancedMode && audioManager.isInitialized()) {
                audioManager.setTempo(this.currentTempo);
            }
        }
    }

    getCurrentPitch() {
        if (!this.isAudioInitialized() || this.isEnhancedMode) return 1;
        return audioManager.getFrequency() / 440;
    }

    getCurrentVolume() {
        if (!this.isAudioInitialized()) return 0;
        return this.isEnhancedMode ? audioManager.getVolume() : audioManager.getAmplitude();
    }

    async initialize() {
        if (this.defaultScene) {
            await this.switchToScene(this.defaultScene);
        }
    }
}

// Create global instance
window.sceneManager = new SceneManager();
