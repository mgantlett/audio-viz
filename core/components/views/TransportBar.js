class TransportBar {
    constructor(p5, config) {
        this.p = p5;
        this.config = {
            x: config.x || 0,
            y: config.y || 0,
            width: config.width || 800,
            height: config.height || 45,
            colors: config.colors || {},
            buttonSize: 25,
            buttonSpacing: 30
        };
    }

    draw(state) {
        this.drawBackground();
        this.drawTitle(state);
        this.drawTransportControls(state);
    }

    drawBackground() {
        // Draw title background with gradient
        for (let i = 0; i < this.config.height; i++) {
            const inter = this.p.map(i, 0, this.config.height, 0, 1);
            const c = this.p.lerpColor(
                this.p.color(this.config.colors.headerBg),
                this.p.color(this.config.colors.panelBg),
                inter
            );
            this.p.fill(c);
            this.p.noStroke();
            this.p.rect(this.config.x, this.config.y + i, this.config.width, 1);
        }
    }

    drawTitle(state) {
        // Draw title text with shadow
        const title = this.formatTitle(state);
        
        // Shadow
        this.p.fill(0, 100);
        this.p.textAlign(this.p.LEFT, this.p.CENTER);
        this.p.textSize(14);
        this.p.text(title, this.config.x + 21, this.config.y + 24);
        
        // Text
        this.p.fill(this.config.colors.text);
        this.p.text(title, this.config.x + 20, this.config.y + 23);
    }

    formatTitle(state) {
        return `Pattern ${state.currentPattern.toString().padStart(2, '0')} ` +
               `Row ${state.currentRow.toString().padStart(2, '0')} ` +
               `BPM ${state.bpm}`;
    }

    drawTransportControls(state) {
        const transportX = this.config.x + this.config.width - 180;
        const transportY = this.config.y + 10;
        let x = transportX;

        // Play/Stop button
        this.drawPlayButton(x, transportY, state.isPlaying);
        x += this.config.buttonSpacing;

        // Previous pattern button
        this.drawPrevButton(x, transportY);
        x += this.config.buttonSpacing;

        // Pattern number
        this.drawPatternNumber(x, transportY, state.currentPattern);
        x += this.config.buttonSpacing;

        // Next pattern button
        this.drawNextButton(x, transportY);
    }

    drawPlayButton(x, y, isPlaying) {
        // Button background
        this.p.stroke(this.config.colors.accent);
        this.p.fill(this.config.colors.panelBg);
        this.p.rect(x, y, this.config.buttonSize, this.config.buttonSize, 5);
        
        // Play/Stop icon
        this.p.fill(this.config.colors.accent);
        this.p.noStroke();
        if (isPlaying) {
            // Stop symbol
            this.p.rect(
                x + 7, 
                y + 7, 
                this.config.buttonSize - 14, 
                this.config.buttonSize - 14, 
                2
            );
        } else {
            // Play symbol
            this.p.triangle(
                x + 8, y + 5,
                x + 8, y + this.config.buttonSize - 5,
                x + this.config.buttonSize - 5, y + this.config.buttonSize/2
            );
        }
    }

    drawPrevButton(x, y) {
        // Button background
        this.p.stroke(this.config.colors.text);
        this.p.fill(this.config.colors.panelBg);
        this.p.rect(x, y, this.config.buttonSize, this.config.buttonSize, 5);
        
        // Previous icon
        this.p.fill(this.config.colors.text);
        this.p.noStroke();
        this.p.triangle(
            x + 5, y + this.config.buttonSize/2,
            x + this.config.buttonSize - 8, y + 5,
            x + this.config.buttonSize - 8, y + this.config.buttonSize - 5
        );
    }

    drawPatternNumber(x, y, pattern) {
        // Button background
        this.p.stroke(this.config.colors.text);
        this.p.fill(this.config.colors.panelBg);
        this.p.rect(x, y, this.config.buttonSize, this.config.buttonSize, 5);
        
        // Pattern number
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.noStroke();
        this.p.fill(this.config.colors.text);
        this.p.text(
            pattern.toString().padStart(2, '0'),
            x + this.config.buttonSize/2,
            y + this.config.buttonSize/2
        );
    }

    drawNextButton(x, y) {
        // Button background
        this.p.stroke(this.config.colors.text);
        this.p.fill(this.config.colors.panelBg);
        this.p.rect(x, y, this.config.buttonSize, this.config.buttonSize, 5);
        
        // Next icon
        this.p.fill(this.config.colors.text);
        this.p.noStroke();
        this.p.triangle(
            x + 8, y + 5,
            x + 8, y + this.config.buttonSize - 5,
            x + this.config.buttonSize - 5, y + this.config.buttonSize/2
        );
    }

    handleClick(mouseX, mouseY) {
        if (!this.isInBounds(mouseX, mouseY)) return null;

        const transportX = this.config.x + this.config.width - 180;
        const transportY = this.config.y + 10;
        const hitArea = 5; // Extra pixels for easier clicking

        if (mouseY >= transportY - hitArea && 
            mouseY < transportY + this.config.buttonSize + hitArea) {
            
            // Play/Stop button
            if (this.isInButtonBounds(mouseX, transportX, hitArea)) {
                return { type: 'transport_toggle' };
            }
            
            // Previous pattern
            if (this.isInButtonBounds(mouseX, transportX + this.config.buttonSpacing, hitArea)) {
                return { type: 'pattern_prev' };
            }
            
            // Next pattern
            if (this.isInButtonBounds(mouseX, transportX + this.config.buttonSpacing * 3, hitArea)) {
                return { type: 'pattern_next' };
            }
        }

        return null;
    }

    isInBounds(x, y) {
        return x >= this.config.x && 
               x < this.config.x + this.config.width &&
               y >= this.config.y && 
               y < this.config.y + this.config.height;
    }

    isInButtonBounds(mouseX, buttonX, hitArea) {
        return mouseX >= buttonX - hitArea && 
               mouseX < buttonX + this.config.buttonSize + hitArea;
    }
}

export default TransportBar;
