// Simulation Runner
// Run this in browser console or node (if mocks provided)

const mockGlobal = {
    Alive: {
        actions: {
            getActionById: (id) => ({ cost: 0 }) 
        },
        utils: {
            clamp: (v, min, max) => Math.min(max, Math.max(min, v))
        }
    },
    window: {}
};

// Paste Player.js content conceptually or assume it's loaded.
// Since we are in tool usage, I will just instruct the user/browser to run it.

if (typeof Alive !== 'undefined' && Alive.Player) {
    console.log("Starting Batch Simulation...");
    const results = Alive.Player.runBatchSimulation(50);
    console.log("Simulation Complete:", results);
} else {
    console.error("Alive.Player not found. Is player.js loaded?");
}
