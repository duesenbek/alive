/**
 * Needs Module - Alive Life Simulator
 * Sims-inspired needs system - make players CARE about their character
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});

    // ============================================================================
    // NEEDS DEFINITIONS
    // ============================================================================

    const NEEDS = {
        ENERGY: {
            id: "energy",
            icon: "⚡",
            nameKey: "needs.energy",
            baseDecay: -8,
            color: "#ffd43b",
            crisisThreshold: 20
        },
        SOCIAL: {
            id: "social",
            icon: "👥",
            nameKey: "needs.social",
            baseDecay: -5,
            color: "#ff6b9d",
            crisisThreshold: 20
        },
        COMFORT: {
            id: "comfort",
            icon: "🛋️",
            nameKey: "needs.comfort",
            baseDecay: -3,
            color: "#845ef7",
            crisisThreshold: 20
        },
        HEALTH: {
            id: "health",
            icon: "❤️",
            nameKey: "needs.health",
            baseDecay: -2,
            color: "#ff5252",
            crisisThreshold: 25
        },
        FUN: {
            id: "fun",
            icon: "🎮",
            nameKey: "needs.fun",
            baseDecay: -6,
            color: "#4ade80",
            crisisThreshold: 20
        }
    };

    const NEED_IDS = ["energy", "social", "comfort", "health", "fun"];

    // ============================================================================
    // STATUS DEFINITIONS
    // ============================================================================

    const NEED_STATUS = {
        CRITICAL: { id: "critical", threshold: 20, nameKey: "needs.status.critical", cssClass: "critical" },
        LOW: { id: "low", threshold: 40, nameKey: "needs.status.low", cssClass: "low" },
        NORMAL: { id: "normal", threshold: 70, nameKey: "needs.status.normal", cssClass: "normal" },
        HIGH: { id: "high", threshold: 100, nameKey: "needs.status.high", cssClass: "high" }
    };

    // ============================================================================
    // AILMENTS & LIFESTYLE DEFINITIONS
    // ============================================================================

    const AILMENTS = {
        HIGH_BP: { id: "high_bp", nameKey: "ailment.high_bp", healthDecay: -5, costPerYear: 500 },
        DEPRESSION: { id: "depression", nameKey: "ailment.depression", funDecay: -5, socialDecay: -5, costPerYear: 1000 },
        ARTHRITIS: { id: "arthritis", nameKey: "ailment.arthritis", comfortDecay: -4, energyDecay: -3, costPerYear: 300 },
        DIABETES: { id: "diabetes", nameKey: "ailment.diabetes", healthDecay: -8, costPerYear: 1500 }
    };

    const DIETS = {
        JUNK_FOOD: { id: "junk_food", nameKey: "diet.junk_food", costModifier: 0.5, healthModifier: -5, energyModifier: -2 },
        BALANCED: { id: "balanced", nameKey: "diet.balanced", costModifier: 1.0, healthModifier: 0, energyModifier: 0 },
        ORGANIC: { id: "organic", nameKey: "diet.organic", costModifier: 2.5, healthModifier: 5, energyModifier: 3 }
    };

    // ============================================================================
    // CORE FUNCTIONS
    // ============================================================================

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Ensure player has needs state initialized
     */
    function ensureNeedsState(player) {
        if (!player) return;

        if (!player.needs || typeof player.needs !== "object") {
            player.needs = {
                energy: 80,
                social: 70,
                comfort: 60,
                health: 75,
                fun: 70
            };
        }

        // Ensure all needs exist
        NEED_IDS.forEach(id => {
            if (typeof player.needs[id] !== "number") {
                player.needs[id] = 70;
            }
            player.needs[id] = clamp(player.needs[id], 0, 100);
        });

        if (typeof player.needsLastUpdated !== "number") {
            player.needsLastUpdated = player.age || 0;
        }

        if (!player.ailments) player.ailments = [];
        if (!player.diet) player.diet = "balanced";
    }

    /**
     * Get a need's current value
     */
    function getNeedLevel(player, needId) {
        ensureNeedsState(player);
        return player.needs[needId] || 0;
    }

    /**
     * Get a need's status (critical, low, normal, high)
     */
    function getNeedStatus(player, needId) {
        const value = getNeedLevel(player, needId);

        if (value < NEED_STATUS.CRITICAL.threshold) return NEED_STATUS.CRITICAL;
        if (value < NEED_STATUS.LOW.threshold) return NEED_STATUS.LOW;
        if (value < NEED_STATUS.NORMAL.threshold) return NEED_STATUS.NORMAL;
        return NEED_STATUS.HIGH;
    }

    /**
     * Modify a specific need
     */
    function modifyNeed(player, needId, delta) {
        ensureNeedsState(player);

        if (!NEED_IDS.includes(needId)) {
            console.warn(`Unknown need: ${needId}`);
            return;
        }

        const oldValue = player.needs[needId];
        player.needs[needId] = clamp(oldValue + delta, 0, 100);

        // Sync health need with player health stat
        if (needId === "health") {
            player.health = clamp(player.health + delta, 0, 100);
        }

        return player.needs[needId];
    }

    /**
     * Apply bulk needs effects
     */
    function applyNeedsEffects(player, effects) {
        if (!effects || typeof effects !== "object") return;

        ensureNeedsState(player);

        NEED_IDS.forEach(id => {
            if (typeof effects[id] === "number") {
                modifyNeed(player, id, effects[id]);
            }
        });
    }

    // ============================================================================
    // DECAY LOGIC
    // ============================================================================

    /**
     * Calculate yearly decay for a specific need
     */
    function getYearlyDecay(player, needId) {
        ensureNeedsState(player);

        const need = Object.values(NEEDS).find(n => n.id === needId);
        if (!need) return 0;

        let decay = need.baseDecay;

        // Modifiers based on life situation
        switch (needId) {
            case "energy":
                // Working drains more energy
                if (player.job && player.job !== "unemployed") decay -= 5;
                // Stress drains energy
                if (player.stress > 60) decay -= 3;
                // Age affects energy recovery
                if (player.age > 60) decay -= 2;
                if (player.diet) {
                    const dietDef = Object.values(DIETS).find(d => d.id === player.diet);
                    if (dietDef) decay += dietDef.energyModifier;
                }
                player.ailments?.forEach(a => {
                    const ailmentDef = Object.values(AILMENTS).find(def => def.id === a);
                    if (ailmentDef && ailmentDef.energyDecay) decay += ailmentDef.energyDecay;
                });
                break;

            case "social":
                // No partner = more lonely
                if (!player.partner) decay -= 3;
                // No friends = more lonely
                const friendCount = player.friends?.filter(f => f.alive !== false).length || 0;
                // ... logic to use friendCount
                if (friendCount === 0) decay -= 4;
                // Has family helps
                if (player.children?.length > 0) decay += 2;
                player.ailments?.forEach(a => {
                    const ailmentDef = Object.values(AILMENTS).find(def => def.id === a);
                    if (ailmentDef && ailmentDef.socialDecay) decay += ailmentDef.socialDecay;
                });
                break;

            case "comfort":
                // Housing quality affects comfort decay
                if (player.housing === "homeless") decay -= 10;
                if (player.housing === "apartment") decay -= 2;
                if (player.housing === "house") decay += 2;
                if (player.housing === "mansion") decay += 5;
                // Money helps comfort
                if (player.money < 1000) decay -= 5;
                player.ailments?.forEach(a => {
                    const ailmentDef = Object.values(AILMENTS).find(def => def.id === a);
                    if (ailmentDef && ailmentDef.comfortDecay) decay += ailmentDef.comfortDecay;
                });
                break;

            case "health":
                // Age affects health decay
                if (player.age > 50) decay -= 1;
                if (player.age > 70) decay -= 3;
                if (player.age > 85) decay -= 5;
                // Stress hurts health
                if (player.stress > 70) decay -= 3;
                // Sync with existing health stat
                const healthDiff = (player.health || 50) - (player.needs?.health || 50);
                decay += Math.floor(healthDiff / 20);
                if (player.diet) {
                    const dietDef = Object.values(DIETS).find(d => d.id === player.diet);
                    if (dietDef) decay += dietDef.healthModifier;
                }
                player.ailments?.forEach(a => {
                    const ailmentDef = Object.values(AILMENTS).find(def => def.id === a);
                    if (ailmentDef && ailmentDef.healthDecay) decay += ailmentDef.healthDecay;
                });
                break;

            case "fun":
                // Working = less fun
                if (player.job && player.job !== "unemployed") decay -= 4;
                // Hobby helps maintain fun
                if (player.mainHobbyId) decay += 3;
                player.ailments?.forEach(a => {
                    const ailmentDef = Object.values(AILMENTS).find(def => def.id === a);
                    if (ailmentDef && ailmentDef.funDecay) decay += ailmentDef.funDecay;
                });
                break;
        }

        return decay;
    }

    /**
     * Apply yearly needs decay (called by game loop)
     */
    function applyNeedsDecay(player) {
        ensureNeedsState(player);

        NEED_IDS.forEach(id => {
            const decay = getYearlyDecay(player, id);
            modifyNeed(player, id, decay);
        });

        player.needsLastUpdated = player.age;

        return true;
    }

    // ============================================================================
    // CRISIS DETECTION
    // ============================================================================

    /**
     * Check if any needs are in crisis state
     */
    function checkNeedsCrises(player) {
        ensureNeedsState(player);

        const crises = [];

        NEED_IDS.forEach(id => {
            const need = Object.values(NEEDS).find(n => n.id === id);
            const value = player.needs[id];

            if (value < need.crisisThreshold) {
                crises.push({
                    needId: id,
                    need: need,
                    value: value,
                    severity: value < 10 ? "severe" : "moderate"
                });
            }
        });

        return crises;
    }

    /**
     * Check if a specific need is critical
     */
    function isNeedCritical(player, needId) {
        ensureNeedsState(player);

        const need = Object.values(NEEDS).find(n => n.id === needId);
        if (!need) return false;

        return player.needs[needId] < need.crisisThreshold;
    }

    /**
     * Get all critical needs
     */
    function getCriticalNeeds(player) {
        ensureNeedsState(player);

        return NEED_IDS.filter(id => isNeedCritical(player, id));
    }

    /**
     * Get crisis events that should be triggered based on current needs
     */
    function getCrisisEvents(player) {
        ensureNeedsState(player);

        const events = [];
        const crises = checkNeedsCrises(player);

        crises.forEach(crisis => {
            switch (crisis.needId) {
                case "energy":
                    if (crisis.severity === "severe") {
                        events.push({ eventId: "needs_exhaustion_crisis", crisis });
                    }
                    break;
                case "social":
                    if (crisis.severity === "severe") {
                        events.push({ eventId: "needs_depression_crisis", crisis });
                    }
                    break;
                case "comfort":
                    if (crisis.severity === "severe") {
                        events.push({ eventId: "needs_burnout_crisis", crisis });
                    }
                    break;
                case "health":
                    if (crisis.value < 15) {
                        events.push({ eventId: "needs_health_crisis", crisis });
                    }
                    break;
                case "fun":
                    if (crisis.severity === "severe") {
                        events.push({ eventId: "needs_boredom_crisis", crisis });
                    }
                    break;
            }
        });

        return events;
    }

    // ============================================================================
    // DISPLAY HELPERS
    // ============================================================================

    /**
     * Get all needs with their current values and statuses for UI
     */
    function getAllNeedsDisplay(player) {
        ensureNeedsState(player);

        return NEED_IDS.map(id => {
            const need = Object.values(NEEDS).find(n => n.id === id);
            const value = player.needs[id];
            const status = getNeedStatus(player, id);

            return {
                id: id,
                value: value,
                icon: need.icon,
                label: need.nameKey,
                color: need.color,
                status: status.id,
                statusLabel: status.nameKey,
                isCritical: value < need.crisisThreshold
            };
        });
    }

    /**
     * Get a formatted string describing current needs state
     */
    function getNeedsSummary(player) {
        ensureNeedsState(player);

        const critical = getCriticalNeeds(player);
        const low = NEED_IDS.filter(id => {
            const value = player.needs[id];
            return value >= 20 && value < 40;
        });

        if (critical.length > 0) {
            return {
                status: "crisis",
                message: `Critical: ${critical.join(", ")}`,
                criticalCount: critical.length,
                lowCount: low.length
            };
        }

        if (low.length > 0) {
            return {
                status: "warning",
                message: `Low: ${low.join(", ")}`,
                criticalCount: 0,
                lowCount: low.length
            };
        }

        return {
            status: "good",
            message: "All needs satisfied",
            criticalCount: 0,
            lowCount: 0
        };
    }

    // ============================================================================
    // EXPORT
    // ============================================================================

    Alive.needs = {
        // Constants
        NEEDS,
        NEED_IDS,
        NEED_STATUS,

        // Core functions
        ensureNeedsState,
        getNeedLevel,
        getNeedStatus,
        modifyNeed,
        applyNeedsEffects,

        // Decay
        getYearlyDecay,
        applyNeedsDecay,

        // Crisis detection
        checkNeedsCrises,
        isNeedCritical,
        getCriticalNeeds,
        getCrisisEvents,

        // Display helpers
        getAllNeedsDisplay,
        getNeedsSummary,

        AILMENTS,
        DIETS
    };

})(window);
