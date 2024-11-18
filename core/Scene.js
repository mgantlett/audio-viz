class Scene {
    constructor() {
        this.isInitialized = false;
        this.p = window.p5Instance;
        this.setupPromise = null;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 3;
        this.cleanupInProgress = false;
    }

    async setup() {
        if (this.setupPromise) {
            console.log('Setup already in progress, waiting...');
            return this.setupPromise;
        }

        this.setupPromise = (async () => {
            try {
                if (this.isInitialized) {
                    console.log('Scene already initialized');
                    return true;
                }

                this.initializationAttempts++;
                console.log(`Setting up scene (attempt ${this.initializationAttempts}/${this.maxInitializationAttempts})`);

                // Ensure cleanup is complete before initializing
                if (this.cleanupInProgress) {
                    console.log('Waiting for cleanup to complete...');
                    await new Promise(resolve => setTimeout(resolve, 200));
                }

                // Initialize scene
                const success = await this.initialize();
                if (success === false) {
                    throw new Error('Scene initialization failed');
                }

                // Wait for initialization to settle
                await new Promise(resolve => setTimeout(resolve, 100));

                this.isInitialized = true;
                console.log('Scene setup completed successfully');
                return true;
            } catch (error) {
                console.error('Error setting up scene:', error);

                // Retry initialization if under max attempts
                if (this.initializationAttempts < this.maxInitializationAttempts) {
                    console.log(`Retrying scene setup (attempt ${this.initializationAttempts + 1}/${this.maxInitializationAttempts})...`);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return this.setup();
                }

                await this.cleanup();
                return false;
            } finally {
                this.setupPromise = null;
            }
        })();

        return this.setupPromise;
    }

    async initialize() {
        try {
            // Override in subclass
            console.log('Base scene initialize called');
            return true;
        } catch (error) {
            console.error('Error in scene initialize:', error);
            return false;
        }
    }

    draw(amplitude, frequency) {
        try {
            if (!this.isInitialized) {
                this.drawInitializingState();
                return;
            }

            // Override in subclass
            console.log('Base scene draw called');
        } catch (error) {
            console.error('Error in scene draw:', error);
            this.drawErrorState(error);
        }
    }

    drawInitializingState() {
        try {
            this.p.background(0);
            this.p.fill(200);
            this.p.noStroke();
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.textSize(14);
            this.p.text('Initializing scene...', this.p.width/2, this.p.height/2);
        } catch (error) {
            console.error('Error drawing initializing state:', error);
        }
    }

    drawErrorState(error) {
        try {
            this.p.background(0);
            this.p.fill(200, 50, 50);
            this.p.noStroke();
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.textSize(14);
            this.p.text('Error: ' + error.message, this.p.width/2, this.p.height/2);
        } catch (e) {
            console.error('Error drawing error state:', e);
        }
    }

    async cleanup() {
        try {
            if (this.cleanupInProgress) {
                console.log('Cleanup already in progress');
                return;
            }

            this.cleanupInProgress = true;
            console.log('Starting scene cleanup');

            // Override in subclass
            console.log('Base scene cleanup called');

            // Reset state
            this.isInitialized = false;
            this.initializationAttempts = 0;
            
            // Wait for cleanup to settle
            await new Promise(resolve => setTimeout(resolve, 100));

            console.log('Scene cleanup completed');
        } catch (error) {
            console.error('Error during scene cleanup:', error);
        } finally {
            this.cleanupInProgress = false;
        }
    }

    windowResized() {
        try {
            if (!this.isInitialized) return;

            // Override in subclass
            console.log('Base scene windowResized called');
        } catch (error) {
            console.error('Error in scene windowResized:', error);
        }
    }

    isReady() {
        return this.isInitialized && !this.cleanupInProgress;
    }
}

export default Scene;
