const fs = require('fs');

global.window = global;
const Alive = (global.Alive = global.Alive || {});

// Load required scripts for simulation
require('./js/stats.js');
require('./js/director.js');
// Mock other dependencies gracefully if needed

Alive.EventDirector = window.Alive.EventDirector;

try {
    const results = Alive.stats.runDebugSimulation(500);
} catch (e) {
    console.error("Simulation error:", e);
}
