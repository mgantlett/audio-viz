export class Modal {
    constructor() {
        this.elements = {
            overlay: null,
            title: null,
            content: null,
            closeButton: null
        };
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        this.cacheElements();
        if (this.validateElements()) {
            this.setupEventListeners();
            this.initialized = true;
        } else {
            console.error('Failed to initialize Modal: Missing required elements');
        }
    }

    validateElements() {
        const requiredElements = [
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

    cacheElements() {
        this.elements.overlay = document.getElementById('modalOverlay');
        this.elements.title = document.getElementById('modalTitle');
        this.elements.content = document.getElementById('modalContent');
        this.elements.closeButton = document.querySelector('.modal-close');
    }

    setupEventListeners() {
        // Close modal when clicking outside
        this.elements.overlay.addEventListener('click', (e) => {
            if (e.target === this.elements.overlay) {
                this.close();
            }
        });

        // Close button
        this.elements.closeButton.addEventListener('click', () => {
            this.close();
        });
    }

    open(title) {
        this.elements.title.textContent = title;
        this.elements.overlay.classList.add('active');
    }

    close() {
        this.elements.overlay.classList.remove('active');
    }

    setContent(content) {
        if (this.elements.content) {
            this.elements.content.innerHTML = content;
        }
    }
}

// Export singleton instance
export default new Modal();
