import { AppEvent, EventHandler, IEventBus } from '../types/events';
import { IManager, IStateManager } from '../types/state';
import { eventBus } from './EventBus';
import { stateManager } from './StateManager';

export abstract class Manager implements IManager {
  protected initialized: boolean;
  protected cleanupHandlers: Array<() => void>;
  public readonly eventBus: IEventBus;
  public readonly state: IStateManager;

  constructor() {
    this.eventBus = eventBus;
    this.state = stateManager;
    this.initialized = false;
    this.cleanupHandlers = [];
  }

  /**
   * Initialize the manager. This should be called once when the manager is first created.
   * Override this method to add custom initialization logic.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn(`${this.constructor.name} is already initialized`);
      return;
    }

    try {
      await this.onInitialize();
      this.initialized = true;
      console.log(`${this.constructor.name} initialized successfully`);
    } catch (error) {
      console.error(`Error initializing ${this.constructor.name}:`, error);
      throw error;
    }
  }

  /**
   * Clean up the manager. This should be called when the manager is being destroyed.
   * Override this method to add custom cleanup logic.
   */
  async cleanup(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      // Run custom cleanup
      await this.onCleanup();

      // Run registered cleanup handlers
      for (const handler of this.cleanupHandlers) {
        try {
          handler();
        } catch (error) {
          console.error('Error in cleanup handler:', error);
        }
      }

      this.cleanupHandlers = [];
      this.initialized = false;
      console.log(`${this.constructor.name} cleaned up successfully`);
    } catch (error) {
      console.error(`Error cleaning up ${this.constructor.name}:`, error);
      throw error;
    }
  }

  /**
   * Register a cleanup handler that will be called when the manager is cleaned up.
   */
  protected registerCleanup(handler: () => void): void {
    this.cleanupHandlers.push(handler);
  }

  /**
   * Subscribe to state updates. The subscription will be automatically cleaned up
   * when the manager is destroyed.
   */
  protected subscribeToState<T>(
    selector: (state: ReturnType<typeof this.state.getState>) => T,
    handler: (value: T) => void,
    equalityFn: (a: T, b: T) => boolean = (a, b) => a === b
  ): void {
    let previousValue = selector(this.state.getState());
    
    const unsubscribe = this.state.subscribe(state => {
      const newValue = selector(state);
      if (!equalityFn(previousValue, newValue)) {
        previousValue = newValue;
        handler(newValue);
      }
    });

    this.registerCleanup(unsubscribe);
  }

  /**
   * Subscribe to events. The subscription will be automatically cleaned up
   * when the manager is destroyed.
   */
  protected on<T extends AppEvent['type']>(
    type: T,
    handler: EventHandler<Extract<AppEvent, { type: T }>>
  ): void {
    this.eventBus.on(type, handler);
    this.registerCleanup(() => this.eventBus.off(type, handler));
  }

  /**
   * Emit an event. This is a convenience method that delegates to the event bus.
   */
  protected emit<T extends AppEvent>(event: T): void {
    this.eventBus.emit(event);
  }

  /**
   * Override this method to add custom initialization logic.
   */
  protected abstract onInitialize(): Promise<void> | void;

  /**
   * Override this method to add custom cleanup logic.
   */
  protected abstract onCleanup(): Promise<void> | void;
}

/**
 * Helper function to ensure a method is only called when the manager is initialized.
 */
export function requiresInit(
  _target: any,
  _propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;
  descriptor.value = function(this: Manager, ...args: any[]) {
    if (!this.initialized) {
      throw new Error(
        `Cannot call ${_propertyKey} on uninitialized manager ${this.constructor.name}`
      );
    }
    return originalMethod.apply(this, args);
  };
  return descriptor;
}
