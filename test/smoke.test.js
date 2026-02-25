#!/usr/bin/env node
/**
 * smoke.test.js — Release-minimum smoke suite for Alive Life Simulator
 *
 * Covers:
 *   1. JSON data file loading & structural integrity
 *   2. Strings / i18n data loading
 *   3. Game class initialization
 *   4. startNewLife — player creation
 *   5. Year progression (nextYear)
 *   6. Save → Load roundtrip (storage)
 *   7. Player stat clamping & economy
 *   8. Multi-year simulation (10-year smoke run)
 *
 * Run:  node test/smoke.test.js
 *   or: npm test
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// ============================================================================
// TEST HARNESS (zero-dependency, exit-code based)
// ============================================================================

let passed = 0;
let failed = 0;
let skipped = 0;
const failures = [];

function assert(label, condition, detail) {
    if (condition) {
        passed++;
        console.log("  ✅ " + label);
    } else {
        failed++;
        const msg = "  ❌ " + label + (detail ? " — " + detail : "");
        console.error(msg);
        failures.push(label);
    }
}

function skip(label, reason) {
    skipped++;
    console.log("  ⏭️  " + label + " (skipped: " + reason + ")");
}

function section(title) {
    console.log("\n━━━ " + title + " ━━━");
}

// ============================================================================
// BROWSER ENVIRONMENT SHIMS
// ============================================================================

// In-memory localStorage
const memStore = {};
global.localStorage = {
    _store: memStore,
    getItem(k) { return memStore[k] || null; },
    setItem(k, v) { memStore[k] = String(v); },
    removeItem(k) { delete memStore[k]; }
};

global.window = global;
global.document = {
    addEventListener() { },
    getElementById() { return null; },
    querySelector() { return null; },
    body: { classList: { add() { }, remove() { } } },
    createElement() {
        return {
            className: "", innerHTML: "", style: {},
            appendChild() { }, addEventListener() { },
            classList: { add() { }, remove() { } }
        };
    }
};

// CustomEvent shim
global.CustomEvent = class CustomEvent {
    constructor(type, opts) { this.type = type; this.detail = opts?.detail; }
};
const eventListeners = {};
global.dispatchEvent = function (ev) {
    const fns = eventListeners[ev.type] || [];
    fns.forEach(fn => fn(ev));
};
global.addEventListener = function (type, fn) {
    eventListeners[type] = eventListeners[type] || [];
    eventListeners[type].push(fn);
};

global.alert = function () { };
global.confirm = function () { return false; };
global.fetch = function () { return Promise.reject("No fetch in tests"); };
global.setTimeout = function (fn) { fn(); return 1; };
global.clearTimeout = function () { };

// Namespace
const Alive = {};
Alive.events = { getRandomEvent: () => null, getEventById: () => null };
global.Alive = Alive;
global.aliveGame = null;

// ============================================================================
// 1. JSON DATA LOADING
// ============================================================================

section("1. JSON Data Files — Loading & Integrity");

const jsonFiles = [
    { relative: "js/data/cities.json", minEntries: 5, requiredFields: ["id", "name", "country"] },
    { relative: "js/data/events.json", minEntries: 1, requiredFields: ["id"] },
    { relative: "js/data/buildings.json", minEntries: 1, requiredFields: ["id"] },
    { relative: "js/data/characters.json", minEntries: 1, requiredFields: [] },
    { relative: "js/data/game_assets.json", minEntries: 0, requiredFields: [] },
    { relative: "js/data/items.json", minEntries: 1, requiredFields: [] },
    { relative: "js/data/transports.json", minEntries: 1, requiredFields: [] },
];

const loadedData = {};

for (const spec of jsonFiles) {
    const fullPath = path.join(ROOT, spec.relative);
    const name = path.basename(spec.relative);

    if (!fs.existsSync(fullPath)) {
        assert(`${name} exists`, false, "File not found: " + spec.relative);
        continue;
    }

    let data;
    try {
        const raw = fs.readFileSync(fullPath, "utf-8");
        data = JSON.parse(raw);
    } catch (e) {
        assert(`${name} is valid JSON`, false, e.message);
        continue;
    }

    assert(`${name} is valid JSON`, true);

    if (Array.isArray(data)) {
        assert(`${name} has ≥${spec.minEntries} entries`, data.length >= spec.minEntries,
            `Got ${data.length}`);

        if (spec.requiredFields.length > 0 && data.length > 0) {
            const first = data[0];
            const missing = spec.requiredFields.filter(f => !(f in first));
            assert(`${name}[0] has required fields [${spec.requiredFields.join(", ")}]`,
                missing.length === 0, "Missing: " + missing.join(", "));
        }
    } else {
        assert(`${name} is a valid object`, typeof data === "object" && data !== null);
    }

    loadedData[name] = data;
}

// ============================================================================
// 2. STRINGS / I18N DATA
// ============================================================================

section("2. Strings / i18n Data");

(() => {
    const stringsPath = path.join(ROOT, "js", "data", "strings.js");
    assert("strings.js exists", fs.existsSync(stringsPath));

    // Load the strings IIFE — it sets Alive.strings
    try {
        eval(fs.readFileSync(stringsPath, "utf-8"));
        assert("Alive.strings loaded", !!Alive.strings);
        assert("English strings present", !!Alive.strings.en);
        assert("Russian strings present", !!Alive.strings.ru);

        const enKeys = Object.keys(Alive.strings.en);
        const ruKeys = Object.keys(Alive.strings.ru);
        assert(`EN has ≥100 string keys (got ${enKeys.length})`, enKeys.length >= 100);
        assert(`RU has ≥100 string keys (got ${ruKeys.length})`, ruKeys.length >= 100);

        // Spot-check critical keys
        const criticalKeys = ["ui.gameTitle", "ui.newLife", "ui.continue", "ui.nextYear", "ui.age", "ui.health"];
        for (const key of criticalKeys) {
            assert(`EN has key "${key}"`, key in Alive.strings.en, "Missing");
        }
    } catch (e) {
        assert("strings.js evaluates without error", false, e.message);
    }
})();

// ============================================================================
// 3. LOAD CORE MODULES (player_core.js, game.js, storage.js)
// ============================================================================

section("3. Core Module Loading");

const modulesToLoad = [
    "js/player_core.js",
    "js/game.js",
    "js/storage.js",
    "js/monetization.js",
];

for (const mod of modulesToLoad) {
    const fullPath = path.join(ROOT, mod);
    const name = path.basename(mod);
    if (!fs.existsSync(fullPath)) {
        assert(`${name} exists`, false);
        continue;
    }
    try {
        eval(fs.readFileSync(fullPath, "utf-8"));
        assert(`${name} loaded`, true);
    } catch (e) {
        assert(`${name} evaluates without error`, false, e.message);
    }
}

// Verify exports
assert("Alive.Player available", typeof Alive.Player === "function");
assert("Alive.Player.createNew available", typeof Alive.Player.createNew === "function");
assert("Alive.Game available", typeof Alive.Game === "function");
assert("Alive.storage available", typeof Alive.storage === "object" && Alive.storage !== null);
assert("Alive.storage.save is function", typeof Alive.storage.save === "function");
assert("Alive.storage.load is function", typeof Alive.storage.load === "function");
assert("Alive.Monetization available", typeof Alive.Monetization === "function");

// ============================================================================
// 4. GAME INITIALIZATION
// ============================================================================

section("4. Game Initialization");

let game;
try {
    game = new Alive.Game();
    assert("new Game() succeeds", !!game);
    assert("game.player is null before startNewLife", game.player === null);
    assert("game.ended is false", game.ended === false);
    assert("game.phase is 'event'", game.phase === "event");
    assert("game.currentYear is 2000", game.currentYear === 2000);
    assert("game.bestResults exists", !!game.bestResults);
    assert("game.lifeStats exists", !!game.lifeStats);
} catch (e) {
    assert("Game constructor doesn't throw", false, e.message);
}

// ============================================================================
// 5. START NEW LIFE
// ============================================================================

section("5. startNewLife — Player Creation");

let player;
try {
    player = game.startNewLife({
        gender: "M",
        name: "SmokeTestPlayer",
        countryId: "kz",
        cityId: "almaty",
        familyWealthTier: "medium"
    });

    assert("startNewLife returns player", !!player);
    assert("player.name = 'SmokeTestPlayer'", player.name === "SmokeTestPlayer");
    assert("player.gender = 'M'", player.gender === "M");
    assert("player.age = 0", player.age === 0);
    assert("player.alive = true", player.alive === true);
    assert("player.health in [0,100]", player.health >= 0 && player.health <= 100);
    assert("player.happiness in [0,100]", player.happiness >= 0 && player.happiness <= 100);
    assert("player.money > 0 (medium tier)", player.money > 0, `Got ${player.money}`);
    assert("game.ended = false after start", game.ended === false);
    assert("game.failCause = null", game.failCause === null);
    assert("game.isProcessingYear = false", game.isProcessingYear === false);
    assert("game._adRewardInProgress = false", game._adRewardInProgress === false);
    assert("game.seenEventIds is empty array", Array.isArray(game.seenEventIds) && game.seenEventIds.length === 0);
    assert("game.eventQueue is empty array", Array.isArray(game.eventQueue) && game.eventQueue.length === 0);
} catch (e) {
    assert("startNewLife doesn't throw", false, e.stack || e.message);
}

// Wealth tier checks
(() => {
    const tiers = [
        { tier: "poor", min: 50, max: 500 },
        { tier: "medium", min: 1000, max: 5000 },
        { tier: "rich", min: 10000, max: 50000 },
        { tier: "elite", min: 50000, max: 500000 },
    ];

    for (const t of tiers) {
        const g = new Alive.Game();
        const p = g.startNewLife({ familyWealthTier: t.tier });
        assert(`Wealth tier "${t.tier}": money ${p.money} in [${t.min}, ${t.max}]`,
            p.money >= t.min && p.money <= t.max,
            `Got ${p.money}`);
    }
})();

// ============================================================================
// 6. YEAR PROGRESSION (nextYear)
// ============================================================================

section("6. Year Progression — nextYear()");

(() => {
    const g = new Alive.Game();
    // Stub out modules that nextYear calls optionally
    Alive.consequences = Alive.consequences || {};
    Alive.needs = Alive.needs || {};
    Alive.stats = Alive.stats || {};
    Alive.achievements = Alive.achievements || { onNewLifeStarted() { } };
    Alive.Analytics = Alive.Analytics || { trackLifeStart() { } };

    const p = g.startNewLife({ name: "YearTest", familyWealthTier: "medium" });
    const initialAge = p.age;
    const initialYear = g.currentYear;
    const initialMoney = p.money;

    // Advance one year
    g.nextYear();

    assert("Age incremented by 1", p.age === initialAge + 1, `Got ${p.age}`);
    assert("currentYear incremented by 1", g.currentYear === initialYear + 1, `Got ${g.currentYear}`);
    assert("isProcessingYear reset to false after nextYear", g.isProcessingYear === false);
    assert("Player still alive after 1 year", p.alive === true);
    assert("game.ended still false after 1 year", g.ended === false);

    // Economy was recalculated
    assert("annualIncome is a number", typeof p.annualIncome === "number");
    assert("annualExpenses is a number", typeof p.annualExpenses === "number");

    // Stats still in bounds
    assert("health still in [0,100]", p.health >= 0 && p.health <= 100);
    assert("happiness still in [0,100]", p.happiness >= 0 && p.happiness <= 100);
    assert("stress still in [0,100]", p.stress >= 0 && p.stress <= 100);
})();

// Rapid year advancement (prevent double-call)
(() => {
    const g = new Alive.Game();
    g.startNewLife({ name: "RapidTest" });

    // Simulate stuck isProcessingYear
    g.isProcessingYear = true;
    const ageBefore = g.player.age;
    g.nextYear(); // Should be a no-op

    assert("nextYear is no-op when isProcessingYear=true",
        g.player.age === ageBefore,
        `Age changed to ${g.player.age}`);

    g.isProcessingYear = false; // Unlock
})();

// ============================================================================
// 7. SAVE / LOAD ROUNDTRIP
// ============================================================================

section("7. Save → Load Roundtrip");

(() => {
    // Clear any previous saves
    Alive.storage.clear();

    const g1 = new Alive.Game();
    global.aliveGame = { monetization: null }; // No monetization for this test
    const p1 = g1.startNewLife({
        name: "SaveLoadTest",
        gender: "F",
        countryId: "us",
        cityId: "newYork",
        familyWealthTier: "rich"
    });

    // Advance a few years
    for (let i = 0; i < 5; i++) {
        g1.nextYear();
    }

    const stateBefore = g1.getState();
    assert("getState() returns object", typeof stateBefore === "object" && stateBefore !== null);
    assert("getState().player exists", !!stateBefore.player);
    assert("getState().player.name = 'SaveLoadTest'", stateBefore.player.name === "SaveLoadTest");
    assert("getState().currentYear = 2005", stateBefore.currentYear === 2005, `Got ${stateBefore.currentYear}`);

    // Save
    const saveOk = Alive.storage.save(stateBefore);
    assert("storage.save() returns true", saveOk === true);
    assert("storage.hasSave() returns true after save", Alive.storage.hasSave() === true);

    // Verify raw storage
    const rawSave = localStorage.getItem("alive_save_v1");
    assert("Raw save data exists in localStorage", !!rawSave);

    let parsedSave;
    try {
        parsedSave = JSON.parse(rawSave);
        assert("Raw save parses as JSON", true);
        assert("Save has version field", typeof parsedSave.version === "number");
        assert("Save has timestamp field", typeof parsedSave.timestamp === "number");
        assert("Save has state field", typeof parsedSave.state === "object");
        assert("Save has flags field", typeof parsedSave.flags === "object");
    } catch (e) {
        assert("Raw save parses as JSON", false, e.message);
    }

    // Load into fresh game
    const g2 = new Alive.Game();
    const loadedState = Alive.storage.load();
    assert("storage.load() returns object", typeof loadedState === "object" && loadedState !== null);

    const loadOk = g2.load(loadedState);
    assert("game.load() returns true", loadOk === true);
    assert("Loaded player.name matches", g2.player.name === "SaveLoadTest");
    assert("Loaded player.gender matches", g2.player.gender === "F");
    assert("Loaded currentYear matches", g2.currentYear === 2005, `Got ${g2.currentYear}`);
    assert("Loaded player.age matches (5)", g2.player.age === 5, `Got ${g2.player.age}`);
    assert("Loaded player.alive = true", g2.player.alive === true);

    // Deep equality on key state fields
    assert("ended flag roundtrips", g2.ended === stateBefore.ended);
    assert("phase roundtrips", g2.phase === stateBefore.phase);
    assert("gems roundtrip", g2.gems === stateBefore.gems);

    // Loaded game should be playable (advance another year)
    const ageBeforeLoad = g2.player.age;
    g2.nextYear();
    assert("Can advance year after load", g2.player.age === ageBeforeLoad + 1);

    // Clean up
    Alive.storage.clear();
    assert("storage.hasSave() returns false after clear", Alive.storage.hasSave() === false);
})();

// ============================================================================
// 8. PLAYER STAT CLAMPING & ECONOMY
// ============================================================================

section("8. Player Stats & Economy");

(() => {
    const p = Alive.Player.createNew({ name: "ClampTest" });

    // Force out-of-bounds
    p.health = 999;
    p.happiness = -50;
    p.stress = 200;
    p.clampAllStats();

    assert("health clamped to 100", p.health === 100);
    assert("happiness clamped to 0", p.happiness === 0);
    assert("stress clamped to 100", p.stress === 100);

    // modifyStat
    p.health = 50;
    p.modifyStat("health", 30);
    assert("modifyStat +30 health → 80", p.health === 80);

    p.modifyStat("health", 50); // would exceed 100
    assert("modifyStat capped at 100", p.health === 100);

    p.modifyStat("health", -150); // would go below 0
    assert("modifyStat floored at 0", p.health === 0);

    // Economy basics
    p.health = 80; // restore for economy
    p.money = 10000;
    p.age = 25;
    p.job = "unemployed";
    const econ = p.recalculateEconomy();
    assert("recalculateEconomy returns object", typeof econ === "object");
    assert("annualIncome is 0 when unemployed", p.annualIncome === 0);
    assert("annualExpenses > 0 (housing + food + health)", p.annualExpenses > 0,
        `Got ${p.annualExpenses}`);

    // Net worth
    p.money = 50000;
    p.investments = [];
    p.housing = "apartment";
    p.car = null;
    const nw = p.updateNetWorth();
    assert("netWorth = money when no assets", nw === 50000, `Got ${nw}`);
})();

// ============================================================================
// 9. MULTI-YEAR SIMULATION (10 years, no crash)
// ============================================================================

section("9. 10-Year Simulation Smoke Run");

(() => {
    const g = new Alive.Game();
    g.startNewLife({
        name: "SimulationPlayer",
        gender: "F",
        countryId: "kz",
        cityId: "almaty",
        familyWealthTier: "medium"
    });

    let crashedAt = -1;
    let yearsCompleted = 0;

    for (let y = 0; y < 10; y++) {
        try {
            g.nextYear();
            yearsCompleted++;
        } catch (e) {
            crashedAt = y;
            assert(`Year ${y + 1} doesn't throw`, false, e.message);
            break;
        }

        // Abort if game ended (death)
        if (g.ended) {
            skip(`Years ${y + 2}–10`, `Game ended at year ${y + 1} (age ${g.player.age})`);
            break;
        }
    }

    if (crashedAt === -1) {
        assert(`Completed ${yearsCompleted} year(s) without crash`, true);
    }

    if (!g.ended) {
        assert("Player age = 10 after 10 years", g.player.age === 10, `Got ${g.player.age}`);
        assert("Player still alive after 10 years", g.player.alive === true);
        assert("currentYear = 2010", g.currentYear === 2010, `Got ${g.currentYear}`);
        assert("health in [0,100] at year 10", g.player.health >= 0 && g.player.health <= 100);
        assert("happiness in [0,100] at year 10", g.player.happiness >= 0 && g.player.happiness <= 100);
        assert("money is a finite number", Number.isFinite(g.player.money), `Got ${g.player.money}`);
    }
})();

// ============================================================================
// 10. INTEGRITY META-CHECKS
// ============================================================================

section("10. Integrity Meta-Checks");

// No duplicate class methods in game.js
(() => {
    const source = fs.readFileSync(path.join(ROOT, "js", "game.js"), "utf-8");
    const lines = source.split(/\r?\n/);
    let startNewLifeCount = 0;
    let revivePlayerCount = 0;
    let nextYearCount = 0;

    for (const line of lines) {
        const t = line.trim();
        if (/^(?:async\s+)?startNewLife\s*\(/.test(t)) startNewLifeCount++;
        if (/^(?:async\s+)?revivePlayer\s*\(/.test(t)) revivePlayerCount++;
        if (/^(?:async\s+)?nextYear\s*\(/.test(t)) nextYearCount++;
    }

    assert("startNewLife defined exactly once", startNewLifeCount === 1, `Found ${startNewLifeCount}`);
    assert("revivePlayer defined exactly once", revivePlayerCount === 1, `Found ${revivePlayerCount}`);
    assert("nextYear defined exactly once", nextYearCount === 1, `Found ${nextYearCount}`);
})();

// No missing <script src> in index.html
(() => {
    const htmlPath = path.join(ROOT, "index.html");
    if (!fs.existsSync(htmlPath)) {
        assert("index.html exists", false);
        return;
    }
    const html = fs.readFileSync(htmlPath, "utf-8");
    const srcRegex = /<script\s+[^>]*src\s*=\s*["']([^"']+)["']/gi;
    let match;
    let missingCount = 0;

    while ((match = srcRegex.exec(html)) !== null) {
        const src = match[1];
        if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//")) continue;
        const fullPath = path.join(ROOT, src);
        if (!fs.existsSync(fullPath)) {
            assert(`Script exists: ${src}`, false, "File not found");
            missingCount++;
        }
    }

    if (missingCount === 0) {
        assert("All local <script src> in index.html exist on disk", true);
    }
})();

// ============================================================================
// RESULTS
// ============================================================================

console.log("\n" + "═".repeat(50));
console.log(`  RESULTS: ${passed} passed, ${failed} failed, ${skipped} skipped`);
if (failures.length > 0) {
    console.log("\n  Failures:");
    failures.forEach(f => console.log("    • " + f));
}
console.log("═".repeat(50));

process.exit(failed > 0 ? 1 : 0);
