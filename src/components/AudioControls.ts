import { Component } from '../core/Component';
import { EventBus } from '../core/EventBus';
import { audioManager } from '../core/audio';
import { sceneManager } from '../core/SceneManager';
import type { IAudioManager } from '../types/audio';

interface ControlEvent {
    deltaY: number;
    preventDefault: () => void;
    clientX?: number;
}

export class AudioControls extends Component {
    protected static _instance: AudioControls;
    private lastTempoUpdate: number;
    private isProcessingTempoChange: boolean;
    private eventBus: EventBus;
    private updateInterval: number | null;
    private startButton: HTMLElement | null;
    private stopButton: HTMLElement | null;
    private touchStartY: number | null;
    private lastTouchY: number | null;
    private keyboardHelpTimeout: number | null;
    private volumeBar: HTMLElement | null;
    private pitchBar: HTMLElement | null;
    private volumeValue: HTMLElement | null;
    private pitchValue: HTMLElement | null;
    private isInitializing: boolean;
    private isStoppingAudio: boolean;

    protected constructor() {
        super();
        this.lastTempoUpdate = 0;
        this.isProcessingTempoChange = false;
        this.eventBus = EventBus.getInstance();
        this.updateInterval = null;
        this.startButton = null;
        this.stopButton = null;
        this.touchStartY = null;
        this.lastTouchY = null;
        this.keyboardHelpTimeout = null;
        this.volumeBar = null;
        this.pitchBar = null;
        this.volumeValue = null;
        this.pitchValue = null;
        this.isInitializing = false;
        this.isStoppingAudio = false;
    }

    static override getInstance(): AudioControls {
        if (!AudioControls._instance) {
            AudioControls._instance = new AudioControls();
        }
        return AudioControls._instance;
    }

    protected async initializeComponent(): Promise<void> {
        console.log('Initializing AudioControls...');
        
        this.setupButtons();
        this.setupControls();
        this.setupPatternShortcuts();
        this.setupEventListeners();
        this.setupHelpButton();
        this.startControlUpdates();
        
        // Listen for tab changes
        const controlsTab = document.querySelector('[data-tab="controls"]');
        if (controlsTab) {
            controlsTab.addEventListener('click', () => {
                console.log('Controls tab clicked, caching elements...');
                // Use setTimeout to ensure DOM is updated
                setTimeout(() => {
                    this.cacheControlElements();
                    // Initialize values if audio is playing
                    if (audioManager.isInitialized() && audioManager.isPlaying) {
                        this.initializeControlValues();
                    }
                }, 0);
            });
        }
        
        console.log('AudioControls initialized successfully');
    }

    private cacheControlElements(): void {
        console.log('Caching control elements...');
        this.volumeBar = document.querySelector('.volume-bar');
        this.pitchBar = document.querySelector('.pitch-bar');
        this.volumeValue = document.querySelector('.control-item.volume .value');
        this.pitchValue = document.querySelector('.control-item.pitch .value');
        
        if (!this.volumeBar || !this.pitchBar || !this.volumeValue || !this.pitchValue) {
            console.warn('Some control elements not found:', {
                volumeBar: !!this.volumeBar,
                pitchBar: !!this.pitchBar,
                volumeValue: !!this.volumeValue,
                pitchValue: !!this.pitchValue
            });
        }
    }

    private setupHelpButton(): void {
        const helpButton = document.querySelector('.help-button');
        const helpPanel = document.querySelector('.keyboard-help');

        if (helpButton && helpPanel) {
            helpButton.addEventListener('click', () => {
                helpPanel.classList.toggle('hidden');
            });

            // Close help panel when clicking outside
            document.addEventListener('click', (e) => {
                if (!helpButton.contains(e.target as Node) && !helpPanel.contains(e.target as Node)) {
                    helpPanel.classList.add('hidden');
                }
            });
        }
    }

