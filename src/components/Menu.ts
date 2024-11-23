import { Component } from '../core/Component';
import { EventBus } from '../core/EventBus';
import { TabSystem } from './TabSystem';
import { menuTemplate, toggleButtonTemplate } from './MenuTemplate';
import type { SceneName } from '../types/scene';

interface MenuElements {
    menuToggleBtn: HTMLElement | null;
    sideControls: HTMLElement | null;
    controlsOverlay: HTMLElement | null;
    tabButtons: NodeListOf<Element> | null;
    sceneButtons: NodeListOf<Element> | null;
}

export class Menu extends Component {
    protected static _instance: Menu;
    private elements: MenuElements;
    private eventBus: EventBus;
    private isMenuOpen: boolean;

    protected constructor() {
        super();
        this.elements = {
            menuToggleBtn: null,
            sideControls: null,
            controlsOverlay: null,
            tabButtons: null,
            sceneButtons: null
        };
        this.eventBus = EventBus.getInstance();
        this.isMenuOpen = false;
    }

    static override getInstance(): Menu {
        if (!Menu._instance) {
            Menu._instance = new Menu();
        }
        return Menu._instance;
    }

    protected async initializeComponent(): Promise<void> {
        console.log('Initializing Menu component...');
        this.createMenuStructure();
        
        if (this.validateElements()) {
            this.setupEventListeners();
            this.hideControls(); // Initially hide menu and show toggle button
            
            // Initialize TabSystem after menu structure is created
            console.log('Initializing TabSystem from Menu...');
            await TabSystem.initialize();
            
            console.log('Menu component initialized successfully');
            
            // Emit event when menu is fully initialized
            this.eventBus.emit({ type: 'menu:initialized' });
        } else {
            throw new Error('Failed to initialize Menu: Missing required elements');
        }
    }

    private createMenuStructure(): void {
        // Create controls overlay if it doesn't exist
        let controlsOverlay = document.getElementById('controls-overlay');
        if (!controlsOverlay) {
            controlsOverlay = document.createElement('div');
            controlsOverlay.id = 'controls-overlay';
            controlsOverlay.className = 'absolute inset-0 pointer-events-none';
            document.getElementById('app')?.appendChild(controlsOverlay);
        }
        this.elements.controlsOverlay = controlsOverlay;

        // Add menu toggle button
        const toggleButtonContainer = document.createElement('div');
        toggleButtonContainer.innerHTML = toggleButtonTemplate;
        document.getElementById('app')?.appendChild(toggleButtonContainer.firstElementChild!);

        // Add menu content
        const menuContainer = document.createElement('div');
        menuContainer.innerHTML = menuTemplate;
        controlsOverlay.appendChild(menuContainer.firstElementChild!);

        // Cache elements after creation
        this.cacheElements();
        
        // Emit event when menu structure is created
        this.eventBus.emit({ type: 'menu:created' });
    }

    private validateElements(): boolean {
        const requiredElements: (keyof MenuElements)[] = [
            'menuToggleBtn',
            'sideControls',
            'controlsOverlay'
        ];
        
        return requiredElements.every(elementKey => {
            const element = this.elements[elementKey];
            if (!element) {
                console.error(`Missing required element: ${elementKey}`);
                return false;
            }
            return true;
        });
    }

    private cacheElements(): void {
        this.elements.menuToggleBtn = document.getElementById('menuToggleBtn');
        this.elements.sideControls = document.getElementById('side-controls');
        this.elements.controlsOverlay = document.getElementById('controls-overlay');
        this.elements.tabButtons = document.querySelectorAll('.tab-btn');
        this.elements.sceneButtons = document.querySelectorAll('.scene-btn');
    }

