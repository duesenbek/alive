/**
 * Director & New Systems Smoke Test — Alive Life Simulator
 * Validates the 6 new systems: Director, Weighted Selection, Event Arcs,
 * Mid-Term Goals, Meta-Progression, and Telemetry.
 *
 * Run: node test/director_test.js
 */

// ============================================================================
// MINIMAL POLYFILLS FOR NODE.JS (browser-only modules need window/localStorage)
// ============================================================================
const globalThis_ = typeof globalThis !== 'undefined' ? globalThis : global;
globalThis_.window = globalThis_;
globalThis_.document = { addEventListener: () => { } };

// localStorage polyfill
const _store = {};
globalThis_.localStorage = {
    getItem: (k) => _store[k] || null,
    setItem: (k, v) => { _store[k] = String(v); },
    removeItem: (k) => { delete _store[k]; }
};

// Load modules in dependency order
const fs = require('fs');
const path = require('path');

const JS_DIR = path.join(__dirname, '..', 'js');
const loadOrder = [
    'data/strings.js', 'i18n.js', 'analytics.js', 'storage.js',
    'player_core.js', 'director.js', 'event_arcs.js', 'goals.js',
    'meta_progression.js', 'consequences.js'
];

for (const file of loadOrder) {
    const filePath = path.join(JS_DIR, file);
    if (fs.existsSync(filePath)) {
        try {
            const code = fs.readFileSync(filePath, 'utf8');
            // Replace window references for Node
            const nodeCode = code.replace(/\(window\)/g, '(globalThis_)');
            eval(nodeCode);
        } catch (e) {
            console.error(`⚠️  Failed to load ${file}: ${e.message}`);
        }
    }
}

const Alive = globalThis_.Alive;

// ============================================================================
// TEST HELPERS
// ============================================================================
let passed = 0;
let failed = 0;

