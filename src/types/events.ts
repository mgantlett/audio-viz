import type { SceneName } from './scene';

// Audio Events
export interface AudioInitializeEvent {
    type: 'audio:initialize';
}

export interface AudioInitializedEvent {
    type: 'audio:initialized';
    success: boolean;
}

export interface AudioStartEvent {
    type: 'audio:start';
}

export interface AudioStartedEvent {
    type: 'audio:started';
}

export interface AudioStopEvent {
    type: 'audio:stop';
}

export interface AudioStoppedEvent {
    type: 'audio:stopped';
}

export interface AudioErrorEvent {
    type: 'audio:error';
    error: Error;
}

// Scene Events
export interface SceneSwitchEvent {
    type: 'scene:switch';
    sceneId: SceneName;  // Changed from sceneName to sceneId to match usage
}

export interface SceneSwitchedEvent {
    type: 'scene:switched';
    to: SceneName;
}

// Menu Events
export interface MenuInitializedEvent {
    type: 'menu:initialized';
}

export interface MenuCreatedEvent {
    type: 'menu:created';
}

export interface MenuOpenedEvent {
    type: 'menu:opened';
}

export interface MenuClosedEvent {
    type: 'menu:closed';
}

export interface MenuFocusedEvent {
    type: 'menu:focused';
}

export interface MenuBlurredEvent {
    type: 'menu:blurred';
}

// Union type of all possible events
export type AppEvent =
    | AudioInitializeEvent
    | AudioInitializedEvent
    | AudioStartEvent
    | AudioStartedEvent
    | AudioStopEvent
    | AudioStoppedEvent
    | AudioErrorEvent
    | SceneSwitchEvent
    | SceneSwitchedEvent
    | MenuInitializedEvent
    | MenuCreatedEvent
    | MenuOpenedEvent
    | MenuClosedEvent
    | MenuFocusedEvent
    | MenuBlurredEvent;

// Event handler type
export type EventHandler<T extends AppEvent> = (event: T) => void;

// Event bus interface
export interface IEventBus {
    on<T extends AppEvent['type']>(
        type: T,
        handler: EventHandler<Extract<AppEvent, { type: T }>>
    ): void;
    off<T extends AppEvent['type']>(
        type: T,
        handler: EventHandler<Extract<AppEvent, { type: T }>>
    ): void;
    emit<T extends AppEvent>(event: T): void;
}
