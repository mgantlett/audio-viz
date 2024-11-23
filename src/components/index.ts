import { Menu } from './Menu';
import { Modal } from './Modal';
import { TabSystem } from './TabSystem';
import { AudioControls } from './AudioControls';
import { SceneControls } from './SceneControls';

// Initialize components in the correct order
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing components...');

    try {
        // Initialize modal system first
        console.log('Initializing Modal...');
        await Modal.initialize();
        
        // Initialize menu system (which will initialize TabSystem)
        console.log('Initializing Menu...');
        await Menu.initialize();
        
        // Initialize feature-specific controls
        console.log('Initializing AudioControls...');
        await AudioControls.initialize();

        console.log('Initializing SceneControls...');
        await SceneControls.initialize();

        console.log('All components initialized.');
    } catch (error) {
        console.error('Error initializing components:', error);
    }
});

// Export singleton instances
export const modal = Modal.getInstance();
export const menu = Menu.getInstance();
export const tabSystem = TabSystem.getInstance();
export const audioControls = AudioControls.getInstance();
export const sceneControls = SceneControls.getInstance();

// Export components
export {
    Menu,
    Modal,
    TabSystem,
    AudioControls,
    SceneControls
};
