// WAV file generation constants
const SAMPLE_RATE = 44100;
const BITS_PER_SAMPLE = 16;
const NUM_CHANNELS = 1;

let audioContext = null;

export async function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.resume();
}

function writeWavHeader(dataLength, sampleRate = SAMPLE_RATE, numChannels = NUM_CHANNELS, bitsPerSample = BITS_PER_SAMPLE) {
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);
    const totalLength = dataLength + 36;  // Header is 44 bytes, minus 8 for the RIFF header
    const bytesPerSecond = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;

    // Write RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, totalLength, true);
    writeString(view, 8, 'WAVE');

    // Write fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);  // Chunk size
    view.setUint16(20, 1, true);   // Audio format (PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, bytesPerSecond, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // Write data chunk header
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    return buffer;
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function generateSineWave(frequency, duration, amplitude = 0.8) {
    const numSamples = Math.floor(SAMPLE_RATE * duration);
    const samples = new Int16Array(numSamples);
    const maxValue = Math.pow(2, 15) - 1;  // Max value for 16-bit signed

    for (let i = 0; i < numSamples; i++) {
        const t = i / SAMPLE_RATE;
        const value = Math.sin(2 * Math.PI * frequency * t) * amplitude;
        // Add envelope to avoid clicks
        const envelope = Math.min(1, 10 * t) * Math.min(1, 10 * (duration - t));
        samples[i] = Math.floor(value * maxValue * envelope);
    }

    return samples.buffer;
}

async function generateSample(name, frequency, duration) {
    try {
        console.log(`Generating ${name} at ${frequency}Hz for ${duration}s...`);
        const audioData = generateSineWave(frequency, duration);
        const header = writeWavHeader(audioData.byteLength);
        
        // Combine header and audio data
        const wavFile = new Blob(
            [header, audioData],
            { type: 'audio/wav' }
        );

        // Send to server
        const formData = new FormData();
        formData.append('file', wavFile, `${name}.wav`);

        const response = await fetch(`/save-sample?name=${name}.wav`, {
            method: 'POST',
            body: wavFile
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Preview the sound
        const arrayBuffer = await wavFile.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();

        return true;
    } catch (error) {
        console.error(`Error generating ${name}:`, error);
        return false;
    }
}

export async function generateAllSamples() {
    const samples = [
        { name: 'kick', freq: 60, duration: 0.5 },
        { name: 'snare', freq: 200, duration: 0.3 },
        { name: 'hihat', freq: 1000, duration: 0.2 },
        { name: 'bass', freq: 50, duration: 1.0 },
        { name: 'lead', freq: 440, duration: 0.8 }
    ];

    let success = true;
    for (const sample of samples) {
        if (!await generateSample(sample.name, sample.freq, sample.duration)) {
            success = false;
        }
        // Add a small delay between samples to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (success) {
        console.log('All samples generated successfully!');
        // Reload the page to ensure new samples are loaded
        window.location.reload();
    } else {
        console.error('Some samples failed to generate.');
    }
    
    return success;
}
