import type p5 from 'p5';
import { SCENES } from '../types/scene';
import { StickFigures } from './StickFigures';
import { ParticleWave } from './ParticleWave';
import { ClassicWave } from './ClassicWave';
import { Pulse } from './Pulse';
import { Beat } from './Beat';

export const registerScenes = async (p: p5): Promise<void> => {
    console.log('[Scenes] Starting scene registration...');

    try {
        // Get EventBus from SceneManager
        const eventBus = window.sceneManager.getEventBus();

        // Register each scene
        console.log('[Scenes] Registering Stick Figures scene...');
        window.sceneManager.registerScene(SCENES.STICK_FIGURES, new StickFigures(p, eventBus));

        console.log('[Scenes] Registering Particle Wave scene...');
        window.sceneManager.registerScene(SCENES.PARTICLE_WAVE, new ParticleWave(p, eventBus));

        console.log('[Scenes] Registering Classic Wave scene...');
        window.sceneManager.registerScene(SCENES.CLASSIC_WAVE, new ClassicWave(p, eventBus));

        console.log('[Scenes] Registering Pulse scene...');
        window.sceneManager.registerScene(SCENES.PULSE, new Pulse(p, eventBus));

        console.log('[Scenes] Registering Beat scene...');
        window.sceneManager.registerScene(SCENES.BEAT, new Beat(p, eventBus));

        // Log registered scenes
        console.log('[Scenes] Currently registered scenes:', Object.values(SCENES));

        // Initialize default scene
        console.log('[Scenes] Initializing default scene...');
        await window.sceneManager.switchScene(SCENES.STICK_FIGURES);

        console.log('[Scenes] Scene registration completed successfully');
    } catch (error) {
        console.error('[Scenes] Error registering scenes:', error);
        throw error;
    }
};
