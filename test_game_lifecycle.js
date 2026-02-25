#!/usr/bin/env node
/**
 * test_game_lifecycle.js — Unit / integration tests for:
 *   - startNewLife  (merged from two duplicate definitions)
 *   - revivePlayer  (merged from two duplicate definitions)
 *   - Processing-flag resets
 *   - Onboarding flag logic
 *
 * Run:  node test_game_lifecycle.js
 */

// ============================================================================
// MINIMAL STUBS — mirror enough of the real modules to exercise Game logic
// ============================================================================

// Simulate the Alive namespace
const Alive = {};

// --- Player Stub ---
class PlayerStub {
    constructor(state = {}) {
        this.name = state.name || "Test";
        this.gender = state.gender || "M";
        this.age = state.age || 0;
        this.countryId = state.countryId || "kz";
        this.cityId = state.cityId || "almaty";
        this.familyWealthTier = state.familyWealthTier || "medium";
        this.money = state.money || 0;
        this.health = state.health || 100;
        this.happiness = state.happiness || 50;
        this.stress = state.stress || 0;
        this.intelligence = state.intelligence || 50;
        this.looks = state.looks || 50;
        this.karma = state.karma || 50;
        this.netWorth = this.money;
        this.annualIncome = 0;
        this.annualExpenses = 0;
        this.adsWatched = 0;
        this.flags = {};
        this.generation = state.generation || 1;
    }
    reset() {
        this.age = 0;
        this.money = 0;
        this.health = 100;
        this.happiness = 50;
        this.flags = {};
    }
    updateNetWorth() {
        this.netWorth = this.money;
    }
    recalculateEconomy() {
        // stub
    }
    applyYearlyUpdate() {
        return {};
    }
    toJSON() {
        return { ...this };
    }
}

PlayerStub.createNew = function (cfg) {
    return new PlayerStub(cfg);
};

Alive.Player = PlayerStub;

// --- Analytics Stub (tracks calls) ---
const analyticsLog = [];
Alive.Analytics = {
    trackLifeStart(player) {
        analyticsLog.push({ event: "life_start", name: player?.name });
    }
};

// --- Achievements Stub ---
let achievementsNewLifeCalled = false;
Alive.achievements = {
    loadProgression() { },
    onNewLifeStarted() {
        achievementsNewLifeCalled = true;
    }
};

// --- Storage Stub ---
Alive.storage = {
    save() { return true; },
    hasSave() { return false; },
    loadCloud() { return null; },
    saveCloud() { return true; },
    initCloudStorage() { }
};

// --- UI Stub ---
const uiLog = [];
Alive.ui = {
    showGame() { uiLog.push("showGame"); },
    showToast(msg) { uiLog.push("toast:" + msg); },
    renderMainMenu() { uiLog.push("renderMainMenu"); }
};

// --- Monetization Stub ---
class MonetizationStub {
    constructor() { this.initialized = false; this.ysdk = null; }
    async init(ysdk) { this.initialized = true; this.ysdk = ysdk; }
}
Alive.Monetization = MonetizationStub;

// ============================================================================
// LOAD THE REAL Game CLASS
// We need to run it through the IIFE that installs Alive.Game,
// but first we must fake the `window` global.
// ============================================================================

const fs = require("fs");
const path = require("path");

// Create a minimal global environment
global.window = global;
global.Alive = Alive;
global.document = {
    addEventListener() { },
    getElementById() { return null; },
    body: { classList: { add() { } } }
};
global.localStorage = {
    getItem() { return null; },
    setItem() { },
    removeItem() { }
};

global.CustomEvent = class CustomEvent {
    constructor(type, opts) { this.type = type; this.detail = opts?.detail; }
};
global.dispatchEvent = function () { };
global.addEventListener = function () { };

// Load game.js by evaluating it
const gameSource = fs.readFileSync(path.join(__dirname, "js", "game.js"), "utf-8");
// eslint-disable-next-line no-eval
eval(gameSource);

const Game = Alive.Game;

// ============================================================================
// TEST HARNESS
// ============================================================================

let testsPassed = 0;
let testsFailed = 0;
const failures = [];

function assert(label, condition, detail) {
    if (condition) {
        testsPassed++;
        console.log("  ✅ " + label);
    } else {
        testsFailed++;
        const msg = "  ❌ " + label + (detail ? " — " + detail : "");
        console.error(msg);
        failures.push(label);
    }
}

function section(title) {
    console.log("\n--- " + title + " ---");
}

// ============================================================================
// TESTS
// ============================================================================

section("startNewLife — basic creation");

(() => {
    const game = new Game();
    const player = game.startNewLife({
        gender: "F",
        name: "Aisulu",
        countryId: "kz",
        cityId: "almaty",
        familyWealthTier: "medium"
    });

    assert("Returns player instance", !!player);
    assert("Player name is set", player.name === "Aisulu");
    assert("Player gender is set", player.gender === "F");
    assert("Game ended = false", game.ended === false);
    assert("failCause = null", game.failCause === null);
    assert("phase = 'event'", game.phase === "event");
    assert("eventQueue is empty", game.eventQueue.length === 0);
    assert("seenEventIds is empty", game.seenEventIds.length === 0);
})();

section("startNewLife — processing flag resets (from V1)");

