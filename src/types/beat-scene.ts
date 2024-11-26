import type { GeneratedPattern } from '../core/audio/MagentaPatternGenerator';

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

export interface MagentaEvent extends CustomEvent {
    detail: {
        type: 'pattern_generate';
        pattern?: GeneratedPattern;
    };
}
