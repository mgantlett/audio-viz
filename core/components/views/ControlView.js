class ControlView {
    constructor(p5, config) {
        this.p = p5;
        this.config = {
            x: config.x || 0,
            y: config.y || 0,
            width: config.width || 250,
            height: config.height || 400,
            colors: config.colors || {},
            sectionSpacing: 15,
            sectionPadding: 15
        };
    }

    draw(state, editMode, selectedSample, selectedRow, selectedChannel) {
        this.drawBackground();
        
        let y = this.config.y + this.config.sectionPadding;

        // Pattern controls
        y = this.drawPatternSection(y, state);

        // Sample controls when in sample edit mode
        if (editMode === 'sample' && state.samples[selectedSample]) {
            y = this.drawSampleSection(y, state.samples[selectedSample]);
        }

        // Effect controls when in pattern edit mode
        if (editMode === 'pattern' && state.pattern) {
            y = this.drawEffectSection(y, state.pattern, selectedRow, selectedChannel);
        }

        // Keyboard shortcuts
        y = this.drawShortcutsSection(y);
    }

    drawBackground() {
        // Main background
        this.p.fill(this.config.colors.panelBg);
        this.p.noStroke();
        this.p.rect(
            this.config.x - 5,
            this.config.y - 5,
            this.config.width + 10,
            this.config.height + 10,
            8
        );

        // Inner shadow effect
        this.p.noFill();
        for (let i = 0; i < 5; i++) {
            const alpha = this.p.map(i, 0, 5, 20, 0);
            this.p.stroke(0, alpha);
            this.p.rect(
                this.config.x - i,
                this.config.y - i,
                this.config.width + i * 2,
                this.config.height + i * 2,
                8
            );
        }
    }

    drawPatternSection(y, state) {
        const lines = [
            `Number: ${state.currentPattern}`,
            `Length: ${state.pattern?.rows || 0}`,
            `Speed: ${state.bpm} BPM`
        ];

        return this.drawSection('Pattern', y, lines);
    }

    drawSampleSection(y, sample) {
        const lines = [
            `Name: ${sample.name}`,
            `Length: ${sample.length}`,
            `Base Note: ${sample.baseNote}`,
            `Loop: ${sample.loopStart}-${sample.loopEnd}`
        ];

        return this.drawSection('Sample', y, lines);
    }

    drawEffectSection(y, pattern, row, channel) {
        const note = pattern.getNote(row, channel);
        const lines = [
            `Type: ${note?.effect !== null ? note.effect.toString(16).toUpperCase() : '--'}`,
            `Param: ${note?.effectParam !== null ? note.effectParam.toString(16).toUpperCase() : '--'}`
        ];

        return this.drawSection('Effects', y, lines);
    }

    drawShortcutsSection(y) {
        const lines = [
            'Z-M: Note Input',
            '0-9: Effect Value',
            'Tab: Next Channel',
            'Space: Play/Stop',
            'Shift: Octave Up',
            'Ctrl: Octave Down'
        ];

        return this.drawSection('Shortcuts', y, lines);
    }

    drawSection(title, y, lines) {
        const lineHeight = 25;
        const sectionHeight = lines.length * lineHeight + 40;

        // Section background with gradient
        this.p.noStroke();
        for (let i = 0; i < sectionHeight; i++) {
            const inter = this.p.map(i, 0, sectionHeight, 0, 1);
            const c = this.p.lerpColor(
                this.p.color(this.config.colors.headerBg + '40'),
                this.p.color(this.config.colors.panelBg),
                inter
            );
            this.p.fill(c);
            this.p.rect(
                this.config.x + 5,
                y + i,
                this.config.width - 10,
                1,
                5
            );
        }

        // Title
        this.p.fill(this.config.colors.accent);
        this.p.textSize(13);
        this.p.textAlign(this.p.LEFT, this.p.CENTER);
        this.p.text(title, this.config.x + 15, y + 20);

        // Lines
        this.p.textSize(12);
        lines.forEach((line, i) => {
            // Text shadow
            this.p.fill(0, 50);
            this.p.text(
                line,
                this.config.x + 21,
                y + 46 + i * lineHeight
            );

            // Actual text
            this.p.fill(this.config.colors.text);
            this.p.text(
                line,
                this.config.x + 20,
                y + 45 + i * lineHeight
            );
        });

        return y + sectionHeight + this.config.sectionSpacing;
    }

    handleClick(mouseX, mouseY) {
        // Add click handling for interactive controls if needed
        if (!this.isInBounds(mouseX, mouseY)) return null;
        return null;
    }

    isInBounds(x, y) {
        return x >= this.config.x && 
               x < this.config.x + this.config.width &&
               y >= this.config.y && 
               y < this.config.y + this.config.height;
    }
}

export default ControlView;
