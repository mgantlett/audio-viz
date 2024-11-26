import type { EventBus } from './EventBus';
import type { SceneName } from '../types/scene';
import { SCENES } from '../types/scene';

export class KeyboardManager {
    private readonly VOLUME_STEP = 0.1;
    private readonly FREQUENCY_STEP = 20;
    private readonly FINE_CONTROL_MULTIPLIER = 0.1;

    constructor(private eventBus: EventBus) {}

    public async initialize(): Promise<void> {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    private handleKeyDown(event: KeyboardEvent): void {
        // Ignore key events when typing in input fields
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
            return;
        }

        const isFineControl = event.shiftKey;
        const step = isFineControl ? this.FINE_CONTROL_MULTIPLIER : 1;

        switch (event.code) {
            case 'Space':
                this.eventBus.emit({ type: 'audio:toggle' });
                event.preventDefault();
                break;

            case 'ArrowUp':
                if (window.audioManager) {
                    const currentVolume = window.audioManager.getCurrentVolume();
                    const newVolume = Math.min(1, currentVolume + (this.VOLUME_STEP * step));
                    this.eventBus.emit({
                        type: 'audio:volume',
                        value: newVolume
                    });
                }
                event.preventDefault();
                break;

            case 'ArrowDown':
                if (window.audioManager) {
                    const currentVolume = window.audioManager.getCurrentVolume();
                    const newVolume = Math.max(0, currentVolume - (this.VOLUME_STEP * step));
                    this.eventBus.emit({
                        type: 'audio:volume',
                        value: newVolume
                    });
                }
                event.preventDefault();
                break;

            case 'ArrowRight':
                if (window.audioManager) {
                    const currentFreq = window.audioManager.getCurrentFrequency();
                    const newFreq = Math.min(880, currentFreq + (this.FREQUENCY_STEP * step));
                    this.eventBus.emit({
                        type: 'audio:frequency',
                        value: newFreq
                    });
                }
                event.preventDefault();
                break;

            case 'ArrowLeft':
                if (window.audioManager) {
                    const currentFreq = window.audioManager.getCurrentFrequency();
                    const newFreq = Math.max(220, currentFreq - (this.FREQUENCY_STEP * step));
                    this.eventBus.emit({
                        type: 'audio:frequency',
                        value: newFreq
                    });
                }
                event.preventDefault();
                break;

            case 'KeyM':
                this.eventBus.emit({ type: 'menu:toggle' });
                event.preventDefault();
                break;

            case 'Digit1':
                this.switchScene(SCENES.STICK_FIGURES);
                event.preventDefault();
                break;

            case 'Digit2':
                this.switchScene(SCENES.PARTICLE_WAVE);
                event.preventDefault();
                break;

            case 'Digit3':
                this.switchScene(SCENES.BEAT);
                event.preventDefault();
                break;
        }
    }

    private switchScene(sceneName: SceneName): void {
        this.eventBus.emit({
            type: 'scene:switch',
            sceneId: sceneName
        });
    }

    public cleanup(): void {
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }
}

export const createKeyboardManager = (eventBus: EventBus): KeyboardManager => {
    return new KeyboardManager(eventBus);
};
