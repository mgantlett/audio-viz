import type { Component } from '../core/Component';
import type { AudioManager } from './audio';
import type { EventBus } from '../core/EventBus';

export interface AudioControlsDependencies {
    eventBus: EventBus;
    audioManager: AudioManager;
}

export interface AudioControlsComponent extends Component {
    readonly eventBus: EventBus;
    readonly audioManager: AudioManager;
}
