/**
 * Mid-Term Goals Module — Alive Life Simulator
 * 5/10-year milestone challenges with rewards to drive engagement.
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});

    // ============================================================================
    // GOAL DEFINITIONS
    // ============================================================================
    const GOAL_POOL = [
        // === FINANCIAL GOALS ===
        { id: 'save_10k', targetAge: 25, category: 'financial', description: { en: 'Save $10,000 by age 25', ru: 'Save $10,000 by age 25' }, condition: (p) => p.money >= 10000, reward: { happinessDelta: 8, moneyDelta: 2000 } },
        { id: 'save_50k', targetAge: 30, category: 'financial', description: { en: 'Save $50,000 by age 30', ru: 'Save $50,000 by age 30' }, condition: (p) => p.money >= 50000, reward: { happinessDelta: 12, intelligenceDelta: 3 } },
        { id: 'net_worth_100k', targetAge: 35, category: 'financial', description: { en: 'Net worth $100,000 by age 35', ru: 'Net worth $100,000 by age 35' }, condition: (p) => (p.netWorth || 0) >= 100000, reward: { happinessDelta: 15, moneyDelta: 5000 } },
        { id: 'millionaire', targetAge: 50, category: 'financial', description: { en: 'Reach $1,000,000 net worth by age 50', ru: 'Reach $1,000,000 net worth by age 50' }, condition: (p) => (p.netWorth || 0) >= 1000000, reward: { happinessDelta: 25, moneyDelta: 20000 }, legacyPoints: 5 },
        { id: 'invest_portfolio', targetAge: 40, category: 'financial', description: { en: 'Build investment portfolio by age 40', ru: 'Build investment portfolio by age 40' }, condition: (p) => (p.investments?.length || 0) >= 3, reward: { happinessDelta: 10, intelligenceDelta: 5 } },

        // === CAREER GOALS ===
        { id: 'first_job', targetAge: 20, category: 'career', description: { en: 'Get your first job by age 20', ru: 'Get your first job by age 20' }, condition: (p) => p.job && p.job !== 'unemployed', reward: { happinessDelta: 8, moneyDelta: 1000 } },
        { id: 'career_5yrs', targetAge: 30, category: 'career', description: { en: 'Hold a job for 5+ years by age 30', ru: 'Hold a job for 5+ years by age 30' }, condition: (p) => (p.jobYearsInRole || 0) >= 5, reward: { happinessDelta: 10, moneyDelta: 3000 } },
        { id: 'high_earner', targetAge: 40, category: 'career', description: { en: 'Earn $50,000+/year by age 40', ru: 'Earn $50,000+/year by age 40' }, condition: (p) => (p.annualIncome || 0) >= 50000, reward: { happinessDelta: 12, stressDelta: -10 } },

        // === RELATIONSHIP GOALS ===
        { id: 'get_married', targetAge: 35, category: 'relationship', description: { en: 'Get married by age 35', ru: 'Get married by age 35' }, condition: (p) => p.married || p.marriageStatus === 'married', reward: { happinessDelta: 20 } },
        { id: 'have_child', targetAge: 40, category: 'relationship', description: { en: 'Have a child by age 40', ru: 'Have a child by age 40' }, condition: (p) => (p.children?.length || 0) >= 1, reward: { happinessDelta: 15 } },
        { id: 'big_family', targetAge: 45, category: 'relationship', description: { en: 'Have 3+ children by age 45', ru: 'Have 3+ children by age 45' }, condition: (p) => (p.children?.length || 0) >= 3, reward: { happinessDelta: 20, stressDelta: 10 }, legacyPoints: 3 },

        // === LIFESTYLE GOALS ===
        { id: 'own_house', targetAge: 35, category: 'lifestyle', description: { en: 'Own a house by age 35', ru: 'Own a house by age 35' }, condition: (p) => p.housing && p.housing !== 'apartment' && typeof p.housing === 'object', reward: { happinessDelta: 15, stressDelta: -5 } },
        { id: 'own_car', targetAge: 25, category: 'lifestyle', description: { en: 'Own a car by age 25', ru: 'Own a car by age 25' }, condition: (p) => !!p.car, reward: { happinessDelta: 8 } },
        { id: 'world_traveler', targetAge: 45, category: 'lifestyle', description: { en: 'Visit 3+ cities by age 45', ru: 'Visit 3+ cities by age 45' }, condition: (p) => (p.citiesVisited?.length || 0) >= 3, reward: { happinessDelta: 12, intelligenceDelta: 3 } },
        { id: 'fitness_buff', targetAge: 40, category: 'lifestyle', description: { en: 'Reach 80+ health at age 40', ru: 'Reach 80+ health at age 40' }, condition: (p) => p.health >= 80, reward: { healthDelta: 10, happinessDelta: 10 } },
        { id: 'educated', targetAge: 25, category: 'lifestyle', description: { en: 'Complete university by age 25', ru: 'Complete university by age 25' }, condition: (p) => (p.educationLevel || 0) >= 3, reward: { intelligenceDelta: 10, happinessDelta: 5 } },

        // === LATE-LIFE GOALS ===
        { id: 'golden_years', targetAge: 65, category: 'lifestyle', description: { en: 'Retire with $200,000+ at age 65', ru: 'Retire with $200,000+ at age 65' }, condition: (p) => p.money >= 200000, reward: { happinessDelta: 20, stressDelta: -20 }, legacyPoints: 4 },
        { id: 'legacy_builder', targetAge: 60, category: 'relationship', description: { en: 'Raise 2+ children to adulthood by 60', ru: 'Raise 2+ children to adulthood by 60' }, condition: (p) => (p.children || []).filter(c => (c.age || 0) >= 18).length >= 2, reward: { happinessDelta: 25 }, legacyPoints: 3 },
        { id: 'wise_elder', targetAge: 70, category: 'lifestyle', description: { en: 'Reach intelligence 80+ at age 70', ru: 'Reach intelligence 80+ at age 70' }, condition: (p) => (p.intelligence || 0) >= 80, reward: { happinessDelta: 15, intelligenceDelta: 5 }, legacyPoints: 3 }
    ];

    // ============================================================================
    // GOALS CLASS
    // ============================================================================
    class MidTermGoals {
        constructor() {
            this.reset();
        }

        reset() {
            this.assignedGoals = [];   // { goalId, targetAge, status: 'active'|'achieved'|'failed' }
            this.achievedCount = 0;
            this.failedCount = 0;
            this.totalLegacyPoints = 0;
        }

        /**
         * Assign 3-4 goals at life start
         */
        assignGoals(player) {
            this.reset();

            // Shuffle and pick goals across different target ages
            const shuffled = [...GOAL_POOL].sort(() => Math.random() - 0.5);
            const targetAges = new Set();
            const selected = [];

            for (const goal of shuffled) {
                if (selected.length >= 4) break;
                // Ensure variety in target ages (at least 5-year spread)
                const tooClose = [...targetAges].some(a => Math.abs(a - goal.targetAge) < 5);
                if (tooClose && selected.length >= 2) continue;

                targetAges.add(goal.targetAge);
                selected.push({
                    goalId: goal.id,
                    targetAge: goal.targetAge,
                    category: goal.category,
                    status: 'active'
                });
            }

            // Sort by target age for display
            this.assignedGoals = selected.sort((a, b) => a.targetAge - b.targetAge);
            return this.assignedGoals;
        }

        /**
         * Evaluate goals at the current age — called each year from nextYear()
         */
        evaluateGoals(player) {
            const results = [];

            for (const assigned of this.assignedGoals) {
                if (assigned.status !== 'active') continue;

                const goalDef = GOAL_POOL.find(g => g.id === assigned.goalId);
                if (!goalDef) continue;

                // Check at target age
                if (player.age === assigned.targetAge) {
                    if (goalDef.condition(player)) {
                        assigned.status = 'achieved';
                        this.achievedCount++;
                        this.totalLegacyPoints += goalDef.legacyPoints || 1;
                        results.push({
                            type: 'achieved',
                            goal: goalDef,
                            assigned: assigned
                        });

                        // Apply reward
                        if (goalDef.reward && player.applyEffects) {
                            player.applyEffects(goalDef.reward);
                        }
                    } else {
                        assigned.status = 'failed';
                        this.failedCount++;
                        results.push({
                            type: 'failed',
                            goal: goalDef,
                            assigned: assigned
                        });
                    }
                }
            }

            return results;
        }

        /**
         * Get active goals for UI display
         */
        getActiveGoals() {
            return this.assignedGoals
                .filter(g => g.status === 'active')
                .map(g => {
                    const def = GOAL_POOL.find(d => d.id === g.goalId);
                    return {
                        ...g,
                        description: def?.description,
                        category: def?.category
                    };
                });
        }

        /**
         * Get all goals with status for summary screen
         */
        getAllGoals() {
            return this.assignedGoals.map(g => {
                const def = GOAL_POOL.find(d => d.id === g.goalId);
                return {
                    ...g,
                    description: def?.description,
                    category: def?.category,
                    legacyPoints: def?.legacyPoints || 1
                };
            });
        }

        // =========================================================================
        // SERIALIZATION
        // =========================================================================
        getState() {
            return {
                assignedGoals: JSON.parse(JSON.stringify(this.assignedGoals)),
                achievedCount: this.achievedCount,
                failedCount: this.failedCount,
                totalLegacyPoints: this.totalLegacyPoints
            };
        }

        loadState(state) {
            if (!state) return;
            this.assignedGoals = state.assignedGoals || [];
            this.achievedCount = state.achievedCount || 0;
            this.failedCount = state.failedCount || 0;
            this.totalLegacyPoints = state.totalLegacyPoints || 0;
        }
    }

    // ============================================================================
    // EXPORT
    // ============================================================================
    Alive.MidTermGoals = MidTermGoals;
    Alive.goals = new MidTermGoals();

})(window);
