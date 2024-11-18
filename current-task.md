summarize all the refactoring changes we made to fix the audio auto-start bug and improve code quality:

Fixed Core Audio Bug:

Modified BasicAudioManager to properly handle initialization state
Ensured oscillator starts with zero gain
Added proper gain control during start/stop operations
Fixed audio state preservation during scene transitions
SceneManager Improvements:

Added SCENES constants for better maintainability
Extracted delay utility function
Added validateAudioState method
Simplified scene switching logic
Added updateUI helper method
Removed unused setPattern and setProgression methods
Better state management with proper cleanup
Improved error handling
Added proper audio mode tracking
UIManager Improvements:

Added element validation system
Improved element selection with proper selectors
Added defensive programming with null checks
Better error handling and reporting
Centralized element selectors
Added helper methods for common operations
Improved keyboard shortcut handling
Better button state management
Improved control value updates
Better code organization
Overall Architecture Improvements:

Better separation of concerns
More consistent state management
Improved error handling throughout
Better code organization
More maintainable codebase
Removed redundant code
Added proper cleanup sequences
Current Issue:

There's still an initialization error in the UI manager when trying to access display property of undefined elements
This suggests we need to fix the element selection or initialization sequence
The refactoring has significantly improved the codebase's organization and reliability, though there's still one initialization issue to resolve in the next prompt.

read this for project context C:\Users\mgant\Desktop\audio-viz\init-prompt.md