    private setupEventListeners(): void {
        this.eventBus.on('audio:initialized', async ({ success }) => {
            if (success) {
                console.log('Audio initialized successfully');
                // Only start playback if context is running
                if (audioManager.context?.state === 'running') {
                    console.log('Context running, starting playback...');
                    this.eventBus.emit({ type: 'audio:start' });
                } else {
                    console.log('Context not running, updating button state...');
                    this.updateButtonState();
                }
            } else {
                console.error('Audio initialization failed');
                this.updateButtonState();
            }
            this.isInitializing = false;
        });

        this.eventBus.on('audio:error', ({ error }) => {
            console.error('Audio error:', error);
            this.updateButtonState();
            this.isInitializing = false;
            this.isStoppingAudio = false;
        });

        this.eventBus.on('audio:stop', async () => {
            if (this.isStoppingAudio) {
                console.log('Stop operation already in progress');
                return;
            }

            this.isStoppingAudio = true;
            try {
                console.log('Stopping audio playback...');
                await audioManager.stop();
                // Force a small delay to ensure cleanup is complete
                await new Promise(resolve => setTimeout(resolve, 200));
                this.updateButtonState();
            } catch (error) {
                console.error('Error stopping audio:', error);
                this.eventBus.emit({ 
                    type: 'audio:error', 
                    error: error instanceof Error ? error : new Error('Unknown error stopping audio')
                });
            } finally {
                this.isStoppingAudio = false;
            }
        });

        this.eventBus.on('audio:start', async () => {
            try {
                console.log('Starting audio playback...');
                await audioManager.start();
                this.updateButtonState();
                // Initialize control values when audio starts
                this.initializeControlValues();
            } catch (error) {
                console.error('Error starting audio:', error);
                this.eventBus.emit({ 
                    type: 'audio:error', 
                    error: error instanceof Error ? error : new Error('Unknown error starting audio')
                });
            }
        });

        // Add listeners for stopped and started events
        this.eventBus.on('audio:stopped', () => {
            console.log('Audio stopped event received');
            this.updateButtonState();
        });

        this.eventBus.on('audio:started', () => {
            console.log('Audio started event received');
            this.updateButtonState();
        });
    }

    private initializeControlValues(): void {
        if (!audioManager.isInitialized()) return;

        // Cache elements if not already cached
        if (!this.volumeBar || !this.pitchBar || !this.volumeValue || !this.pitchValue) {
            this.cacheControlElements();
        }

        // Initialize volume control
        const volume = sceneManager.getCurrentVolume();
        this.updateVolumeUI(volume);

        // Initialize pitch control
        const pitch = sceneManager.getCurrentPitch();
        this.updatePitchUI(pitch);
    }

    private updateButtonState(): void {
        if (!this.startButton || !this.stopButton) {
            this.startButton = document.getElementById('startButton');
            this.stopButton = document.getElementById('stopButton');
            if (!this.startButton || !this.stopButton) return;
        }

        const isInitialized = audioManager.isInitialized();
        const isPlaying = audioManager.isPlaying;

        console.log('Updating button state:', { isInitialized, isPlaying });

        if (!isInitialized || !isPlaying) {
            this.stopButton.classList.add('hidden');
            this.startButton.classList.remove('hidden');
            this.startButton.textContent = isInitialized ? 'Start Audio' : 'Initialize Audio System';
        } else {
            this.startButton.classList.add('hidden');
            this.stopButton.classList.remove('hidden');
        }
    }

