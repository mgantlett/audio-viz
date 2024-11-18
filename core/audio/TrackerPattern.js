class TrackerPattern {
    constructor(rows = 64, channels = 8) {
        try {
            // Validate constructor parameters
            if (typeof rows !== 'number' || typeof channels !== 'number') {
                throw new Error('Invalid parameters: rows and channels must be numbers');
            }
            
            this.rows = Math.max(1, Math.min(256, Math.floor(rows)));
            this.channels = Math.max(1, Math.min(16, Math.floor(channels)));
            this.data = null;
            this.initializeData();
            
            if (!this.data) {
                throw new Error('Failed to initialize pattern data');
            }
        } catch (error) {
            console.error('Error constructing TrackerPattern:', error);
            // Set safe defaults
            this.rows = 64;
            this.channels = 8;
            this.initializeData();
        }
    }

    initializeData() {
        try {
            // Create empty pattern data with proper validation
            this.data = new Array(this.rows);
            for (let i = 0; i < this.rows; i++) {
                this.data[i] = new Array(this.channels);
                for (let j = 0; j < this.channels; j++) {
                    this.data[i][j] = {
                        sample: null,    // Sample name
                        note: null,      // Note (e.g., 'C4', 'A#3')
                        volume: null,    // Volume (0-64)
                        effect: null,    // Effect type
                        effectParam: null // Effect parameter
                    };
                }
            }
            return true;
        } catch (error) {
            console.error('Error initializing pattern data:', error);
            this.data = null;
            return false;
        }
    }

    // Effect command constants
    static EFFECTS = {
        ARPEGGIO: 0x0,
        PORTA_UP: 0x1,
        PORTA_DOWN: 0x2,
        TONE_PORTA: 0x3,
        VIBRATO: 0x4,
        PORTA_VOL_SLIDE: 0x5,
        VIBRATO_VOL_SLIDE: 0x6,
        TREMOLO: 0x7,
        PAN: 0x8,
        SAMPLE_OFFSET: 0x9,
        VOLUME_SLIDE: 0xA,
        POSITION_JUMP: 0xB,
        SET_VOLUME: 0xC,
        PATTERN_BREAK: 0xD,
        EXTENDED: 0xE,
        SET_SPEED: 0xF
    };

    // Extended effect commands
    static EXT_EFFECTS = {
        FINE_PORTA_UP: 0x1,
        FINE_PORTA_DOWN: 0x2,
        SET_GLISS_CONTROL: 0x3,
        SET_VIBRATO_CONTROL: 0x4,
        SET_FINETUNE: 0x5,
        PATTERN_LOOP: 0x6,
        SET_TREMOLO_CONTROL: 0x7,
        RETRIG_NOTE: 0x9,
        FINE_VOL_SLIDE_UP: 0xA,
        FINE_VOL_SLIDE_DOWN: 0xB,
        NOTE_CUT: 0xC,
        NOTE_DELAY: 0xD,
        PATTERN_DELAY: 0xE,
        INVERT_LOOP: 0xF
    };

    validateNote(note) {
        if (!note) return true; // null is valid
        const notePattern = /^[A-G](#|b)?[0-9]$/;
        return typeof note === 'string' && notePattern.test(note);
    }

    validateVolume(volume) {
        if (volume === null) return true;
        return Number.isInteger(volume) && volume >= 0 && volume <= 64;
    }

    validateEffect(effect, param) {
        if (effect === null) return true;
        if (!Number.isInteger(effect) || effect < 0 || effect > 0xF) return false;
        if (param !== null && (!Number.isInteger(param) || param < 0 || param > 0xFF)) return false;
        return true;
    }

    validateSample(sample) {
        if (sample === null) return true;
        return typeof sample === 'string' || typeof sample === 'number';
    }

    setNote(row, channel, note, sample = null, volume = null, effect = null, effectParam = null) {
        try {
            // Validate row and channel bounds
            if (!Number.isInteger(row) || row < 0 || row >= this.rows ||
                !Number.isInteger(channel) || channel < 0 || channel >= this.channels) {
                console.warn('Invalid row or channel:', row, channel);
                return false;
            }

            // Validate note data
            if (!this.validateNote(note)) {
                console.warn('Invalid note format:', note);
                return false;
            }

            if (!this.validateSample(sample)) {
                console.warn('Invalid sample:', sample);
                return false;
            }

            if (!this.validateVolume(volume)) {
                console.warn('Invalid volume:', volume);
                return false;
            }

            if (!this.validateEffect(effect, effectParam)) {
                console.warn('Invalid effect or parameter:', effect, effectParam);
                return false;
            }

            // Ensure data array exists
            if (!this.data || !this.data[row] || !this.data[row][channel]) {
                console.error('Pattern data not properly initialized');
                return false;
            }

            // Set note data
            this.data[row][channel] = {
                sample,
                note,
                volume,
                effect,
                effectParam
            };

            return true;
        } catch (error) {
            console.error('Error setting note:', error);
            return false;
        }
    }

    getNote(row, channel) {
        try {
            // Validate parameters
            if (!Number.isInteger(row) || row < 0 || row >= this.rows ||
                !Number.isInteger(channel) || channel < 0 || channel >= this.channels) {
                return null;
            }

            // Ensure data exists
            if (!this.data || !this.data[row] || !this.data[row][channel]) {
                return null;
            }

            // Return a copy of the note data
            return {...this.data[row][channel]};
        } catch (error) {
            console.error('Error getting note:', error);
            return null;
        }
    }

    clearNote(row, channel) {
        try {
            // Validate parameters
            if (!Number.isInteger(row) || row < 0 || row >= this.rows ||
                !Number.isInteger(channel) || channel < 0 || channel >= this.channels) {
                return false;
            }

            // Ensure data exists
            if (!this.data || !this.data[row] || !this.data[row][channel]) {
                return false;
            }

            // Clear note data
            this.data[row][channel] = {
                sample: null,
                note: null,
                volume: null,
                effect: null,
                effectParam: null
            };

            return true;
        } catch (error) {
            console.error('Error clearing note:', error);
            return false;
        }
    }

    clearPattern() {
        try {
            return this.initializeData();
        } catch (error) {
            console.error('Error clearing pattern:', error);
            return false;
        }
    }

    copyRows(startRow, endRow) {
        try {
            // Validate parameters
            if (!Number.isInteger(startRow) || !Number.isInteger(endRow) ||
                startRow < 0 || endRow >= this.rows || startRow > endRow) {
                return null;
            }

            // Ensure data exists
            if (!this.data) return null;

            // Create deep copy of rows
            return this.data.slice(startRow, endRow + 1).map(row => 
                row.map(cell => ({...cell}))
            );
        } catch (error) {
            console.error('Error copying rows:', error);
            return null;
        }
    }

    pasteRows(startRow, rowData) {
        try {
            // Validate parameters
            if (!Array.isArray(rowData) || !Number.isInteger(startRow) ||
                startRow < 0 || startRow + rowData.length > this.rows) {
                return false;
            }

            // Ensure data exists
            if (!this.data) return false;

            // Paste rows with validation
            for (let i = 0; i < rowData.length; i++) {
                const row = rowData[i];
                if (!Array.isArray(row) || row.length !== this.channels) continue;
                
                for (let j = 0; j < this.channels; j++) {
                    const cell = row[j];
                    if (!cell) continue;
                    
                    if (this.validateNote(cell.note) && 
                        this.validateVolume(cell.volume) && 
                        this.validateEffect(cell.effect, cell.effectParam)) {
                        this.data[startRow + i][j] = {...cell};
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Error pasting rows:', error);
            return false;
        }
    }

    interpolateRows(startRow, endRow, channel) {
        try {
            // Validate parameters
            if (!Number.isInteger(startRow) || !Number.isInteger(endRow) || !Number.isInteger(channel) ||
                startRow < 0 || endRow >= this.rows || channel < 0 || channel >= this.channels) {
                return false;
            }

            // Ensure data exists
            if (!this.data) return false;

            const startNote = this.data[startRow][channel];
            const endNote = this.data[endRow][channel];
            
            if (!startNote.note || !endNote.note) return false;

            const rowCount = endRow - startRow;
            if (rowCount <= 1) return true;

            // Interpolate values
            for (let i = startRow + 1; i < endRow; i++) {
                const progress = (i - startRow) / rowCount;
                const cell = this.data[i][channel];

                if (startNote.volume !== null && endNote.volume !== null) {
                    cell.volume = Math.round(startNote.volume + (endNote.volume - startNote.volume) * progress);
                }

                if (startNote.effect === TrackerPattern.EFFECTS.VOLUME_SLIDE && 
                    endNote.effect === TrackerPattern.EFFECTS.VOLUME_SLIDE) {
                    cell.effect = TrackerPattern.EFFECTS.VOLUME_SLIDE;
                    const startParam = startNote.effectParam || 0;
                    const endParam = endNote.effectParam || 0;
                    cell.effectParam = Math.round(startParam + (endParam - startParam) * progress);
                }
            }

            return true;
        } catch (error) {
            console.error('Error interpolating rows:', error);
            return false;
        }
    }

    exportData() {
        try {
            // Ensure data exists
            if (!this.data) return null;

            // Create deep copy of pattern data
            return {
                rows: this.rows,
                channels: this.channels,
                data: this.data.map(row => 
                    row.map(cell => ({...cell}))
                )
            };
        } catch (error) {
            console.error('Error exporting pattern data:', error);
            return null;
        }
    }

    importData(data) {
        try {
            // Validate import data
            if (!data || !Array.isArray(data.data) || 
                !Number.isInteger(data.rows) || !Number.isInteger(data.channels) ||
                data.rows !== this.rows || data.channels !== this.channels) {
                return false;
            }

            // Validate all cells
            for (let i = 0; i < data.data.length; i++) {
                const row = data.data[i];
                if (!Array.isArray(row) || row.length !== this.channels) return false;
                
                for (let j = 0; j < row.length; j++) {
                    const cell = row[j];
                    if (!cell) continue;
                    
                    if (!this.validateNote(cell.note) || 
                        !this.validateVolume(cell.volume) || 
                        !this.validateEffect(cell.effect, cell.effectParam)) {
                        return false;
                    }
                }
            }

            // Import validated data
            this.data = data.data.map(row => 
                row.map(cell => ({...cell}))
            );

            return true;
        } catch (error) {
            console.error('Error importing pattern data:', error);
            return false;
        }
    }
}

export default TrackerPattern;
