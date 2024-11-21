import EventBus from '../controllers/EventBus.js';

export class SceneControls {
    constructor() {
        this.initialized = false;
        this.eventBus = EventBus.getInstance();
        this.sceneButtons = {
            scene1: null,
            scene2: null,
            scene3: null
        };
    }

    initialize() {
        if (this.initialized) return;
        console.log('Initializing SceneControls...');
        
        this.cacheElements();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        
        this.initialized = true;
        console.log('SceneControls initialized successfully');
    }

    cacheElements() {
        Object.keys(this.sceneButtons).forEach(sceneId => {
            this.sceneButtons[sceneId] = document.getElementById(sceneId);
        });
    }

    setupEventListeners() {
        // Set up click handlers for scene buttons
        Object.entries(this.sceneButtons).forEach(([sceneId, button]) => {
            if (button) {
                button.addEventListener('click', () => {
                    console.log(`Switching to ${sceneId}`);
                    this.eventBus.emit('scene:switch', sceneId);
                });
            }
        });

        // Listen for scene changes to update button states
        this.eventBus.on('scene:switched', ({ to }) => {
            this.updateSceneButtons(to);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const sceneMap = {
                '1': 'scene1',
                '2': 'scene2',
                '3': 'scene3'
            };

            const sceneId = sceneMap[e.key];
            if (sceneId) {
                console.log(`Scene shortcut pressed: ${sceneId}`);
                this.eventBus.emit('scene:switch', sceneId);
            }
        });
    }

    updateSceneButtons(activeSceneId) {
        Object.entries(this.sceneButtons).forEach(([sceneId, button]) => {
            if (button) {
                const isActive = sceneId === activeSceneId;
                button.classList.toggle('active', isActive);
                button.classList.toggle('bg-primary', isActive);
                button.classList.toggle('text-white', isActive);
            }
        });
    }
}

// Export singleton instance
export default new SceneControls();
