# Audio System Flow

This document details the audio system's initialization, playback, and state management flows.

## Initialization and Playback Flow

The following diagram shows the complete flow of audio initialization and playback:

```mermaid
sequenceDiagram
    participant UI as AudioControls
    participant EB as EventBus
    participant AM as AudioManager
    participant BM as BasicAudioManager
    participant AB as AudioBase
    participant AC as AudioContext

    Note over UI,AC: Initialization Flow
    UI->>AM: handleStart()
    alt Not Initialized
        AM->>BM: initializeWithMode('oscillator')
        BM->>AB: setupAudioContext()
        AB->>AC: new AudioContext()
        Note right of AC: Initial state: 'suspended'
        AB->>AC: context.resume()
        Note right of AC: State changes to: 'running'
        AB-->>BM: success
        BM-->>AM: success
        AM->>EB: emit('audio:initialized')
        EB->>UI: on('audio:initialized')
        UI->>EB: emit('audio:start')
        EB->>AM: on('audio:start')
        AM->>BM: start()
        BM->>AB: start()
        AM->>EB: emit('audio:started')
        EB->>UI: on('audio:started')
        Note right of UI: Update button state to 'Stop'
    else Already Initialized
        UI->>EB: emit('audio:start')
        EB->>AM: on('audio:start')
        AM->>BM: start()
        BM->>AB: start()
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
    participant BM as BasicAudioManager
    participant AB as AudioBase

    Note over UI,AB: Stop Flow
    UI->>EB: emit('audio:stop')
    EB->>AM: on('audio:stop')
    AM->>BM: stop()
    BM->>AB: stop()
    Note right of BM: Ramp down gain
    Note right of BM: Cleanup nodes
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
    Initializing --> Initialized: Context Ready
    Initializing --> Error: Init Failed
    Error --> Uninitialized: Reset
    
    state Initialized {
        [*] --> Stopped
        Stopped --> Starting: Click "Start"
        Starting --> Playing: Audio Nodes Ready
        Playing --> Stopping: Click "Stop"
        Stopping --> Stopped: Cleanup Complete
    }

    Initialized --> Uninitialized: Cleanup/Reset
```

## State Management Flow

This diagram details how state is managed between components:

```mermaid
sequenceDiagram
    participant UI as AudioControls
    participant AM as AudioManager
    participant BM as BasicAudioManager

    Note over UI,BM: State Management Flow
    
    state Initialized {
        UI->>+AM: handleStart()
        AM->>+BM: start()
        Note right of BM: Setup Audio Nodes
        BM-->>-AM: success
        AM->>EB: emit('audio:started')
        AM-->>-UI: Update State
        Note right of UI: Show Stop Button
    }

    state Playing {
        UI->>+AM: handleStop()
        AM->>+BM: stop()
        Note right of BM: Ramp Down Gain
        Note right of BM: Wait for Ramp (150ms)
        Note right of BM: Cleanup Nodes
        BM-->>-AM: success
        AM->>EB: emit('audio:stopped')
        AM-->>-UI: Update State
        Note right of UI: Show Start Button
    }
```

## Key Points

1. Initialization Flow:
   - Context creation and setup
   - State transitions
   - Event handling
   - Button state management

2. Playback Control:
   - Start/stop operations
   - State synchronization
   - Event propagation
   - UI updates

3. State Management:
   - State transitions
   - Error handling
   - Resource cleanup
   - UI feedback

4. Event Flow:
   - Event emission
   - Event handling
   - State updates
   - Component synchronization
