export class TabSystem {
    constructor() {
        this.elements = {
            tabButtons: null,
            tabPanes: null,
            toolsTab: null
        };
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        console.log('TabSystem: Initializing...');
        
        // Wait for next frame to ensure DOM elements are ready
        requestAnimationFrame(() => {
            this.cacheElements();
            if (this.validateElements()) {
                this.setupEventListeners();
                // Set initial active tab
                this.switchTab('scenes');
                this.initialized = true;
                console.log('TabSystem: Initialized successfully');
            } else {
                console.error('TabSystem: Failed to initialize - Missing required elements');
            }
        });
    }

    validateElements() {
        const requiredElements = [
            'tabButtons',
            'tabPanes'
        ];
        
        return requiredElements.every(elementKey => {
            const element = this.elements[elementKey];
            if (!element || element.length === 0) {
                console.error(`TabSystem: Missing required element: ${elementKey}`);
                return false;
            }
            return true;
        });
    }

    cacheElements() {
        this.elements.tabButtons = document.querySelectorAll('.tab-btn');
        this.elements.tabPanes = document.querySelectorAll('.tab-pane');
        this.elements.toolsTab = document.querySelector('.tools-tab');
    }

    setupEventListeners() {
        this.elements.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('TabSystem: Tab clicked -', btn.dataset.tab);
                this.switchTab(btn.dataset.tab);
            });
        });
    }

    switchTab(tabName) {
        console.log('TabSystem: Switching to tab -', tabName);
        this.elements.tabButtons.forEach(btn => {
            const isActive = btn.dataset.tab === tabName;
            this.toggleButtonState(btn, isActive);
        });

        this.elements.tabPanes.forEach(pane => {
            const isActive = pane.dataset.tab === tabName;
            pane.classList.toggle('hidden', !isActive);
            pane.classList.toggle('block', isActive);
        });
    }

    toggleButtonState(btn, isActive) {
        btn.classList.toggle('bg-primary', isActive);
        btn.classList.toggle('text-white', isActive);
        btn.classList.toggle('text-secondary', !isActive);
        btn.classList.toggle('bg-transparent', !isActive);
        btn.classList.toggle('active', isActive);
    }

    updateToolsTabVisibility(isEnhancedMode) {
        if (this.elements.toolsTab) {
            this.elements.toolsTab.classList.toggle('visible', isEnhancedMode);
            
            if (!isEnhancedMode && this.elements.toolsTab.classList.contains('bg-primary')) {
                this.switchTab('scenes');
            }
        }
    }
}

// Export singleton instance
export default new TabSystem();
