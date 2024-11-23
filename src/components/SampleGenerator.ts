import { Component } from '../core/Component';

interface Sample {
  name: string;
  frequency: number;
  description: string;
}

export class SampleGenerator extends Component {
  private elements: {
    container: HTMLElement | null;
    generateBtn: HTMLElement | null;
    status: HTMLElement | null;
    sampleList: HTMLElement | null;
  };

  private samples: Sample[] = [
    { name: 'kick.wav', frequency: 60, description: 'Kick drum' },
    { name: 'snare.wav', frequency: 200, description: 'Snare drum' },
    { name: 'hihat.wav', frequency: 1000, description: 'Hi-hat' },
    { name: 'bass.wav', frequency: 50, description: 'Bass synth' },
    { name: 'lead.wav', frequency: 440, description: 'Lead synth' }
  ];

  constructor() {
    super();
    this.elements = {
      container: null,
      generateBtn: null,
      status: null,
      sampleList: null
    };
  }

  protected async onInitialize(): Promise<void> {
    console.log('Initializing SampleGenerator component...');
    this.cacheElements();
    
    if (this.validateElements()) {
      this.setupEventListeners();
      console.log('SampleGenerator component initialized successfully');
    } else {
      throw new Error('Failed to initialize SampleGenerator: Missing required elements');
    }
  }

  private cacheElements(): void {
    this.elements.container = document.getElementById('sampleGeneratorTool');
    this.elements.generateBtn = document.getElementById('generateBtn');
    this.elements.status = document.getElementById('status');
    this.elements.sampleList = this.elements.container?.querySelector('.sample-list') || null;
  }

  private validateElements(): boolean {
    const requiredElements = [
      'container',
      'generateBtn',
      'status',
      'sampleList'
    ] as const;
    
    return requiredElements.every(elementKey => {
      const element = this.elements[elementKey];
      if (!element) {
        console.error(`Missing required element: ${elementKey}`);
        return false;
      }
      return true;
    });
  }

  private setupEventListeners(): void {
    const { generateBtn } = this.elements;
    if (!generateBtn) return;

    // Generate button click
    generateBtn.addEventListener('click', () => this.generateSamples());

    // Listen for tool button click
    const toolBtn = document.getElementById('openSampleGenerator');
    if (toolBtn) {
      toolBtn.addEventListener('click', () => {
        this.emit({ type: 'ui:modal:open', id: 'sampleGeneratorTool' });
      });
    }
  }

  private async generateSamples(): Promise<void> {
    const { generateBtn, status } = this.elements;
    if (!generateBtn || !status) return;

    try {
      // Disable button and show progress
      generateBtn.setAttribute('disabled', 'true');
      status.textContent = 'Generating samples...';
      status.classList.remove('hidden', 'text-red-500');
      status.classList.add('text-green-500');

      // Generate each sample
      for (const sample of this.samples) {
        await this.generateSample(sample);
      }

      // Show success
      status.textContent = 'Samples generated successfully!';

      // Close modal after a delay
      setTimeout(() => {
        this.emit({ type: 'ui:modal:close' });
      }, 1500);

    } catch (error) {
      console.error('Error generating samples:', error);
      status.textContent = 'Error generating samples. Please try again.';
      status.classList.remove('text-green-500');
      status.classList.add('text-red-500');
    } finally {
      generateBtn.removeAttribute('disabled');
    }
  }

  private async generateSample(sample: Sample): Promise<void> {
    // Simulate sample generation with a delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real implementation, this would generate audio samples
    // using Web Audio API or communicate with the Python backend
    console.log(`Generated sample: ${sample.name} (${sample.frequency} Hz)`);
  }

  protected async onCleanup(): Promise<void> {
    // The base Component class will handle cleaning up our registered handlers
  }
}

// Export singleton instance
export const sampleGenerator = new SampleGenerator();
export default sampleGenerator;
