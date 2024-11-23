// Import components
import { menu } from './Menu';
import { modal } from './Modal';
import { tabSystem } from './TabSystem';
import { audioControls } from './AudioControls';
import { sceneControls } from './SceneControls';
import { sampleGenerator } from './SampleGenerator';
import { menuTemplate, toggleButtonTemplate } from './MenuTemplate';
import type { IScene } from '../core/SceneManager';

// Export components
export {
  menu,
  modal,
  tabSystem,
  audioControls,
  sceneControls,
  sampleGenerator,
  menuTemplate,
  toggleButtonTemplate
};

// Export types
export type { IScene };

// Initialize all components
export async function initializeComponents(): Promise<void> {
  console.log('Initializing components...');

  try {
    // Initialize modal system first
    console.log('Initializing Modal...');
    await modal.initialize();
    
    // Initialize menu system (which will initialize TabSystem)
    console.log('Initializing Menu...');
    await menu.initialize();
    
    // Initialize feature-specific controls
    console.log('Initializing AudioControls...');
    await audioControls.initialize();

    console.log('Initializing SceneControls...');
    await sceneControls.initialize();

    console.log('Initializing SampleGenerator...');
    await sampleGenerator.initialize();

    console.log('All components initialized successfully');
  } catch (error) {
    console.error('Error initializing components:', error);
    throw error;
  }
}

// Export initialization function
export { initializeComponents as initialize };
