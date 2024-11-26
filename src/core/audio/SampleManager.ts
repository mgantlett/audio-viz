import type { EventBus } from '../EventBus';

interface AudioSample {
    buffer: AudioBuffer;
    source?: AudioBufferSourceNode;
    gain?: GainNode;
    baseGain: number;
}

interface SampleMap {
    kick?: AudioSample;
    snare?: AudioSample;
    hihat?: AudioSample;
    bass?: AudioSample;
    lead?: AudioSample;
}

export class SampleManager {
    private samples: SampleMap = {};
    private activeGainNodes: GainNode[] = [];

    constructor(
        private context: AudioContext,
        private masterGain: GainNode,
        private eventBus: EventBus
    ) {}

    async loadSamples(): Promise<void> {
        const sampleFiles = {
            kick: { url: '/audio-viz/samples/kick.wav', baseGain: 0.7 },
            snare: { url: '/audio-viz/samples/snare.wav', baseGain: 0.6 },
            hihat: { url: '/audio-viz/samples/hihat.wav', baseGain: 0.4 },
            bass: { url: '/audio-viz/samples/bass.wav', baseGain: 0.6 },
            lead: { url: '/audio-viz/samples/lead.wav', baseGain: 0.5 }
        };

        try {
            const loadSample = async (url: string): Promise<AudioBuffer> => {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                return await this.context.decodeAudioData(arrayBuffer);
            };

            const results = await Promise.all(
                Object.entries(sampleFiles).map(async ([key, config]) => {
                    try {
                        console.log(`Loading sample ${key} from ${config.url}...`);
                        const buffer = await loadSample(config.url);
                        console.log(`Sample ${key} loaded successfully`);
                        return [key, { buffer, baseGain: config.baseGain }] as [string, AudioSample];
                    } catch (error) {
                        console.error(`Error loading sample ${key}:`, error);
                        return null;
                    }
                })
            );

            results.forEach(result => {
                if (result) {
                    const [key, sample] = result;
                    this.samples[key as keyof SampleMap] = sample;
                }
            });

            console.log('Samples loaded successfully:', Object.keys(this.samples));
        } catch (error) {
            console.error('Error loading samples:', error);
        }
    }

    playSample(sampleType: keyof SampleMap, time: number, amplitude: number): void {
        const sample = this.samples[sampleType];
        if (!sample) return;

        try {
            const source = this.context.createBufferSource();
            const gainNode = this.context.createGain();
            
            source.buffer = sample.buffer;
            const baseGain = sample.baseGain || 0.5;
            gainNode.gain.value = baseGain * amplitude;

            // Connect through the audio chain
            source.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            source.start(time);
            source.stop(time + sample.buffer.duration);

            // Store references to clean up later
            sample.source = source;
            sample.gain = gainNode;
            this.activeGainNodes.push(gainNode);

            // Cleanup after playback
            source.onended = () => {
                source.disconnect();
                gainNode.disconnect();
                if (sample.source === source) {
                    sample.source = undefined;
                    sample.gain = undefined;
                }
                const index = this.activeGainNodes.indexOf(gainNode);
                if (index > -1) {
                    this.activeGainNodes.splice(index, 1);
                }
            };
        } catch (error) {
            console.error(`Error playing sample ${sampleType}:`, error);
        }
    }

    updateVolume(value: number, amplitude: number): void {
        const currentTime = this.context.currentTime;
        this.activeGainNodes.forEach(gainNode => {
            gainNode.gain.cancelScheduledValues(currentTime);
            gainNode.gain.setValueAtTime(gainNode.gain.value * (value / amplitude), currentTime);
        });
    }

    cleanup(): void {
        this.activeGainNodes.forEach(gainNode => {
            try {
                gainNode.disconnect();
            } catch (error) {
                console.warn('Error disconnecting gain node:', error);
            }
        });
        this.activeGainNodes = [];
        this.samples = {};
    }

    getSampleNames(): string[] {
        return Object.keys(this.samples);
    }
}
