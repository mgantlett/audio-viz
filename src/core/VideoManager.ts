export class VideoManager {
    private width: number;
    private height: number;

    constructor() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    public handleResize(): void {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }
}

export const createVideoManager = (): VideoManager => {
    return new VideoManager();
};
