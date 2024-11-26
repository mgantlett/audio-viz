import type { AudioManager } from '../core/audio/AudioManager';
import type { EventBus } from '../core/EventBus';
import { AudioControls, createAudioControls } from './AudioControls';
import { SceneSelector, createSceneSelector } from './SceneSelector';
import { Oscilloscope, createOscilloscope } from './Oscilloscope';

export class Menu {
    private container: HTMLElement;
    private menuButton: HTMLElement;
    private menuPanel: HTMLElement;
    private audioControls!: AudioControls;
    private sceneSelector!: SceneSelector;
    private oscilloscope!: Oscilloscope;
    private isOpen = false;

    constructor(
        private audioManager: AudioManager,
        private eventBus: EventBus
    ) {
        // Create container
        this.container = document.createElement('div');
        this.container.style.cssText = `
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
        `;

        // Create menu button
        this.menuButton = document.createElement('button');
        this.menuButton.setAttribute('aria-label', 'Toggle Menu');
        this.menuButton.setAttribute('aria-expanded', 'false');
        this.menuButton.style.cssText = `
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #2196F3;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: center;
            outline: none;
        `;
        this.menuButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
        `;
        this.menuButton.onmouseover = () => {
            this.menuButton.style.transform = this.isOpen ? 'scale(1.1) rotate(90deg)' : 'scale(1.1)';
            this.menuButton.style.backgroundColor = '#1976D2';
            this.menuButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        };
        this.menuButton.onmouseout = () => {
            this.menuButton.style.transform = this.isOpen ? 'rotate(90deg)' : '';
            this.menuButton.style.backgroundColor = '#2196F3';
            this.menuButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        };
        this.menuButton.onfocus = () => {
            this.menuButton.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.3)';
        };
        this.menuButton.onblur = () => {
            this.menuButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        };

        // Create menu panel
        this.menuPanel = document.createElement('div');
        this.menuPanel.setAttribute('role', 'dialog');
        this.menuPanel.setAttribute('aria-label', 'Menu');
        this.menuPanel.style.cssText = `
            visibility: hidden;
            position: absolute;
            top: 56px;
            right: 0;
            width: 320px;
            background: rgba(13, 13, 17, 0.98);
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.1);
            overflow: hidden;
            opacity: 0;
            transform: translateY(-8px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        // Create panel sections
        const scenesSection = document.createElement('div');
        scenesSection.style.cssText = `
            padding: 16px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            background: rgba(0,0,0,0.2);
        `;
        scenesSection.innerHTML = '<h2 style="color: #2196F3; font-size: 14px; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Scenes</h2>';

        const controlsSection = document.createElement('div');
        controlsSection.style.cssText = `
            padding: 16px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            background: rgba(0,0,0,0.2);
        `;
        controlsSection.innerHTML = '<h2 style="color: #2196F3; font-size: 14px; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Controls</h2>';

        const visualizerSection = document.createElement('div');
        visualizerSection.style.cssText = `
            padding: 16px;
            background: rgba(0,0,0,0.2);
        `;
        visualizerSection.innerHTML = '<h2 style="color: #2196F3; font-size: 14px; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Visualizer</h2>';

        // Add sections to panel
        this.menuPanel.appendChild(scenesSection);
        this.menuPanel.appendChild(controlsSection);
        this.menuPanel.appendChild(visualizerSection);

        // Store section references for mounting components
        this.scenesContainer = scenesSection;
        this.controlsContainer = controlsSection;
        this.visualizerContainer = visualizerSection;

        // Add components to DOM
        this.container.appendChild(this.menuButton);
        this.container.appendChild(this.menuPanel);
    }

    private scenesContainer: HTMLElement;
    private controlsContainer: HTMLElement;
    private visualizerContainer: HTMLElement;

    public async initialize(): Promise<void> {
        console.log('[Menu] Starting initialization...');

        // Initialize components
        this.audioControls = createAudioControls(this.audioManager, this.eventBus);
        this.sceneSelector = createSceneSelector(this.eventBus);
        this.oscilloscope = createOscilloscope(this.audioManager);

        // Mount components to their sections
        this.sceneSelector.mount(this.scenesContainer);
        this.audioControls.mount(this.controlsContainer);
        this.oscilloscope.mount(this.visualizerContainer);

        // Add event listeners
        this.menuButton.addEventListener('click', () => this.toggleMenu());
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target as Node) && this.isOpen) {
                this.hideMenu();
            }
        });

        // Mount menu to DOM
        document.body.appendChild(this.container);

        // Listen for keyboard shortcuts
        this.eventBus.on('menu:toggle', () => this.toggleMenu());

        // Add keyboard navigation
        this.menuPanel.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.hideMenu();
                this.menuButton.focus();
            }
        });

        console.log('[Menu] Initialization complete');
    }

    private toggleMenu(): void {
        if (this.isOpen) {
            this.hideMenu();
        } else {
            this.showMenu();
        }
    }

    private showMenu(): void {
        // Make panel visible but still transparent
        this.menuPanel.style.visibility = 'visible';
        
        // Force a reflow
        this.menuPanel.offsetHeight;
        
        // Animate in
        this.menuPanel.style.opacity = '1';
        this.menuPanel.style.transform = 'translateY(0)';
        
        // Rotate button and update ARIA
        this.menuButton.style.transform = 'rotate(90deg)';
        this.menuButton.setAttribute('aria-expanded', 'true');
        
        this.isOpen = true;
        window.dispatchEvent(new Event('resize')); // For oscilloscope
    }

    private hideMenu(): void {
        // Start animation
        this.menuPanel.style.opacity = '0';
        this.menuPanel.style.transform = 'translateY(-8px)';
        
        // Reset button and update ARIA
        this.menuButton.style.transform = '';
        this.menuButton.setAttribute('aria-expanded', 'false');
        
        // Hide panel after animation
        setTimeout(() => {
            if (!this.isOpen) { // Check if still closed
                this.menuPanel.style.visibility = 'hidden';
            }
        }, 300); // Match transition duration
        
        this.isOpen = false;
    }

    public cleanup(): void {
        this.audioControls.unmount();
        this.sceneSelector.unmount();
        this.oscilloscope.unmount();
        this.container.remove();
    }
}

export const createMenu = (audioManager: AudioManager, eventBus: EventBus): Menu => {
    return new Menu(audioManager, eventBus);
};