    private setupButtons(): void {
        this.startButton = document.getElementById('startButton');
        this.stopButton = document.getElementById('stopButton');

        const handleStart = async (): Promise<void> => {
            if (this.isInitializing || this.isStoppingAudio) {
                console.log('Operation in progress');
                return;
            }

            try {
                if (!audioManager.isInitialized()) {
                    console.log('Initializing audio system...');
                    this.isInitializing = true;
                    const success = await sceneManager.initializeAudioForCurrentScene();
                    if (success) {
                        // Ensure audio context is resumed before proceeding
                        if (audioManager.context) {
                            await audioManager.context.resume();
                            this.eventBus.emit({ type: 'audio:initialized', success: true });
                        }
                    } else {
                        throw new Error('Failed to initialize audio');
                    }
                } else if (audioManager.context?.state === 'suspended') {
                    // If initialized but suspended, resume context and start
                    await audioManager.context.resume();
                    this.eventBus.emit({ type: 'audio:start' });
                } else {
                    // Context is running, just start audio
                    this.eventBus.emit({ type: 'audio:start' });
                }
            } catch (error) {
                console.error('Error initializing/starting audio:', error);
                this.eventBus.emit({ 
                    type: 'audio:error', 
                    error: error instanceof Error ? error : new Error('Unknown error initializing audio')
                });
                this.isInitializing = false;
            }
        };

        const handleStop = async (): Promise<void> => {
            if (this.isInitializing || this.isStoppingAudio) {
                console.log('Cannot stop while operation in progress');
                return;
            }

            console.log('Stopping audio system...');
            try {
                this.eventBus.emit({ type: 'audio:stop' });
            } catch (error) {
                console.error('Error stopping audio:', error);
                this.eventBus.emit({ 
                    type: 'audio:error', 
                    error: error instanceof Error ? error : new Error('Unknown error stopping audio')
                });
            }
        };

        if (this.startButton) {
            // Mouse/Touch events for start button
            this.startButton.addEventListener('click', handleStart);
            this.startButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                handleStart();
            });
        }

        if (this.stopButton) {
            // Mouse/Touch events for stop button
            this.stopButton.addEventListener('click', handleStop);
            this.stopButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                handleStop();
            });
        }

        // Keyboard controls for start/stop
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!audioManager.isInitialized()) return;

            if (e.code === 'Space') {
                e.preventDefault();
                if (audioManager.isPlaying) {
                    handleStop();
                } else {
                    handleStart();
                }
            }
        });

        this.updateButtonState();
    }

    private setupControls(): void {
        // Mouse wheel control
        document.addEventListener('wheel', (e: WheelEvent) => {
            this.handleControlChange({
                deltaY: e.deltaY,
                preventDefault: () => e.preventDefault(),
                clientX: e.clientX
            });
        }, { passive: false });

        // Touch controls
        document.addEventListener('touchstart', (e: TouchEvent) => {
            const touch = e.touches[0];
            this.touchStartY = touch.clientY;
            this.lastTouchY = touch.clientY;
        });

        document.addEventListener('touchmove', (e: TouchEvent) => {
            if (this.touchStartY === null || this.lastTouchY === null) return;
            
            const touch = e.touches[0];
            const deltaY = this.lastTouchY - touch.clientY;
            this.lastTouchY = touch.clientY;

            this.handleControlChange({
                deltaY,
                preventDefault: () => e.preventDefault(),
                clientX: touch.clientX
            });
        });

        document.addEventListener('touchend', () => {
            this.touchStartY = null;
            this.lastTouchY = null;
        });

        // Keyboard controls for pitch/volume
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!audioManager.isInitialized() || !audioManager.isPlaying) {
                console.log('Audio not ready for keyboard controls');
                return;
            }

            const step = e.shiftKey ? 0.1 : 0.2; // Increased step sizes for more noticeable changes
            let handled = true;

            switch (e.key) {
                case 'ArrowUp':
                    console.log('Volume up');
                    this.adjustVolume(step);
                    this.showKeyboardFeedback('volume');
                    break;
                case 'ArrowDown':
                    console.log('Volume down');
                    this.adjustVolume(-step);
                    this.showKeyboardFeedback('volume');
                    break;
                case 'ArrowRight':
                    console.log('Pitch up');
                    this.adjustPitch(step);
                    this.showKeyboardFeedback('pitch');
                    break;
                case 'ArrowLeft':
                    console.log('Pitch down');
                    this.adjustPitch(-step);
                    this.showKeyboardFeedback('pitch');
                    break;
                default:
                    handled = false;
            }

            if (handled) {
                e.preventDefault();
            }
        });
    }

    private showKeyboardFeedback(control: string): void {
        const controlElement = document.querySelector(`.control-item.${control}`);
        if (controlElement) {
            controlElement.classList.add('bg-white/[0.06]');
            if (this.keyboardHelpTimeout) {
                clearTimeout(this.keyboardHelpTimeout);
            }
            this.keyboardHelpTimeout = window.setTimeout(() => {
                controlElement.classList.remove('bg-white/[0.06]');
            }, 200);
        }
    }

    private handleControlChange(event: ControlEvent): void {
        if (!audioManager.isInitialized() || !audioManager.isPlaying || this.isProcessingTempoChange) return;
        
        event.preventDefault();
        
        if (Date.now() - this.lastTempoUpdate < 50) return;
        this.lastTempoUpdate = Date.now();
        
        this.isProcessingTempoChange = true;

        if (sceneManager.isEnhancedMode) {
            const delta = event.deltaY < 0 ? 5 : -5;
            sceneManager.updateTempo(delta);
            this.updateControlValues();
        } else {
            // Adjust pitch/volume based on mouse/touch position
            const x = event.clientX ?? window.innerWidth / 2;
            const isRightHalf = x > window.innerWidth / 2;
            
            if (isRightHalf) {
                this.adjustPitch(event.deltaY < 0 ? 0.01 : -0.01);
                this.showKeyboardFeedback('pitch');
            } else {
                this.adjustVolume(event.deltaY < 0 ? 0.01 : -0.01);
                this.showKeyboardFeedback('volume');
            }
        }
        
        setTimeout(() => {
            this.isProcessingTempoChange = false;
        }, 50);
    }

    private adjustVolume(delta: number): void {
        console.log('Adjusting volume by:', delta);
        const currentVolume = sceneManager.getCurrentVolume();
        const newVolume = Math.max(0, Math.min(1, currentVolume + delta));
        console.log('New volume:', newVolume);
        audioManager.setVolume(newVolume);
        this.updateVolumeUI(newVolume);
    }

    private adjustPitch(delta: number): void {
        console.log('Adjusting pitch by:', delta);
        const currentPitch = sceneManager.getCurrentPitch();
        const newPitch = Math.max(0.5, Math.min(2, currentPitch + delta));
        console.log('New pitch:', newPitch);
        audioManager.setFrequency(newPitch * 440);
        this.updatePitchUI(newPitch);
    }

    private updateVolumeUI(volume: number): void {
        if (!this.volumeBar || !this.volumeValue) {
            this.cacheControlElements();
        }
        if (this.volumeBar) {
            this.volumeBar.style.width = `${volume * 100}%`;
        }
        if (this.volumeValue) {
            this.volumeValue.textContent = `${Math.round(volume * 100)}%`;
        }
    }

    private updatePitchUI(pitch: number): void {
        if (!this.pitchBar || !this.pitchValue) {
            this.cacheControlElements();
        }
        const percentage = ((pitch - 0.5) / (2.0 - 0.5)) * 100;
        if (this.pitchBar) {
            this.pitchBar.style.width = `${percentage}%`;
        }
        if (this.pitchValue) {
            this.pitchValue.textContent = `${pitch.toFixed(2)}x`;
        }
    }

    private setupPatternShortcuts(): void {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!audioManager.isInitialized() || !audioManager.isPlaying) return;

            const patternMap: Record<string, string> = {
                'b': 'basic',
                'B': 'basic',
                's': 'syncopated',
                'S': 'syncopated',
                'c': 'complex',
                'C': 'complex'
            };

            const pattern = patternMap[e.key];
            if (pattern) {
                (audioManager as IAudioManager).setPattern(pattern);
            }
        });
    }

    private startControlUpdates(): void {
        if (this.updateInterval) {
            window.clearInterval(this.updateInterval);
        }

        this.updateInterval = window.setInterval(() => {
            if (audioManager.isInitialized() && audioManager.isPlaying) {
                // Update volume and pitch
                const volume = sceneManager.getCurrentVolume();
                const pitch = sceneManager.getCurrentPitch();
                
                this.updateVolumeUI(volume);
                this.updatePitchUI(pitch);

                // Update tempo in enhanced mode
                if (sceneManager.isEnhancedMode) {
                    this.updateControlValues();
                }
            }
        }, 100);
    }

    private updateControlValues(): void {
        const controlItems = document.querySelectorAll('.control-item');
        controlItems.forEach(item => {
            const label = item.querySelector('.label')?.textContent?.toLowerCase();
            const valueSpan = item.querySelector('.value');
            const progressBar = item.querySelector('.pitch-bar, .volume-bar, .tempo-bar');
            
            if (!label || !valueSpan) return;

            if (sceneManager.isEnhancedMode) {
                if (label === 'tempo' && audioManager.isInitialized()) {
                    const tempo = sceneManager.currentTempo;
                    valueSpan.textContent = `${tempo} BPM`;
                    if (progressBar instanceof HTMLElement) {
                        // Map tempo (60-180) to percentage
                        const percentage = ((tempo - 60) / (180 - 60)) * 100;
                        progressBar.style.width = `${percentage}%`;
                    }
                }
            }
        });
    }

    cleanup(): void {
        if (this.updateInterval) {
            window.clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        if (this.keyboardHelpTimeout) {
            clearTimeout(this.keyboardHelpTimeout);
            this.keyboardHelpTimeout = null;
        }
    }
}

// Export singleton instance
export const audioControls = AudioControls.getInstance();
export default audioControls;
