import EventBus from './EventBus.js';
import audioController from './AudioController.js';
import sceneController from './SceneController.js';

export class UIController {
    constructor() {
        this.initialized = false;
        this.elements = {
            startButton: null,
            stopButton: null,
            sideControls: null,
            sceneButtons: null,
            basicSceneControls: null,
            beatSceneControls: null,
            patternButtons: null,
            progressionButtons: null
        };
        this.lastTempoUpdate = 0;
        this.isProcessingTempoChange = false;
        this.eventBus = EventBus.getInstance();
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Audio events
        this.eventBus.on('audio:started', () => {
            this.showControls();
            this.elements.startButton.classList.add('hidden');
            this.elements.stopButton.classList.remove('hidden');
            this.updateControlValues();
        });

        this.eventBus.on('audio:stopped', () => {
            this.elements.stopButton.classList.add('hidden');
            this.elements.startButton.classList.remove('hidden');
            this.elements.startButton.disabled = false;
        });

        this.eventBus.on('audio:error', (error) => {
            console.error('Audio error:', error);
            this.resetAudioButton();
        });

        // Scene events
        this.eventBus.on('scene:switched', ({ to }) => {
            this.updateSceneButtons(to);
            this.updateControlsForScene(to);
        });
    }

    initialize() {
        if (this.initialized) return;
        this.cacheElements();
        this.setupUIEventListeners();
        this.startControlUpdates();
        this.initialized = true;
    }

    cacheElements() {
        this.elements.startButton = document.getElementById('startButton');
        this.elements.stopButton = document.getElementById('stopButton');
        this.elements.sideControls = document.getElementById('side-controls');
        this.elements.sceneButtons = document.querySelectorAll('.scene-btn');
        this.elements.basicSceneControls = document.querySelector('.basic-scene-controls');
        this.elements.beatSceneControls = document.querySelector('.beat-scene-controls');
        this.elements.patternButtons = document.querySelectorAll('.pattern-btn');
        this.elements.progressionButtons = document.querySelectorAll('.progression-btn');
    }

    setupUIEventListeners() {
        this.setupAudioControls();
        this.setupPatternControls();
        this.setupProgressionControls();
        this.setupTempoControl();
        this.setupSceneControls();
        this.setupKeyboardShortcuts();
    }

    setupAudioControls() {
        this.elements.startButton.addEventListener('click', async () => {
            this.elements.startButton.disabled = true;
            
            try {
                if (!audioController.isAudioInitialized()) {
                    const mode = audioController.isEnhancedMode ? 'enhanced' : 'basic';
                    this.eventBus.emit('audio:initialize', mode);
                }

                this.eventBus.emit('audio:start');
            } catch (error) {
                console.error('Error during audio start:', error);
                this.elements.startButton.disabled = false;
            }
        });

        this.elements.stopButton.addEventListener('click', () => {
            this.eventBus.emit('audio:stop');
        });
    }

    setupPatternControls() {
        this.elements.patternButtons?.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!audioController.isAudioInitialized()) return;
                
