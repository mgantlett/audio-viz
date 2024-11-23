import { Component } from '../core/Component';
import { EventBus } from '../core/EventBus';
import { TabSystem } from './TabSystem';
import type { SceneName } from '../types/scene';
import type { SceneSwitchedEvent } from '../types/events';

interface SceneButtons {
    scene1: HTMLElement | null;
    scene2: HTMLElement | null;
    scene3: HTMLElement | null;
}

export class SceneControls extends Component {
    protected static _instance: SceneControls;
    private eventBus: EventBus;
    private sceneButtons: SceneButtons;
    private basicControls: HTMLElement | null;
    private beatControls: HTMLElement | null;

    protected constructor() {
        super();
        this.eventBus = EventBus.getInstance();
        this.sceneButtons = {
            scene1: null,
            scene2: null,
            scene3: null
        };
        this.basicControls = null;
        this.beatControls = null;

        // Listen for menu creation
        this.eventBus.on('menu:created', () => {
            console.log('Menu created, initializing scene controls...');
            this.cacheElements();
            this.setupEventListeners();
        });
    }

    static override getInstance(): SceneControls {
        if (!SceneControls._instance) {
            SceneControls._instance = new SceneControls();
        }
        return SceneControls._instance;
    }

    protected async initializeComponent(): Promise<void> {
        console.log('Initializing SceneControls...');
        this.setupKeyboardShortcuts();
        console.log('SceneControls initialized successfully');
    }

    private cacheElements(): void {
        // Cache scene buttons
        (Object.keys(this.sceneButtons) as SceneName[]).forEach(sceneId => {
            this.sceneButtons[sceneId] = document.getElementById(sceneId);
            console.log(`Caching scene button ${sceneId}:`, this.sceneButtons[sceneId]);
        });

        // Cache control sections
        this.basicControls = document.querySelector('.basic-scene-controls');
        this.beatControls = document.querySelector('.beat-scene-controls');
    }

    private setupEventListeners(): void {
        // Set up click handlers for scene buttons
        (Object.entries(this.sceneButtons) as [SceneName, HTMLElement | null][]).forEach(([sceneId, button]) => {
            if (button) {
                console.log(`Setting up click handler for ${sceneId}`);
                button.addEventListener('click', (e) => {
                    console.log(`Scene button clicked: ${sceneId}`);
                    e.preventDefault();
                    e.stopPropagation();
                    this.eventBus.emit({ type: 'scene:switch', sceneId });
                    console.log(`Emitted scene:switch event for ${sceneId}`);
                    // Switch to controls tab
                    TabSystem.getInstance().switchTab('controls');
                    // Update controls visibility
                    this.updateControlsVisibility(sceneId);
                });
            } else {
                console.error(`Button not found for scene: ${sceneId}`);
            }
        });

        // Listen for scene changes to update button states and controls
        this.eventBus.on('scene:switched', (event: SceneSwitchedEvent) => {
            console.log('Scene switched event received:', event.to);
            this.updateSceneButtons(event.to);
            this.updateControlsVisibility(event.to);
        });
    }

    private setupKeyboardShortcuts(): void {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            const sceneMap: Record<string, SceneName> = {
                '1': 'scene1',
                '2': 'scene2',
                '3': 'scene3'
            };

            const sceneId = sceneMap[e.key];
            if (sceneId) {
                console.log(`Scene shortcut pressed: ${sceneId}`);
                this.eventBus.emit({ type: 'scene:switch', sceneId });
                // Switch to controls tab
                TabSystem.getInstance().switchTab('controls');
                // Update controls visibility
                this.updateControlsVisibility(sceneId);
            }
        });
    }

    private updateSceneButtons(activeSceneId: SceneName): void {
        console.log('Updating scene buttons for active scene:', activeSceneId);
        (Object.entries(this.sceneButtons) as [SceneName, HTMLElement | null][]).forEach(([sceneId, button]) => {
            if (button) {
                const isActive = sceneId === activeSceneId;
                button.classList.toggle('active', isActive);
                button.classList.toggle('bg-primary', isActive);
                button.classList.toggle('text-white', isActive);
                console.log(`Updated button ${sceneId}, active: ${isActive}`);
            }
        });
    }

    private updateControlsVisibility(sceneId: SceneName): void {
        if (!this.basicControls || !this.beatControls) return;

        const isBeatScene = sceneId === 'scene3';
        
        // Show/hide basic controls
        this.basicControls.classList.toggle('hidden', isBeatScene);
        
        // Show/hide beat scene controls
        this.beatControls.classList.toggle('hidden', !isBeatScene);
        
        console.log(`Updated controls visibility for scene ${sceneId}, isBeatScene: ${isBeatScene}`);
    }
}

// Export singleton instance
export const sceneControls = SceneControls.getInstance();
export default sceneControls;
