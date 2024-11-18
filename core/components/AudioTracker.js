import TrackerDisplay from './TrackerDisplay.js';

export class AudioTracker {
    constructor(p5, x = 20, y = 20) {
        try {
            if (!p5) {
                throw new Error('AudioTracker requires p5 instance');
            }

            this.p = p5;
            this.display = null;
            this.eventHandlers = new Map();
            this.isInitialized = false;

            // Defer display initialization until canvas is ready
            this.initializeWhenReady(x, y);
        } catch (error) {
            console.error('Error constructing AudioTracker:', error);
        }
    }

    async initializeWhenReady(x, y) {
        try {
            // Wait for canvas to be ready
            while (!this.p.canvas) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Initialize display
            this.display = new TrackerDisplay(this.p, x, y, 800, 500);

            // Bind event handlers
            this.bindEventHandlers();

            this.isInitialized = true;
            console.log('AudioTracker initialized successfully');
        } catch (error) {
            console.error('Error initializing AudioTracker:', error);
        }
    }

    bindEventHandlers() {
        try {
            // Create bound event handlers
            this.eventHandlers.set('click', this.handleClick.bind(this));
            this.eventHandlers.set('keydown', this.handleKeyPress.bind(this));
            this.eventHandlers.set('wheel', this.handleScroll.bind(this));

            // Add event listeners
            if (this.p.canvas) {
                this.p.canvas.addEventListener('click', this.eventHandlers.get('click'));
                this.p.canvas.addEventListener('wheel', this.eventHandlers.get('wheel'));
            }
            window.addEventListener('keydown', this.eventHandlers.get('keydown'));
        } catch (error) {
            console.error('Error binding event handlers:', error);
        }
    }

    draw(metrics) {
        try {
            if (!this.isInitialized) {
                this.drawInitializingState();
                return;
            }

            // Clear background
            this.p.push();
            this.p.fill(0);
            this.p.noStroke();
            this.p.rect(0, 0, this.p.width, this.p.height);
            this.p.pop();

            // Draw tracker display with safe defaults
            if (this.display) {
                this.display.draw({
                    pattern: metrics.pattern || null,
                    currentPattern: metrics.currentPattern || 0,
                    currentRow: metrics.currentRow || 0,
                    isPlaying: metrics.isPlaying || false,
                    bpm: metrics.bpm || 125,
                    samples: metrics.samples || [],
                    waveform: metrics.waveform || new Float32Array(1024)
                });
            }
        } catch (error) {
            console.error('Error in AudioTracker draw:', error);
            this.drawErrorState(error);
        }
    }

    drawInitializingState() {
        try {
            this.p.push();
            this.p.background(0);
            this.p.fill(200);
            this.p.noStroke();
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.textSize(14);
            this.p.text('Initializing tracker...', this.p.width/2, this.p.height/2);
            this.p.pop();
        } catch (error) {
            console.error('Error drawing initializing state:', error);
        }
    }

    drawErrorState(error) {
        try {
            this.p.push();
            this.p.background(0);
            this.p.fill(200, 50, 50);
            this.p.noStroke();
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.textSize(14);
            this.p.text('Error: ' + error.message, this.p.width/2, this.p.height/2);
            this.p.pop();
        } catch (e) {
            console.error('Error drawing error state:', e);
        }
    }

    handleClick(event) {
        try {
            if (!this.isInitialized || !this.display) return;

            const rect = this.p.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            const result = this.display.handleClick(x, y);
            if (result) {
                this.dispatchTrackerEvent(result);
            }
        } catch (error) {
            console.error('Error handling click:', error);
        }
    }

    handleKeyPress(event) {
        try {
            if (!this.isInitialized || !this.display) return;

            // Only handle keys when not in an input field
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            const result = this.display.handleKeyPress(
                event.key,
                event.shiftKey,
                event.ctrlKey
            );
            
            if (result) {
                this.dispatchTrackerEvent(result);
                event.preventDefault();
            }
        } catch (error) {
            console.error('Error handling key press:', error);
        }
    }

    handleScroll(event) {
        try {
            if (!this.isInitialized || !this.display) return;

            const result = this.display.handleScroll(event.deltaY);
            if (result) {
                this.dispatchTrackerEvent(result);
                event.preventDefault();
            }
        } catch (error) {
            console.error('Error handling scroll:', error);
        }
    }

    dispatchTrackerEvent(detail) {
        try {
            const customEvent = new CustomEvent('tracker-event', { 
                detail,
                bubbles: true,
                cancelable: true
            });
            window.dispatchEvent(customEvent);
        } catch (error) {
            console.error('Error dispatching tracker event:', error);
        }
    }

    cleanup() {
        try {
            // Remove event listeners
            if (this.p.canvas && this.eventHandlers.has('click')) {
                this.p.canvas.removeEventListener('click', this.eventHandlers.get('click'));
                this.p.canvas.removeEventListener('wheel', this.eventHandlers.get('wheel'));
            }
            if (this.eventHandlers.has('keydown')) {
                window.removeEventListener('keydown', this.eventHandlers.get('keydown'));
            }

            // Clear event handlers
            this.eventHandlers.clear();
            this.isInitialized = false;
            console.log('AudioTracker cleaned up successfully');
        } catch (error) {
            console.error('Error during AudioTracker cleanup:', error);
        }
    }
}

export default AudioTracker;
