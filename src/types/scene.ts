export const SCENES = {
    STICK_FIGURES: 'StickFigures',
    PARTICLE_WAVE: 'ParticleWave',
    CLASSIC_WAVE: 'ClassicWave',
    PULSE: 'Pulse',
    BEAT: 'Beat'
} as const;

export type SceneName = typeof SCENES[keyof typeof SCENES];

export type AudioMode = 'basic' | 'tracker' | 'synth';

export type AudioType = 'basic' | 'enhanced';

export interface SceneConfig {
    name: SceneName;
    description: string;
    audioType: AudioType;
}

export const SCENE_CONFIGS: Record<SceneName, SceneConfig> = {
    [SCENES.STICK_FIGURES]: {
        name: SCENES.STICK_FIGURES,
        description: 'Dancing figures react to audio',
        audioType: 'basic'
    },
    [SCENES.PARTICLE_WAVE]: {
        name: SCENES.PARTICLE_WAVE,
        description: 'Waves of particles flow with sound',
        audioType: 'basic'
    },
    [SCENES.CLASSIC_WAVE]: {
        name: SCENES.CLASSIC_WAVE,
        description: 'Classic wave visualization',
        audioType: 'basic'
    },
    [SCENES.PULSE]: {
        name: SCENES.PULSE,
        description: 'Pulsing particle patterns',
        audioType: 'basic'
    },
    [SCENES.BEAT]: {
        name: SCENES.BEAT,
        description: 'Deep house beat visualization',
        audioType: 'enhanced'
    }
};
