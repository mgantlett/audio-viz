# Audio Visualizer

A modern web-based audio visualization system combining a music tracker interface with real-time visualizations. This project creates an immersive audio-visual experience where music and graphics are tightly integrated.

## 🎵 [Live Demo](https://mgantlett.github.io/audio-viz/)

## Features

- **Multiple Visualization Scenes**
  - Stick Figures: Dynamic character animations reacting to audio
  - Particle Wave: Fluid particle system synchronized with sound
  - Beat Scene: Music tracker with real-time visual feedback (Under Construction)

- **Audio System**
  - Real-time audio processing
  - Pattern-based sequencing
  - Sample playback with pitch control
  - Multi-channel mixing
  - Effect processing

- **Modern UI**
  - Tab-based navigation
  - Scene selection
  - Transport controls
  - Sample generation tools
  - Keyboard shortcuts

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/mgantlett/audio-viz.git
   cd audio-viz
   ```

2. Open index.html in your browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

## Controls

- **Scene Navigation**
  - Press `1`, `2`, or `3` to switch scenes
  - Press `M` to toggle menu

- **Audio Controls**
  - Space: Play/Stop
  - Mouse Wheel: Adjust tempo (Beat Scene)
  - Left/Right: Change pitch
  - Up/Down: Adjust volume

- **Beat Scene**
  - Z-M: Note input
  - Tab: Next channel
  - 0-9: Effect values
  - Shift: Octave up
  - Ctrl: Octave down

## Technical Stack

- P5.js for graphics rendering
- Web Audio API for sound processing
- Tailwind CSS for styling
- Vanilla JavaScript for core functionality

## Architecture

The project follows a modular architecture with clear separation of concerns:

- **Core Systems**
  - Audio Engine: Sample-accurate sound processing
  - Graphics Engine: Optimized visual rendering
  - Scene Manager: State and transition handling
  - UI Manager: User interaction and controls

- **Components**
  - Audio Managers (Basic/Enhanced)
  - Scene Implementations
  - UI Components
  - Tool Integration

For detailed architecture information, see [audio-components.md](audio-components.md).

## Development

The project is structured for easy extension:

```
audio-viz/
├── core/           # Core system implementations
├── scenes/         # Visualization scenes
├── controls/       # UI and control systems
├── styles/         # CSS and styling
├── samples/        # Audio samples
└── tools/          # Development tools
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

Requires Web Audio API and modern JavaScript support.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
