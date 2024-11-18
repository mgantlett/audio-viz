import EventBus from '../controllers/EventBus.js';

class AppState {
    constructor() {
        this.state = {
            audio: {
                isPlaying: false,
                isInitialized: false,
                mode: 'basic',
                volume: 0.7,
                tempo: 120,
                pattern: 'basic',
                progression: 0
            },
            scene: {
                current: null,
                isTransitioning: false,
                availableScenes: new Set()
            },
            ui: {
                controlsVisible: false,
                isProcessingTempoChange: false
            }
        };

        this.eventBus = EventBus.getInstance();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Audio state updates
        this.eventBus.on('audio:initialized', ({ success, mode }) => {
            if (success) {
                this.updateState('audio', {
                    isInitialized: true,
                    mode
                });
            }
        });

        this.eventBus.on('audio:started', () => {
            this.updateState('audio', { isPlaying: true });
        });

        this.eventBus.on('audio:stopped', () => {
            this.updateState('audio', { isPlaying: false });
        });

        this.eventBus.on('audio:cleaned', () => {
            this.updateState('audio', {
                isInitialized: false,
                isPlaying: false
            });
        });

        // Scene state updates
        this.eventBus.on('scene:registered', ({ name }) => {
            const scenes = new Set(this.state.scene.availableScenes);
            scenes.add(name);
            this.updateState('scene', { availableScenes: scenes });
        });

        this.eventBus.on('scene:switched', ({ to }) => {
            this.updateState('scene', { 
                current: to,
                isTransitioning: false
            });
        });

        // UI state updates
        this.eventBus.on('ui:controls_toggled', (visible) => {
            this.updateState('ui', { controlsVisible: visible });
        });
    }

    updateState(section, updates) {
        const oldState = { ...this.state[section] };
        this.state[section] = { ...oldState, ...updates };

        this.eventBus.emit('state:updated', {
            section,
            oldState,
            newState: this.state[section]
        });
    }

    getState() {
        return { ...this.state };
    }

    getSection(section) {
        return { ...this.state[section] };
    }
}

// Export singleton instance
export default new AppState();
