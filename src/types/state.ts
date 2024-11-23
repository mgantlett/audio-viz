import { IEventBus } from './events';

// Audio State
export interface AudioState {
  initialized: boolean;
  playing: boolean;
  mode: 'basic' | 'enhanced';
  volume: number;
  tempo: number;
  currentPattern?: string;
  metrics: {
    frequency: number;
    amplitude: number;
    beatIntensity: number;
    midFrequency: number;
    highFrequency: number;
  };
}

// Scene State
export interface Scene {
  id: string;
  name: string;
  active: boolean;
  type: 'basic' | 'enhanced';
}

export interface SceneState {
  currentScene: string;
  scenes: Record<string, Scene>;
  loading: boolean;
  error?: string;
}

// UI State
export interface UIState {
  menuVisible: boolean;
  currentTab: string;
  activeModal?: string;
  controls: {
    basic: {
      visible: boolean;
      pitch: number;
      volume: number;
    };
    enhanced: {
      visible: boolean;
      tempo: number;
      pattern: string;
      progression: string;
    };
  };
}

// Root State
export interface AppState {
  audio: AudioState;
  scene: SceneState;
  ui: UIState;
}

// State Updates
export type StateUpdate<T> = Partial<T> | ((prev: T) => Partial<T>);

// State Manager Interface
export interface IStateManager {
  getState(): AppState;
  setState<K extends keyof AppState>(
    key: K,
    update: StateUpdate<AppState[K]>
  ): void;
  subscribe(listener: (state: AppState) => void): () => void;
}

// Component Interface
export interface IComponent {
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}

// Manager Interface
export interface IManager {
  eventBus: IEventBus;
  state: IStateManager;
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}

// Default State Values
export const defaultAudioState: AudioState = {
  initialized: false,
  playing: false,
  mode: 'basic',
  volume: 0.5,
  tempo: 120,
  metrics: {
    frequency: 440,
    amplitude: 0,
    beatIntensity: 0,
    midFrequency: 0,
    highFrequency: 0
  }
};

export const defaultSceneState: SceneState = {
  currentScene: 'scene1',
  scenes: {
    scene1: {
      id: 'scene1',
      name: 'Stick Figures',
      active: true,
      type: 'basic'
    },
    scene2: {
      id: 'scene2',
      name: 'Particle Wave',
      active: false,
      type: 'basic'
    },
    scene3: {
      id: 'scene3',
      name: 'Beat Scene',
      active: false,
      type: 'enhanced'
    }
  },
  loading: false
};

export const defaultUIState: UIState = {
  menuVisible: false,
  currentTab: 'scenes',
  controls: {
    basic: {
      visible: true,
      pitch: 1,
      volume: 0.5
    },
    enhanced: {
      visible: false,
      tempo: 120,
      pattern: 'basic',
      progression: 'I-vi-IV-V'
    }
  }
};

export const defaultAppState: AppState = {
  audio: defaultAudioState,
  scene: defaultSceneState,
  ui: defaultUIState
};
