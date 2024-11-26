import type { EventBus } from '../EventBus';

export class AudioAnalyzer {
    private analyser: AnalyserNode;
    private dataArray: Uint8Array;
    private waveformArray: Uint8Array;

    constructor(
        private context: AudioContext,
        private eventBus: EventBus
    ) {
        // Create analyzer node
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 2048; // Larger FFT for more detailed waveform
        this.analyser.minDecibels = -90;
        this.analyser.maxDecibels = -10;
        this.analyser.smoothingTimeConstant = 0.85;

        // Initialize data arrays
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.waveformArray = new Uint8Array(this.analyser.frequencyBinCount);
    }

    connectInput(node: AudioNode): void {
        node.connect(this.analyser);
    }

    connectOutput(node: AudioNode): void {
        this.analyser.connect(node);
    }

    getSpectralData(): Uint8Array {
        try {
            this.analyser.getByteFrequencyData(this.dataArray);
            return this.dataArray;
        } catch (error) {
            console.error('Error getting spectral data:', error);
            return new Uint8Array(1024);
        }
    }

    getWaveform(): Float32Array {
        try {
            // Get waveform data
            this.analyser.getByteTimeDomainData(this.waveformArray);

            // Convert to normalized float values (-1 to 1)
            const normalizedData = new Float32Array(this.waveformArray.length);
            for (let i = 0; i < this.waveformArray.length; i++) {
                normalizedData[i] = (this.waveformArray[i] - 128) / 128;
            }

            return normalizedData;
        } catch (error) {
            console.error('Error getting waveform:', error);
            return new Float32Array(1024);
        }
    }

    getAudioMetrics(): { bassIntensity: string; midIntensity: string; highIntensity: string } {
        try {
            const data = this.getSpectralData();
            
            // Calculate frequency band intensities
            const bassIntensity = data.slice(0, 10).reduce((a, b) => a + b, 0) / 2550;
            const midIntensity = data.slice(10, 100).reduce((a, b) => a + b, 0) / 22950;
            const highIntensity = data.slice(100, 200).reduce((a, b) => a + b, 0) / 25500;

            return {
                bassIntensity: bassIntensity.toFixed(3),
                midIntensity: midIntensity.toFixed(3),
                highIntensity: highIntensity.toFixed(3)
            };
        } catch (error) {
            console.warn('Error getting audio metrics:', error);
            return {
                bassIntensity: '0.000',
                midIntensity: '0.000',
                highIntensity: '0.000'
            };
        }
    }

    cleanup(): void {
        try {
            this.analyser.disconnect();
        } catch (error) {
            console.warn('Error disconnecting analyzer:', error);
        }
    }
}
