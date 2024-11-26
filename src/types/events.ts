export type EventType = 
    | 'scene:switch' 
    | 'scene:switched'
    | 'scene:ready'
    | 'scene:error'
    | 'menu:toggle'
    | 'audio:toggle'
    | 'audio:volume'
    | 'audio:frequency'
    | 'audio:state_changed'
    | 'audio:initialized'
    | 'audio:error'
    | 'audio:pitch'
    | 'audio:pattern'
    | 'audio:tempo'
    | 'audio:started'
    | 'audio:stopped'
    | 'audio:step'
    | 'audio:manager_changed';

export interface SceneSwitchEvent {
    type: 'scene:switch';
    sceneId: string;
}

export interface SceneSwitchedEvent {
    type: 'scene:switched';
    to: string;
}

export interface SceneReadyEvent {
    type: 'scene:ready';
    sceneName: string;
}

export interface SceneErrorEvent {
    type: 'scene:error';
    error: Error;
    sceneName: string;
}

export interface MenuToggleEvent {
    type: 'menu:toggle';
}

export interface AudioToggleEvent {
    type: 'audio:toggle';
}

export interface AudioVolumeEvent {
    type: 'audio:volume';
    value: number;
}

export interface AudioFrequencyEvent {
    type: 'audio:frequency';
    value: number;
}

export interface AudioStateChangedEvent {
    type: 'audio:state_changed';
    metrics: {
        volume: number;
        frequency: number;
        waveform: Float32Array;
        pattern?: any;
    };
    isPlaying: boolean;
}

export interface AudioInitializedEvent {
    type: 'audio:initialized';
    success: boolean;
}

export interface AudioErrorEvent {
    type: 'audio:error';
    error: Error;
}

export interface AudioPitchEvent {
    type: 'audio:pitch';
    pitch: number;
}

export interface AudioPatternEvent {
    type: 'audio:pattern';
    pattern: any;
}

export interface AudioTempoEvent {
    type: 'audio:tempo';
    tempo: number;
}

export interface AudioStartedEvent {
    type: 'audio:started';
}

export interface AudioStoppedEvent {
    type: 'audio:stopped';
}

export interface AudioStepEvent {
    type: 'audio:step';
    step: number;
    time: number;
}

export interface AudioManagerChangedEvent {
    type: 'audio:manager_changed';
    manager: any;
}

export type AppEvent = 
    | SceneSwitchEvent 
    | SceneSwitchedEvent 
    | SceneReadyEvent
    | SceneErrorEvent
    | MenuToggleEvent
    | AudioToggleEvent
    | AudioVolumeEvent
    | AudioFrequencyEvent
    | AudioStateChangedEvent
    | AudioInitializedEvent
    | AudioErrorEvent
    | AudioPitchEvent
    | AudioPatternEvent
    | AudioTempoEvent
    | AudioStartedEvent
    | AudioStoppedEvent
    | AudioStepEvent
    | AudioManagerChangedEvent;

export type EventTypeFromName<T extends EventType> = Extract<AppEvent, { type: T }>;
