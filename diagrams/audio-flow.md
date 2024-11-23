# Audio System Flow

This document details the audio system's initialization, playback, and state management flows.

## Initialization and Playback Flow

The following diagram shows the complete flow of audio initialization and playback:

```mermaid
sequenceDiagram
    participant UI as AudioControls
    participant EB as EventBus
    participant AM as AudioManager
    participant EM as EnhancedAudioManager
    participant MG as MagentaPatternGenerator
    participant AB as AudioBase
    participant AC as AudioContext

    Note over UI,AC: Initialization Flow
    UI->>AM: handleStart()
    alt Not Initialized
        AM->>EM: initializeWithMode('tracker')
        EM->>AB: setupAudioContext()
        AB->>AC: new AudioContext()
        Note right of AC: Initial state: 'suspended'
        AB->>AC: context.resume()
        Note right of AC: State changes to: 'running'
        EM->>AC: createAnalyser()
        EM->>AC: createCompressor()
        Note right of EM: Setup audio chain
        AB-->>EM: success
        EM-->>AM: success
        AM->>EB: emit('audio:initialized')
        EB->>UI: on('audio:initialized')
        UI->>EB: emit('audio:start')
        EB->>AM: on('audio:start')
        AM->>EM: start()
        EM->>MG: initialize()
        Note right of MG: Load Magenta models
        MG->>MG: generateDeepHouse()
        Note right of MG: Generate patterns
        MG-->>EM: setPattern()
        EM->>AB: start()
        AM->>EB: emit('audio:started')
        EB->>UI: on('audio:started')
        Note right of UI: Update button state to 'Stop'
    else Already Initialized
        UI->>EB: emit('audio:start')
        EB->>AM: on('audio:start')
        AM->>EM: start()
        EM->>AB: start()
        AM->>EB: emit('audio:started')
        EB->>UI: on('audio:started')
        Note right of UI: Update button state to 'Stop'
    end
```

## Stop Flow

This diagram illustrates the audio stop sequence:

```mermaid
sequenceDiagram
    participant UI as AudioControls
    participant EB as EventBus
    participant AM as AudioManager
    participant EM as EnhancedAudioManager
    participant AB as AudioBase

    Note over UI,AB: Stop Flow
    UI->>EB: emit('audio:stop')
    EB->>AM: on('audio:stop')
    AM->>EM: stop()
    EM->>AB: stop()
    Note right of EM: Ramp down gain
    Note right of EM: Cleanup nodes
    AM->>EB: emit('audio:stopped')
    EB->>UI: on('audio:stopped')
    Note right of UI: Update button state to 'Start Audio'
```

## Audio System States

This diagram shows the possible states of the audio system:

```mermaid
stateDiagram-v2
    [*] --> Uninitialized
    Uninitialized --> Initializing: Click "Initialize Audio"
    Initializing --> LoadingMagenta: Context Ready
    LoadingMagenta --> GeneratingPattern: Models Loaded
    GeneratingPattern --> Initialized: Pattern Ready
    Initializing --> Error: Init Failed
    LoadingMagenta --> Error: Model Load Failed
    GeneratingPattern --> Error: Generation Failed
    Error --> Uninitialized: Reset
    
    state Initialized {
        [*] --> Stopped
        Stopped --> Starting: Click "Start"
        Starting --> Playing: Audio Nodes Ready
        Playing --> Stopping: Click "Stop"
        Stopping --> Stopped: Cleanup Complete
        Playing --> GeneratingNewPattern: Press 'G'
        GeneratingNewPattern --> Playing: Pattern Ready
    }

    Initialized --> Uninitialized: Cleanup/Reset
```

## Pattern Generation Flow

This diagram shows the Magenta pattern generation process:

```mermaid
sequenceDiagram
    participant MG as MagentaPatternGenerator
    participant MV as MusicVAE
    participant MR as MusicRNN
    participant EM as EnhancedAudioManager

    Note over MG,EM: Pattern Generation Flow
    MG->>MV: initialize()
    MV-->>MG: Model Ready
    MG->>MR: initialize()
    MR-->>MG: Model Ready
    
    MG->>MV: sample()
    Note right of MV: Generate drum pattern
    MV-->>MG: Drum sequence
    
    MG->>MR: continueSequence()
    Note right of MR: Generate melodic pattern
    MR-->>MG: Melodic sequence
    
    MG->>MG: processPatterns()
    Note right of MG: Convert to audio format
    MG->>EM: setPattern()
    Note right of EM: Update audio nodes
```

## Key Points

1. Enhanced Audio System:
   - Magenta model initialization
   - Pattern generation
   - Audio node setup (Analyser, Compressor)
   - Pattern processing and playback

2. Initialization Flow:
   - Context creation and setup
   - Magenta model loading
   - Pattern generation
   - State transitions
   - Event handling
   - Button state management

3. Playback Control:
   - Start/stop operations
   - Pattern generation
   - State synchronization
   - Event propagation
   - UI updates

4. State Management:
   - State transitions
   - Error handling
   - Resource cleanup
   - UI feedback

5. Event Flow:
   - Event emission
   - Event handling
   - State updates
   - Component synchronization

6. Pattern Generation:
   - Model initialization
   - Drum pattern generation
   - Melodic pattern generation
   - Pattern processing
   - Audio node updates
