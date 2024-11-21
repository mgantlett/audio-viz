import EventBus from '../controllers/EventBus.js';
import TabSystem from './TabSystem.js';
import { menuTemplate, toggleButtonTemplate } from './MenuTemplate.js';

export class Menu {
    constructor() {
        this.elements = {
            menuToggleBtn: null,
            sideControls: null,
            controlsOverlay: null
        };
        
        this.eventBus = EventBus.getInstance();
        this.tabSystem = TabSystem;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        
        console.log('Initializing Menu component...');
        this.createMenuStructure();
        
        if (this.validateElements()) {
            this.setupEventListeners();
            this.hideControls(); // Initially hide menu and show toggle button
            
            // Initialize TabSystem after menu structure is created
            console.log('Initializing TabSystem from Menu...');
            this.tabSystem.initialize();
            
            this.initialized = true;
            console.log('Menu component initialized successfully');
        } else {
            console.error('Failed to initialize Menu: Missing required elements');
        }
    }

    createMenuStructure() {
        // Create controls overlay if it doesn't exist
        let controlsOverlay = document.getElementById('controls-overlay');
        if (!controlsOverlay) {
            controlsOverlay = document.createElement('div');
            controlsOverlay.id = 'controls-overlay';
            controlsOverlay.className = 'absolute inset-0 pointer-events-none';
            document.getElementById('app').appendChild(controlsOverlay);
        }
        this.elements.controlsOverlay = controlsOverlay;

        // Add menu toggle button
        const toggleButtonContainer = document.createElement('div');
        toggleButtonContainer.innerHTML = toggleButtonTemplate;
        document.getElementById('app').appendChild(toggleButtonContainer.firstElementChild);

        // Add menu content
        const menuContainer = document.createElement('div');
        menuContainer.innerHTML = menuTemplate;
        controlsOverlay.appendChild(menuContainer.firstElementChild);

        // Cache elements after creation
        this.cacheElements();
    }

    validateElements() {
        const requiredElements = [
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

    cacheElements() {
        this.elements.menuToggleBtn = document.getElementById('menuToggleBtn');
        this.elements.sideControls = document.getElementById('side-controls');
        this.elements.controlsOverlay = document.getElementById('controls-overlay');
    }

    setupEventListeners() {
        // Menu toggle button
        this.elements.menuToggleBtn.addEventListener('click', () => {
            console.log('Menu toggle button clicked');
            this.toggleControls();
        });

        // Click outside to close
        document.addEventListener('click', (event) => {
            if (this.elements.sideControls.classList.contains('hidden')) return;

            const isClickOutside = !this.elements.sideControls.contains(event.target) && 
                                 !this.elements.menuToggleBtn.contains(event.target);
            
            if (isClickOutside) {
                this.hideControls();
            }
        });

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
            this.tabSystem.updateToolsTabVisibility(isEnhancedMode);
        });
    }

    showControls() {
        console.log('Showing menu');
        this.elements.sideControls.classList.remove('hidden');
        this.elements.menuToggleBtn.classList.add('hidden');
        this.elements.sideControls.style.opacity = '0';
        this.elements.sideControls.style.transform = 'translateY(-50%) translateX(50px)';
        
        requestAnimationFrame(() => {
            this.elements.sideControls.style.transition = 'all 0.3s ease-out';
            this.elements.sideControls.style.opacity = '1';
            this.elements.sideControls.style.transform = 'translateY(-50%) translateX(0)';
        });
    }

    hideControls() {
        console.log('Hiding menu');
        this.elements.sideControls.style.opacity = '0';
        this.elements.sideControls.style.transform = 'translateY(-50%) translateX(50px)';
        
        setTimeout(() => {
            this.elements.sideControls.classList.add('hidden');
            this.elements.menuToggleBtn.classList.remove('hidden');
        }, 300);
    }

    toggleControls() {
        if (this.elements.sideControls.classList.contains('hidden')) {
            this.showControls();
        } else {
            this.hideControls();
        }
    }
}

// Export singleton instance
export default new Menu();
