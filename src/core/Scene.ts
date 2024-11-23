import type p5 from 'p5';
import type { SceneName } from '../types/scene';

export abstract class Scene {
    protected p5: p5;
    id: SceneName;

    constructor(p5: p5) {
        this.p5 = p5;
        this.id = 'scene1'; // Default ID, will be overwritten by SceneManager
    }

    abstract draw(amplitude?: number, frequency?: number): void;
    
    async setup(): Promise<boolean> {
        return true;
    }

    async cleanup(): Promise<void> {
        // Optional cleanup method
    }

    windowResized(): void {
        // Optional window resize handler
    }
}
