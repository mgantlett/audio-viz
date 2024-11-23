# Audio Node Lifecycle

This document details the lifecycle of audio nodes, including creation, connection, playback, and cleanup processes.

## Audio Node Setup and Cleanup Flow

The following diagram shows the complete lifecycle of audio nodes:

```mermaid
sequenceDiagram
    participant AC as AudioContext
    participant ON as OscillatorNode
    participant GN as GainNode
    participant MG as MasterGain
    participant DS as Destination

    Note over AC,DS: Audio Node Setup Flow
    
    AC->>ON: createOscillator()
    AC->>GN: createGain()
    Note right of GN: Initial gain: 0
    
    ON->>GN: connect()
    GN->>MG: connect()
    MG->>DS: connect()
    
    ON->>ON: start()
    Note right of ON: Oscillator running
    
    GN->>GN: linearRampToValueAtTime()
    Note right of GN: Ramp gain up

    Note over AC,DS: Cleanup Flow
    
    GN->>GN: linearRampToValueAtTime(0)
    Note right of GN: Ramp down (100ms)
    
    Note over AC,DS: After ramp down
    ON->>ON: stop()
    ON--xGN: disconnect()
    GN--xMG: disconnect()
    Note right of ON: Nodes cleaned up
```

## Node State Transitions

This diagram illustrates the various states an audio node can be in:

```mermaid
stateDiagram-v2
    [*] --> Created: Create Nodes
    Created --> Connected: Connect Chain
    Connected --> Running: Start Oscillator
    Running --> RampingUp: Set Initial Gain
    RampingUp --> Playing: Gain Reached
    
    Playing --> RampingDown: Stop Requested
    RampingDown --> Stopping: Gain Zero
    Stopping --> Cleanup: Stop Oscillator
    Cleanup --> [*]: Disconnect Nodes

    state Playing {
        [*] --> Steady
        Steady --> Adjusting: Volume/Pitch Change
        Adjusting --> Steady: Change Complete
    }

    state "Node Lifecycle" as NL {
        state "Active Nodes" as AN {
            OscillatorNode
            GainNode
            MasterGain
        }
        state "Connections" as CN {
            Oscillator_to_Gain
            Gain_to_Master
            Master_to_Destination
        }
    }
```

## Audio Node Architecture

This diagram shows the relationships between different audio nodes and their parameters:

```mermaid
graph TB
    subgraph AudioContext
        AC[Audio Context]
        ST[State: running/suspended]
    end

    subgraph AudioNodes
        ON[Oscillator Node]
        GN[Gain Node]
        MG[Master Gain]
        DS[Destination]
    end

    subgraph NodeStates
        CR[Created]
        CN[Connected]
        RU[Running]
        PL[Playing]
        CL[Cleanup]
    end

    subgraph Parameters
        FR[Frequency]
        VL[Volume]
        GP[Gain]
    end

    AC -->|creates| ON
    AC -->|creates| GN
    AC -->|creates| MG
    
    ON -->|connects to| GN
    GN -->|connects to| MG
    MG -->|connects to| DS
    
    ON -->|state| RU
    GN -->|state| PL
    
    FR -->|controls| ON
    VL -->|controls| GN
    GP -->|controls| MG
    
    CR -->|transition| CN
    CN -->|transition| RU
    RU -->|transition| PL
    PL -->|transition| CL

    ST -->|affects| ON
    ST -->|affects| GN
    ST -->|affects| MG
```

## Key Concepts

1. Node Setup:
   - OscillatorNode created with frequency
   - GainNode created with initial gain of 0
   - Nodes connected in chain
   - Oscillator started immediately
   - Gain ramped up smoothly

2. Node Lifecycle:
   - Created → Connected → Running → Playing
   - Volume/Pitch adjustments during playback
   - Proper cleanup sequence on stop

3. Cleanup Process:
   - Ramp down gain to avoid clicks
   - Wait for ramp completion
   - Stop oscillator
   - Disconnect nodes in reverse order
   - Clear node references

4. State Management:
   - Track node states independently
   - Coordinate state changes
   - Handle parameter changes
   - Manage AudioContext state

## Important Considerations

1. Timing:
   - Proper sequencing of node creation
   - Smooth gain transitions
   - Cleanup timing
   - State synchronization

2. Resource Management:
   - Node creation/disposal
   - Connection management
   - Memory usage
   - Context state

3. Error Prevention:
   - State validation
   - Connection verification
   - Parameter bounds checking
   - Cleanup confirmation

4. Performance:
   - Efficient node creation
   - Optimized connections
   - Proper cleanup
   - Resource pooling
