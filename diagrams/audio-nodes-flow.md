# Audio Node Lifecycle

This document details the lifecycle of audio nodes, including creation, connection, playback, and cleanup processes.

## Enhanced Audio Node Setup and Cleanup Flow

The following diagram shows the complete lifecycle of audio nodes in the enhanced audio system:

```mermaid
sequenceDiagram
    participant AC as AudioContext
    participant AN as AnalyserNode
    participant CN as CompressorNode
    participant MG as MasterGain
    participant DS as Destination
    participant PG as PatternGenerator

    Note over AC,DS: Enhanced Audio Node Setup Flow
    
    AC->>AN: createAnalyser()
    Note right of AN: FFT Size: 2048
    AC->>CN: createCompressor()
    Note right of CN: Dynamic compression
    
    AN->>CN: connect()
    CN->>MG: connect()
    MG->>DS: connect()
    
    PG->>PG: generatePattern()
    Note right of PG: AI pattern generation
    
    AN->>AN: getByteFrequencyData()
    Note right of AN: Frequency analysis
    AN->>AN: getByteTimeDomainData()
    Note right of AN: Waveform data

    Note over AC,DS: Cleanup Flow
    
    MG->>MG: linearRampToValueAtTime(0)
    Note right of MG: Ramp down (100ms)
    
    Note over AC,DS: After ramp down
    AN--xCN: disconnect()
    CN--xMG: disconnect()
    MG--xDS: disconnect()
    Note right of AN: Nodes cleaned up
```

## Node State Transitions

This diagram illustrates the various states an audio node can be in:

```mermaid
stateDiagram-v2
    [*] --> Created: Create Nodes
    Created --> Connected: Connect Chain
    Connected --> PatternLoading: Initialize Magenta
    PatternLoading --> PatternReady: Pattern Generated
    PatternReady --> Running: Start Playback
    Running --> RampingUp: Set Initial Gain
    RampingUp --> Playing: Gain Reached
    
    Playing --> RampingDown: Stop Requested
    RampingDown --> Stopping: Gain Zero
    Stopping --> Cleanup: Stop Playback
    Cleanup --> [*]: Disconnect Nodes

    state Playing {
        [*] --> Steady
        Steady --> GeneratingPattern: New Pattern Requested
        GeneratingPattern --> Steady: Pattern Ready
        Steady --> Analyzing: Process Audio
        Analyzing --> Steady: Update Visuals
    }

    state "Node Lifecycle" as NL {
        state "Active Nodes" as AN {
            AnalyserNode
            CompressorNode
            MasterGain
        }
        state "Connections" as CN {
            Analyser_to_Compressor
            Compressor_to_Master
            Master_to_Destination
        }
    }
```

## Enhanced Audio Node Architecture

This diagram shows the relationships between different audio nodes and their parameters:

```mermaid
graph TB
    subgraph AudioContext
        AC[Audio Context]
        ST[State: running/suspended]
    end

    subgraph AudioNodes
        AN[Analyser Node]
        CN[Compressor Node]
        MG[Master Gain]
        DS[Destination]
    end

    subgraph PatternGeneration
        PG[Pattern Generator]
        MV[MusicVAE]
        MR[MusicRNN]
    end

    subgraph Analysis
        FA[Frequency Analysis]
        WF[Waveform Data]
        BD[Beat Detection]
    end

    subgraph NodeStates
        CR[Created]
        CO[Connected]
        PR[Pattern Ready]
        RU[Running]
        PL[Playing]
        CL[Cleanup]
    end

    subgraph Parameters
        FS[FFT Size]
        TH[Threshold]
        RT[Ratio]
        GP[Gain]
    end

    AC -->|creates| AN
    AC -->|creates| CN
    AC -->|creates| MG
    
    AN -->|connects to| CN
    CN -->|connects to| MG
    MG -->|connects to| DS
    
    PG -->|generates| MV
    PG -->|generates| MR
    
    AN -->|provides| FA
    AN -->|provides| WF
    FA -->|enables| BD
    
    FS -->|controls| AN
    TH -->|controls| CN
    RT -->|controls| CN
    GP -->|controls| MG
    
    CR -->|transition| CO
    CO -->|transition| PR
    PR -->|transition| RU
    RU -->|transition| PL
    PL -->|transition| CL

    ST -->|affects| AN
    ST -->|affects| CN
    ST -->|affects| MG
```

## Key Concepts

1. Enhanced Node Setup:
   - AnalyserNode for real-time audio analysis
   - CompressorNode for dynamic range control
   - Pattern-based audio generation
   - Nodes connected in optimized chain
   - Real-time audio analysis

2. Node Lifecycle:
   - Created → Connected → Pattern Ready → Running → Playing
   - Pattern generation and updates during playback
   - Real-time audio analysis and visualization
   - Proper cleanup sequence on stop

3. Pattern Generation:
   - AI-powered pattern creation
   - Drum and melodic pattern synthesis
   - Pattern processing and playback
   - Real-time pattern updates

4. Analysis Features:
   - Frequency analysis
   - Waveform visualization
   - Beat detection
   - Audio metrics calculation

5. Cleanup Process:
   - Ramp down gain to avoid clicks
   - Wait for ramp completion
   - Stop pattern playback
   - Disconnect nodes in reverse order
   - Clear node references

6. State Management:
   - Track node states independently
   - Coordinate pattern generation
   - Handle parameter changes
   - Manage AudioContext state

## Important Considerations

1. Timing:
   - Pattern synchronization
   - Analysis timing
   - Smooth gain transitions
   - Cleanup timing
   - State synchronization

2. Resource Management:
   - Node creation/disposal
   - Pattern memory management
   - Connection optimization
   - Context state handling

3. Error Prevention:
   - Pattern generation fallbacks
   - State validation
   - Connection verification
   - Parameter bounds checking
   - Cleanup confirmation

4. Performance:
   - Efficient node creation
   - Optimized pattern processing
   - Analysis buffer management
   - Resource pooling
   - Memory optimization
