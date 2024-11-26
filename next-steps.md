
when you are in sync with the ai it feels you spend less in the api?

when the page first loads show the stick figure scene loaded in its default lowest/slowest state
fix the volume control in the beats page
can we have the stick and particle scenes not init at max rate (slowest moving stick men to start please same with particles :))
update the help menu for all control types
can we show a little ociliscope in the pitch menu area to show live feedback

so now we have these 3 scenes i want you to generate your own 4th scene use your own imagination

update all the diagrams and readme.md now 
and update the following social media post context and also what scene of this app should we take a screenshot of to show it off in the post:

"
🎵 Just launched my new TypeScript Audio Visualizer! 🚀    CLINE AND CLAUDE
In this arcade, your AI credits are smarter than your high score.
work those api's

✨ Features: • Real-time audio visualization with p5.js • Dual-mode audio engine (oscillator/tracker) • Advanced audio processing chain • Responsive controls (keyboard/mouse/touch)
🔗 Try it: https://mgantlett.github.io/audio-viz/ #WebAudio #TypeScript #CreativeCoding
"


and then do a git commmit
and do git status make sure all files that should be in git are in git


FOR REFACTOR/ new projects:
Let me help you choose a modern frontend stack and suggest prompting strategies for AI pair programming.

For a new internet app in 2024, I recommend:

Frontend Stack:
1. Next.js 14 with App Router - It's become the de-facto React framework, offering excellent performance, good AI/LLM integration patterns, and great TypeScript support
2. TypeScript by default - Provides better type safety and better AI code generation
3. Tailwind CSS - Makes styling consistent and AI can generate reliable utility classes
4. shadcn/ui - Provides accessible, customizable components that work well with AI generation
5. Tanstack Query (formerly React Query) - For data fetching and state management

For AI pair programming and generating maintainable TypeScript code, here are key prompting strategies:

1. Request component separation by telling the AI:
"Please create separate files for each component following these patterns:
- One component per file
- Place shared interfaces in separate types.ts files
- Keep components focused on single responsibilities
- Extract reusable logic into custom hooks"

2. For proper object modeling:
"Please follow these patterns when creating types and interfaces:
- Break down complex types into smaller, composable interfaces
- Use discriminated unions for state management
- Create separate model files for domain objects
- Use generics for reusable type patterns"

3. File structure guidance:
"Please organize the code with this structure:
/components
  /[feature]
    /ui - For presentational components
    /hooks - For feature-specific hooks
    /types - For feature-specific types
/lib - For shared utilities
/types - For shared types
/hooks - For shared hooks"

Would you like me to demonstrate this with a small example of how to structure a specific feature using these patterns?