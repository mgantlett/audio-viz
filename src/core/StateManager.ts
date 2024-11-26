import { AppState, IStateManager, StateUpdate, defaultAppState } from '../types/state';
import { eventBus } from './EventBus';
import type { SceneName } from '../types/scene';

export class StateManager implements IStateManager {
  private state: AppState;
  private listeners: Set<(state: AppState) => void>;
  private debug: boolean;
  private batchUpdating = false;
  private pendingUpdates: Map<keyof AppState, StateUpdate<any>> = new Map();

  constructor(initialState: AppState = defaultAppState, debug = true) {
    this.state = { ...initialState };
    this.listeners = new Set();
    this.debug = debug;
  }

  getState(): AppState {
    return { ...this.state };
  }

  setState<K extends keyof AppState>(
    key: K,
    update: StateUpdate<AppState[K]>
  ): void {
    if (this.batchUpdating) {
      this.pendingUpdates.set(key, update);
      return;
    }

    const currentValue = this.state[key];
    const newValue = typeof update === 'function' 
      ? { ...currentValue, ...update(currentValue) }
      : { ...currentValue, ...update };

    // Only update if there are actual changes
    if (JSON.stringify(currentValue) === JSON.stringify(newValue)) {
      return;
    }

    this.state = {
      ...this.state,
      [key]: newValue
    };

    if (this.debug) {
      console.log(`[StateManager] State updated for ${String(key)}:`, {
        previous: currentValue,
        current: newValue
      });
    }

    // Notify listeners
    this.notifyListeners();
  }

  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);

    if (this.debug) {
      console.log('[StateManager] New listener subscribed');
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
      if (this.debug) {
        console.log('[StateManager] Listener unsubscribed');
      }
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('[StateManager] Error in state listener:', error);
      }
    });
  }

  // Helper method to reset state
  reset(): void {
    this.state = { ...defaultAppState };
    if (this.debug) {
      console.log('[StateManager] State reset to default');
    }
    this.notifyListeners();
  }

  // Helper method to get a specific slice of state
  getSlice<K extends keyof AppState>(key: K): AppState[K] {
    return { ...this.state[key] };
  }

  // Helper method to batch multiple updates
  batchUpdate(updates: Partial<{ [K in keyof AppState]: StateUpdate<AppState[K]> }>): void {
    this.batchUpdating = true;
    this.pendingUpdates.clear();

    try {
      Object.entries(updates).forEach(([key, update]) => {
        this.setState(key as keyof AppState, update as StateUpdate<any>);
      });
    } finally {
      this.batchUpdating = false;
      if (this.pendingUpdates.size > 0) {
        let hasChanges = false;
        this.pendingUpdates.forEach((update, key) => {
          const currentValue = this.state[key];
          const newValue = typeof update === 'function'
            ? { ...currentValue, ...update(currentValue) }
            : { ...currentValue, ...update };

          if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
            this.state[key] = newValue;
            hasChanges = true;
          }
        });

        if (hasChanges) {
          if (this.debug) {
            console.log('[StateManager] Batch update applied:', 
              Object.fromEntries(this.pendingUpdates.entries())
            );
          }
          this.notifyListeners();
        }
      }
    }
  }

  // Helper method to subscribe to specific state changes
  subscribeToSlice<K extends keyof AppState>(
    key: K,
    listener: (slice: AppState[K]) => void,
    equalityFn: (a: AppState[K], b: AppState[K]) => boolean = (a, b) => 
      JSON.stringify(a) === JSON.stringify(b)
  ): () => void {
    let previousValue = this.getSlice(key);

    const unsubscribe = this.subscribe((state) => {
      const newValue = state[key];
      if (!equalityFn(previousValue, newValue)) {
        previousValue = newValue;
        listener(newValue);
      }
    });

    return unsubscribe;
  }
}

// Create and export singleton instance
export const stateManager = new StateManager();
export default stateManager;

// Set up state change logging in development
if (import.meta.env.DEV) {
  stateManager.subscribe(state => {
    console.log('[State Updated]', state);
  });

  // Example of connecting state changes to events
  stateManager.subscribe(state => {
    // Example: Emit UI events based on state changes
    if (state.ui.menuVisible) {
      eventBus.emit({ type: 'ui:menu:toggle' });
    }

    // Example: Emit scene events based on state changes
    if (state.scene.currentScene !== defaultAppState.scene.currentScene) {
      eventBus.emit({
        type: 'scene:switched',
        to: state.scene.currentScene as SceneName
      });
    }
  });
}