(() => {
    const game = new Game();
    // Simulate a stuck processing state from previous life
    game.isProcessingYear = true;
    game._adRewardInProgress = true;

    game.startNewLife({ name: "Test" });

    assert("isProcessingYear reset to false", game.isProcessingYear === false);
    assert("_adRewardInProgress reset to false", game._adRewardInProgress === false);
})();

section("startNewLife — onboarding check (from V1)");

(() => {
    const game = new Game();
    game.bestResults.tutorialComplete = false;

    game.startNewLife({ name: "Newbie" });

    assert("isOnboarding = true for new player", game.isOnboarding === true);
    assert("onboardingStep = 0", game.onboardingStep === 0);
})();

(() => {
    const game = new Game();
    game.bestResults.tutorialComplete = true;

    game.startNewLife({ name: "Veteran" });

    assert("isOnboarding stays false for veteran", game.isOnboarding === false);
})();

section("startNewLife — analytics tracking (from V1)");

(() => {
    analyticsLog.length = 0;
    const game = new Game();

    game.startNewLife({ name: "Tracked" });

    assert("Analytics.trackLifeStart called", analyticsLog.length > 0);
    assert(
        "Analytics receives player name",
        analyticsLog[analyticsLog.length - 1]?.name === "Tracked"
    );
})();

section("startNewLife — achievements hook (from V2)");

(() => {
    achievementsNewLifeCalled = false;
    const game = new Game();

    game.startNewLife({ name: "Achiever" });

    assert("achievements.onNewLifeStarted called", achievementsNewLifeCalled === true);
})();

section("startNewLife — playerState (legacy/inheritance mode)");

(() => {
    const game = new Game();
    const player = game.startNewLife({
        playerState: {
            name: "Child",
            gender: "M",
            age: 5,
            money: 50000
        }
    });

    assert("Legacy playerState: name set", player.name === "Child");
    assert("Legacy playerState: age set", player.age === 5);
})();

section("startNewLife — wealth tiers");

(() => {
    const game = new Game();

    game.startNewLife({ familyWealthTier: "poor" });
    assert("Poor tier: money = 100", game.player.money === 100);

    game.startNewLife({ familyWealthTier: "rich" });
    assert("Rich tier: money = 15000", game.player.money === 15000);

    game.startNewLife({ familyWealthTier: "elite" });
    assert("Elite tier: money = 100000", game.player.money === 100000);

    game.startNewLife({ familyWealthTier: "medium" });
    assert("Medium tier: money = 2500", game.player.money === 2500);
})();

section("revivePlayer — basic behaviour");

(() => {
    const game = new Game();
    game.startNewLife({ name: "Dying" });
    game.ended = true;
    game.failCause = "old_age";

    game.revivePlayer();

    assert("ended set to false after revive", game.ended === false);
    assert("failCause cleared", game.failCause === null);
    assert("health set to 40 (diminished capacity)", game.player.health === 40);
    assert("happiness set to 40 (diminished capacity)", game.player.happiness === 40);
})();

section("revivePlayer — one-time guard");

(() => {
    const game = new Game();
    game.startNewLife({ name: "Catlife" });
    game.ended = true;

    game.revivePlayer(); // First revive — should work
    assert("First revive: flags.revivedOnce = true", game.player.flags.revivedOnce === true);

    // Simulate death again
    game.ended = true;
    const healthBefore = game.player.health;
    game.revivePlayer(); // Second revive — should be blocked

    assert("Second revive: still ended", game.ended === true,
        "Player was revived a second time — guard failed!");
})();

section("revivePlayer — does nothing if game not ended");

(() => {
    const game = new Game();
    game.startNewLife({ name: "Alive" });
    game.ended = false;

    game.revivePlayer();

    // Should not mark as revived if game wasn't ended
    assert("No-op when not ended", !game.player.flags.revivedOnce);
    assert("health unchanged", game.player.health === 100);
})();

section("No duplicate method definitions (meta-check)");

(() => {
    const gameSource = fs.readFileSync(path.join(__dirname, "js", "game.js"), "utf-8");
    const lines = gameSource.split(/\r?\n/);

    // Count method definition lines for startNewLife and revivePlayer
    let startNewLifeCount = 0;
    let revivePlayerCount = 0;

    for (const line of lines) {
        const trimmed = line.trim();
        // Match actual method definitions (not comments/strings)
        if (/^(?:async\s+)?startNewLife\s*\(/.test(trimmed)) startNewLifeCount++;
        if (/^(?:async\s+)?revivePlayer\s*\(/.test(trimmed)) revivePlayerCount++;
    }

    assert(
        "startNewLife defined exactly once",
        startNewLifeCount === 1,
        `Found ${startNewLifeCount} definitions`
    );
    assert(
        "revivePlayer defined exactly once",
        revivePlayerCount === 1,
        `Found ${revivePlayerCount} definitions`
    );
})();

// ============================================================================
// RESULTS
// ============================================================================

console.log("\n========================================");
console.log(
    `Result: ${testsPassed} passed, ${testsFailed} failed`
);
if (failures.length > 0) {
    console.log("Failures:");
    failures.forEach((f) => console.log("  - " + f));
}
console.log("========================================");

process.exit(testsFailed > 0 ? 1 : 0);
