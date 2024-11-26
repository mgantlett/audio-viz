import type { AudioManager } from '../core/audio/AudioManager';
import type { EventBus } from '../core/EventBus';

export class AudioControls {
    private container: HTMLElement;
    private playButton: HTMLElement;
    private volumeSlider: HTMLInputElement;
    private pitchSlider: HTMLInputElement;
    private currentAudioManager: AudioManager;

    constructor(private audioManager: AudioManager, private eventBus: EventBus) {
        this.currentAudioManager = audioManager;
        
        // Create container
        this.container = document.createElement('div');
        this.container.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 16px;
        `;

        // Create play button
        this.playButton = document.createElement('button');
        this.playButton.style.cssText = `
            width: 100%;
            height: 48px;
            background: rgba(33, 150, 243, 0.1);
            border: 1px solid rgba(33, 150, 243, 0.2);
            border-radius: 8px;
            color: #2196F3;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.2s ease-out;
            outline: none;
        `;
        this.playButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/>
            </svg>
            <span>Start Audio</span>
        `;
        this.playButton.onmouseover = () => {
            this.playButton.style.background = 'rgba(33, 150, 243, 0.2)';
            this.playButton.style.borderColor = 'rgba(33, 150, 243, 0.3)';
        };
        this.playButton.onmouseout = () => {
            this.playButton.style.background = 'rgba(33, 150, 243, 0.1)';
            this.playButton.style.borderColor = 'rgba(33, 150, 243, 0.2)';
        };
        this.playButton.onfocus = () => {
            this.playButton.style.boxShadow = '0 0 0 2px rgba(33, 150, 243, 0.3)';
        };
        this.playButton.onblur = () => {
            this.playButton.style.boxShadow = 'none';
        };

        // Create volume control
        const volumeContainer = document.createElement('div');
        volumeContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;
        const volumeLabel = document.createElement('label');
        volumeLabel.style.cssText = `
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        volumeLabel.innerHTML = `
            <span>Volume</span>
            <span style="color: #2196F3; font-family: monospace;">50%</span>
        `;
        this.volumeSlider = document.createElement('input');
        this.volumeSlider.type = 'range';
        this.volumeSlider.min = '0';
        this.volumeSlider.max = '100';
        this.volumeSlider.value = '50';
        this.volumeSlider.style.cssText = `
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            outline: none;
            -webkit-appearance: none;
            cursor: pointer;
        `;
        volumeContainer.appendChild(volumeLabel);
        volumeContainer.appendChild(this.volumeSlider);

        // Create pitch control
        const pitchContainer = document.createElement('div');
        pitchContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;
        const pitchLabel = document.createElement('label');
        pitchLabel.style.cssText = `
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        pitchLabel.innerHTML = `
            <span>Pitch</span>
            <span style="color: #2196F3; font-family: monospace;">1.00x</span>
        `;
        this.pitchSlider = document.createElement('input');
        this.pitchSlider.type = 'range';
        this.pitchSlider.min = '0';
        this.pitchSlider.max = '100';
        this.pitchSlider.value = '50';
        this.pitchSlider.style.cssText = `
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            outline: none;
            -webkit-appearance: none;
            cursor: pointer;
        `;
        pitchContainer.appendChild(pitchLabel);
        pitchContainer.appendChild(this.pitchSlider);

        // Add components to container
        this.container.appendChild(this.playButton);
        this.container.appendChild(volumeContainer);
        this.container.appendChild(pitchContainer);

        // Set up event listeners
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Play button
        this.playButton.onclick = () => {
            if (this.currentAudioManager.isPlaying) {
                this.currentAudioManager.stop();
            } else {
                this.currentAudioManager.start();
            }
        };

        // Volume slider
        this.volumeSlider.oninput = (e) => {
            const value = (e.target as HTMLInputElement).value;
            const volume = parseInt(value) / 100;
            this.currentAudioManager.setVolume(volume);
        };

        // Pitch slider
        this.pitchSlider.oninput = (e) => {
            const value = (e.target as HTMLInputElement).value;
            const pitch = (parseInt(value) / 50) * 2; // Map 0-100 to 0-2
            this.currentAudioManager.setFrequency(440 * pitch);
        };

        // Listen for audio state changes
        this.eventBus.on('audio:state_changed', (event) => {
            // Update play button
            this.updatePlayButton(event.isPlaying);

            // Update volume slider
            const volumeValue = Math.round(event.metrics.volume * 100);
            this.volumeSlider.value = volumeValue.toString();
            const volumeLabel = this.volumeSlider.previousElementSibling;
            if (volumeLabel) {
                const valueSpan = volumeLabel.querySelector('span:last-child');
                if (valueSpan) {
                    valueSpan.textContent = `${volumeValue}%`;
                }
            }

            // Update pitch slider
            const normalizedPitch = event.metrics.frequency / 440;
            const pitchValue = Math.round((normalizedPitch * 50));
            this.pitchSlider.value = pitchValue.toString();
            const pitchLabel = this.pitchSlider.previousElementSibling;
            if (pitchLabel) {
                const valueSpan = pitchLabel.querySelector('span:last-child');
                if (valueSpan) {
                    valueSpan.textContent = `${normalizedPitch.toFixed(2)}x`;
                }
            }
        });

        // Listen for audio manager changes
        this.eventBus.on('audio:manager_changed', (event) => {
            this.currentAudioManager = event.manager;
            // Update UI state based on new manager
            this.updatePlayButton(this.currentAudioManager.isPlaying);
            const volume = this.currentAudioManager.getCurrentVolume();
            const frequency = this.currentAudioManager.getCurrentFrequency();
            this.volumeSlider.value = (volume * 100).toString();
            this.pitchSlider.value = ((frequency / 440) * 50).toString();
        });
    }

    private updatePlayButton(isPlaying: boolean): void {
        if (isPlaying) {
            this.playButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none"/>
                    <rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none"/>
                </svg>
                <span>Stop Audio</span>
            `;
        } else {
            this.playButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/>
                </svg>
                <span>Start Audio</span>
            `;
        }
    }

    public mount(parent: HTMLElement): void {
        parent.appendChild(this.container);
    }

    public unmount(): void {
        this.container.remove();
    }
}

export const createAudioControls = (audioManager: AudioManager, eventBus: EventBus): AudioControls => {
    return new AudioControls(audioManager, eventBus);
};
