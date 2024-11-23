# Audio Visualizer

A TypeScript-based audio visualization application using p5.js and Magenta.js for creative visual effects synchronized with AI-generated music patterns.

## Project Structure

```
src/
├── core/               # Core application infrastructure
│   ├── App.ts         # Main application class
│   ├── audio/         # Audio system components
│   │   ├── AudioBase.ts           # Base audio system
│   │   ├── BasicAudioManager.ts   # Oscillator-based audio
│   │   ├── EnhancedAudioManager.ts # Advanced audio features
│   │   └── MagentaPatternGenerator.ts # AI pattern generation
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
│   ├── Beat.ts        # Beat visualization with AI patterns
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

- **AI-Powered Audio System**
  - Magenta.js integration for pattern generation
  - MusicVAE for drum pattern generation
  - MusicRNN for melodic pattern generation
  - Real-time pattern synthesis and playback
  - Automatic pattern transposition and processing

- **Advanced Audio System**
  - Multi-mode audio engine (Basic/Enhanced/Tracker)
  - Real-time frequency and amplitude analysis
  - Built-in audio processing chain with:
    - Dynamic compression
    - Frequency analysis
    - Waveform visualization
  - Automatic audio context management
  - Graceful error handling and recovery

- **Beat Scene**
  - AI-generated musical patterns
  - Dynamic geometric visualizations
  - Real-time audio reactivity
  - Particle system with beat synchronization
  - Waveform ring visualizations

- **Responsive Controls**
  - Keyboard shortcuts for all major functions
  - Mouse wheel control for volume and tempo
  - Touch-screen support with gesture controls
  - Visual feedback for all interactions
  - Pattern generation controls

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

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Controls

### Keyboard Shortcuts
- **Space**: Start/Stop audio
- **Arrow Up/Down**: Adjust volume
- **G**: Generate new pattern (in Beat scene)
- **M**: Toggle menu
- **B**: Basic pattern
- **S**: Syncopated pattern
- **C**: Complex pattern

### Mouse/Touch Controls
- **Mouse wheel**: Adjust tempo (in Beat scene)
- **Double tap**: Toggle audio
- **Menu button**: Access scene selection

## Audio Modes

### Basic Mode (Oscillator)
- Simple sine wave generation
- Real-time frequency modulation
- Volume control with smooth transitions
- Ideal for basic sound experiments

### Enhanced Mode (Tracker)
- AI-generated musical patterns
- Multiple audio channels (drums, bass, lead)
- BPM control with beat detection
- Real-time audio analysis
- Pattern variation and generation

### Beat Scene
- Deep house pattern generation
- Dynamic pattern transposition
- Real-time visualization updates
- Beat-synchronized animations
- Audio-reactive geometric patterns

## Pattern Generation

The system uses Magenta.js for AI-powered pattern generation:

### Drum Patterns
- Four-on-the-floor kick patterns
- Dynamic hi-hat patterns
- Varied snare placements
- Pattern variation through MusicVAE

### Melodic Patterns
- Bass line generation
- Chord progression synthesis
- Lead pattern generation
- Automatic pattern transposition
- Real-time pattern processing

## Error Handling

The system includes comprehensive error handling:
- Audio context state management
- Pattern generation fallbacks
- Graceful recovery from audio glitches
- User feedback for all error states
- Automatic cleanup of audio resources

## Performance Optimization

- Efficient audio node management
- Smart pattern caching
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