    private setupEventListeners(): void {
        if (!this.elements.menuToggleBtn || !this.elements.sideControls) return;

        // Menu toggle button
        this.elements.menuToggleBtn.addEventListener('click', () => {
            console.log('Menu toggle button clicked');
            this.toggleControls();
        });

        // Click outside to close
        document.addEventListener('click', (event) => {
            if (!this.elements.sideControls || !this.elements.menuToggleBtn) return;
            if (this.elements.sideControls.classList.contains('hidden')) return;

            const target = event.target as Node;
            const isClickOutside = !this.elements.sideControls.contains(target) && 
                                 !this.elements.menuToggleBtn.contains(target);
            
            if (isClickOutside) {
                this.hideControls();
            }
        });

        // Set up tab button click handlers
        if (this.elements.tabButtons) {
            this.elements.tabButtons.forEach(btn => {
                if (!(btn instanceof HTMLElement)) return;
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const tabName = btn.dataset.tab;
                    if (tabName) {
                        console.log('Tab button clicked:', tabName);
                        TabSystem.getInstance().switchTab(tabName as any);
                    }
                });
            });
        }

        // Set up scene button click handlers
        if (this.elements.sceneButtons) {
            this.elements.sceneButtons.forEach(btn => {
                if (!(btn instanceof HTMLElement)) return;
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const sceneId = btn.id as SceneName;
                    console.log('Scene button clicked:', sceneId);
                    this.eventBus.emit({ type: 'scene:switch', sceneId });
                    // Switch to controls tab
                    TabSystem.getInstance().switchTab('controls');
                });
            });
        }

        // Prevent menu clicks from bubbling
        this.elements.sideControls.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'm') {
                console.log('Menu keyboard shortcut pressed');
                this.toggleControls();
            }
        });

        // Listen for scene changes
        this.eventBus.on('scene:switched', ({ to }) => {
            const isEnhancedMode = to === 'scene3';
            TabSystem.getInstance().updateToolsTabVisibility(isEnhancedMode);
        });

        // Focus management for keyboard controls
        this.elements.sideControls.addEventListener('mouseenter', () => {
            if (!this.elements.sideControls) return;
            this.elements.sideControls.focus();
            this.eventBus.emit({ type: 'menu:focused' });
        });

        this.elements.sideControls.addEventListener('mouseleave', () => {
            if (!this.elements.sideControls) return;
            this.elements.sideControls.blur();
            this.eventBus.emit({ type: 'menu:blurred' });
        });

        // Make menu focusable
        this.elements.sideControls.setAttribute('tabindex', '0');
    }

    private showControls(): void {
        if (!this.elements.sideControls || !this.elements.menuToggleBtn) return;

        console.log('Showing menu');
        this.elements.sideControls.classList.remove('hidden');
        this.elements.menuToggleBtn.classList.add('hidden');
        this.elements.sideControls.style.opacity = '0';
        this.elements.sideControls.style.transform = 'translateY(-50%) translateX(50px)';
        
        requestAnimationFrame(() => {
            if (!this.elements.sideControls) return;
            this.elements.sideControls.style.transition = 'all 0.3s ease-out';
            this.elements.sideControls.style.opacity = '1';
            this.elements.sideControls.style.transform = 'translateY(-50%) translateX(0)';
            this.elements.sideControls.focus();
            // Emit focused event when menu opens
            this.eventBus.emit({ type: 'menu:focused' });
        });

        this.isMenuOpen = true;
        this.eventBus.emit({ type: 'menu:opened' });
    }

    private hideControls(): void {
        if (!this.elements.sideControls || !this.elements.menuToggleBtn) return;

        console.log('Hiding menu');
        this.elements.sideControls.style.opacity = '0';
        this.elements.sideControls.style.transform = 'translateY(-50%) translateX(50px)';
        
        setTimeout(() => {
            if (!this.elements.sideControls || !this.elements.menuToggleBtn) return;
            this.elements.sideControls.classList.add('hidden');
            this.elements.menuToggleBtn.classList.remove('hidden');
            this.elements.sideControls.blur();
            // Emit blurred event when menu closes
            this.eventBus.emit({ type: 'menu:blurred' });
        }, 300);

        this.isMenuOpen = false;
        this.eventBus.emit({ type: 'menu:closed' });
    }

    private toggleControls(): void {
        if (!this.elements.sideControls) return;
        
        if (this.elements.sideControls.classList.contains('hidden')) {
            this.showControls();
        } else {
            this.hideControls();
        }
    }

    isOpen(): boolean {
        return this.isMenuOpen;
    }
}

// Export singleton instance
export const menu = Menu.getInstance();
export default menu;
