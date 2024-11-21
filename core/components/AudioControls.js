import EventBus from '../controllers/EventBus.js';
import audioController from '../controllers/AudioController.js';

export class AudioControls {
    constructor() {
        this.initialized = false;
        this.lastTempoUpdate = 0;
        this.isProcessingTempoChange = false;
        this.eventBus = EventBus.getInstance();
        this.updateInterval = null;
        this.elements = {
            startButton: null,
            stopButton: null
        };
    }

    initialize() {
        if (this.initialized) return;
        console.log('Initializing AudioControls...');
        
        this.cacheElements();
        this.setupEventListeners();
        this.setupTempoControl();
        this.setupPatternShortcuts();
        this.startControlUpdates();
        
        this.initialized = true;
        console.log('AudioControls initialized successfully');
    }

    cacheElements() {
        this.elements.startButton = document.getElementById('startButton');
        this.elements.stopButton = document.getElementById('stopButton');
    }

    setupEventListeners() {
        // Start button click handler
        if (this.elements.startButton) {
            this.elements.startButton.addEventListener('click', async () => {
                console.log('Start button clicked');
                this.elements.startButton.disabled = true;
                
                try {
                    if (!audioController.isAudioInitialized()) {
                        const mode = audioController.isEnhancedMode ? 'enhanced' : 'basic';
                        // Set up one-time listener for initialization completion
                        const initPromise = new Promise((resolve, reject) => {
                            const initHandler = (data) => {
                                if (data.success) {
                                    resolve();
                                } else {
                                    reject(new Error('Audio initialization failed'));
                                }
                                this.eventBus.off('audio:initialized', initHandler);
                            };
                            this.eventBus.on('audio:initialized', initHandler);
                        });

                        // Emit initialization event
                        this.eventBus.emit('audio:initialize', mode);

                        // Wait for initialization to complete
                        await initPromise;
                    }

                    // Start audio after initialization is complete
                    this.eventBus.emit('audio:start');
                } catch (error) {
                    console.error('Error during audio start:', error);
                    this.elements.startButton.disabled = false;
                }
            });
        }

        // Stop button click handler
        if (this.elements.stopButton) {
            this.elements.stopButton.addEventListener('click', () => {
                console.log('Stop button clicked');
                this.eventBus.emit('audio:stop');
            });
        }

        // Listen for audio state changes
        this.eventBus.on('audio:started', () => {
            this.elements.startButton?.classList.add('hidden');
            this.elements.stopButton?.classList.remove('hidden');
        });

        this.eventBus.on('audio:stopped', () => {
            this.elements.stopButton?.classList.add('hidden');
            this.elements.startButton?.classList.remove('hidden');
            if (this.elements.startButton) {
                this.elements.startButton.disabled = false;
            }
        });

        this.eventBus.on('audio:error', (error) => {
            console.error('Audio error:', error);
            if (this.elements.startButton) {
                this.elements.startButton.disabled = false;
            }
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

    setupPatternShortcuts() {
        document.addEventListener('keydown', (e) => {
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
            }
        });
    }

    startControlUpdates() {
        // Clear any existing interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(() => {
            if (audioController.isAudioInitialized()) {
                this.updateControlValues();
            }
        }, 100);
    }

    updateControlValues() {
        const controlItems = document.querySelectorAll('.control-item');
        controlItems.forEach(item => {
            const label = item.querySelector('.label')?.textContent.toLowerCase();
            const valueSpan = item.querySelector('.value');
            
            if (!label || !valueSpan) return;

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

    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Export singleton instance
export default new AudioControls();
