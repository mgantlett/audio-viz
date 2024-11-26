import { AudioBase } from './AudioBase';

export class BasicAudioManager extends AudioBase {
    private masterGain: GainNode | null = null;
    private analyzer: AnalyserNode | null = null;
    private waveformData: Float32Array = new Float32Array(128);
    private oscillator: OscillatorNode | null = null;

    protected async setupAudioNodes(): Promise<void> {
        if (!this.context) throw new Error('Audio context not initialized');

        // Create master gain node
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = this.volume * this.getAmplitude();

        // Create analyzer node
        this.analyzer = this.context.createAnalyser();
        this.analyzer.fftSize = 2048; // Increased for better resolution
        this.analyzer.smoothingTimeConstant = 0.8;
        this.waveformData = new Float32Array(this.analyzer.frequencyBinCount);

        // Connect nodes
        this.masterGain.connect(this.analyzer);
        this.analyzer.connect(this.context.destination);

        console.log('[BasicAudioManager] Audio nodes setup with:', {
            volume: this.volume,
            amplitude: this.getAmplitude(),
            frequency: this.getFrequency()
        });
    }

    start(): void {
        if (!this.context || !this.masterGain || !this.analyzer) {
            throw new Error('Audio nodes not initialized');
        }

        if (this.isPlaying) return;

        try {
            // Create and configure oscillator
            this.oscillator = this.context.createOscillator();
            this.oscillator.type = 'sine';
            this.oscillator.frequency.setValueAtTime(this.getFrequency(), this.context.currentTime);
            
            // Connect oscillator
            this.oscillator.connect(this.masterGain);
            
            // Start oscillator
            this.oscillator.start();
            this.setIsPlaying(true);

            // Start animation frame for waveform updates
            this.updateWaveform();

            console.log('[BasicAudioManager] Started with:', {
                frequency: this.getFrequency(),
                amplitude: this.getAmplitude(),
                volume: this.getVolume()
            });

        } catch (error) {
            console.error('Error starting audio:', error);
            throw error;
        }
    }

    stop(): void {
        if (!this.isPlaying) return;

        try {
            // Stop oscillator
            if (this.oscillator) {
                this.oscillator.stop();
                this.oscillator.disconnect();
                this.oscillator = null;
            }

            this.setIsPlaying(false);

            // Clear waveform data
            this.waveformData.fill(0);

            console.log('[BasicAudioManager] Stopped');
        } catch (error) {
            console.error('Error stopping audio:', error);
            throw error;
        }
    }

    protected updateVolume(): void {
        if (this.masterGain) {
            const value = this.volume * this.getAmplitude();
            console.log('[BasicAudioManager] Updating volume:', {
                volume: this.volume,
                amplitude: this.getAmplitude(),
                finalValue: value
            });
            this.masterGain.gain.setValueAtTime(
                value, 
                this.context?.currentTime || 0
            );
        }
    }

    private updateWaveform = (): void => {
        if (this.isPlaying && this.analyzer) {
            this.analyzer.getFloatTimeDomainData(this.waveformData);
            requestAnimationFrame(this.updateWaveform);
        }
    };

    protected getCurrentWaveform(): Float32Array {
        if (!this.analyzer || !this.isPlaying) {
            return new Float32Array(128).fill(0);
        }

        // Get current waveform data
        this.analyzer.getFloatTimeDomainData(this.waveformData);

        // Normalize waveform data
        const normalizedData = new Float32Array(this.waveformData.length);
        let maxAmplitude = 0;

        // Find max amplitude
        for (let i = 0; i < this.waveformData.length; i++) {
            const abs = Math.abs(this.waveformData[i]);
            if (abs > maxAmplitude) {
                maxAmplitude = abs;
            }
        }

        // Normalize values
        const scale = maxAmplitude > 0 ? 1 / maxAmplitude : 1;
        for (let i = 0; i < this.waveformData.length; i++) {
            normalizedData[i] = this.waveformData[i] * scale;
        }

        return normalizedData;
    }

    override setFrequency(freq: number): void {
        super.setFrequency(freq);
        if (this.oscillator && this.context) {
            console.log('[BasicAudioManager] Setting frequency:', freq);
            this.oscillator.frequency.setValueAtTime(freq, this.context.currentTime);
        }
    }

    override mapMouseToAudio(mouseX: number, mouseY: number, width: number, height: number): void {
        // Map X position to frequency (pitch) using exponential mapping
        const minFreq = 220; // A3
        const maxFreq = 880; // A5
        const freqScale = Math.exp(Math.log(maxFreq / minFreq) * (mouseX / width));
        const newFreq = minFreq * freqScale;
        
        // Map Y position to amplitude (volume)
        // Invert Y axis so higher = louder
        const newAmp = 1 - (mouseY / height);

        console.log('[BasicAudioManager] Mouse mapping:', {
            x: mouseX,
            y: mouseY,
            width,
            height,
            newFrequency: newFreq,
            newAmplitude: newAmp
        });

        this.setFrequency(newFreq);
        this.setAmplitude(newAmp);
    }

    async cleanup(): Promise<void> {
        await super.cleanup();
        this.masterGain = null;
        this.analyzer = null;
        this.oscillator = null;
        this.waveformData = new Float32Array(128);
    }
}
