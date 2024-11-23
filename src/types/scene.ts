import type { Scene } from '../core/Scene';

export const SCENES = {
    STICK_FIGURES: 'scene1',
    PARTICLE_WAVE: 'scene2',
    BEAT_SCENE: 'scene3'
} as const;

export type SceneName = typeof SCENES[keyof typeof SCENES];
export type AudioMode = 'oscillator' | 'wave' | 'tracker';

export interface SceneConfig {
    name: string;
    audioMode: AudioMode;
    description?: string;
}

export const SCENE_CONFIG: Record<SceneName, SceneConfig> = {
    [SCENES.STICK_FIGURES]: {
        name: 'Stick Figures',
        audioMode: 'oscillator',
        description: 'Simple stick figure visualization reacting to audio'
    },
    [SCENES.PARTICLE_WAVE]: {
        name: 'Particle Wave',
        audioMode: 'wave',
        description: 'Wave of particles that respond to audio frequency and amplitude'
    },
    [SCENES.BEAT_SCENE]: {
        name: 'Beat Scene',
        audioMode: 'tracker',
        description: 'Advanced visualization with beat detection and pattern sequencing'
    }
} as const;

export interface ISceneManager {
    scenes: Map<SceneName, Scene>;
    currentScene: SceneName | null;
    defaultScene: SceneName | null;
    currentTempo: number;
    lastTempoUpdate: number;
    tempoUpdateThrottle: number;
    isTransitioning: boolean;
    currentAudioMode: AudioMode | null;

    readonly isPlaying: boolean;
    readonly isEnhancedMode: boolean;

    registerScene(name: SceneName, scene: Scene): void;
    switchToScene(name: SceneName): Promise<boolean>;
    initialize(): Promise<void>;
    draw(): void;
    windowResized(): void;
    updateTempo(delta: number): void;
    getCurrentPitch(): number;
    getCurrentVolume(): number;
    startAudio(): void;
    stopAudio(): void;
}
