import PatternView from './views/PatternView.js';
import SampleView from './views/SampleView.js';
import TransportBar from './views/TransportBar.js';
import ControlView from './views/ControlView.js';

class TrackerDisplay {
    constructor(p5, x = 20, y = 20, width = 800, height = 500) {
        if (!p5) {
            console.error('TrackerDisplay: p5 instance is required');
            return;
        }

        this.p = p5;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // Modern color scheme
        this.colors = {
            background: '#1a1a2e',
            panelBg: '#16213e',
            headerBg: '#1E293B',
            text: '#e2e2e2',
            dimText: '#94A3B8',
            highlight: '#2563EB',
            selection: '#4F46E5',
            accent: '#3B82F6',
            border: '#334155',
            waveform: '#10B981',
            grid: '#1E293B'
        };

        // Initialize components
        this.initializeComponents();

        // Display state
        this.editMode = 'pattern';
        this.keyToNote = {
            'z': 'C-', 's': 'C#', 'x': 'D-', 'd': 'D#', 'c': 'E-',
            'v': 'F-', 'g': 'F#', 'b': 'G-', 'h': 'G#', 'n': 'A-',
            'j': 'A#', 'm': 'B-', ',': 'C-'
        };

        console.log('TrackerDisplay initialized');
    }

    initializeComponents() {
        // Transport bar at the top
        this.transportBar = new TransportBar(this.p, {
            x: this.x,
            y: this.y,
            width: this.width,
            height: 45,
            colors: this.colors
        });

        // Pattern view in the main area
        this.patternView = new PatternView(this.p, {
            x: this.x + 15,
            y: this.y + 60,
            width: this.width * 0.65,
            height: this.height * 0.55,
            rowHeight: 20,
            channelWidth: 140,
            headerHeight: 30,
            colors: this.colors
        });

        // Sample view below pattern view
        this.sampleView = new SampleView(this.p, {
            x: this.x + 15,
            y: this.y + this.height * 0.55 + 80,
            width: this.width * 0.65,
            height: this.height * 0.35,
            rowHeight: 25,
            colors: this.colors
        });

        // Control view on the right
        this.controlView = new ControlView(this.p, {
            x: this.x + this.width * 0.65 + 30,
            y: this.y + 60,
            width: this.width * 0.3,
            height: this.height - 70,
            colors: this.colors
        });
    }

    draw(trackerState = {}) {
        try {
            // Ensure valid state with defaults
            const state = {
                pattern: trackerState.pattern || null,
                currentPattern: trackerState.currentPattern || 0,
                currentRow: trackerState.currentRow || 0,
                isPlaying: trackerState.isPlaying || false,
                bpm: trackerState.bpm || 125,
                samples: trackerState.samples || [],
                waveform: trackerState.waveform || new Float32Array(1024)
            };

            this.p.push();
            
            // Draw main background
            this.drawBackground();
            
            // Draw components
            this.transportBar.draw(state);
            this.patternView.draw(state.pattern, state.currentRow);
            this.sampleView.draw(state.samples);
            this.controlView.draw(
                state,
                this.editMode,
                this.sampleView.getSelectedSample(),
                this.patternView.state.selectedRow,
                this.patternView.state.selectedChannel
            );

            this.p.pop();
        } catch (error) {
            console.error('Error in TrackerDisplay draw:', error);
            this.drawErrorState(error);
        }
    }

    drawBackground() {
        // Create subtle gradient background
        this.p.noFill();
        for (let i = 0; i < this.height; i++) {
            const inter = this.p.map(i, 0, this.height, 0, 1);
            const c = this.p.lerpColor(
                this.p.color(this.colors.background),
                this.p.color(this.colors.panelBg),
                inter
            );
            this.p.stroke(c);
            this.p.line(this.x, this.y + i, this.x + this.width, this.y + i);
        }

        // Add subtle vignette effect
        this.p.noFill();
        for (let i = 0; i < 50; i++) {
            const alpha = this.p.map(i, 0, 50, 0, 30);
            this.p.stroke(0, alpha);
            this.p.rect(this.x + i, this.y + i, this.width - i * 2, this.height - i * 2);
        }
    }

    drawErrorState(error) {
        try {
            this.p.push();
            this.p.fill(this.colors.background);
            this.p.noStroke();
            this.p.rect(this.x, this.y, this.width, this.height);
            this.p.fill(this.colors.accent);
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.textSize(14);
            this.p.text('Error displaying tracker', this.x + this.width/2, this.y + this.height/2);
            this.p.pop();
        } catch (e) {
            console.error('Error drawing error state:', e);
        }
    }

    handleClick(mouseX, mouseY) {
        // Delegate click handling to components
        const transportAction = this.transportBar.handleClick(mouseX, mouseY);
        if (transportAction) return transportAction;

        const patternAction = this.patternView.handleClick(mouseX, mouseY);
        if (patternAction) {
            this.editMode = 'pattern';
            return patternAction;
        }

        const sampleAction = this.sampleView.handleClick(mouseX, mouseY);
        if (sampleAction) {
            this.editMode = 'sample';
            return sampleAction;
        }

        const controlAction = this.controlView.handleClick(mouseX, mouseY);
        if (controlAction) return controlAction;

        return null;
    }

    handleKeyPress(key, shift, ctrl) {
        if (this.editMode === 'pattern') {
            // Note input
            if (this.keyToNote[key]) {
                const note = this.keyToNote[key];
                const octave = shift ? 5 : ctrl ? 3 : 4;
                return {
                    type: 'note_input',
                    note: note + octave,
                    row: this.patternView.state.selectedRow,
                    channel: this.patternView.state.selectedChannel
                };
            }

            // Effect input
            if (key >= '0' && key <= '9' || key >= 'a' && key <= 'f') {
                return {
                    type: 'effect_input',
                    value: parseInt(key, 16),
                    row: this.patternView.state.selectedRow,
                    channel: this.patternView.state.selectedChannel
                };
            }

            // Navigation
            switch (key) {
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                case 'Tab':
                case 'PageUp':
                case 'PageDown':
                    return this.handleNavigation(key);
            }
        }

        return null;
    }

    handleNavigation(key) {
        switch (key) {
            case 'ArrowUp':
                return { type: 'navigation', direction: 'up' };
            case 'ArrowDown':
                return { type: 'navigation', direction: 'down' };
            case 'ArrowLeft':
                return { type: 'navigation', direction: 'left' };
            case 'ArrowRight':
                return { type: 'navigation', direction: 'right' };
            case 'Tab':
                return { type: 'navigation', direction: 'next_channel' };
            case 'PageUp':
                return { type: 'navigation', direction: 'page_up' };
            case 'PageDown':
                return { type: 'navigation', direction: 'page_down' };
        }
        return null;
    }

    handleScroll(delta) {
        if (this.editMode === 'pattern') {
            return this.patternView.scroll(delta);
        }
        return null;
    }
}

export default TrackerDisplay;
