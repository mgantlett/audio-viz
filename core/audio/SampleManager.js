class SampleManager {
    constructor(audioContext) {
        if (!audioContext) {
            throw new Error('SampleManager requires audioContext');
        }
        this.context = audioContext;
        this.samples = new Map();
        this.loadingPromises = new Map();
    }

    async loadSample(name, url, options = {}) {
        try {
            if (!name || !url) {
                throw new Error('Sample name and URL are required');
            }

            // Check if sample is already loading
            if (this.loadingPromises.has(name)) {
                return this.loadingPromises.get(name);
            }

            console.log(`Loading sample ${name} from ${url}`);

            // Create loading promise
            const loadingPromise = (async () => {
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

    getSample(name) {
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

    listSamples() {
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

    getAudioData(audioBuffer) {
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

    hasSample(name) {
        try {
            return this.samples.has(name);
        } catch (error) {
            console.error('Error checking sample existence:', error);
            return false;
        }
    }

    async loadSamples(sampleList) {
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

    removeSample(name) {
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

    clear() {
        try {
            this.samples.clear();
            this.loadingPromises.clear();
            return true;
        } catch (error) {
            console.error('Error clearing samples:', error);
            return false;
        }
    }

    isLoading(name) {
        try {
            return this.loadingPromises.has(name);
        } catch (error) {
            console.error('Error checking loading state:', error);
            return false;
        }
    }

    getLoadingProgress() {
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

export default SampleManager;
