/**
 * Stats Module - Alive Life Simulator
 * Centralized stat system with diminishing returns, thresholds, and risk/reward
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});

    // ============================================================================
    // BALANCE PARAMETERS
    // ============================================================================

    const BALANCE = {
        // Thresholds that trigger consequences
        HEALTH_CRISIS_THRESHOLD: 15,
        BANKRUPTCY_THRESHOLD: 0,
        DEPRESSION_THRESHOLD: 10,

        // Diminishing returns curve
        DIMINISH_EXPONENT: 1.5,
        DIMINISH_DIVISOR: 50,

        // Risk/reward multipliers
        HIGH_RISK_FAIL_CHANCE: 0.35,
        MED_RISK_FAIL_CHANCE: 0.15,
        LOW_RISK_FAIL_CHANCE: 0.05,

        // Stat decay per year by age (tuned for ~35% fail rate)
        HEALTH_DECAY_BASE: 1,
        HEALTH_DECAY_AGE_50: 2,
        HEALTH_DECAY_AGE_70: 4, // TUNED: 3→4 (late-game danger)
        HEALTH_DECAY_AGE_85: 7, // TUNED: 5→7 (late-game danger)

        // Depression debuff
        DEPRESSION_EFFECTIVENESS: 0.5,

        // Intelligence job requirements
        INTEL_FOR_BASIC_JOBS: 20,
        INTEL_FOR_SKILLED_JOBS: 40,
        INTEL_FOR_PROFESSIONAL_JOBS: 60,
        INTEL_FOR_EXECUTIVE_JOBS: 80
    };

    // ============================================================================
    // DIMINISHING RETURNS
    // ============================================================================

    /**
     * Calculate the cost multiplier for raising a stat at a given level
     * Higher current values = more costly to improve
     */
    function getDiminishingMultiplier(currentValue) {
        const normalized = Math.max(0, currentValue) / BALANCE.DIMINISH_DIVISOR;
        return 1 + Math.pow(normalized, BALANCE.DIMINISH_EXPONENT);
    }

    /**
     * Apply a stat change with diminishing returns
     * Returns the actual change applied (may be less than requested)
     */
    function applyStatChange(player, statName, rawDelta, options = {}) {
        if (!player || typeof rawDelta !== 'number') return 0;

        const currentValue = player[statName] || 0;
        let actualDelta = rawDelta;

        // Apply diminishing returns for positive changes
        if (rawDelta > 0) {
            const multiplier = getDiminishingMultiplier(currentValue);
            actualDelta = Math.round(rawDelta / multiplier);
            // Minimum gain of 1 if raw delta was positive
            if (rawDelta > 0 && actualDelta < 1) actualDelta = 1;
        }

        // Apply depression debuff if applicable
        if (player.isDepressed && rawDelta > 0 && !options.ignoreDepression) {
            actualDelta = Math.round(actualDelta * BALANCE.DEPRESSION_EFFECTIVENESS);
        }

        // Apply the change
        const newValue = clamp(currentValue + actualDelta, 0, 100);
        player[statName] = newValue;

        return actualDelta;
    }

    /**
     * Calculate stat cost (how much of other stats it costs to raise one)
     */
    function getStatGainCost(currentValue, delta) {
        const multiplier = getDiminishingMultiplier(currentValue);
        return Math.ceil(Math.abs(delta) * multiplier);
    }

    // ============================================================================
    // THRESHOLD CHECKING
    // ============================================================================

    /**
     * Check if player has hit any critical stat thresholds
     * Returns array of threshold events to trigger
     */
    function checkStatThresholds(player) {
        const events = [];

        if (!player) return events;

        // Health Crisis (≤15%)
        if (player.health <= BALANCE.HEALTH_CRISIS_THRESHOLD) {
            if (!player.isHospitalized) {
                player.isHospitalized = true;
                events.push({
                    type: 'health_crisis',
                    severity: player.health <= 5 ? 'critical' : 'severe',
                    statValue: player.health
                });
            }
        } else {
            player.isHospitalized = false;
        }

        // Bankruptcy (≤$0)
        if (player.money <= BALANCE.BANKRUPTCY_THRESHOLD) {
            if (!player.isBankrupt) {
                player.isBankrupt = true;
                events.push({
                    type: 'bankruptcy',
                    severity: player.money <= -5000 ? 'critical' : 'warning',
                    statValue: player.money
                });
            }
        } else if (player.money > 1000) {
            // Clear bankruptcy only when back above $1000
            player.isBankrupt = false;
        }

        // Depression (Happiness ≤10%)
        if (player.happiness <= BALANCE.DEPRESSION_THRESHOLD) {
            if (!player.isDepressed) {
                player.isDepressed = true;
                events.push({
                    type: 'depression',
                    severity: player.happiness <= 5 ? 'critical' : 'moderate',
                    statValue: player.happiness
                });
            }
        } else if (player.happiness > 25) {
            // Clear depression when happiness > 25
            player.isDepressed = false;
        }

        return events;
    }

    /**
     * Get death risk based on current stats
     * Returns probability 0-1
     */
    function getDeathRisk(player) {
        if (!player) return 0;

        let risk = 0;

        // Base age risk
        if (player.age > 70) {
            risk += (player.age - 70) / 200; // 0.5% per year over 70
        }
        if (player.age > 90) {
            risk += (player.age - 90) / 50; // Additional 2% per year over 90
        }

        // Health crisis risk
        if (player.health <= 15) {
            risk += (15 - player.health) / 30; // Up to 50% at 0 health
        }
        if (player.health <= 5) {
            risk += 0.3; // Additional 30% at critical health
        }

        // Stress compounds health risk
        if (player.stress >= 90 && player.health <= 30) {
            risk += 0.1;
        }

        return clamp(risk, 0, 0.95);
    }

    // ============================================================================
    // RISK/REWARD SYSTEM
    // ============================================================================

    /**
     * Calculate outcome for a risky action
     * @param {string} riskLevel - 'low', 'medium', 'high'
     * @param {object} successEffects - effects on success
     * @param {object} failEffects - effects on failure
     * @param {object} player - player for intelligence check
     * @returns {object} - { success: boolean, effects: object }
     */
    function calculateRiskOutcome(riskLevel, successEffects, failEffects, player) {
        let failChance;

        switch (riskLevel) {
            case 'high':
                failChance = BALANCE.HIGH_RISK_FAIL_CHANCE;
                break;
            case 'medium':
                failChance = BALANCE.MED_RISK_FAIL_CHANCE;
                break;
            case 'low':
            default:
                failChance = BALANCE.LOW_RISK_FAIL_CHANCE;
        }

        // Intelligence reduces fail chance slightly
        if (player && player.intelligence) {
            const intelBonus = (player.intelligence - 50) / 500; // ±10% at 0/100 intel
            failChance -= intelBonus;
        }

        failChance = clamp(failChance, 0.01, 0.9);

        const roll = Math.random();
        const success = roll >= failChance;

        return {
            success,
            effects: success ? successEffects : failEffects,
            roll,
            failChance
        };
    }

    /**
     * Check if player qualifies for a job based on intelligence
     */
    function canQualifyForJob(player, jobTier) {
        if (!player) return false;

        const intel = player.intelligence || 0;

        switch (jobTier) {
            case 'basic':
                return intel >= BALANCE.INTEL_FOR_BASIC_JOBS;
            case 'skilled':
                return intel >= BALANCE.INTEL_FOR_SKILLED_JOBS;
            case 'professional':
                return intel >= BALANCE.INTEL_FOR_PROFESSIONAL_JOBS;
            case 'executive':
                return intel >= BALANCE.INTEL_FOR_EXECUTIVE_JOBS;
            default:
                return true;
        }
    }

    /**
     * Calculate self-development success chance based on intelligence
     */
    function getSelfDevSuccessChance(player, difficulty = 'normal') {
        if (!player) return 0.5;

        const baseChance = {
            easy: 0.8,
            normal: 0.6,
            hard: 0.4,
            expert: 0.2
        }[difficulty] || 0.6;

        // Intelligence bonus: 0 intel = -20%, 100 intel = +20%
        const intelBonus = (player.intelligence - 50) / 250;

        return clamp(baseChance + intelBonus, 0.1, 0.95);
    }

    // ============================================================================
    // YEARLY STAT UPDATES
    // ============================================================================

    /**
     * Apply yearly stat decay based on age and conditions
     */
    function applyYearlyStatDecay(player) {
        if (!player) return;

        // Age-based health decay (gentler curve)
        let healthDecay = BALANCE.HEALTH_DECAY_BASE;
        if (player.age >= 85) healthDecay = BALANCE.HEALTH_DECAY_AGE_85;
        else if (player.age >= 70) healthDecay = BALANCE.HEALTH_DECAY_AGE_70;
        else if (player.age >= 50) healthDecay = BALANCE.HEALTH_DECAY_AGE_50;

        // Only high stress accelerates health decay
        if (player.stress > 80) {
            healthDecay += Math.floor((player.stress - 80) / 20);
        }

        player.health = clamp((player.health || 100) - healthDecay, 0, 100);

        // Happiness decay - gentler rates
        let happinessDecay = 1;
        if (!player.job || player.job === 'unemployed') {
            happinessDecay += 2;
        }
        if (!player.partner && (!player.friends || player.friends.length === 0)) {
            happinessDecay += 2;
        }
        if (player.money < 0) {
            happinessDecay += 3;
        }

        player.happiness = clamp((player.happiness || 50) - happinessDecay, 0, 100);

        // Natural stress recovery each year - TUNED: slower recovery
        player.stress = clamp((player.stress || 0) - 3, 0, 100);
    }

    // ============================================================================
    // DEBUG SIMULATION
    // ============================================================================

    /**
     * Run automated simulation of N lives
     * Returns statistics for balancing
     */
    function runDebugSimulation(numLives = 1000) {
        const results = {
            lives: [],
            summary: null
        };

        for (let i = 0; i < numLives; i++) {
            const lifeResult = simulateSingleLife();
            results.lives.push(lifeResult);
        }

        // Calculate summary
        const ages = results.lives.map(l => l.age);
        // Only count premature deaths as failures (not old_age)
        const failedLives = results.lives.filter(l =>
            l.failState === 'health' || l.failState === 'bankruptcy' || l.failState === 'burnout'
        );

        results.summary = {
            totalLives: numLives,
            avgLifespan: Math.round(ages.reduce((a, b) => a + b, 0) / ages.length),
            minAge: Math.min(...ages),
            maxAge: Math.max(...ages),
            failRate: Math.round((failedLives.length / numLives) * 100),
            failCauses: {
                health: results.lives.filter(l => l.failState === 'health').length,
                bankruptcy: results.lives.filter(l => l.failState === 'bankruptcy').length,
                burnout: results.lives.filter(l => l.failState === 'burnout').length,
                old_age: results.lives.filter(l => l.failState === 'old_age').length
            },
            telemetry: {
                avgEventsPerLife: Math.round(results.lives.reduce((s, l) => s + (l.events || 0), 0) / numLives * 10) / 10,
                avgDiversity: Math.round(results.lives.reduce((s, l) => s + (l.diversity || 0), 0) / numLives * 100) / 100,
                avgMaxDrought: Math.round(results.lives.reduce((s, l) => s + (l.maxDrought || 0), 0) / numLives * 10) / 10
            },
            meanEndStats: {
                health: Math.round(results.lives.reduce((s, l) => s + l.endStats.health, 0) / numLives),
                money: Math.round(results.lives.reduce((s, l) => s + l.endStats.money, 0) / numLives),
                happiness: Math.round(results.lives.reduce((s, l) => s + l.endStats.happiness, 0) / numLives),
                intelligence: Math.round(results.lives.reduce((s, l) => s + l.endStats.intelligence, 0) / numLives)
            }
        };

        console.log('=== SIMULATION RESULTS ===');
        console.log(`Lives simulated: ${numLives}`);
        console.log(`Average lifespan: ${results.summary.avgLifespan} years`);
        console.log(`Fail rate (premature death): ${results.summary.failRate}%`);
        console.log(`Average events per life: ${results.summary.telemetry.avgEventsPerLife}`);
        console.log(`Average event diversity: ${results.summary.telemetry.avgDiversity} (1.0 = perfect)`);
        console.log(`Average max drought: ${results.summary.telemetry.avgMaxDrought} years`);
        console.log('End causes:', results.summary.failCauses);
        console.log('Mean end stats:', results.summary.meanEndStats);

        return results;
    }

    /**
     * Simulate a single life with random choices
     */
    function simulateSingleLife() {
        // Create mock player
        const player = {
            age: 0,
            health: 70 + Math.floor(Math.random() * 20),
            happiness: 60 + Math.floor(Math.random() * 20),
            intelligence: 40 + Math.floor(Math.random() * 30),
            stress: 10,
            money: 2500,
            burnoutYears: 0,
            job: null,
            partner: null,
            friends: [],
            isDepressed: false,
            isBankrupt: false,
            isHospitalized: false
        };

        let failState = null;
        const maxAge = 110;

        // Director setup for simulation
        let director = null;
        let totalEvents = 0;
        let uniqueEvents = new Set();
        let eventGaps = [];
        let lastEventAge = 0;

        if (Alive.EventDirector) {
            director = new Alive.EventDirector();
            director.tension = 30; // Initialize
        }

        // Simulate years
        while (player.age < maxAge && !failState) {
            player.age++;

            // Director evaluation
            if (director) {
                const results = director.evaluateYear(player, {
                    eventQueue: [],
                    activeEvent: null,
                    queueControlledEvent: (ev) => { }
                });
                for (const res of results) {
                    if (res.event) {
                        totalEvents++;
                        uniqueEvents.add(res.event.id || res.event);
                        if (totalEvents > 1) {
                            eventGaps.push(player.age - lastEventAge);
                        }
                        lastEventAge = player.age;

                        // Tell director we saw it so tension/repeats calculate properly
                        if (director._recordEvent) {
                            director._recordEvent(res.event.tag || 'minor_positive', res.event.id, player.age);
                        }
                        break;
                    }
                }
            }

            // Random action effects
            simulateYearActions(player);

            // Apply yearly decay
            applyYearlyStatDecay(player);

            // Check thresholds
            const thresholdEvents = checkStatThresholds(player);

            // Track burnout
            if (player.stress >= 100) {
                player.burnoutYears++;
            } else {
                player.burnoutYears = 0;
            }

            // Check fail states
            // Deaths after age 65 from health are "natural" (old_age), not fail states
            if (player.health <= 0) {
                failState = player.age >= 65 ? 'old_age' : 'health';
            } else if (player.money <= -5000) {
                failState = 'bankruptcy';
            } else if (player.burnoutYears >= 2) {
                failState = 'burnout';
            } else if (player.age >= maxAge) {
                failState = 'old_age';
            }

            // Random death check (age + health) - natural death after 70
            const deathRisk = getDeathRisk(player);
            if (Math.random() < deathRisk) {
                failState = player.age >= 65 ? 'old_age' : 'health';
            }
        }

        if (!failState && player.age >= maxAge) {
            failState = 'old_age';
        }

        const maxDrought = eventGaps.length > 0 ? Math.max(...eventGaps) : player.age;
        const diversity = totalEvents > 0 ? uniqueEvents.size / totalEvents : 0;

        return {
            age: player.age,
            failState,
            events: totalEvents,
            uniqueEvents: uniqueEvents.size,
            maxDrought: maxDrought,
            diversity: Math.round(diversity * 100) / 100,
            endStats: {
                health: player.health,
                money: player.money,
                happiness: player.happiness,
                intelligence: player.intelligence
            }
        };
    }

    /**
   * Simulate random actions for a year
   */
    function simulateYearActions(player) {
        // Children (0-17) have minimal expenses covered by family
        if (player.age < 18) {
            // School years - slight stat changes
            if (player.age >= 6) {
                player.intelligence = clamp(player.intelligence + 1, 0, 100);
            }
            // Rare childhood accidents (2%)
            if (Math.random() < 0.02) {
                player.health = clamp(player.health - 8, 0, 100);
            }
            return;
        }

        // Random job for adults
        if (!player.job && Math.random() < 0.80) {
            player.job = 'employed';
        }

        // Job loss risk (5%)
        if (player.job && Math.random() < 0.05) {
            player.job = null;
            player.stress = clamp(player.stress + 15, 0, 100);
            player.happiness = clamp(player.happiness - 10, 0, 100);
        }

        if (player.job) {
            // Earn money
            const baseIncome = 7000;
            const intelBonus = player.intelligence * 110;
            const income = baseIncome + intelBonus;
            player.money += income;
            // Work stress
            player.stress = clamp(player.stress + 4 + Math.floor(Math.random() * 6), 0, 100);
        } else {
            // Unemployed
            player.stress = clamp(player.stress + 8, 0, 100);
            player.happiness = clamp(player.happiness - 3, 0, 100);
        }

        // Living expenses
        const baseExpenses = 4500;
        const variableExpenses = Math.floor(Math.random() * 2000);
        player.money -= (baseExpenses + variableExpenses);

        // Random life events (8% chance of something significant)
        if (Math.random() < 0.08) {
            const eventType = Math.random();
            if (eventType < 0.25) {
                // Medical issue
                player.health = clamp(player.health - 12, 0, 100);
                player.money -= 2000;
            } else if (eventType < 0.45) {
                // Financial setback
                player.money -= 3000;
                player.stress = clamp(player.stress + 10, 0, 100);
            } else if (eventType < 0.60) {
                // Life stress
                player.happiness = clamp(player.happiness - 12, 0, 100);
                player.stress = clamp(player.stress + 15, 0, 100);
            } else {
                // Positive event (40%)
                player.money += 5000;
                player.happiness = clamp(player.happiness + 8, 0, 100);
            }
        }

        // Regular choices
        const choiceType = Math.random();

        if (choiceType < 0.22) {
            // Health-focused
            player.health = clamp(player.health + 7, 0, 100);
            player.money -= 350;
        } else if (choiceType < 0.42) {
            // Fun/social
            player.happiness = clamp(player.happiness + 10, 0, 100);
            player.money -= 400;
            player.stress = clamp(player.stress - 8, 0, 100);
        } else if (choiceType < 0.60) {
            // Work/learning
            player.intelligence = clamp(player.intelligence + 2, 0, 100);
            player.stress = clamp(player.stress + 6, 0, 100);
        } else if (choiceType < 0.75) {
            // Moderate risk choice (15% of choices)
            if (Math.random() < 0.35) {
                player.health -= 8;
                player.money -= 1500;
                player.happiness -= 5;
            } else {
                player.money += 2500;
                player.happiness += 4;
            }
        } else if (choiceType < 0.88) {
            // Relaxation
            player.stress = clamp(player.stress - 12, 0, 100);
            player.happiness = clamp(player.happiness + 4, 0, 100);
        } else {
            // Neglect - mild declines
            player.happiness -= 3;
            player.health -= 2;
        }
    }

    // ============================================================================
    // UTILITY
    // ============================================================================

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    // ============================================================================
    // EXPORT
    // ============================================================================

    Alive.stats = {
        // Constants
        BALANCE,

        // Diminishing returns
        getDiminishingMultiplier,
        applyStatChange,
        getStatGainCost,

        // Thresholds
        checkStatThresholds,
        getDeathRisk,

        // Risk/reward
        calculateRiskOutcome,
        canQualifyForJob,
        getSelfDevSuccessChance,

        // Yearly updates
        applyYearlyStatDecay,

        // Debug simulation
        runDebugSimulation,
        simulateSingleLife
    };

})(window);
