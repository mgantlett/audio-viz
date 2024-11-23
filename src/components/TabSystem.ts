import { Component } from '../core/Component';

interface TabElements {
    tabButtons: NodeListOf<Element> | null;
    tabPanes: NodeListOf<Element> | null;
    toolsTab: Element | null;
    sideControls: HTMLElement | null;
}

type TabName = 'scenes' | 'controls' | 'tools';

export class TabSystem extends Component {
    protected static _instance: TabSystem;
    private elements: TabElements;
    private currentTab: TabName | null;

    protected constructor() {
        super();
        this.elements = {
            tabButtons: null,
            tabPanes: null,
            toolsTab: null,
            sideControls: null
        };
        this.currentTab = null;
    }

    static override getInstance(): TabSystem {
        if (!TabSystem._instance) {
            TabSystem._instance = new TabSystem();
        }
        return TabSystem._instance;
    }

    protected async initializeComponent(): Promise<void> {
        // Wait for next frame to ensure DOM elements are ready
        await new Promise<void>(resolve => requestAnimationFrame(() => {
            this.cacheElements();
            if (this.validateElements()) {
                this.setupEventListeners();
                // Set initial active tab
                this.switchTab('scenes');
                resolve();
                console.log('TabSystem: Initialized successfully');
            } else {
                throw new Error('TabSystem: Failed to initialize - Missing required elements');
            }
        }));
    }

    private validateElements(): boolean {
        const requiredElements: (keyof TabElements)[] = [
            'tabButtons',
            'tabPanes',
            'sideControls'
        ];
        
        return requiredElements.every(elementKey => {
            const element = this.elements[elementKey];
            if (!element || (element instanceof NodeList && element.length === 0)) {
                console.error(`TabSystem: Missing required element: ${elementKey}`);
                return false;
            }
            return true;
        });
    }

    private cacheElements(): void {
        this.elements.tabButtons = document.querySelectorAll('.tab-btn');
        this.elements.tabPanes = document.querySelectorAll('.tab-pane');
        this.elements.toolsTab = document.querySelector('.tools-tab');
        this.elements.sideControls = document.getElementById('side-controls');
    }

    private setupEventListeners(): void {
        // Add click handlers to tab buttons
        if (this.elements.tabButtons) {
            this.elements.tabButtons.forEach(btn => {
                if (!(btn instanceof HTMLElement)) return;
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const tabName = btn.dataset.tab;
                    if (tabName) {
                        console.log('TabSystem: Tab button clicked -', tabName);
                        this.switchTab(tabName as TabName);
                    }
                });
            });
        }

        // Prevent clicks in tab content from bubbling
        if (this.elements.tabPanes) {
            this.elements.tabPanes.forEach(pane => {
                if (!(pane instanceof HTMLElement)) return;
                pane.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            });
        }
    }

    switchTab(tabName: TabName): void {
        if (!tabName || tabName === this.currentTab) return;
        
        console.log('TabSystem: Switching to tab -', tabName);
        this.currentTab = tabName;

        // Update button states
        if (this.elements.tabButtons) {
            this.elements.tabButtons.forEach(btn => {
                if (!(btn instanceof HTMLElement)) return;
                const isActive = btn.dataset.tab === tabName;
                btn.classList.toggle('bg-primary', isActive);
                btn.classList.toggle('text-white', isActive);
                btn.classList.toggle('text-secondary', !isActive);
                btn.classList.toggle('bg-transparent', !isActive);
            });
        }

        // Update pane visibility
        if (this.elements.tabPanes) {
            this.elements.tabPanes.forEach(pane => {
                if (!(pane instanceof HTMLElement)) return;
                const isActive = pane.dataset.tab === tabName;
                pane.classList.toggle('hidden', !isActive);
                pane.classList.toggle('block', isActive);
            });
        }

        // Ensure menu stays open
        if (this.elements.sideControls) {
            this.elements.sideControls.classList.remove('hidden');
        }
    }

    updateToolsTabVisibility(isEnhancedMode: boolean): void {
        if (this.elements.toolsTab) {
            this.elements.toolsTab.classList.toggle('visible', isEnhancedMode);
            
            if (!isEnhancedMode && this.currentTab === 'tools') {
                this.switchTab('scenes');
            }
        }
    }
}

// Export singleton instance
export const tabSystem = TabSystem.getInstance();
export default tabSystem;
