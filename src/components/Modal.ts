import { Component } from '../core/Component';

interface ModalElements {
    overlay: HTMLElement | null;
    title: HTMLElement | null;
    content: HTMLElement | null;
    closeButton: HTMLElement | null;
}

export class Modal extends Component {
    protected static _instance: Modal;
    private elements: ModalElements;

    protected constructor() {
        super();
        this.elements = {
            overlay: null,
            title: null,
            content: null,
            closeButton: null
        };
    }

    static override getInstance(): Modal {
        if (!Modal._instance) {
            Modal._instance = new Modal();
        }
        return Modal._instance;
    }

    protected async initializeComponent(): Promise<void> {
        this.cacheElements();
        if (this.validateElements()) {
            this.setupEventListeners();
        } else {
            throw new Error('Failed to initialize Modal: Missing required elements');
        }
    }

    private validateElements(): boolean {
        const requiredElements: (keyof ModalElements)[] = [
            'overlay',
            'title',
            'closeButton'
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
        this.elements.overlay = document.getElementById('modalOverlay');
        this.elements.title = document.getElementById('modalTitle');
        this.elements.content = document.getElementById('modalContent');
        this.elements.closeButton = document.querySelector('.modal-close');
    }

    private setupEventListeners(): void {
        if (!this.elements.overlay || !this.elements.closeButton) return;

        // Close modal when clicking outside
        this.elements.overlay.addEventListener('click', (e: MouseEvent) => {
            if (e.target === this.elements.overlay) {
                this.close();
            }
        });

        // Close button
        this.elements.closeButton.addEventListener('click', () => {
            this.close();
        });
    }

    open(title: string): void {
        if (!this.elements.title || !this.elements.overlay) return;
        this.elements.title.textContent = title;
        this.elements.overlay.classList.add('active');
    }

    close(): void {
        if (!this.elements.overlay) return;
        this.elements.overlay.classList.remove('active');
    }

    setContent(content: string): void {
        if (!this.elements.content) return;
        this.elements.content.innerHTML = content;
    }
}

// Export singleton instance
export const modal = Modal.getInstance();
export default modal;
