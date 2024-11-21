import EventBus from '../controllers/EventBus.js';
import audioController from '../controllers/AudioController.js';

export class AudioControls {
    constructor() {
        this.initialized = false;
        this.lastTempoUpdate = 0;
        this.isProcessingTempoChange = false;
        this.eventBus = EventBus.getInstance();
        this.updateInterval = null;
    }

    initialize() {
        if (this.initialized) return;
        console.log('Initializing AudioControls...');
        
        this.setupTempoControl();
        this.setupPatternShortcuts();
        this.startControlUpdates();
        
        this.initialized = true;
        console.log('AudioControls initialized successfully');
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
