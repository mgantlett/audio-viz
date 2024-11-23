interface SampleData {
    buffer: AudioBuffer;
    name: string;
    baseNote: string;
    loopStart: number;
    loopEnd: number;
    length: number;
    data: Float32Array;
}

interface SampleInfo {
    name: string;
    baseNote: string;
    length: number;
    loopStart: number;
    loopEnd: number;
}

interface SampleLoadOptions {
    baseNote?: string;
    loopStart?: number;
    loopEnd?: number;
}

interface SampleToLoad {
    name: string;
    url: string;
    options?: SampleLoadOptions;
}

interface LoadingProgress {
    total: number;
    loaded: number;
    loading: number;
}

export class SampleManager {
    private context: AudioContext;
    private samples: Map<string, SampleData>;
    private loadingPromises: Map<string, Promise<boolean>>;

    constructor(audioContext: AudioContext) {
        if (!audioContext) {
            throw new Error('SampleManager requires audioContext');
        }
        this.context = audioContext;
        this.samples = new Map();
        this.loadingPromises = new Map();
    }

    async loadSample(name: string, url: string, options: SampleLoadOptions = {}): Promise<boolean> {
        try {
            if (!name || !url) {
                throw new Error('Sample name and URL are required');
            }

            // Check if sample is already loading
            if (this.loadingPromises.has(name)) {
                return this.loadingPromises.get(name) || false;
            }

            console.log(`Loading sample ${name} from ${url}`);

            // Create loading promise
            const loadingPromise = (async (): Promise<boolean> => {
                try {
                    // Fetch audio data
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                    }

                    const arrayBuffer = await response.arrayBuffer();
                    if (!arrayBuffer) {
                        throw new Error('Failed to get array buffer from response');
                    }

                    // Decode audio data
                    console.log(`Decoding audio data for ${name}...`);
                    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
                    if (!audioBuffer) {
                        throw new Error('Failed to decode audio data');
                    }
                    console.log(`Successfully decoded audio data for ${name}`);

                    // Store sample data
                    this.samples.set(name, {
                        buffer: audioBuffer,
                        name: name,
                        baseNote: options.baseNote || 'C4',
                        loopStart: options.loopStart || 0,
                        loopEnd: options.loopEnd || audioBuffer.length,
                        length: audioBuffer.length,
                        data: this.getAudioData(audioBuffer)
                    });

                    console.log(`Sample ${name} loaded successfully`);
                    return true;
                } catch (error) {
                    console.error(`Error loading sample ${name}:`, error);
                    return false;
                } finally {
                    // Clean up loading promise
                    this.loadingPromises.delete(name);
                }
            })();

            // Store loading promise
            this.loadingPromises.set(name, loadingPromise);
            return loadingPromise;
        } catch (error) {
            console.error(`Error initiating sample load for ${name}:`, error);
            return false;
        }
    }

    getSample(name: string): SampleData | null {
        try {
            if (!name) {
                throw new Error('Sample name is required');
            }
            return this.samples.get(name) || null;
        } catch (error) {
            console.error('Error getting sample:', error);
            return null;
        }
    }

    listSamples(): SampleInfo[] {
        try {
            return Array.from(this.samples.values()).map(sample => ({
                name: sample.name,
                baseNote: sample.baseNote,
                length: sample.length,
                loopStart: sample.loopStart,
                loopEnd: sample.loopEnd
            }));
        } catch (error) {
            console.error('Error listing samples:', error);
            return [];
        }
    }

    private getAudioData(audioBuffer: AudioBuffer): Float32Array {
        try {
            // Get audio data from the first channel
            const channelData = audioBuffer.getChannelData(0);
            
            // Create a copy of the data to prevent modifications
            return Float32Array.from(channelData);
        } catch (error) {
            console.error('Error getting audio data:', error);
            return new Float32Array(0);
        }
    }

    hasSample(name: string): boolean {
        try {
            return this.samples.has(name);
        } catch (error) {
            console.error('Error checking sample existence:', error);
            return false;
        }
    }

    async loadSamples(sampleList: SampleToLoad[]): Promise<boolean> {
        try {
            const results = await Promise.all(
                sampleList.map(sample => 
                    this.loadSample(sample.name, sample.url, sample.options)
                )
            );
            return results.every(result => result === true);
        } catch (error) {
            console.error('Error loading multiple samples:', error);
            return false;
        }
    }

    removeSample(name: string): boolean {
        try {
            if (!name) {
                throw new Error('Sample name is required');
            }
            return this.samples.delete(name);
        } catch (error) {
            console.error('Error removing sample:', error);
            return false;
        }
    }

    clear(): boolean {
        try {
            this.samples.clear();
            this.loadingPromises.clear();
            return true;
        } catch (error) {
            console.error('Error clearing samples:', error);
            return false;
        }
    }

    isLoading(name: string): boolean {
        try {
            return this.loadingPromises.has(name);
        } catch (error) {
            console.error('Error checking loading state:', error);
            return false;
        }
    }

    getLoadingProgress(): LoadingProgress {
        try {
            return {
                total: this.samples.size + this.loadingPromises.size,
                loaded: this.samples.size,
                loading: this.loadingPromises.size
            };
        } catch (error) {
            console.error('Error getting loading progress:', error);
            return { total: 0, loaded: 0, loading: 0 };
        }
    }
}
