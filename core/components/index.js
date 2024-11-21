import Menu from './Menu.js';
import Modal from './Modal.js';
import SampleGenerator from './SampleGenerator.js';
import AudioControls from './AudioControls.js';
import SceneControls from './SceneControls.js';
import TabSystem from './TabSystem.js';

// Initialize components in the correct order
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing components...');

    // Initialize modal system first
    console.log('Initializing Modal...');
    Modal.initialize();
    
    // Initialize menu system (which will initialize TabSystem)
    console.log('Initializing Menu...');
    Menu.initialize();
    
    // Initialize feature-specific controls
    console.log('Initializing AudioControls...');
    AudioControls.initialize();

    console.log('Initializing SceneControls...');
    SceneControls.initialize();

    console.log('Initializing SampleGenerator...');
    SampleGenerator.initialize();

    console.log('All components initialized.');
});

// Export components
export {
    Menu,
    Modal,
    SampleGenerator,
    AudioControls,
    SceneControls,
    TabSystem
};
