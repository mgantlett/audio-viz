import { Manager } from './Manager';
import { uiManager } from './UIManager';
import { audioManager } from './AudioManager';
import { sceneManager } from './SceneManager';
import { eventBus } from './EventBus';
import type { AppEvent } from '../types/events';

export class App extends Manager {
  private static instance: App;

  private constructor() {
    super();
    this.setupErrorHandling();
  }

  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }

  protected async onInitialize(): Promise<void> {
    try {
      console.log('Initializing application...');

      // Initialize managers in order
      await this.initializeManagers();

      // Set up global event listeners
      this.setupEventListeners();

      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Error initializing application:', error);
      throw error;
    }
  }

  protected async onCleanup(): Promise<void> {
    try {
      console.log('Cleaning up application...');

      // Stop any playing audio
      if (audioManager.isPlaying) {
        eventBus.emit({ type: 'audio:stop' });
      }

      console.log('Application cleanup completed');
    } catch (error) {
      console.error('Error during application cleanup:', error);
      throw error;
    }
  }

  private async initializeManagers(): Promise<void> {
    try {
      // Initialize UI first as it provides the interface
      console.log('Initializing UI Manager...');
      await uiManager.initialize();

      // Initialize audio system
      console.log('Initializing Audio Manager...');
      await audioManager.initialize();

      // Initialize scene manager last as it depends on both UI and audio
      console.log('Initializing Scene Manager...');
      await sceneManager.initialize();
    } catch (error) {
      console.error('Error initializing managers:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Listen for window resize events
    window.addEventListener('resize', () => {
      sceneManager.windowResized();
    });

    // Listen for visibility change to pause/resume audio
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        eventBus.emit({ type: 'audio:stop' });
      }
    });

    // Listen for unload to clean up
    window.addEventListener('beforeunload', () => {
      if (audioManager.isPlaying) {
        eventBus.emit({ type: 'audio:stop' });
      }
    });

    // Listen for audio errors
    eventBus.on('audio:error', (event: AppEvent & { type: 'audio:error' }) => {
      console.error('Audio error:', event.error);
    });
  }

  private setupErrorHandling(): void {
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('Global error:', {
        message,
        source,
        lineno,
        colno,
        error
      });
      return false;
    };

    window.onunhandledrejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    };
  }
}

// Create and export singleton instance
export const app = App.getInstance();
export default app;
