# Audio Visualizer

A TypeScript-based audio visualization application using p5.js for creative visual effects synchronized with audio.

## Project Structure

```
src/
├── core/               # Core application infrastructure
│   ├── App.ts         # Main application class
│   ├── audio/         # Audio system components
│   │   ├── AudioBase.ts        # Base audio system
│   │   ├── BasicAudioManager.ts # Oscillator-based audio
│   │   └── EnhancedAudioManager.ts # Advanced audio features
│   ├── Component.ts   # Base component class
│   ├── EventBus.ts    # Event management system
│   ├── Manager.ts     # Base manager class
│   ├── SceneManager.ts # Scene management
│   ├── StateManager.ts # State management
│   └── UIManager.ts   # UI state and controls
├── components/        # UI Components
│   ├── AudioControls.ts # Audio control interface
│   └── Menu.ts        # Menu system
├── scenes/            # Visualization scenes
│   ├── StickFigures.ts # Example scene implementation
│   └── index.ts       # Scene registration
├── types/             # TypeScript type definitions
│   ├── audio.ts       # Audio system types
│   ├── events.ts      # Event type definitions
│   ├── state.ts       # State type definitions
│   └── scene.ts       # Scene type definitions
└── index.ts           # Application entry point
```

## Features

- **Advanced Audio System**
  - Dual-mode audio engine (Basic/Enhanced)
  - Real-time frequency and amplitude control
  - Built-in audio processing chain with compression and limiting
  - Automatic audio context management
  - Graceful error handling and recovery

- **Responsive Controls**
  - Keyboard shortcuts for all major functions
  - Mouse wheel control for volume and pitch
  - Touch-screen support with gesture controls
  - Visual feedback for all interactions

- **Architecture**
  - TypeScript with strict type checking
  - Event-driven communication
  - Centralized state management
  - Hot module replacement
  - ESLint and Prettier integration

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development servers:
   ```bash
   npm start
   ```
   This launches:
   - Python server (port 8000) for audio processing
   - Vite dev server for TypeScript/frontend

3. Build for production:
   ```bash
   npm run build
   ```

## Controls

### Keyboard Shortcuts
- **Space**: Start/Stop audio
- **Arrow Up/Down**: Adjust volume
- **Arrow Left/Right**: Adjust pitch
- **B**: Basic pattern
- **S**: Syncopated pattern
- **C**: Complex pattern

### Mouse/Touch Controls
- **Left half**: Volume control
- **Right half**: Pitch control
- **Mouse wheel/Touch drag**: Adjust selected control
- **Double tap**: Toggle audio

## Audio Modes

### Basic Mode (Oscillator)
- Simple sine wave generation
- Real-time frequency modulation
- Volume control with smooth transitions
- Ideal for basic sound experiments

### Enhanced Mode (Tracker)
- Pattern-based sequencing
- Multiple audio channels
- BPM control
- Sample playback support

## Error Handling

The system includes comprehensive error handling:
- Audio context state management
- Graceful recovery from audio glitches
- User feedback for all error states
- Automatic cleanup of audio resources

## Performance Optimization

- Efficient audio node management
- Automatic resource cleanup
- Debounced control updates
- Memory leak prevention

## Contributing

1. Fork the repository
2. Create your feature branch
3. Run tests: `npm test`
4. Submit a pull request

## License

MIT
