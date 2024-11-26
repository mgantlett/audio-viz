import type { AudioManager } from '../core/audio/AudioManager';

export class Oscilloscope {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private animationFrame: number | null = null;

    constructor(private audioManager: AudioManager) {
        // Create container
        this.container = document.createElement('div');
        this.container.style.cssText = `
            width: 100%;
            height: 120px;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            width: 100%;
            height: 100%;
        `;
        this.container.appendChild(this.canvas);

        // Get context
        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        this.ctx = ctx;

        // Handle resize
        window.addEventListener('resize', this.handleResize.bind(this));
        this.handleResize();

        // Start animation
        this.animate();
    }

    private handleResize(): void {
        const rect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#2196F3';
    }

    private animate = (): void => {
        this.animationFrame = requestAnimationFrame(this.animate);
        this.draw();
    };

    private draw(): void {
        const { width, height } = this.canvas;
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = width / dpr;
        const displayHeight = height / dpr;

        // Clear canvas
        this.ctx.clearRect(0, 0, displayWidth, displayHeight);

        if (!this.audioManager.isPlaying) {
            this.drawPlaceholder(displayWidth, displayHeight);
            return;
        }

        // Get waveform data
        const waveform = this.audioManager.getWaveform();
        const step = Math.ceil(waveform.length / displayWidth);

        this.ctx.beginPath();
        this.ctx.moveTo(0, displayHeight / 2);

        for (let i = 0; i < displayWidth; i++) {
            const waveformIndex = Math.min(i * step, waveform.length - 1);
            const value = waveform[waveformIndex];
            const y = ((value + 1) / 2) * displayHeight;
            this.ctx.lineTo(i, y);
        }

        this.ctx.stroke();
    }

    private drawPlaceholder(width: number, height: number): void {
        // Draw center line
        this.ctx.beginPath();
        this.ctx.moveTo(0, height / 2);
        this.ctx.lineTo(width, height / 2);
        this.ctx.globalAlpha = 0.3;
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;

        // Draw text
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.font = '12px system-ui';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Start audio to see visualization', width / 2, height / 2 - 16);
    }

    public mount(parent: HTMLElement): void {
        parent.appendChild(this.container);
        this.handleResize();
    }

    public unmount(): void {
        if (this.animationFrame !== null) {
            cancelAnimationFrame(this.animationFrame);
        }
        window.removeEventListener('resize', this.handleResize.bind(this));
        this.container.remove();
    }
}

export const createOscilloscope = (audioManager: AudioManager): Oscilloscope => {
    return new Oscilloscope(audioManager);
};
