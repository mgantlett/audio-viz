import Modal from './Modal.js';

export class SampleGenerator {
    constructor() {
        this.elements = {
            button: null,
            generateBtn: null,
            status: null
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
            console.error('Failed to initialize SampleGenerator: Missing required elements');
        }
    }

    validateElements() {
        const requiredElements = [
            'button',
            'generateBtn',
            'status'
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
        this.elements.button = document.getElementById('sampleGeneratorBtn');
        this.elements.generateBtn = document.getElementById('generateBtn');
        this.elements.status = document.getElementById('status');
    }

    setupEventListeners() {
        // Open sample generator modal
        this.elements.button.addEventListener('click', () => {
            Modal.open('Sample Generator');
        });

        // Generate samples
        this.elements.generateBtn.addEventListener('click', async () => {
            await this.generateSamples();
        });
    }

    async generateSamples() {
        const { initAudio, generateAllSamples } = await import('../../tools/generateSamples.js');
        const button = this.elements.generateBtn;
        const status = this.elements.status;
        
        try {
            button.disabled = true;
            status.style.display = 'block';
            status.className = '';
            status.textContent = 'Initializing audio context...';
            
            await initAudio();
            
            status.textContent = 'Generating samples...';
            await generateAllSamples();
            
            status.className = 'bg-green-900/10 text-green-300 border border-green-700';
            status.textContent = 'Samples generated successfully! Check your downloads folder.';
        } catch (error) {
            console.error('Error generating samples:', error);
            status.className = 'bg-red-900/10 text-red-300 border border-red-700';
            status.textContent = 'Error generating samples. Check console for details.';
        } finally {
            button.disabled = false;
        }
    }
}

// Export singleton instance
export default new SampleGenerator();