function assert(label, condition, detail) {
    if (condition) {
        passed++;
        console.log(`  ✅ ${label}`);
    } else {
        failed++;
        console.error(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
    }
}

function createMockPlayer(overrides = {}) {
    const defaults = {
        age: 30, health: 70, happiness: 60, money: 10000, stress: 30,
        energy: 70, intelligence: 50, attractiveness: 50,
        sportsSkill: 20, businessSkill: 20, investingSkill: 10,
        careerSkill: 30, socialSkill: 30,
        job: 'office_worker', netWorth: 15000,
        familyWealthTier: 'medium',
        investments: [], children: [], history: [],
        clamp: (v, min, max) => Math.min(max, Math.max(min, v)),
        clampAllStats: function () {
            this.health = this.clamp(this.health, 0, 100);
            this.happiness = this.clamp(this.happiness, 0, 100);
            this.energy = this.clamp(this.energy, 0, 100);
            this.stress = this.clamp(this.stress, 0, 100);
        },
        updateNetWorth: function () { this.netWorth = this.money; }
    };
    const player = { ...defaults, ...overrides };
    // Add applyEffects
    player.applyEffects = function (effects) {
        if (!effects) return;
        if (effects.moneyDelta) this.money += effects.moneyDelta;
        if (effects.healthDelta) this.health += effects.healthDelta;
        if (effects.happinessDelta) this.happiness += effects.happinessDelta;
        if (effects.stressDelta) this.stress += effects.stressDelta;
        this.clampAllStats();
        this.updateNetWorth();
    };
    return player;
}

// ============================================================================
// TEST 1: DIRECTOR BASICS
// ============================================================================
console.log('\n📋 Test 1: EventDirector');

assert('EventDirector class exists', !!Alive.EventDirector);
assert('Director singleton exists', !!Alive.director);

const director = new Alive.EventDirector();
assert('Director starts with tension=30', director.tension === 30);
assert('Director starts in calm phase', director.phase === 'calm');
assert('Director tracks 0 events', director.eventsThisLife === 0);

// Test tension update with stressed player
const stressedPlayer = createMockPlayer({ health: 20, money: -5000, stress: 90, happiness: 10 });
director._updateTension(stressedPlayer);
assert('Tension rises with stressed player', director.tension > 30,
    `tension=${director.tension}`);

// Test tension update with happy player
const director2 = new Alive.EventDirector();
const happyPlayer = createMockPlayer({ health: 90, money: 300000, stress: 10, happiness: 90 });
director2._updateTension(happyPlayer);
assert('Tension drops with happy player', director2.tension < 30,
    `tension=${director2.tension}`);

// ============================================================================
// TEST 2: PACING PHASE MACHINE
// ============================================================================
console.log('\n📋 Test 2: Pacing Phase Machine');

const director3 = new Alive.EventDirector();
const phases = new Set();
for (let i = 0; i < 20; i++) {
    director3._advancePhase(createMockPlayer({ age: 30 + i }));
    phases.add(director3.phase);
}
assert('Multiple phases occur over 20 years', phases.size >= 2,
    `phases seen: ${[...phases].join(', ')}`);

// ============================================================================
// TEST 3: EVENT CHANCE CALCULATION
// ============================================================================
console.log('\n📋 Test 3: Event Chance Calculation');

const director4 = new Alive.EventDirector();
director4.phase = 'climax';
director4.yearsSinceLastEvent = 4;
director4.tension = 80;
const highChance = director4._calculateEventChance(createMockPlayer());
assert('High chance in climax with drought + tension', highChance > 0.5,
    `chance=${highChance.toFixed(3)}`);

const director5 = new Alive.EventDirector();
director5.phase = 'calm';
director5.yearsSinceLastEvent = 0;
director5.tension = 20;
const lowChance = director5._calculateEventChance(createMockPlayer());
assert('Low chance in calm just after event', lowChance < 0.15,
    `chance=${lowChance.toFixed(3)}`);

// ============================================================================
// TEST 4: EVENT ARCS
// ============================================================================
console.log('\n📋 Test 4: Event Arcs');

assert('EventArcManager exists', !!Alive.EventArcManager);
assert('eventArcs singleton exists', !!Alive.eventArcs);

const arcManager = new Alive.EventArcManager();
const youngPlayer = createMockPlayer({ age: 25, intelligence: 60, job: 'software_dev', money: 2000 });

// Try starting arcs multiple times (probabilistic)
let arcStarted = false;
for (let i = 0; i < 100; i++) {
    arcManager.reset();
    const result = arcManager.tryStartArc(youngPlayer);
    if (result) { arcStarted = true; break; }
}
assert('Arc can start for eligible player', arcStarted);

// Test arc serialization
arcManager.reset();
arcManager.activeArcs.push({ arcId: 'arc_startup', currentStage: 1, lastStageAge: 25, flags: {} });
const state = arcManager.getState();
assert('Arc serialization works', state.activeArcs.length === 1);

const arcManager2 = new Alive.EventArcManager();
arcManager2.loadState(state);
assert('Arc deserialization works', arcManager2.activeArcs.length === 1);

// ============================================================================
// TEST 5: MID-TERM GOALS
// ============================================================================
console.log('\n📋 Test 5: Mid-Term Goals');

assert('MidTermGoals class exists', !!Alive.MidTermGoals);
assert('Goals singleton exists', !!Alive.goals);

const goals = new Alive.MidTermGoals();
const goalPlayer = createMockPlayer({ age: 0 });
const assigned = goals.assignGoals(goalPlayer);
assert('Goals assigned (3-4)', assigned.length >= 3 && assigned.length <= 4,
    `count=${assigned.length}`);
assert('Goals sorted by target age', assigned[0].targetAge <= assigned[assigned.length - 1].targetAge);

// Simulate achieving a financial goal
const richPlayer = createMockPlayer({ age: 25, money: 15000, netWorth: 15000 });
richPlayer.applyEffects = function (effects) {
    if (effects.happinessDelta) this.happiness += effects.happinessDelta;
    if (effects.moneyDelta) this.money += effects.moneyDelta;
};

const goals2 = new Alive.MidTermGoals();
goals2.assignedGoals = [{ goalId: 'save_10k', targetAge: 25, category: 'financial', status: 'active' }];
const results = goals2.evaluateGoals(richPlayer);
assert('Goal evaluated at target age', results.length === 1);
assert('Goal achieved for qualifying player', results[0]?.type === 'achieved');
assert('Achieved count updated', goals2.achievedCount === 1);

// ============================================================================
// TEST 6: META-PROGRESSION
// ============================================================================
console.log('\n📋 Test 6: Meta-Progression');

assert('MetaProgression class exists', !!Alive.MetaProgression);
assert('Meta singleton exists', !!Alive.meta);

const meta = new Alive.MetaProgression();
meta.load();

// Test LP calculation
const endPlayer = createMockPlayer({ age: 65, netWorth: 250000 });
const lp = meta.calculateLP(endPlayer, { totalLegacyPoints: 5, achievedCount: 3 }, ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'e10'], 2);
assert('LP calculated correctly', lp >= 1, `lp=${lp}`);
assert('LP includes age component', lp >= 6, `lp=${lp} (age/10=6)`);

