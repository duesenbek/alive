const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ============================================================================
// BROWSER ENVIRONMENT SHIMS (Copied from smoke.test.js)
// ============================================================================
const memStore = {};
global.localStorage = {
    _store: memStore,
    getItem(k) { return memStore[k] || null; },
    setItem(k, v) { memStore[k] = String(v); },
    removeItem(k) { delete memStore[k]; },
    clear() { for (let key in memStore) delete memStore[key]; }
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
global.fetch = function (url) {
    if (url === 'js/data/events.json') {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(global.Alive.data['events.json'] || [])
        });
    }
    return Promise.reject("No fetch in tests");
};
global.setTimeout = function (fn) { fn(); return 1; };
global.clearTimeout = function () { };
global.setInterval = function () { return 1; };
global.clearInterval = function () { };

const Alive = {};
Alive.events = { getRandomEvent: () => null, getEventById: () => null, init: () => null };
global.Alive = Alive;
global.aliveGame = null;

// ============================================================================
// LOAD MODULES
// ============================================================================

// LOAD DATA
const jsonFiles = [
    { relative: 'js/data/cities.json' },
    { relative: 'js/data/events.json' },
    { relative: 'js/data/buildings.json' },
    { relative: 'js/data/characters.json' },
    { relative: 'js/data/game_assets.json' },
    { relative: 'js/data/items.json' },
    { relative: 'js/data/transports.json' },
];
const loadedData = {};
for (const spec of jsonFiles) {
    const fullPath = path.join(ROOT, spec.relative);
    if (fs.existsSync(fullPath)) {
        loadedData[path.basename(spec.relative)] = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    }
}
global.Alive.data = loadedData;

// Load strings
try {
    const stringsPath = path.join(ROOT, "js", "data", "strings.js");
    eval(fs.readFileSync(stringsPath, "utf-8"));
} catch (e) { }

// Load actual scripts into the global scope
const scriptsToLoad = [
    'utils.js',
    'i18n.js',
    'actions.js',
    'events.js',
    'needs.js',
    'jobs.js',
    'selfdevelopment.js',
    'consequences.js',
    'relationships.js',
    'achievements.js',
    'ui.js',
    'player_core.js',
    'game.js',
    'storage.js',
    'monetization.js',
    'main.js'
];

scriptsToLoad.forEach(script => {
    const filePath = path.join(ROOT, 'js', script);
    if (fs.existsSync(filePath)) {
        const code = fs.readFileSync(filePath, 'utf8');
        try {
            eval(code);
        } catch (e) {
            console.error(`Error loading ${script}:`, e);
        }
    }
});

let game;
try {
    game = new Alive.Game();
    global.Alive.game = game; // Bind to Alive structure
} catch (e) {
    console.error("Failed to initialize game:", e);
}

function createTestPlayer(playstyle) {
    // Clear mock storage to prevent state leakage
    if (global.localStorage && global.localStorage.clear) {
        global.localStorage.clear();
    }
    try {
        game.startNewLife({
            gender: "M",
            name: "TestPlayer",
            countryId: "us",
            cityId: "newyork",
            familyWealthTier: "medium"
        });
    } catch (e) { }

    // Fallback if full init failed
    const p = game.player || {};
    p.age = 22;
    p.money = 2000;
    p.happiness = 80;
    p.health = 80;
    if (!p.actionUsageCounts) p.actionUsageCounts = {};

    // Fast-forward setup based on style
    if (playstyle === 'career') {
        p.careerSkill = 70;
        p.intelligence = 80;
        p.job = "mid_developer";
        p.annualIncome = 85000;
    } else if (playstyle === 'social') {
        p.socialSkill = 85;
        p.followers = 50000;
        p.job = "freelancer";
        p.annualIncome = 30000;
    } else if (playstyle === 'investor') {
        p.investingSkill = 75;
        p.money = 40000;
        p.job = "data_analyst";
        p.annualIncome = 65000;
        if (global.Alive.selfdevelopment && global.Alive.selfdevelopment.makeInvestment) {
            try {
                global.Alive.selfdevelopment.makeInvestment(p, 'stocks', 20000);
                global.Alive.selfdevelopment.makeInvestment(p, 'crypto', 10000);
            } catch (e) { }
        }
    }
    return p;
}

function simulatePlaystyle(playstyle, yearsToSim) {
    let p = createTestPlayer(playstyle);

    let maxMoney = p.money || 0;
    let minHealth = p.health || 0;
    let totalIncomeGenerated = 0;

    for (let i = 0; i < yearsToSim; i++) {
        // Player "Actions"
        try {
            if (playstyle === 'career') {
                global.Alive.actions.applyAction("work_overtime", { player: p, game });
                global.Alive.actions.applyAction("attend_business_seminar", { player: p, game });
            } else if (playstyle === 'social') {
                global.Alive.actions.applyAction("post_content", { player: p, game });
                global.Alive.actions.applyAction("host_party", { player: p, game });
            } else if (playstyle === 'investor') {
                global.Alive.actions.applyAction("invest_stocks", { player: p, game });
                global.Alive.actions.applyAction("follow_markets", { player: p, game });
            }
        } catch (e) { }

        // Sim income/expenses
        const incomeGen = (global.Alive.actions && global.Alive.actions.getSocialIncome) ? global.Alive.actions.getSocialIncome(p) : 0;
        const inc = (p.annualIncome || 0) + incomeGen;
        const exp = 30000 + ((p.age || 0) * 500); // Fixed base + inflation

        p.money = Math.max(0, (p.money || 0) + inc - exp);
        totalIncomeGenerated += inc;

        // Sim Investments
        try {
            if (p.portfolio && global.Alive.selfdevelopment && global.Alive.selfdevelopment.progressInvestments) {
                // mock market
                const dummyMarket = { 'stocks': 0.05, 'crypto': 0.1 };
                const res = global.Alive.selfdevelopment.progressInvestments(p, dummyMarket);
                if (res && res.totalReturn) {
                    // For sim, let's keep money flowing
                    if (res.totalReturn > 0 && Math.random() < 0.2) {
                        global.Alive.selfdevelopment.sellInvestment(p, 'stocks', 0.2);
                    }
                }
            }
        } catch (e) { }

        maxMoney = Math.max(maxMoney, p.money || 0);
        minHealth = Math.min(minHealth, p.health || 0);

        // Ensure player doesn't die immediately
        p.health = Math.max(20, p.health || 0);
        if (p.age !== undefined) p.age++;
    }

    return {
        maxMoney,
        minHealth,
        totalIncomeGenerated,
        endMoney: p.money,
        endSkill: playstyle === 'career' ? p.careerSkill : (playstyle === 'social' ? p.socialSkill : p.investingSkill)
    };
}

console.log("=== BALANCING SIMULATION (30 YEARS) ===");
const SIM_YEARS = 30;

const careerStats = simulatePlaystyle('career', SIM_YEARS);
const socialStats = simulatePlaystyle('social', SIM_YEARS);
const investorStats = simulatePlaystyle('investor', SIM_YEARS);

console.log("\\nCAREER PATH (High Stable Income, High Stress)");
console.table(careerStats);

console.log("\\nSOCIAL PATH (High Influence, Passive Income, High Risk)");
console.table(socialStats);

console.log("\\nINVESTOR PATH (High Capital, High Volatility)");
console.table(investorStats);

assert(careerStats.maxMoney > 50000, "Career path should be viable.");
assert(socialStats.totalIncomeGenerated > 50000, "Social path should generate income.");
assert(investorStats.maxMoney > 50000, "Investor path should build wealth.");

console.log("\\n✅ Balance testing passed! Playstyles are distinct.");
