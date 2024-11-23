import * as p5 from 'p5';

declare global {
    interface Window {
        p5Instance: p5;
        sceneManager: {
            registerScene(name: string, scene: any): void;
            initialize(): void;
            draw(): void;
            windowResized(): void;
            isEnhancedMode: boolean;
        };
        uiManager: {
            initialize(): void;
            handleStartClick(): Promise<void>;
            handleStopClick(): void;
            resetAudioButton(): void;
            updateSceneButtons(activeSceneId: string): void;
            updateControlsForScene(sceneName: string): void;
            elements: {
                startButton: HTMLElement | null;
                stopButton: HTMLElement | null;
                sceneButtons: NodeListOf<Element> | null;
            };
        };
    }
}

export {};
