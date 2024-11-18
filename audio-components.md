graph TD
    %% Core Components
    UI[UIManager] --> |Controls| SM[SceneManager]
    SM --> |Manages| AM[AudioManager]
    SM --> |Manages| Scene[Scene]
    
    %% Audio System
    AM --> |Extends| BAM[BasicAudioManager]
    AM --> |Extends| EAM[EnhancedAudioManager]
    BAM --> |Extends| AB[AudioBase]
    EAM --> |Extends| AB
    
    %% Audio Components
    EAM --> |Uses| SEQ[TrackerSequencer]
    EAM --> |Uses| SAMP[SampleManager]
    SEQ --> |Uses| PAT[TrackerPattern]
    
    %% State Flow
    subgraph State Management
        SM --> |Tracks| CurrentScene
        SM --> |Tracks| AudioMode[Current Audio Mode]
        AM --> |Manages| AudioState[Audio State]
        AB --> |Controls| WebAudio[Web Audio API]
    end
    
    %% Scene Types
    subgraph Scenes
        Scene --> Scene1[Stick Figures]
        Scene --> Scene2[Particle Wave]
        Scene --> Scene3[Beat Scene]
        Scene3 --> |Shows| Construction[Under Construction Notice]
    end
    
    %% Audio Modes
    subgraph Audio Modes
        BAM --> |Basic Mode| Scene1
        BAM --> |Basic Mode| Scene2
        EAM --> |Enhanced Mode| Scene3
    end

    %% UI Components
    subgraph UI Controls
        UI --> Tabs[Tab Navigation]
        Tabs --> ScenesTab[Scenes Tab]
        Tabs --> ControlsTab[Controls Tab]
        Tabs --> ToolsTab[Tools Tab]
        
        UI --> Transport[Transport Controls]
        Transport --> PlayBtn[Play/Stop]
        Transport --> PrevBtn[Previous]
        Transport --> NextBtn[Next]
        
        UI --> Tools[Tools Panel]
        Tools --> SampleGen[Sample Generator]
        Tools --> DebugConsole[Debug Console]
        Tools --> Settings[Settings]
    end

    %% Audio Chain
    subgraph Audio Chain
        WebAudio --> Context[AudioContext]
        Context --> Gain[Master Gain]
        Gain --> Comp[Compressor]
        Comp --> Dest[Destination]
    end

    %% Module Loading Order
    subgraph Initialization Flow
        ModuleLoad[Module Loading] --> SceneManagerInit[SceneManager Init]
        SceneManagerInit --> UIInit[UI Init]
        UIInit --> SceneInit[Scene Init]
        SceneInit --> AudioInit[Audio Init]
    end

    %% Error Handling Flow
    subgraph Error Handling
        Error[Error Detection] --> Display[Display on Canvas]
        Error --> Console[Console Log]
        Error --> Cleanup[State Cleanup]
        Cleanup --> Recovery[Auto Recovery]
    end

    %% State Transitions
    classDef transition fill:#f9f,stroke:#333,stroke-width:2px
    class AudioState,CurrentScene,AudioMode transition

    %% Components
    classDef component fill:#bbf,stroke:#333,stroke-width:2px
    class UI,SM,AM,Scene,Tabs,Transport,Tools component

    %% Audio
    classDef audio fill:#bfb,stroke:#333,stroke-width:2px
    class BAM,EAM,AB,WebAudio,Context,Gain,Comp,Dest audio

    %% Error Handling
    classDef error fill:#fbb,stroke:#333,stroke-width:2px
    class Error,Display,Console,Cleanup,Recovery error

    %% Initialization
    classDef init fill:#ffb,stroke:#333,stroke-width:2px
    class ModuleLoad,SceneManagerInit,UIInit,SceneInit,AudioInit init

    %% UI Elements
    classDef ui fill:#ddf,stroke:#333,stroke-width:2px
    class ScenesTab,ControlsTab,ToolsTab,PlayBtn,PrevBtn,NextBtn,SampleGen,DebugConsole,Settings ui

    %% Construction Notice
    classDef notice fill:#ffd,stroke:#333,stroke-width:2px
    class Construction notice
