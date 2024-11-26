import type { EventBus } from '../core/EventBus';
import { SCENE_CONFIGS, type SceneName } from '../types/scene';

export class SceneSelector {
    private container: HTMLElement;
    private buttons: Map<SceneName, HTMLElement> = new Map();
    private currentScene: SceneName | null = null;

    constructor(private eventBus: EventBus) {
        this.container = document.createElement('div');
        this.container.className = 'space-y-2';
        this.createSceneButtons();
        this.setupEventListeners();
    }

    private createSceneButtons(): void {
        Object.entries(SCENE_CONFIGS).forEach(([sceneName, config], index) => {
            const button = document.createElement('button');
            button.style.cssText = `
                width: 100%;
                padding: 12px;
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: rgba(255, 255, 255, 0.9);
                text-align: left;
                cursor: pointer;
                transition: all 0.2s ease-out;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
                outline: none;
            `;
            button.innerHTML = `
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 14px; font-weight: 500; margin-bottom: 4px;">${config.name}</div>
                    <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">${config.description}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="
                        padding: 4px 8px;
                        background: rgba(33, 150, 243, 0.1);
                        color: #2196F3;
                        border: 1px solid rgba(33, 150, 243, 0.2);
                        border-radius: 4px;
                        font-size: 12px;
                        font-family: monospace;
                    ">${index + 1}</span>
                    <span style="
                        color: #2196F3;
                        opacity: 0;
                        transition: opacity 0.2s;
                    ">▶</span>
                </div>
            `;

            button.onmouseover = () => {
                button.style.background = 'rgba(255, 255, 255, 0.05)';
                button.style.borderColor = 'rgba(33, 150, 243, 0.3)';
            };
            button.onmouseout = () => {
                if (this.currentScene !== sceneName) {
                    button.style.background = 'rgba(0, 0, 0, 0.2)';
                    button.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
            };
            button.onfocus = () => {
                button.style.boxShadow = '0 0 0 2px rgba(33, 150, 243, 0.3)';
            };
            button.onblur = () => {
                button.style.boxShadow = 'none';
            };

            button.onclick = () => this.switchScene(sceneName as SceneName);

            this.buttons.set(sceneName as SceneName, button);
            this.container.appendChild(button);
        });
    }

    private setupEventListeners(): void {
        this.eventBus.on('scene:switched', (event) => {
            this.updateActiveScene(event.to as SceneName);
        });
    }

    private switchScene(sceneName: SceneName): void {
        this.eventBus.emit({
            type: 'scene:switch',
            sceneId: sceneName
        });
    }

    private updateActiveScene(sceneName: SceneName): void {
        this.currentScene = sceneName;

        this.buttons.forEach((button, name) => {
            if (name === sceneName) {
                button.style.background = 'rgba(33, 150, 243, 0.1)';
                button.style.borderColor = '#2196F3';
                const playIcon = button.querySelector('span:last-child') as HTMLElement;
                if (playIcon) {
                    playIcon.style.opacity = '1';
                }
            } else {
                button.style.background = 'rgba(0, 0, 0, 0.2)';
                button.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                const playIcon = button.querySelector('span:last-child') as HTMLElement;
                if (playIcon) {
                    playIcon.style.opacity = '0';
                }
            }
        });
    }

    public mount(parent: HTMLElement): void {
        parent.appendChild(this.container);
    }

    public unmount(): void {
        this.container.remove();
    }

    public getCurrentScene(): SceneName | null {
        return this.currentScene;
    }
}

export const createSceneSelector = (eventBus: EventBus): SceneSelector => {
    return new SceneSelector(eventBus);
};
