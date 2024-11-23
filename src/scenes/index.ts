import type p5 from 'p5';
import StickFigures from './StickFigures';
import ParticleWave from './ParticleWave';
import Beat from './Beat';
import type { SceneName } from '../types/scene';

// Export scene classes for potential direct usage
export {
  StickFigures,
  ParticleWave,
  Beat,
};

// Function to register all scenes
export function registerScenes(p5: p5): void {
  try {
    console.log('Registering scenes...');
    
    // Register each scene with the scene manager
    window.sceneManager.registerScene('scene1' as SceneName, new StickFigures(p5));
    window.sceneManager.registerScene('scene2' as SceneName, new ParticleWave(p5));
    window.sceneManager.registerScene('scene3' as SceneName, new Beat(p5));

    // Initialize the scene manager after registering scenes
    window.sceneManager.initialize();

    console.log('Scenes registered successfully');
  } catch (error) {
    console.error('Error registering scenes:', error);
    throw error;
  }
}
