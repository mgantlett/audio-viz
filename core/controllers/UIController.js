import EventBus from './EventBus.js';
import audioController from './AudioController.js';

export class UIController {
    constructor() {
        this.initialized = false;
        this.elements = {
            startButton: null,
            stopButton: null
        };
        this.eventBus = EventBus.getInstance();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventBus.on('audio:started', () => {
            this.elements.startButton.classList.add('hidden');
            this.elements.stopButton.classList.remove('hidden');
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
    }

    initialize() {
        if (this.initialized) return;
        this.cacheElements();
        this.setupAudioControls();
        this.initialized = true;
    }

    cacheElements() {
        this.elements.startButton = document.getElementById('startButton');
        this.elements.stopButton = document.getElementById('stopButton');
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

    resetAudioButton() {
        this.elements.startButton.classList.remove('hidden');
        this.elements.stopButton.classList.add('hidden');
        this.elements.startButton.disabled = false;
    }
}

// Export singleton instance
export default new UIController();
