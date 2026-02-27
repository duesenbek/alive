/**
 * Consequences Module - Alive Life Simulator
 * Deep consequence system that tracks decisions and creates long-term ripple effects
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});

    // ============================================================================
    // CONSEQUENCE TYPES
    // ============================================================================

    const CONSEQUENCE_TYPES = {
        CAREER: "career",
        HEALTH: "health",
        SOCIAL: "social",
        FINANCIAL: "financial",
        LEGAL: "legal",
        EDUCATION: "education"
    };

    // ============================================================================
    // CONSEQUENCE FLAG DEFINITIONS
    // ============================================================================

    const FLAG_DEFINITIONS = {
        // Education Flags
        dropped_out: {
            type: CONSEQUENCE_TYPES.EDUCATION,
            description: "Dropped out of school",
            effects: { salaryMult: 0.8, promotionChanceMod: -0.2 },
            duration: "permanent"
        },
        cheated_school: {
            type: CONSEQUENCE_TYPES.EDUCATION,
            description: "Caught cheating in school",
            effects: { intelligenceCap: -5, reputationMod: -10 },
            duration: "permanent"
        },
        expelled: {
            type: CONSEQUENCE_TYPES.EDUCATION,
            description: "Expelled from school",
            effects: { salaryMult: 0.7, blocksHigherEducation: true },
            duration: "permanent"
        },
        valedictorian: {
            type: CONSEQUENCE_TYPES.EDUCATION,
            description: "Graduated as valedictorian",
            effects: { intelligenceMod: 5, reputationMod: 15 },
            duration: "permanent"
        },

        // Career Flags
        fired_once: {
            type: CONSEQUENCE_TYPES.CAREER,
            description: "Fired from a job",
            effects: { salaryMult: 0.9, hiringDifficultyMod: 0.2 },
            duration: 5 // years
        },
        fired_twice: {
            type: CONSEQUENCE_TYPES.CAREER,
            description: "Fired from multiple jobs",
            effects: { salaryMult: 0.75, hiringDifficultyMod: 0.5, mustWaitYears: 2 },
            duration: 10
        },
        job_hopper: {
            type: CONSEQUENCE_TYPES.CAREER,
            description: "Changed jobs frequently",
            effects: { promotionChanceMod: -0.3, reputationMod: -5 },
            duration: 8
        },
        reliable_employee: {
            type: CONSEQUENCE_TYPES.CAREER,
            description: "Steady employment history",
            effects: { promotionChanceMod: 0.2, salaryMult: 1.1 },
            duration: "while_employed"
        },
        executive_track: {
            type: CONSEQUENCE_TYPES.CAREER,
            description: "On track for executive positions",
            effects: { unlockExecutiveJobs: true },
            duration: "permanent"
        },
        unreliable: {
            type: CONSEQUENCE_TYPES.CAREER,
            description: "Known for being unreliable",
            effects: { promotionChanceMod: -0.4, firedChanceMod: 0.2 },
            duration: 5
        },

        // Health Flags
        health_neglect: {
            type: CONSEQUENCE_TYPES.HEALTH,
            description: "Neglected health for years",
            effects: { chronicConditionRisk: 0.3, healthDecayMod: 1.5 },
            duration: "permanent"
        },
        chronic_condition: {
            type: CONSEQUENCE_TYPES.HEALTH,
            description: "Has a chronic health condition",
            effects: { healthCap: -20, medicalCostsMod: 2.0, jobRestrictions: true },
            duration: "permanent"
        },
        fitness_focused: {
            type: CONSEQUENCE_TYPES.HEALTH,
            description: "Maintains excellent fitness",
            effects: { healthDecayMod: 0.7, attractivenessMod: 5 },
            duration: "while_active"
        },
        addiction: {
            type: CONSEQUENCE_TYPES.HEALTH,
            description: "Struggling with addiction",
            effects: { happinessCap: -15, relationshipMod: -20, jobPerformanceMod: -0.3 },
            duration: "until_treated"
        },

        // Social Flags
        betrayer: {
            type: CONSEQUENCE_TYPES.SOCIAL,
            description: "Betrayed a close friend",
            effects: { friendTrustMod: -30, newFriendChanceMod: -0.3 },
            duration: 10
        },
        loyal_friend: {
            type: CONSEQUENCE_TYPES.SOCIAL,
            description: "Known as a loyal friend",
            effects: { friendTrustMod: 20, networkingBonusMod: 0.3 },
            duration: "while_active"
        },
        neglectful: {
            type: CONSEQUENCE_TYPES.SOCIAL,
            description: "Neglects relationships",
            effects: { relationshipDecayMod: 1.5, familyHelpChanceMod: -0.5 },
            duration: 5
        },
        social_climber: {
            type: CONSEQUENCE_TYPES.SOCIAL,
            description: "Known for social climbing",
            effects: { wealthyFriendChanceMod: 0.3, genuineFriendMod: -0.2 },
            duration: "permanent"
        },

        // Financial Flags
        bankrupt: {
            type: CONSEQUENCE_TYPES.FINANCIAL,
            description: "Declared bankruptcy",
            effects: { creditMod: -50, loanAccessBlocked: true },
            duration: 7
        },
        debt_ridden: {
            type: CONSEQUENCE_TYPES.FINANCIAL,
            description: "Significant debt",
            effects: { stressMod: 15, savingsMod: -0.5 },
            duration: "until_paid"
        },
        financially_savvy: {
            type: CONSEQUENCE_TYPES.FINANCIAL,
            description: "Smart with money",
            effects: { investmentReturnMod: 0.2, scamResistanceMod: 0.5 },
            duration: "permanent"
        },
        wealthy_reputation: {
            type: CONSEQUENCE_TYPES.FINANCIAL,
            description: "Known as wealthy",
            effects: { socialAccessMod: 0.3, targetForScamsMod: 0.3 },
            duration: "while_wealthy"
        },

        // Legal Flags
        criminal_record: {
            type: CONSEQUENCE_TYPES.LEGAL,
            description: "Has a criminal record",
            effects: { blocksExecutiveJobs: true, blocksGovernmentJobs: true, reputationMod: -30 },
            duration: "permanent"
        },
        arrested: {
            type: CONSEQUENCE_TYPES.LEGAL,
            description: "Been arrested",
            effects: { reputationMod: -15, hiringDifficultyMod: 0.3 },
            duration: 10
        },
        sued: {
            type: CONSEQUENCE_TYPES.LEGAL,
            description: "Lost a lawsuit",
            effects: { moneyLoss: true, reputationMod: -10 },
            duration: 5
        }
    };

    // ============================================================================
    // CORE FUNCTIONS
    // ============================================================================

    /**
     * Initialize consequence state on player
     */
    function ensureConsequenceState(player) {
        if (!player) return;

        if (!Array.isArray(player.decisionHistory)) {
            player.decisionHistory = [];
        }

        if (!player.consequenceFlags || typeof player.consequenceFlags !== "object") {
            player.consequenceFlags = {};
        }

        if (!player.reputation || typeof player.reputation !== "object") {
            player.reputation = {
                workplace: { score: 50, firedCount: 0, promotionCount: 0, jobHopCount: 0, lastEmployer: null },
                social: { score: 50, betrayals: 0, helpGiven: 0, neglectInstances: 0 },
                cities: {}
            };
        }

        if (!player.healthHistory || typeof player.healthHistory !== "object") {
            player.healthHistory = {
                chronicConditions: [],
                ignoredHealthYears: 0,
                lastCheckupAge: 0,
                addictionHistory: []
            };
        }

        if (!player.relationshipMemory || typeof player.relationshipMemory !== "object") {
            player.relationshipMemory = {};
        }
    }

    /**
     * Record a significant decision
     */
    function recordDecision(player, decisionId, context = {}) {
        ensureConsequenceState(player);

        const decision = {
            id: decisionId,
            age: player.age,
            year: new Date().getFullYear() - (100 - player.age),
            context: context,
            flags: context.flags || [],
            timestamp: Date.now()
        };

        player.decisionHistory.push(decision);

        // Limit history size
        if (player.decisionHistory.length > 500) {
            player.decisionHistory = player.decisionHistory.slice(-500);
        }

        // Apply any flags from this decision
        if (Array.isArray(context.flags)) {
            context.flags.forEach(flagId => {
                addFlag(player, flagId, context);
            });
        }

        return decision;
    }

    /**
     * Add a consequence flag to player
     */
    function addFlag(player, flagId, context = {}) {
        ensureConsequenceState(player);

        const definition = FLAG_DEFINITIONS[flagId];
        if (!definition) {
            console.warn(`Unknown consequence flag: ${flagId}`);
            return false;
        }

        const flag = {
            addedAge: player.age,
            addedYear: new Date().getFullYear() - (100 - player.age),
            severity: context.severity || 1,
            context: context,
            city: player.city || player.cityId
        };

        // Calculate expiration
        if (typeof definition.duration === "number") {
            flag.expiresAtAge = player.age + definition.duration;
        } else {
            flag.expiresAtAge = null; // Permanent or conditional
            flag.durationType = definition.duration;
        }

        // Handle flag stacking (e.g., fired_once → fired_twice)
        if (flagId === "fired_once" && player.consequenceFlags.fired_once) {
            // Upgrade to fired_twice
            delete player.consequenceFlags.fired_once;
            flagId = "fired_twice";
            flag.severity = 2;
        }

        player.consequenceFlags[flagId] = flag;

        // Update reputation based on flag type
        updateReputationFromFlag(player, flagId, definition);

        return true;
    }

    /**
     * Remove a consequence flag
     */
    function removeFlag(player, flagId) {
        ensureConsequenceState(player);
        if (player.consequenceFlags[flagId]) {
            delete player.consequenceFlags[flagId];
            return true;
        }
        return false;
    }

    /**
     * Check if player has a flag
     */
    function hasFlag(player, flagId) {
        ensureConsequenceState(player);
        return !!player.consequenceFlags[flagId];
    }

    /**
     * Get a specific flag's data
     */
    function getFlag(player, flagId) {
        ensureConsequenceState(player);
        return player.consequenceFlags[flagId] || null;
    }

    /**
     * Get all active flags of a type
     */
    function getFlagsByType(player, type) {
        ensureConsequenceState(player);
        const result = [];

        Object.entries(player.consequenceFlags).forEach(([flagId, flagData]) => {
            const definition = FLAG_DEFINITIONS[flagId];
            if (definition && definition.type === type) {
                result.push({ id: flagId, ...flagData, definition });
            }
        });

        return result;
    }

    /**
     * Process expired flags (call yearly)
     */
    function processExpiredFlags(player) {
        ensureConsequenceState(player);

        const toRemove = [];

        Object.entries(player.consequenceFlags).forEach(([flagId, flagData]) => {
            if (flagData.expiresAtAge && player.age >= flagData.expiresAtAge) {
                toRemove.push(flagId);
            }
        });

        toRemove.forEach(flagId => removeFlag(player, flagId));

        return toRemove;
    }

    /**
     * Get consequence modifiers for a specific check type
     */
    function getConsequenceModifiers(player, checkType) {
        ensureConsequenceState(player);

        const modifiers = {
            salaryMult: 1.0,
            promotionChanceMod: 0,
            hiringDifficultyMod: 0,
            healthDecayMod: 1.0,
            relationshipDecayMod: 1.0,
            stressMod: 0,
            intelligenceCap: 0,
            healthCap: 0,
            happinessCap: 0,
            blockedJobs: [],
            warnings: []
        };

        Object.entries(player.consequenceFlags).forEach(([flagId, flagData]) => {
            const definition = FLAG_DEFINITIONS[flagId];
            if (!definition) return;

            // Only apply if not expired
            if (flagData.expiresAtAge && player.age >= flagData.expiresAtAge) return;

            const effects = definition.effects;

            // Accumulate modifiers
            if (effects.salaryMult) modifiers.salaryMult *= effects.salaryMult;
            if (effects.promotionChanceMod) modifiers.promotionChanceMod += effects.promotionChanceMod;
            if (effects.hiringDifficultyMod) modifiers.hiringDifficultyMod += effects.hiringDifficultyMod;
            if (effects.healthDecayMod) modifiers.healthDecayMod *= effects.healthDecayMod;
            if (effects.relationshipDecayMod) modifiers.relationshipDecayMod *= effects.relationshipDecayMod;
            if (effects.stressMod) modifiers.stressMod += effects.stressMod;
            if (effects.intelligenceCap) modifiers.intelligenceCap += effects.intelligenceCap;
            if (effects.healthCap) modifiers.healthCap += effects.healthCap;
            if (effects.happinessCap) modifiers.happinessCap += effects.happinessCap;

            // Track blocked jobs
            if (effects.blocksExecutiveJobs) modifiers.blockedJobs.push("executive");
            if (effects.blocksGovernmentJobs) modifiers.blockedJobs.push("government");
            if (effects.blocksHigherEducation) modifiers.blockedJobs.push("higher_education");

            // Add warnings
            modifiers.warnings.push({
                flagId,
                description: definition.description,
                severity: flagData.severity
            });
        });

        return modifiers;
    }

    // ============================================================================
    // REPUTATION SYSTEM
    // ============================================================================

    /**
     * Update reputation based on a flag
     */
    function updateReputationFromFlag(player, flagId, definition) {
        ensureConsequenceState(player);

        const effects = definition.effects;

        // Workplace reputation
        if (definition.type === CONSEQUENCE_TYPES.CAREER) {
            if (flagId.includes("fired")) {
                player.reputation.workplace.firedCount++;
                player.reputation.workplace.score = Math.max(0, player.reputation.workplace.score - 15);
            }
            if (flagId === "job_hopper") {
                player.reputation.workplace.jobHopCount++;
                player.reputation.workplace.score = Math.max(0, player.reputation.workplace.score - 10);
            }
            if (effects.reputationMod) {
                player.reputation.workplace.score = clamp(player.reputation.workplace.score + effects.reputationMod, 0, 100);
            }
        }

        // Social reputation
        if (definition.type === CONSEQUENCE_TYPES.SOCIAL) {
            if (flagId === "betrayer") {
                player.reputation.social.betrayals++;
                player.reputation.social.score = Math.max(0, player.reputation.social.score - 20);
            }
            if (flagId === "loyal_friend") {
                player.reputation.social.helpGiven++;
                player.reputation.social.score = Math.min(100, player.reputation.social.score + 10);
            }
            if (effects.reputationMod) {
                player.reputation.social.score = clamp(player.reputation.social.score + effects.reputationMod, 0, 100);
            }
        }
    }

    /**
     * Get overall reputation for a context
     */
    function getReputation(player, context) {
        ensureConsequenceState(player);

        switch (context) {
            case "workplace":
                return player.reputation.workplace.score;
            case "social":
                return player.reputation.social.score;
            case "city":
                const cityId = player.city || player.cityId;
                return player.reputation.cities[cityId]?.score || 50;
            default:
                return 50;
        }
    }

    /**
     * Modify reputation directly
     */
    function modifyReputation(player, context, delta) {
        ensureConsequenceState(player);

        switch (context) {
            case "workplace":
                player.reputation.workplace.score = clamp(player.reputation.workplace.score + delta, 0, 100);
                break;
            case "social":
                player.reputation.social.score = clamp(player.reputation.social.score + delta, 0, 100);
                break;
            case "city":
                const cityId = player.city || player.cityId;
                if (!player.reputation.cities[cityId]) {
                    player.reputation.cities[cityId] = { score: 50, flags: [], events: [] };
                }
                player.reputation.cities[cityId].score = clamp(player.reputation.cities[cityId].score + delta, 0, 100);
                break;
        }
    }

    // ============================================================================
    // RELATIONSHIP MEMORY
    // ============================================================================

    /**
     * Record a relationship event in memory
     */
    function recordRelationshipEvent(player, personId, eventType, description) {
        ensureConsequenceState(player);

        if (!player.relationshipMemory[personId]) {
            player.relationshipMemory[personId] = [];
        }

        player.relationshipMemory[personId].push({
            age: player.age,
            type: eventType, // "betrayal", "help", "neglect", "gift", "fight", "reconciliation"
            description: description,
            timestamp: Date.now()
        });

        // Limit memory per person
        if (player.relationshipMemory[personId].length > 20) {
            player.relationshipMemory[personId] = player.relationshipMemory[personId].slice(-20);
        }
    }

    /**
     * Get relationship memory for a person
     */
    function getRelationshipMemory(player, personId) {
        ensureConsequenceState(player);
        return player.relationshipMemory[personId] || [];
    }

    /**
     * Get relationship modifier based on memory
     */
    function getRelationshipModifier(player, personId) {
        const memory = getRelationshipMemory(player, personId);

        let modifier = 0;

        memory.forEach(event => {
            switch (event.type) {
                case "betrayal":
                    modifier -= 20;
                    break;
                case "help":
                    modifier += 10;
                    break;
                case "neglect":
                    modifier -= 5;
                    break;
                case "gift":
                    modifier += 5;
                    break;
                case "fight":
                    modifier -= 10;
                    break;
                case "reconciliation":
                    modifier += 15;
                    break;
            }
        });

        return clamp(modifier, -50, 50);
    }

    /**
     * Check if a person should confront the player about past behavior
     */
    function shouldConfront(player, personId) {
        const memory = getRelationshipMemory(player, personId);

        // Check for unaddressed issues
        const recentBetrayals = memory.filter(e =>
            e.type === "betrayal" &&
            player.age - e.age < 5 &&
            !memory.some(r => r.type === "reconciliation" && r.age > e.age)
        );

        const recentNeglect = memory.filter(e =>
            e.type === "neglect" &&
            player.age - e.age < 3
        );

        if (recentBetrayals.length > 0) {
            return { shouldConfront: true, reason: "betrayal", events: recentBetrayals };
        }

        if (recentNeglect.length >= 2) {
            return { shouldConfront: true, reason: "neglect", events: recentNeglect };
        }

        return { shouldConfront: false };
    }

    // ============================================================================
    // HEALTH CONSEQUENCES
    // ============================================================================

    /**
     * Track health neglect
     */
    function trackHealthNeglect(player) {
        ensureConsequenceState(player);

        if (player.health < 40) {
            player.healthHistory.ignoredHealthYears++;

            // After 3 years of neglect, risk chronic condition
            if (player.healthHistory.ignoredHealthYears >= 3 && !hasFlag(player, "health_neglect")) {
                addFlag(player, "health_neglect", { severity: 1 });
            }

            // After 5 years, may develop chronic condition
            if (player.healthHistory.ignoredHealthYears >= 5 && Math.random() < 0.3) {
                developChronicCondition(player);
            }
        } else {
            // Reset if health is good
            player.healthHistory.ignoredHealthYears = Math.max(0, player.healthHistory.ignoredHealthYears - 1);
        }
    }

    /**
     * Develop a chronic condition
     */
    function developChronicCondition(player) {
        ensureConsequenceState(player);

        const conditions = [
            { id: "heart_disease", severity: 3, description: "Heart Disease" },
            { id: "diabetes", severity: 2, description: "Diabetes" },
            { id: "chronic_pain", severity: 2, description: "Chronic Pain" },
            { id: "depression", severity: 2, description: "Depression" },
            { id: "anxiety", severity: 1, description: "Anxiety Disorder" }
        ];

        // Don't add duplicates
        const existing = player.healthHistory.chronicConditions.map(c => c.id);
        const available = conditions.filter(c => !existing.includes(c.id));

        if (available.length === 0) return null;

        const condition = available[Math.floor(Math.random() * available.length)];
        condition.addedAge = player.age;

        player.healthHistory.chronicConditions.push(condition);
        addFlag(player, "chronic_condition", { severity: condition.severity });

        return condition;
    }

    // ============================================================================
    // CAREER CONSEQUENCES
    // ============================================================================

    /**
     * Record getting fired
     */
    function recordFired(player, context = {}) {
        ensureConsequenceState(player);

        player.reputation.workplace.firedCount++;
        player.reputation.workplace.lastEmployer = context.employer || null;

        recordDecision(player, "fired", {
            ...context,
            flags: player.reputation.workplace.firedCount >= 2 ? ["fired_twice"] : ["fired_once"]
        });

        modifyReputation(player, "workplace", -15);
    }

    /**
     * Record job change
     */
    function recordJobChange(player, context = {}) {
        ensureConsequenceState(player);

        const recentChanges = player.decisionHistory.filter(d =>
            d.id === "job_change" &&
            player.age - d.age < 3
        ).length;

        // If 3+ job changes in 3 years, flag as job hopper
        if (recentChanges >= 2) {
            addFlag(player, "job_hopper", { severity: 1 });
        }

        recordDecision(player, "job_change", context);
    }

    /**
     * Check if player can apply for a job given their history
     */
    function canApplyForJob(player, jobRequirements = {}) {
        ensureConsequenceState(player);

        const modifiers = getConsequenceModifiers(player, CONSEQUENCE_TYPES.CAREER);
        const result = { canApply: true, warnings: [], salaryModifier: modifiers.salaryMult };

        // Check blocked job types
        if (jobRequirements.isExecutive && modifiers.blockedJobs.includes("executive")) {
            result.canApply = false;
            result.reason = "criminal_record_blocks_executive";
        }

        if (jobRequirements.isGovernment && modifiers.blockedJobs.includes("government")) {
            result.canApply = false;
            result.reason = "criminal_record_blocks_government";
        }

        // Check fired_twice waiting period
        if (hasFlag(player, "fired_twice")) {
            const flag = getFlag(player, "fired_twice");
            const yearsSince = player.age - flag.addedAge;
            const sameCity = (player.city === flag.city || player.cityId === flag.city);

            if (yearsSince < 2 && sameCity) {
                result.canApply = false;
                result.reason = "must_wait_after_termination";
                result.waitYears = 2 - yearsSince;
            }
        }

        // Add warnings
        result.warnings = modifiers.warnings.filter(w =>
            ["fired_once", "fired_twice", "job_hopper", "unreliable"].includes(w.flagId)
        );

        return result;
    }

    // ============================================================================
    // UTILITY
    // ============================================================================

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Yearly consequence processing
     */
    function processYearlyConsequences(player) {
        ensureConsequenceState(player);

        // Process expired flags
        const expiredFlags = processExpiredFlags(player);

        // Track health
        trackHealthNeglect(player);

        // Build reliable employee reputation if employed long enough
        if (player.job && player.job !== "unemployed") {
            const jobYears = player.jobYearsInRole || 0;
            if (jobYears >= 5 && !hasFlag(player, "reliable_employee")) {
                addFlag(player, "reliable_employee", { severity: 1 });
                modifyReputation(player, "workplace", 10);
            }
        }

        return { expiredFlags };
    }

    // ============================================================================
    // I18N PATCHES
    // ============================================================================

    (function patchConsequenceI18n() {
        const i18n = Alive.i18n;
        if (!i18n || !i18n.texts) return;
        const en = (i18n.texts.en = i18n.texts.en || {});
        const ru = (i18n.texts.ru = i18n.texts.ru || {});

        Object.assign(en, {
            "consequence.dropped_out": "Dropped out of school",
            "consequence.fired_once": "Fired from a job",
            "consequence.fired_twice": "Fired multiple times",
            "consequence.job_hopper": "Known as a job hopper",
            "consequence.criminal_record": "Has a criminal record",
            "consequence.health_neglect": "Neglected health",
            "consequence.chronic_condition": "Has chronic condition",
            "consequence.betrayer": "Betrayed a friend",
            "consequence.loyal_friend": "Known as loyal friend",
            "consequence.reliable_employee": "Reliable employee",
            "consequence.must_wait": "Must wait {years} years before applying",
            "consequence.blocked_job": "This job is blocked due to your history",
            "consequence.salary_reduced": "Salary reduced by {percent}% due to history"
        });

        Object.assign(ru, {
            "consequence.dropped_out": "Бросил учёбу",
            "consequence.fired_once": "Уволен с работы",
            "consequence.fired_twice": "Уволен несколько раз",
            "consequence.job_hopper": "Известен частой сменой работы",
            "consequence.criminal_record": "Имеет судимость",
            "consequence.health_neglect": "Запустил здоровье",
            "consequence.chronic_condition": "Имеет хроническое заболевание",
            "consequence.betrayer": "Предал друга",
            "consequence.loyal_friend": "Известен как верный друг",
            "consequence.reliable_employee": "Надёжный сотрудник",
            "consequence.must_wait": "Нужно подождать {years} лет перед подачей",
            "consequence.blocked_job": "Эта работа недоступна из-за вашей истории",
            "consequence.salary_reduced": "Зарплата снижена на {percent}% из-за истории"
        });
    })();

    // ============================================================================
    // EXPORT
    // ============================================================================

    Alive.consequences = {
        // Constants
        CONSEQUENCE_TYPES,
        FLAG_DEFINITIONS,

        // Core functions
        ensureConsequenceState,
        recordDecision,
        addFlag,
        removeFlag,
        hasFlag,
        getFlag,
        getFlagsByType,
        processExpiredFlags,
        getConsequenceModifiers,

        // Reputation
        getReputation,
        modifyReputation,
        updateReputationFromFlag,

        // Relationship Memory
        recordRelationshipEvent,
        getRelationshipMemory,
        getRelationshipModifier,
        shouldConfront,

        // Health
        trackHealthNeglect,
        developChronicCondition,

        // Career
        recordFired,
        recordJobChange,
        canApplyForJob,

        // Processing
        processYearlyConsequences,

        // === NEW: Cumulative scores for director ===

        /**
         * Get cumulative behavioral tendency scores.
         * Used by the EventDirector to bias event selection.
         */
        getCumulativeScores: function (player) {
            ensureConsequenceState(player);
            return player._cumulativeScores || {
                career_ambition: 0,
                risk_tolerance: 0,
                family_focus: 0,
                health_consciousness: 0
            };
        },

        /**
         * Record a choice that affects cumulative behavioral scores.
         * @param {object} player
         * @param {string} category - 'career_ambition'|'risk_tolerance'|'family_focus'|'health_consciousness'
         * @param {number} delta - how much to adjust (positive or negative)
         */
        recordCumulativeChoice: function (player, category, delta) {
            ensureConsequenceState(player);
            if (!player._cumulativeScores) {
                player._cumulativeScores = {
                    career_ambition: 0,
                    risk_tolerance: 0,
                    family_focus: 0,
                    health_consciousness: 0
                };
            }
            if (typeof player._cumulativeScores[category] === 'number') {
                player._cumulativeScores[category] += delta;
            }
        }
    };

})(window);