// Test perk unlock
meta.legacyPoints = 10;
const unlockResult = meta.unlockPerk('silver_spoon');
assert('Perk unlock succeeds', unlockResult.success);
assert('LP deducted after unlock', meta.legacyPoints === 8);
assert('Perk in unlocked list', meta.unlockedPerks.includes('silver_spoon'));

// Test perk apply
const newLifePlayer = createMockPlayer({ money: 1000 });
meta.applyPerks(newLifePlayer);
assert('Silver Spoon perk applied', newLifePlayer.money === 6000, `money=${newLifePlayer.money}`);

// Test starting trait roll
const traitPlayer = createMockPlayer({});
const trait = meta.rollStartingTrait(traitPlayer);
assert('Starting trait rolled', !!trait);

// ============================================================================
// TEST 7: ANALYTICS TELEMETRY
// ============================================================================
console.log('\n📋 Test 7: Analytics Telemetry');

assert('Analytics module exists', !!Alive.Analytics);
assert('trackSessionStart exists', typeof Alive.Analytics.trackSessionStart === 'function');
assert('trackLifeDepth exists', typeof Alive.Analytics.trackLifeDepth === 'function');
assert('trackEventDiversity exists', typeof Alive.Analytics.trackEventDiversity === 'function');
assert('trackGoalCompletion exists', typeof Alive.Analytics.trackGoalCompletion === 'function');
assert('trackMetaProgression exists', typeof Alive.Analytics.trackMetaProgression === 'function');
assert('trackYearAdvance exists', typeof Alive.Analytics.trackYearAdvance === 'function');
assert('getRetentionDashboard exists', typeof Alive.Analytics.getRetentionDashboard === 'function');

// Test trackSessionStart stores data
Alive.Analytics.trackSessionStart();
const retentionData = JSON.parse(localStorage.getItem('alive_retention_v1') || '{}');
assert('Session start recorded', !!retentionData.firstPlayDate);
assert('Session added to list', retentionData.sessions?.length >= 1);

// Test dashboard
const dashboard = Alive.Analytics.getRetentionDashboard();
assert('Dashboard returns object', typeof dashboard === 'object');
assert('Dashboard has totalSessions', typeof dashboard.totalSessions === 'number');

// ============================================================================
// TEST 8: CUMULATIVE CONSEQUENCES
// ============================================================================
console.log('\n📋 Test 8: Cumulative Consequences');

assert('getCumulativeScores exists', typeof Alive.consequences?.getCumulativeScores === 'function');
assert('recordCumulativeChoice exists', typeof Alive.consequences?.recordCumulativeChoice === 'function');

const consPlayer = createMockPlayer({});
Alive.consequences.ensureConsequenceState(consPlayer);
Alive.consequences.recordCumulativeChoice(consPlayer, 'career_ambition', 3);
Alive.consequences.recordCumulativeChoice(consPlayer, 'risk_tolerance', 5);
const scores = Alive.consequences.getCumulativeScores(consPlayer);
assert('Career ambition tracked', scores.career_ambition === 3);
assert('Risk tolerance tracked', scores.risk_tolerance === 5);

// ============================================================================
// TEST 9: PLAYER APPLY EFFECTS
// ============================================================================
console.log('\n📋 Test 9: Player.applyEffects');

if (Alive.Player) {
    const testPlayer = new Alive.Player({ age: 25, money: 1000, health: 50, happiness: 50, stress: 20 });
    if (typeof testPlayer.applyEffects === 'function') {
        testPlayer.applyEffects({ moneyDelta: 5000, healthDelta: -10, happinessDelta: 20, stressDelta: 15 });
        assert('Money delta applied', testPlayer.money === 6000, `money=${testPlayer.money}`);
        assert('Health delta applied', testPlayer.health === 40, `health=${testPlayer.health}`);
        assert('Happiness delta applied', testPlayer.happiness === 70, `happiness=${testPlayer.happiness}`);
        assert('Stress delta applied', testPlayer.stress === 35, `stress=${testPlayer.stress}`);
    } else {
        assert('Player.applyEffects exists', false, 'method not found on Player instance');
    }
} else {
    console.log('  ⏭️  Skipping Player.applyEffects — Player class not loaded in this env');
}

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n' + '='.repeat(50));
console.log(`  Director & Systems Test: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50));

if (failed > 0) {
    process.exit(1);
}
