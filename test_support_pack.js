#!/usr/bin/env node
/**
 * test_support_pack.js — Tests for Support Pack entitlement persistence.
 *
 * Scenario tested:
 *   1. Purchase Support Pack  →  hasSupportPack = true
 *   2. Save the game state
 *   3. Create a NEW monetization instance (simulates app restart)
 *   4. Load the saved state
 *   5. Assert: hasSupportPack is restored on the new instance
 *   6. Assert: interstitial ads are blocked when Support Pack is active
 *
 * Run:  node test_support_pack.js
 */

// ============================================================================
// MINIMAL STUBS
// ============================================================================

const Alive = {};
global.window = global;
global.Alive = Alive;
global.aliveGame = null;
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
global.alert = function () { };
global.confirm = function () { return false; };

// --- Stub modules needed for storage.js ---
Alive.Player = function (state) {
    Object.assign(this, { name: "Test", age: 0, money: 0, health: 100, ...state });
};
Alive.Player.createNew = function (cfg) { return new Alive.Player(cfg); };

// ============================================================================
// LOAD REAL MODULES
// ============================================================================

const fs = require("fs");
const path = require("path");

// Load storage.js
eval(fs.readFileSync(path.join(__dirname, "js", "storage.js"), "utf-8"));

// Load monetization.js
eval(fs.readFileSync(path.join(__dirname, "js", "monetization.js"), "utf-8"));

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
// IN-MEMORY STORAGE BACKEND (bypass localStorage stubs)
// ============================================================================

const memStore = {};
global.localStorage = {
    _store: memStore,
    getItem(key) { return memStore[key] || null; },
    setItem(key, val) { memStore[key] = val; },
    removeItem(key) { delete memStore[key]; }
};

// Re-load storage with working localStorage
eval(fs.readFileSync(path.join(__dirname, "js", "storage.js"), "utf-8"));

// ============================================================================
// TESTS
// ============================================================================

section("Step 1: Initial state — no Support Pack");

(() => {
    const monetization = new Alive.Monetization();
    assert("hasSupportPack starts false", monetization.hasSupportPack === false);

    // Simulate game instance
    global.aliveGame = {
        monetization: monetization,
        player: new Alive.Player({ name: "Buyer" }),
        emitUpdate() { }
    };

    assert("aliveGame.monetization linked", global.aliveGame.monetization === monetization);
})();

section("Step 2: Purchase Support Pack (mock)");

(() => {
    const monet = global.aliveGame.monetization;

    // Simulate mock purchase (no ysdk, no payments)
    monet.hasSupportPack = true;

    assert("hasSupportPack = true after purchase", monet.hasSupportPack === true);
})();

section("Step 3: Save game state");

(() => {
    const state = {
        player: { name: "Buyer", age: 25, money: 5000 }
    };
    const success = Alive.storage.save(state);
    assert("Save succeeded", success === true);

    // Verify the flag was persisted in the raw JSON
    const raw = localStorage.getItem("alive_save_v1");
    assert("Raw save data exists", !!raw);

    const parsed = JSON.parse(raw);
    assert(
        "flags.hasSupportPack = true in saved data",
        parsed.flags && parsed.flags.hasSupportPack === true,
        "Got: " + JSON.stringify(parsed.flags)
    );
})();

section("Step 4: Simulate app restart — new Monetization instance");

(() => {
    // Destroy old instance to simulate a cold restart
    global.aliveGame.monetization = null;
    global.aliveGame = null;

    // Clear the namespace flag if leftover
    delete Alive._pendingSupportPack;
})();

section("Step 5: Load saved state and verify entitlement restoration");

(() => {
    // Load triggers before the Monetization instance exists
    const loadedState = Alive.storage.load();
    assert("State loaded successfully", !!loadedState);
    assert("_pendingSupportPack flag set by load()", Alive._pendingSupportPack === true);

    // Now create the new Monetization instance (like main.js init() would)
    const newMonet = new Alive.Monetization();
    assert(
        "New Monetization picks up deferred Support Pack",
        newMonet.hasSupportPack === true,
        "Got: " + newMonet.hasSupportPack
    );
    assert(
        "_pendingSupportPack cleaned up",
        Alive._pendingSupportPack === undefined
    );

    // Re-wire game
    global.aliveGame = {
        monetization: newMonet,
        player: new Alive.Player(loadedState.player || {}),
        emitUpdate() { }
    };
})();

section("Step 6: Verify interstitial ads are blocked");

(() => {
    const monet = global.aliveGame.monetization;
    let adShown = false;

    // Monkey-patch to detect if ad would be shown
    const origLog = console.log;
    console.log = function (...args) {
        const msg = args.join(" ");
        if (msg.includes("MOCK Interstitial")) adShown = true;
        origLog.apply(console, args);
    };

    monet.showInterstitial();

    console.log = origLog;

    assert(
        "Interstitial ad NOT shown (Support Pack active)",
        adShown === false,
        adShown ? "Ad was shown despite Support Pack!" : ""
    );
})();

section("Step 7: Verify interstitial works WITHOUT Support Pack");

(() => {
    const monet = global.aliveGame.monetization;
    monet.hasSupportPack = false;
    let adShown = false;

    const origLog = console.log;
    console.log = function (...args) {
        const msg = args.join(" ");
        if (msg.includes("MOCK Interstitial")) adShown = true;
        origLog.apply(console, args);
    };

    monet.showInterstitial();

    console.log = origLog;

    assert(
        "Interstitial ad shown when Support Pack is NOT active",
        adShown === true,
        !adShown ? "Ad was blocked despite no Support Pack!" : ""
    );
})();

section("Step 8: No static property leaks on Alive.Monetization");

(() => {
    assert(
        "Alive.Monetization class has no hasSupportPack static prop",
        Alive.Monetization.hasSupportPack === undefined,
        "Got: " + Alive.Monetization.hasSupportPack
    );
})();

// ============================================================================
// RESULTS
// ============================================================================

console.log("\n========================================");
console.log(`Result: ${testsPassed} passed, ${testsFailed} failed`);
if (failures.length > 0) {
    console.log("Failures:");
    failures.forEach(f => console.log("  - " + f));
}
console.log("========================================");

process.exit(testsFailed > 0 ? 1 : 0);
