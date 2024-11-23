export class TrackerPattern {
    private _rows: number;
    private _channels: number;
    private _data: Array<Array<any>>;

    constructor(rows: number = 64, channels: number = 8) {
        this._rows = rows;
        this._channels = channels;
        this._data = Array(rows).fill(null).map(() => Array(channels).fill(null));
    }

    get rows(): number {
        return this._rows;
    }

    get channels(): number {
        return this._channels;
    }

    get data(): Array<Array<any>> {
        return this._data;
    }

    setNote(row: number, channel: number, note: string, sample: string, velocity: number): boolean {
        try {
            if (row < 0 || row >= this._rows || channel < 0 || channel >= this._channels) {
                return false;
            }

            this._data[row][channel] = {
                note,
                sample,
                velocity
            };

            return true;
        } catch (error) {
            console.error('Error setting note:', error);
            return false;
        }
    }

    getNote(row: number, channel: number): any {
        try {
            if (row < 0 || row >= this._rows || channel < 0 || channel >= this._channels) {
                return null;
            }
            return this._data[row][channel];
        } catch (error) {
            console.error('Error getting note:', error);
            return null;
        }
    }

    clear(): void {
        try {
            this._data = Array(this._rows).fill(null).map(() => Array(this._channels).fill(null));
        } catch (error) {
            console.error('Error clearing pattern:', error);
        }
    }
}
