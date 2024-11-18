class UIManager {
    constructor() {
        this.initialized = false;
        this.elements = {
            startButton: null,
            stopButton: null,
            sideControls: null,
            sceneButtons: null,
            basicSceneControls: null,
            beatSceneControls: null,
            toolsSection: null,
            patternButtons: null,
            progressionButtons: null,
            transportButtons: null,
            tabButtons: null,
            tabPanes: null,
            toolsTab: null
        };
        this.lastTempoUpdate = 0;
        this.isProcessingTempoChange = false;
    }

    initialize() {
        if (this.initialized) return;
        this.cacheElements();
        if (this.validateElements()) {
            this.setupEventListeners();
            this.startControlUpdates();
            this.updateControlsForScene('scene1');
            this.initialized = true;
        } else {
            console.error('Failed to initialize UI: Missing required elements');
        }
    }

    validateElements() {
        const requiredElements = [
            'startButton',
            'stopButton',
            'sideControls',
            'basicSceneControls',
            'beatSceneControls'
        ];
        
        return requiredElements.every(elementKey => {
            const element = this.elements[elementKey];
            if (!element) {
                console.error(`Missing required element: ${elementKey}`);
                return false;
            }
            return true;
        });
    }

    cacheElements() {
        Object.keys(this.elements).forEach(key => {
            const selector = this.getElementSelector(key);
            this.elements[key] = selector.startsWith('.') ? 
                document.querySelectorAll(selector) : 
                document.querySelector(selector);
        });
    }

    getElementSelector(key) {
        const selectors = {
            startButton: '#startButton',
            stopButton: '#stopButton',
            sideControls: '#side-controls',
            sceneButtons: '.scene-btn',
            basicSceneControls: '.basic-scene-controls',
            beatSceneControls: '.beat-scene-controls',
            toolsSection: '.tools-section',
            patternButtons: '.pattern-btn',
            progressionButtons: '.progression-btn',
            transportButtons: '.transport-btn',
            tabButtons: '.tab-btn',
            tabPanes: '.tab-pane',
            toolsTab: '.tools-tab'
        };
        return selectors[key] || '';
    }

    startControlUpdates() {
        setInterval(() => {
            if (window.sceneManager?.isAudioInitialized()) {
                this.updateControlValues();
            }
        }, 100);
    }

    setupEventListeners() {
        this.setupAudioControls();
        this.setupPatternControls();
        this.setupProgressionControls();
        this.setupTempoControl();
        this.setupSceneControls();
        this.setupKeyboardShortcuts();
        this.setupTabControls();
    }

    setupTabControls() {
        if (!this.elements.tabButtons) return;
        this.elements.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
    }

    switchTab(tabName) {
        if (!this.elements.tabButtons || !this.elements.tabPanes) return;

        this.elements.tabButtons.forEach(btn => {
            const isActive = btn.dataset.tab === tabName;
            this.toggleButtonState(btn, isActive);
        });

        this.elements.tabPanes.forEach(pane => {
            const isActive = pane.dataset.tab === tabName;
            pane.classList.toggle('hidden', !isActive);
            pane.classList.toggle('block', isActive);
        });
    }

    toggleButtonState(btn, isActive) {
        btn.classList.toggle('bg-primary', isActive);
        btn.classList.toggle('text-white', isActive);
        btn.classList.toggle('text-secondary', !isActive);
        btn.classList.toggle('bg-transparent', !isActive);
    }

    setupAudioControls() {
        if (!this.elements.startButton || !this.elements.stopButton) return;

        this.elements.startButton.addEventListener('click', async () => {
            this.elements.startButton.disabled = true;
            
            try {
                if (!window.sceneManager.isAudioInitialized()) {
                    const mode = window.sceneManager.isEnhancedMode ? 'enhanced' : 'basic';
                    const success = await window.sceneManager.initializeAudio(mode);
                    
                    if (!success) {
                        throw new Error('Failed to initialize audio');
                    }
                }

                window.sceneManager.startAudio();
            } catch (error) {
                console.error('Error during audio start:', error);
                this.resetAudioButton();
            }
        });

        this.elements.stopButton.addEventListener('click', () => {
            try {
                window.sceneManager.stopAudio();
            } catch (error) {
                console.error('Error during audio stop:', error);
                this.resetAudioButton();
            }
        });
    }

    updateAudioButtonState(isPlaying) {
        if (!this.elements.startButton || !this.elements.stopButton) return;

        this.elements.startButton.classList.toggle('hidden', isPlaying);
        this.elements.stopButton.classList.toggle('hidden', !isPlaying);
        this.elements.startButton.disabled = false;
        this.updateTransportButtons(isPlaying);
    }

    resetAudioButton() {
        if (!this.elements.startButton || !this.elements.stopButton) return;

        this.elements.startButton.classList.remove('hidden');
        this.elements.stopButton.classList.add('hidden');
        this.elements.startButton.disabled = false;
        this.updateTransportButtons(false);
        this.elements.startButton.textContent = 'Initialize Audio System';
    }

    setupPatternControls() {
        if (!this.elements.patternButtons) return;

        this.elements.patternButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!window.sceneManager.isAudioInitialized()) return;
                
                const pattern = btn.dataset.pattern;
                window.sceneManager.setPattern(pattern);
                this.updatePatternButtons(pattern);
            });
        });
    }

    setupProgressionControls() {
        if (!this.elements.progressionButtons) return;

        this.elements.progressionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!window.sceneManager.isAudioInitialized()) return;
                
                const progression = parseInt(btn.dataset.progression);
                window.sceneManager.setProgression(progression);
                this.updateProgressionButtons(progression);
            });
        });
    }

    setupTempoControl() {
        document.addEventListener('wheel', this.handleTempoWheel.bind(this), { passive: false });
    }

    handleTempoWheel(event) {
        if (!this.canProcessTempoChange()) return;
        
        event.preventDefault();
        
        if (this.isThrottled()) return;
        this.lastTempoUpdate = Date.now();
        
        this.isProcessingTempoChange = true;
        
        const delta = event.deltaY < 0 ? 5 : -5;
        window.sceneManager.updateTempo(delta);
        this.updateControlValues();
        
        setTimeout(() => {
            this.isProcessingTempoChange = false;
        }, 50);
    }

    canProcessTempoChange() {
        return window.sceneManager?.isEnhancedMode && 
               window.sceneManager?.isAudioInitialized() && 
               !this.isProcessingTempoChange;
    }

    isThrottled() {
        return Date.now() - this.lastTempoUpdate < 50;
    }

    setupSceneControls() {
        if (!this.elements.sceneButtons) return;

        this.elements.sceneButtons.forEach(btn => {
            this.setupSceneButton(btn);
        });
    }

    setupSceneButton(btn) {
        btn.addEventListener('mouseenter', () => {
            if (!btn.classList.contains('bg-primary')) {
                btn.style.transform = 'translateX(5px)';
            }
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateX(0)';
        });

        btn.addEventListener('click', async () => {
            const sceneName = btn.id;
            await window.sceneManager.switchToScene(sceneName);
            this.updateSceneButtons(sceneName);
            this.updateControlsForScene(sceneName);
            this.switchTab('controls');
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    handleKeyPress(e) {
        if (window.sceneManager?.isEnhancedMode) {
            this.handleTrackerShortcuts(e);
        } else {
            this.handleSceneShortcuts(e);
        }
        this.handleGlobalShortcuts(e);
    }

    handleTrackerShortcuts(e) {
        if (!window.sceneManager?.currentScene?.tracker) return;

        if (this.isNoteKey(e.key)) {
            window.sceneManager.currentScene.tracker.handleKeyPress(e.key, e.shiftKey, e.ctrlKey);
            return;
        }

        if (this.isEffectValueKey(e.key)) {
            window.sceneManager.currentScene.tracker.handleKeyPress(e.key, e.shiftKey, e.ctrlKey);
            return;
        }

        this.handleTrackerNavigationKey(e);
    }

    isNoteKey(key) {
        return 'zsxdcvgbhnjm'.includes(key.toLowerCase());
    }

    isEffectValueKey(key) {
        return key >= '0' && key <= '9';
    }

    handleTrackerNavigationKey(e) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.toggleAudio();
                break;
            case 'Tab':
                e.preventDefault();
                window.sceneManager.currentScene.tracker.handleKeyPress('Tab', e.shiftKey, e.ctrlKey);
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowUp':
            case 'ArrowDown':
                window.sceneManager.currentScene.tracker.handleKeyPress(e.key, e.shiftKey, e.ctrlKey);
                break;
        }
    }

    toggleAudio() {
        if (window.sceneManager?.isPlaying) {
            window.sceneManager.stopAudio();
        } else {
            window.sceneManager.startAudio();
        }
    }

    handleSceneShortcuts(e) {
        const sceneMap = {
            '1': 'scene1',
            '2': 'scene2',
            '3': 'scene3'
        };

        const action = sceneMap[e.key];
        if (action) {
            window.sceneManager.switchToScene(action);
            this.updateSceneButtons(action);
            this.updateControlsForScene(action);
            this.switchTab('controls');
        }
    }

    handleGlobalShortcuts(e) {
        if (e.key.toLowerCase() === 'm') {
            this.toggleControls();
        }
    }

    updatePatternButtons(pattern) {
        if (!this.elements.patternButtons) return;

        this.elements.patternButtons.forEach(btn => {
            const isActive = btn.dataset.pattern === pattern;
            this.updateButtonStyle(btn, isActive);
        });
    }

    updateProgressionButtons(progression) {
        if (!this.elements.progressionButtons) return;

        this.elements.progressionButtons.forEach(btn => {
            const isActive = parseInt(btn.dataset.progression) === progression;
            this.updateButtonStyle(btn, isActive);
        });
    }

    updateButtonStyle(btn, isActive) {
        btn.classList.toggle('bg-primary', isActive);
        btn.classList.toggle('border-primary/80', isActive);
        btn.classList.toggle('shadow-lg', isActive);
        btn.classList.toggle('shadow-primary/30', isActive);
    }

    updateTransportButtons(isPlaying) {
        const playButton = document.querySelector('.transport-btn[data-action="play"]');
        if (playButton) {
            playButton.textContent = isPlaying ? 'Stop' : 'Play';
            playButton.classList.toggle('bg-primary', isPlaying);
            playButton.classList.toggle('border-primary/80', isPlaying);
        }
    }

    updateControlValues() {
        const controlItems = document.querySelectorAll('.control-item');
        controlItems.forEach(item => {
            const label = item.querySelector('.label')?.textContent.toLowerCase();
            const valueSpan = item.querySelector('.value');
            
            if (label && valueSpan) {
                this.updateControlValue(label, valueSpan);
            }
        });
    }

    updateControlValue(label, valueSpan) {
        if (!window.sceneManager?.isAudioInitialized()) return;

        if (window.sceneManager.isEnhancedMode) {
            if (label === 'tempo') {
                valueSpan.textContent = `${window.sceneManager.currentTempo} BPM`;
            }
        } else {
            switch(label) {
                case 'pitch':
                    const pitchRatio = window.sceneManager.getCurrentPitch();
                    valueSpan.textContent = `${pitchRatio.toFixed(2)}x`;
                    break;
                case 'volume':
                    const volume = window.sceneManager.getCurrentVolume();
                    valueSpan.textContent = `${Math.round(volume * 100)}%`;
                    break;
            }
        }
    }

    updateControlsForScene(sceneId) {
        const isEnhancedMode = sceneId === 'scene3';
        
        // Handle basic scene controls
        const basicControls = document.querySelector('.basic-scene-controls');
        if (basicControls) {
            basicControls.style.display = isEnhancedMode ? 'none' : 'block';
        }
        
        // Handle beat scene controls
        const beatControls = document.querySelector('.beat-scene-controls');
        if (beatControls) {
            beatControls.style.display = isEnhancedMode ? 'block' : 'none';
        }
        
        // Handle tools tab visibility
        if (this.elements.toolsTab) {
            const toolsTab = document.querySelector('.tools-tab');
            if (toolsTab) {
                toolsTab.classList.toggle('visible', isEnhancedMode);
                
                if (!isEnhancedMode && toolsTab.classList.contains('bg-primary')) {
                    this.switchTab('scenes');
                }
            }
        }
        
        this.updateControlValues();
    }

    showControls() {
        if (!this.elements.sideControls) return;

        this.elements.sideControls.classList.remove('hidden');
        this.elements.sideControls.style.opacity = '1';
        this.elements.sideControls.style.transform = 'translateY(-50%) translateX(0)';
    }

    hideControls() {
        if (!this.elements.sideControls) return;

        this.elements.sideControls.style.opacity = '0';
        this.elements.sideControls.style.transform = 'translateY(-50%) translateX(50px)';
        
        setTimeout(() => {
            this.elements.sideControls.classList.add('hidden');
        }, 300);
    }

    toggleControls() {
        if (!this.elements.sideControls) return;

        if (this.elements.sideControls.classList.contains('hidden')) {
            this.showControls();
        } else {
            this.hideControls();
        }
    }

    updateSceneButtons(activeScene) {
        if (!this.elements.sceneButtons) return;

        this.elements.sceneButtons.forEach(btn => {
            const isActive = btn.id === activeScene;
            this.updateButtonStyle(btn, isActive);
        });
    }
}

window.uiManager = new UIManager();
