class SampleView {
    constructor(p5, config) {
        this.p = p5;
        this.config = {
            x: config.x || 0,
            y: config.y || 0,
            width: config.width || 800,
            height: config.height || 200,
            rowHeight: config.rowHeight || 25,
            colors: config.colors || {}
        };

        this.state = {
            selectedSample: 0
        };
    }

    draw(samples) {
        if (!samples || !samples.length) {
            this.drawEmptyState();
            return;
        }

        this.drawBackground();
        this.drawHeader();
        this.drawSampleList(samples);
    }

    drawBackground() {
        this.p.fill(this.config.colors.panelBg);
        this.p.noStroke();
        this.p.rect(
            this.config.x - 5, 
            this.config.y - 25,
            this.config.width + 10, 
            this.config.height + 30, 
            5
        );
    }

    drawHeader() {
        this.p.fill(this.config.colors.text);
        this.p.textAlign(this.p.LEFT, this.p.CENTER);
        this.p.textSize(14);
        this.p.text('Samples', this.config.x, this.config.y - 10);
    }

    drawSampleList(samples) {
        const visibleSamples = Math.floor(this.config.height / this.config.rowHeight);
        
        for (let i = 0; i < visibleSamples && i < samples.length; i++) {
            const y = this.config.y + i * this.config.rowHeight;
            
            // Draw selection highlight
            if (i === this.state.selectedSample) {
                this.drawSelectionHighlight(y);
            }

            const sample = samples[i];
            if (sample) {
                this.drawSampleInfo(sample, i, y);
                if (sample.data) {
                    this.drawWaveformPreview(sample, y);
                }
            }
        }
    }

    drawSelectionHighlight(y) {
        this.p.fill(this.config.colors.selection + '80');
        this.p.noStroke();
        this.p.rect(
            this.config.x, 
            y, 
            this.config.width, 
            this.config.rowHeight, 
            3
        );
    }

    drawSampleInfo(sample, index, y) {
        this.p.fill(this.config.colors.text);
        this.p.textAlign(this.p.LEFT, this.p.CENTER);
        this.p.textSize(13);
        this.p.text(
            `${index.toString().padStart(2, '0')}: ${sample.name}`,
            this.config.x + 10, 
            y + this.config.rowHeight/2
        );
    }

    drawWaveformPreview(sample, y) {
        const previewWidth = 200;
        const previewX = this.config.x + this.config.width - previewWidth - 10;
        
        this.p.stroke(this.config.colors.waveform);
        this.p.noFill();
        this.p.beginShape();
        
        for (let x = 0; x < previewWidth; x++) {
            const idx = Math.floor((x / previewWidth) * sample.data.length);
            const value = sample.data[idx] * 8; // Amplify for visibility
            this.p.vertex(
                previewX + x,
                y + (this.config.rowHeight/2) + value * (this.config.rowHeight/4)
            );
        }
        
        this.p.endShape();
    }

    drawEmptyState() {
        this.drawBackground();
        
        this.p.fill(this.config.colors.dimText);
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.textSize(14);
        this.p.text(
            'No samples loaded',
            this.config.x + this.config.width/2,
            this.config.y + this.config.height/2
        );
    }

    handleClick(mouseX, mouseY) {
        if (!this.isInBounds(mouseX, mouseY)) return null;

        const sample = this.getSampleFromY(mouseY);
        if (sample >= 0) {
            this.state.selectedSample = sample;
            return { type: 'sample_select', sample };
        }

        return null;
    }

    isInBounds(x, y) {
        return x >= this.config.x && 
               x < this.config.x + this.config.width &&
               y >= this.config.y && 
               y < this.config.y + this.config.height;
    }

    getSampleFromY(y) {
        return Math.floor((y - this.config.y) / this.config.rowHeight);
    }

    getSelectedSample() {
        return this.state.selectedSample;
    }

    setSelectedSample(index) {
        this.state.selectedSample = index;
    }
}

export default SampleView;
