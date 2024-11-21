export const menuTemplate = `
<div id="side-controls" class="absolute top-1/2 right-5 -translate-y-1/2 bg-dark p-4 rounded-xl pointer-events-auto w-[280px] max-h-[80vh] transition-all duration-300 ease-in-out border border-white/10 shadow-lg flex flex-col z-50 hidden">
    <!-- Tab Navigation -->
    <div class="tab-navigation flex gap-0.5 mb-4 bg-black/20 p-1 rounded-lg z-[51]">
        <button class="tab-btn flex-1 py-2 px-3 bg-transparent border-none text-secondary cursor-pointer text-sm rounded-md transition-all duration-200 hover:bg-white/5 active z-[52]" data-tab="scenes">Scenes</button>
        <button class="tab-btn flex-1 py-2 px-3 bg-transparent border-none text-secondary cursor-pointer text-sm rounded-md transition-all duration-200 hover:bg-white/5 z-[52]" data-tab="controls">Controls</button>
        <button class="tab-btn tools-tab flex-1 py-2 px-3 bg-transparent border-none text-secondary cursor-pointer text-sm rounded-md transition-all duration-200 hover:bg-white/5 z-[52]" data-tab="tools">Tools</button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content flex-1 overflow-y-auto min-h-0 pr-1.5">
        <!-- Scenes Tab -->
        <div class="tab-pane active p-2.5 bg-white/[0.03] rounded-lg" data-tab="scenes">
            <button id="scene1" class="scene-btn block w-full py-2.5 px-3.5 mb-2 bg-white/5 border border-white/10 text-white rounded-md cursor-pointer text-left transition-all duration-200 text-sm hover:bg-white/10 hover:translate-x-1 active">Stick Figures</button>
            <button id="scene2" class="scene-btn block w-full py-2.5 px-3.5 mb-2 bg-white/5 border border-white/10 text-white rounded-md cursor-pointer text-left transition-all duration-200 text-sm hover:bg-white/10 hover:translate-x-1">Particle Wave</button>
            <button id="scene3" class="scene-btn block w-full py-2.5 px-3.5 bg-white/5 border border-white/10 text-white rounded-md cursor-pointer text-left transition-all duration-200 text-sm hover:bg-white/10 hover:translate-x-1">Beat Scene</button>
        </div>

        <!-- Controls Tab -->
        <div class="tab-pane hidden p-2.5 bg-white/[0.03] rounded-lg" data-tab="controls">
            <button id="startButton" class="primary-btn block w-full bg-gradient-to-r from-primary to-primary/80 text-white border-none py-3 px-6 rounded-md cursor-pointer text-base font-medium transition-all duration-200 shadow-sm hover:translate-y-[-1px] hover:shadow-lg mb-4">Initialize Audio System</button>
            <button id="stopButton" class="primary-btn hidden block w-full bg-gradient-to-r from-primary to-primary/80 text-white border-none py-3 px-6 rounded-md cursor-pointer text-base font-medium transition-all duration-200 shadow-sm hover:translate-y-[-1px] hover:shadow-lg mb-4">Stop Audio</button>
            
            <!-- Basic Scene Controls (Scenes 1 & 2) -->
            <div class="control-info basic-scene-controls mt-4">
                <div class="control-item mb-3 p-2.5 bg-white/[0.03] rounded-md border border-white/5">
                    <span class="label text-secondary font-medium block mb-2">Pitch</span>
                    <div class="control-display flex items-center justify-between gap-2">
                        <span class="value text-white font-medium tracking-wide">1.0x</span>
                        <span class="shortcut text-gray-400 text-xs py-0.5 px-1.5 bg-white/5 rounded border border-white/10">(← / →)</span>
                    </div>
                </div>
                <div class="control-item mb-3 p-2.5 bg-white/[0.03] rounded-md border border-white/5">
                    <span class="label text-secondary font-medium block mb-2">Volume</span>
                    <div class="control-display flex items-center justify-between gap-2">
                        <span class="value text-white font-medium tracking-wide">100%</span>
                        <span class="shortcut text-gray-400 text-xs py-0.5 px-1.5 bg-white/5 rounded border border-white/10">(↑ / ↓)</span>
                    </div>
                </div>
            </div>

            <!-- Beat Scene Controls (Scene 3) -->
            <div class="control-info beat-scene-controls mt-4">
                <!-- Under Construction Notice -->
                <div class="construction-notice mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm animate-pulse">
                    🚧 Beep boop! This beat scene is still under construction. 
                    <span class="block mt-1 text-yellow-300/70 text-xs">
                        Our musical robots are working hard to make it awesome! 🤖🎵
                    </span>
                </div>

                <!-- Tracker Transport Controls -->
                <div class="control-item mb-3 p-2.5 bg-white/[0.03] rounded-md border border-white/5">
                    <span class="label text-secondary font-medium block mb-2">Transport</span>
                    <div class="tracker-transport flex gap-2">
                        <button class="transport-btn flex-1 bg-white/5 border border-white/10 text-white py-2 px-2 rounded-md cursor-pointer transition-all duration-200 text-sm flex items-center justify-center gap-1.5 hover:bg-white/10" data-action="prev">
                            <span class="shortcut text-xs">←</span>
                            Prev
                        </button>
                        <button class="transport-btn flex-1 bg-white/5 border border-white/10 text-white py-2 px-2 rounded-md cursor-pointer transition-all duration-200 text-sm flex items-center justify-center gap-1.5 hover:bg-white/10" data-action="play">
                            <span class="shortcut text-xs">Space</span>
                            Play
                        </button>
                        <button class="transport-btn flex-1 bg-white/5 border border-white/10 text-white py-2 px-2 rounded-md cursor-pointer transition-all duration-200 text-sm flex items-center justify-center gap-1.5 hover:bg-white/10" data-action="next">
                            <span class="shortcut text-xs">→</span>
                            Next
                        </button>
                    </div>
                </div>

                <!-- Tempo Control -->
                <div class="control-item mb-3 p-2.5 bg-white/[0.03] rounded-md border border-white/5">
                    <span class="label text-secondary font-medium block mb-2">Tempo</span>
                    <div class="control-display flex items-center justify-between gap-2">
                        <span class="value text-white font-medium tracking-wide">120 BPM</span>
                        <span class="shortcut text-gray-400 text-xs py-0.5 px-1.5 bg-white/5 rounded border border-white/10">(Mouse Wheel)</span>
                    </div>
                </div>

                <!-- Pattern Control -->
                <div class="control-item mb-3 p-2.5 bg-white/[0.03] rounded-md border border-white/5">
                    <span class="label text-secondary font-medium block mb-2">Pattern</span>
                    <div class="pattern-buttons flex flex-col gap-2">
                        <button class="pattern-btn bg-white/5 border border-white/10 text-white py-2 px-3 rounded-md cursor-pointer transition-all duration-200 text-sm text-left flex items-center gap-2 hover:bg-white/10 hover:translate-x-1 active" data-pattern="basic">Basic</button>
                        <button class="pattern-btn bg-white/5 border border-white/10 text-white py-2 px-3 rounded-md cursor-pointer transition-all duration-200 text-sm text-left flex items-center gap-2 hover:bg-white/10 hover:translate-x-1" data-pattern="syncopated">Syncopated</button>
                        <button class="pattern-btn bg-white/5 border border-white/10 text-white py-2 px-3 rounded-md cursor-pointer transition-all duration-200 text-sm text-left flex items-center gap-2 hover:bg-white/10 hover:translate-x-1" data-pattern="complex">Complex</button>
                    </div>
                </div>

                <!-- Progression Control -->
                <div class="control-item mb-3 p-2.5 bg-white/[0.03] rounded-md border border-white/5">
                    <span class="label text-secondary font-medium block mb-2">Progression</span>
                    <div class="progression-buttons flex flex-col gap-2">
                        <button class="progression-btn bg-white/5 border border-white/10 text-white py-2 px-3 rounded-md cursor-pointer transition-all duration-200 text-sm text-left flex items-center gap-2 hover:bg-white/10 hover:translate-x-1 active" data-progression="0">I-vi-IV-V</button>
                        <button class="progression-btn bg-white/5 border border-white/10 text-white py-2 px-3 rounded-md cursor-pointer transition-all duration-200 text-sm text-left flex items-center gap-2 hover:bg-white/10 hover:translate-x-1" data-progression="1">vi-IV-I-V</button>
                        <button class="progression-btn bg-white/5 border border-white/10 text-white py-2 px-3 rounded-md cursor-pointer transition-all duration-200 text-sm text-left flex items-center gap-2 hover:bg-white/10 hover:translate-x-1" data-progression="2">I-V-vi-IV</button>
                    </div>
                </div>

                <!-- Tracker Shortcuts -->
                <div class="control-item mb-3 p-2.5 bg-white/[0.03] rounded-md border border-white/5">
                    <span class="label text-secondary font-medium block mb-2">Keyboard Shortcuts</span>
                    <div class="tracker-shortcuts grid grid-cols-2 gap-2">
                        <div class="shortcut-item flex items-center gap-2 text-xs text-gray-400">
                            <span class="shortcut-key bg-white/5 py-0.5 px-1.5 rounded border border-white/10 text-secondary">Z-M</span>
                            <span>Note Input</span>
                        </div>
                        <div class="shortcut-item flex items-center gap-2 text-xs text-gray-400">
                            <span class="shortcut-key bg-white/5 py-0.5 px-1.5 rounded border border-white/10 text-secondary">0-9</span>
                            <span>Effect Value</span>
                        </div>
                        <div class="shortcut-item flex items-center gap-2 text-xs text-gray-400">
                            <span class="shortcut-key bg-white/5 py-0.5 px-1.5 rounded border border-white/10 text-secondary">Tab</span>
                            <span>Next Channel</span>
                        </div>
                        <div class="shortcut-item flex items-center gap-2 text-xs text-gray-400">
                            <span class="shortcut-key bg-white/5 py-0.5 px-1.5 rounded border border-white/10 text-secondary">Space</span>
                            <span>Play/Stop</span>
                        </div>
                        <div class="shortcut-item flex items-center gap-2 text-xs text-gray-400">
                            <span class="shortcut-key bg-white/5 py-0.5 px-1.5 rounded border border-white/10 text-secondary">Shift</span>
                            <span>Octave Up</span>
                        </div>
                        <div class="shortcut-item flex items-center gap-2 text-xs text-gray-400">
                            <span class="shortcut-key bg-white/5 py-0.5 px-1.5 rounded border border-white/10 text-secondary">Ctrl</span>
                            <span>Octave Down</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tools Tab -->
        <div class="tab-pane hidden p-2.5 bg-white/[0.03] rounded-lg" data-tab="tools">
            <button id="sampleGeneratorBtn" class="tool-btn block w-full py-2.5 px-3.5 mb-2 bg-white/5 border border-white/10 text-white rounded-md cursor-pointer text-left transition-all duration-200 text-sm hover:bg-white/10 hover:translate-x-1">Sample Generator</button>
        </div>
    </div>

    <div class="control-hint text-gray-400 text-xs text-center mt-4 border-t border-white/10 pt-4">Press 'M' to toggle menu</div>
</div>`;

export const toggleButtonTemplate = `
<button id="menuToggleBtn" class="fixed top-1/2 right-5 -translate-y-1/2 bg-dark p-3 rounded-xl pointer-events-auto border border-white/10 shadow-lg transition-all duration-300 ease-in-out hover:bg-white/5 z-50" title="Toggle Menu">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
    <span class="sr-only">Toggle Menu</span>
</button>
`;
