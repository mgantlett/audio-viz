export const menuTemplate = `
<div id="side-controls" class="absolute top-1/2 right-5 -translate-y-1/2 bg-dark p-4 rounded-xl pointer-events-auto w-[280px] max-h-[80vh] transition-all duration-300 ease-in-out border border-white/10 shadow-lg flex flex-col z-50 hidden">
    <!-- Tab Navigation -->
    <div class="tab-navigation flex gap-0.5 mb-4 bg-black/20 p-1 rounded-lg">
        <button class="tab-btn flex-1 py-2 px-3 bg-transparent border-none text-secondary cursor-pointer text-sm rounded-md transition-all duration-200 hover:bg-white/5" data-tab="scenes">Scenes</button>
        <button class="tab-btn flex-1 py-2 px-3 bg-transparent border-none text-secondary cursor-pointer text-sm rounded-md transition-all duration-200 hover:bg-white/5" data-tab="controls">Controls</button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content flex-1 overflow-y-auto min-h-0 pr-1.5">
        <!-- Scenes Tab -->
        <div class="tab-pane p-2.5 bg-white/[0.03] rounded-lg" data-tab="scenes">
            <button id="scene1" class="scene-btn block w-full py-2.5 px-3.5 mb-2 bg-white/5 border border-white/10 text-white rounded-md cursor-pointer text-left transition-all duration-200 text-sm hover:bg-white/10 hover:translate-x-1">Stick Figures</button>
            <button id="scene2" class="scene-btn block w-full py-2.5 px-3.5 mb-2 bg-white/5 border border-white/10 text-white rounded-md cursor-pointer text-left transition-all duration-200 text-sm hover:bg-white/10 hover:translate-x-1">Particle Wave</button>
            <button id="scene3" class="scene-btn block w-full py-2.5 px-3.5 bg-white/5 border border-white/10 text-white rounded-md cursor-pointer text-left transition-all duration-200 text-sm hover:bg-white/10 hover:translate-x-1">Beat Scene</button>
        </div>

        <!-- Controls Tab -->
        <div class="tab-pane hidden p-2.5 bg-white/[0.03] rounded-lg" data-tab="controls">
            <div class="flex flex-col gap-4">
                <!-- Audio Control Buttons -->
                <div class="audio-controls">
                    <button id="startButton" class="primary-btn block w-full bg-gradient-to-r from-primary to-primary/80 text-white border-none py-3 px-6 rounded-md cursor-pointer text-base font-medium transition-all duration-200 shadow-sm hover:translate-y-[-1px] hover:shadow-lg">Start Audio</button>
                    <button id="stopButton" class="primary-btn hidden block w-full bg-gradient-to-r from-primary to-primary/80 text-white border-none py-3 px-6 rounded-md cursor-pointer text-base font-medium transition-all duration-200 shadow-sm hover:translate-y-[-1px] hover:shadow-lg">Stop Audio</button>
                </div>
                
                <!-- Basic Scene Controls (Scenes 1 & 2) -->
                <div class="control-info basic-scene-controls">
                    <div class="control-item pitch mb-3 p-2.5 bg-white/[0.03] rounded-md border border-white/5 transition-colors duration-200">
                        <span class="label text-secondary font-medium block mb-2">Pitch</span>
                        <div class="control-display flex items-center justify-between gap-2 mb-2">
                            <span class="value text-white font-medium tracking-wide">1.0x</span>
                            <span class="shortcut text-gray-400 text-xs py-0.5 px-1.5 bg-white/5 rounded border border-white/10">(← / →)</span>
                        </div>
                        <div class="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div class="pitch-bar h-full bg-primary transition-all duration-100" style="width: 50%"></div>
                        </div>
                    </div>
                    <div class="control-item volume mb-3 p-2.5 bg-white/[0.03] rounded-md border border-white/5 transition-colors duration-200">
                        <span class="label text-secondary font-medium block mb-2">Volume</span>
                        <div class="control-display flex items-center justify-between gap-2 mb-2">
                            <span class="value text-white font-medium tracking-wide">100%</span>
                            <span class="shortcut text-gray-400 text-xs py-0.5 px-1.5 bg-white/5 rounded border border-white/10">(↑ / ↓)</span>
                        </div>
                        <div class="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div class="volume-bar h-full bg-primary transition-all duration-100" style="width: 100%"></div>
                        </div>
                    </div>
                </div>

                <!-- Beat Scene Controls (Scene 3) -->
                <div class="control-info beat-scene-controls hidden">
                    <!-- Tempo Control -->
                    <div class="control-item tempo mb-3 p-2.5 bg-white/[0.03] rounded-md border border-white/5 transition-colors duration-200">
                        <span class="label text-secondary font-medium block mb-2">Tempo</span>
                        <div class="control-display flex items-center justify-between gap-2 mb-2">
                            <span class="value text-white font-medium tracking-wide">135 BPM</span>
                            <span class="shortcut text-gray-400 text-xs py-0.5 px-1.5 bg-white/5 rounded border border-white/10">(Mouse Wheel)</span>
                        </div>
                        <div class="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div class="tempo-bar h-full bg-primary transition-all duration-100" style="width: 50%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="control-hint text-gray-400 text-xs text-center mt-4 border-t border-white/10 pt-4">Press 'M' to toggle menu</div>
</div>` as const;

export const toggleButtonTemplate = `
<button id="menuToggleBtn" class="fixed top-1/2 right-5 -translate-y-1/2 bg-dark p-3 rounded-xl pointer-events-auto border border-white/10 shadow-lg transition-all duration-300 ease-in-out hover:bg-white/5 z-50" title="Toggle Menu">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
    <span class="sr-only">Toggle Menu</span>
</button>
` as const;
