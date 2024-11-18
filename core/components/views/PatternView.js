class PatternView {
    constructor(p5, config) {
        this.p = p5;
        this.config = {
            x: config.x || 0,
            y: config.y || 0,
            width: config.width || 800,
            height: config.height || 400,
            rowHeight: config.rowHeight || 20,
            channelWidth: config.channelWidth || 140,
            headerHeight: config.headerHeight || 30,
            colors: config.colors || {}
        };

        this.state = {
            selectedRow: 0,
            selectedChannel: 0,
            topRow: 0,
            visibleRows: Math.floor((this.config.height - this.config.headerHeight) / this.config.rowHeight)
        };
    }

    draw(pattern, currentRow) {
        if (!pattern || !pattern.data) {
            this.drawEmptyState();
            return;
        }

        this.drawBackground();
        this.drawHeaders(pattern.channels);
        this.drawGrid(pattern, currentRow);
        this.drawScrollbar();
    }

    drawBackground() {
        this.p.fill(this.config.colors.panelBg);
        this.p.noStroke();
        this.p.rect(this.config.x, this.config.y, this.config.width, this.config.height, 5);
    }

    drawHeaders(channels) {
        for (let i = 0; i < channels; i++) {
            const x = this.config.x + i * this.config.channelWidth;
            
            // Header background
            this.p.fill(this.config.colors.headerBg);
            this.p.rect(x, this.config.y, this.config.channelWidth - 1, this.config.headerHeight, 3);
            
            // Header text
            this.p.fill(this.config.colors.text);
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.textSize(12);
            this.p.text(`Channel ${i + 1}`, 
                       x + this.config.channelWidth/2, 
                       this.config.y + this.config.headerHeight/2);
        }
    }

    drawGrid(pattern, currentRow) {
        for (let row = 0; row < this.state.visibleRows; row++) {
            const actualRow = row + this.state.topRow;
            if (actualRow >= pattern.rows) break;

            const y = this.config.y + this.config.headerHeight + row * this.config.rowHeight;
            
            this.drawRowBackground(actualRow, y, currentRow);
            this.drawRowNumber(actualRow, y);
            this.drawNoteData(pattern, actualRow, y);
        }
    }

    drawRowBackground(row, y, currentRow) {
        // Bar line (every 4 rows)
        if (row % 4 === 0) {
            this.p.fill(this.config.colors.grid);
            this.p.noStroke();
            this.p.rect(this.config.x, y, this.config.width, this.config.rowHeight);
        }
        
        // Current row highlight
        if (row === currentRow) {
            this.p.fill(this.config.colors.highlight + '80');
            this.p.rect(this.config.x, y, this.config.width, this.config.rowHeight);
        }
        
        // Selected row/channel highlight
        if (row === this.state.selectedRow) {
            this.p.fill(this.config.colors.selection + '80');
            this.p.rect(
                this.config.x + this.state.selectedChannel * this.config.channelWidth,
                y, this.config.channelWidth, this.config.rowHeight
            );
        }
    }

    drawRowNumber(row, y) {
        this.p.fill(row % 4 === 0 ? this.config.colors.accent : this.config.colors.dimText);
        this.p.textAlign(this.p.RIGHT, this.p.CENTER);
        this.p.textSize(11);
        this.p.text(row.toString().padStart(2, '0'), 
                   this.config.x - 10, 
                   y + this.config.rowHeight/2);
    }

    drawNoteData(pattern, row, y) {
        this.p.textAlign(this.p.LEFT, this.p.CENTER);
        for (let channel = 0; channel < pattern.channels; channel++) {
            const x = this.config.x + channel * this.config.channelWidth;
            const note = pattern.getNote(row, channel);
            
            if (note) {
                const noteText = this.formatNoteText(note);
                this.p.fill(note.note ? this.config.colors.text : this.config.colors.dimText);
                this.p.text(noteText, x + 10, y + this.config.rowHeight/2);
            }
        }
    }

    formatNoteText(note) {
        if (!note.note) return '···';

        const notePart = `${note.note}${note.sample !== null ? note.sample.toString().padStart(2,'0') : '--'}`;
        const volPart = note.volume !== null ? note.volume.toString(16).toUpperCase().padStart(2,'0') : '';
        const effectPart = note.effect !== null ? 
            `${note.effect.toString(16).toUpperCase()}${
                note.effectParam !== null ? note.effectParam.toString(16).toUpperCase().padStart(2,'0') : '--'
            }` : '';
        
        return `${notePart} ${volPart} ${effectPart}`.trim();
    }

    drawScrollbar() {
        const scrollbarWidth = 8;
        const x = this.config.x + this.config.width + 5;
        const y = this.config.y + this.config.headerHeight;
        const height = this.config.height - this.config.headerHeight;
        
        // Track
        this.p.fill(this.config.colors.grid);
        this.p.noStroke();
        this.p.rect(x, y, scrollbarWidth, height, scrollbarWidth/2);
        
        // Thumb
        const thumbHeight = (this.state.visibleRows / 64) * height;
        const thumbY = y + (this.state.topRow / 64) * (height - thumbHeight);
        
        this.p.fill(this.config.colors.accent);
        this.p.rect(x, thumbY, scrollbarWidth, thumbHeight, scrollbarWidth/2);
    }

    drawEmptyState() {
        this.p.fill(this.config.colors.panelBg);
        this.p.noStroke();
        this.p.rect(this.config.x, this.config.y, this.config.width, this.config.height, 5);
        
        this.p.fill(this.config.colors.dimText);
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.textSize(14);
        this.p.text('No pattern loaded', 
                   this.config.x + this.config.width/2,
                   this.config.y + this.config.height/2);
    }

    handleClick(mouseX, mouseY) {
        if (!this.isInBounds(mouseX, mouseY)) return null;

        const row = this.getRowFromY(mouseY);
        const channel = this.getChannelFromX(mouseX);

        if (row >= 0 && channel >= 0) {
            this.state.selectedRow = row;
            this.state.selectedChannel = channel;
            return { type: 'pattern_select', row, channel };
        }

        return null;
    }

    isInBounds(x, y) {
        return x >= this.config.x && 
               x < this.config.x + this.config.width &&
               y >= this.config.y + this.config.headerHeight && 
               y < this.config.y + this.config.height;
    }

    getRowFromY(y) {
        return Math.floor((y - this.config.y - this.config.headerHeight) / 
                         this.config.rowHeight) + this.state.topRow;
    }

    getChannelFromX(x) {
        return Math.floor((x - this.config.x) / this.config.channelWidth);
    }

    scroll(delta) {
        const newTopRow = Math.max(0, Math.min(
            this.state.topRow + Math.sign(delta),
            64 - this.state.visibleRows
        ));
        
        if (newTopRow !== this.state.topRow) {
            this.state.topRow = newTopRow;
            return { type: 'scroll', topRow: newTopRow };
        }

        return null;
    }
}

export default PatternView;