                const pattern = btn.dataset.pattern;
                audioController.setPattern(pattern);
                this.updatePatternButtons(pattern);
            });
        });
    }

    setupProgressionControls() {
        this.elements.progressionButtons?.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!audioController.isAudioInitialized()) return;
                
                const progression = parseInt(btn.dataset.progression);
                audioController.setProgression(progression);
                this.updateProgressionButtons(progression);
            });
        });
    }

    setupTempoControl() {
        document.addEventListener('wheel', (event) => {
            if (audioController.isEnhancedMode && 
                audioController.isAudioInitialized() && 
                !this.isProcessingTempoChange) {
                
                event.preventDefault();
                
                if (Date.now() - this.lastTempoUpdate < 50) return;
                this.lastTempoUpdate = Date.now();
                
                this.isProcessingTempoChange = true;
                
                const delta = event.deltaY < 0 ? 5 : -5;
                audioController.setTempo(delta);
                this.updateControlValues();
                
                setTimeout(() => {
                    this.isProcessingTempoChange = false;
                }, 50);
            }
        }, { passive: false });
    }

    setupSceneControls() {
        this.elements.sceneButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (!btn.classList.contains('active')) {
                    btn.style.transform = 'translateX(5px)';
                }
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateX(0)';
            });

            btn.addEventListener('click', () => {
                const sceneName = btn.id;
                this.eventBus.emit('scene:switch', sceneName);
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            this.handleSceneShortcuts(e);
            this.handlePatternShortcuts(e);
        });
    }

    handleSceneShortcuts(e) {
        const sceneMap = {
            '1': 'scene1',
            '2': 'scene2',
            '3': 'scene3',
            'm': () => this.toggleControls(),
            'M': () => this.toggleControls()
        };

        const action = sceneMap[e.key];
        if (action) {
            if (typeof action === 'function') {
                action();
            } else {
                this.eventBus.emit('scene:switch', action);
            }
        }
    }

    handlePatternShortcuts(e) {
        if (!audioController.isAudioInitialized()) return;

        const patternMap = {
            'b': 'basic',
            'B': 'basic',
            's': 'syncopated',
            'S': 'syncopated',
            'c': 'complex',
            'C': 'complex'
        };

        const pattern = patternMap[e.key];
        if (pattern) {
            audioController.setPattern(pattern);
            this.updatePatternButtons(pattern);
        }
    }

    startControlUpdates() {
        setInterval(() => {
            if (audioController.isAudioInitialized()) {
                this.updateControlValues();
            }
        }, 100);
    }

    updateControlValues() {
        const controlItems = document.querySelectorAll('.control-item');
        controlItems.forEach(item => {
            const label = item.querySelector('.label').textContent.toLowerCase();
            const valueSpan = item.querySelector('.value');
            
            if (audioController.isEnhancedMode) {
                if (label === 'tempo' && audioController.isAudioInitialized()) {
                    valueSpan.textContent = `${audioController.currentTempo} BPM`;
                }
            } else {
                if (audioController.isAudioInitialized()) {
                    switch(label) {
                        case 'pitch':
                            const pitchRatio = audioController.getCurrentPitch();
                            valueSpan.textContent = `${pitchRatio.toFixed(2)}x`;
                            break;
                        case 'volume':
                            const volume = audioController.getCurrentVolume();
                            valueSpan.textContent = `${Math.round(volume * 100)}%`;
                            break;
                    }
                }
            }
        });
    }

    updatePatternButtons(pattern) {
        this.elements.patternButtons?.forEach(btn => 
            btn.classList.toggle('active', btn.dataset.pattern === pattern)
        );
    }

    updateProgressionButtons(progression) {
        this.elements.progressionButtons?.forEach(btn => 
            btn.classList.toggle('active', parseInt(btn.dataset.progression) === progression)
        );
    }

    updateControlsForScene(sceneId) {
        const isEnhancedMode = sceneId === 'scene3';
        this.elements.beatSceneControls.style.display = isEnhancedMode ? 'block' : 'none';
        this.elements.basicSceneControls.style.display = isEnhancedMode ? 'none' : 'block';
        this.updateControlValues();
    }

    showControls() {
        this.elements.sideControls.classList.remove('hidden');
        this.elements.sideControls.style.opacity = '0';
        this.elements.sideControls.style.transform = 'translateY(-50%) translateX(50px)';
        
        requestAnimationFrame(() => {
            this.elements.sideControls.style.transition = 'all 0.3s ease-out';
            this.elements.sideControls.style.opacity = '1';
            this.elements.sideControls.style.transform = 'translateY(-50%) translateX(0)';
        });
        
        this.updateControlsForScene(sceneController.currentScene);
    }

    hideControls() {
        this.elements.sideControls.style.opacity = '0';
        this.elements.sideControls.style.transform = 'translateY(-50%) translateX(50px)';
        
        setTimeout(() => {
            this.elements.sideControls.classList.add('hidden');
        }, 300);
    }

    toggleControls() {
        if (this.elements.sideControls.classList.contains('hidden')) {
            this.showControls();
        } else {
            this.hideControls();
        }
    }

    updateSceneButtons(activeScene) {
        this.elements.sceneButtons.forEach(btn => {
            btn.classList.toggle('active', btn.id === activeScene);
        });
    }

    resetAudioButton() {
        this.elements.startButton.classList.remove('hidden');
        this.elements.stopButton.classList.add('hidden');
        this.elements.startButton.disabled = false;
    }
}

// Export singleton instance
export default new UIController();
