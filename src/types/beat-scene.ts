import type { AudioMetrics } from './audio';

export interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    hue: number;
    alpha: number;
    energy: number;
}

export interface WaveformRing {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    channel: number;
    alpha: number;
    rotation: number;
}

export interface GeometricPattern {
    x: number;
    y: number;
    rotation: number;
    size: number;
    baseSize: number;
    sides: number;
    hue: number;
    pulsePhase: number;
    energy: number;
    orbitAngle: number;
    orbitSpeed: number;
}

export interface SampleVisualizer {
    data: Float32Array;
    offset: number;
    speed: number;
    active: boolean;
}

export interface TrackerEvent extends CustomEvent {
    detail: {
        type: 'transport_toggle' | 'note_input' | 'sample_select';
        channel?: number;
        sample?: number;
    };
}

export interface AudioTracker {
    display: any; // Will be updated once AudioTracker is converted
    draw(metrics: AudioMetrics): void;
    cleanup(): void;
}
