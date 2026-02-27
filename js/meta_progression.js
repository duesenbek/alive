/**
 * Meta-Progression Module — Alive Life Simulator
 * Cross-life unlocks: Legacy Points, Perk Tree, Starting Traits.
 * Persists via localStorage independently from game saves.
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});

    const META_STORAGE_KEY = 'alive_meta_v1';

    // ============================================================================
    // PERK DEFINITIONS
    // ============================================================================
    const PERK_TREE = [
        { id: 'silver_spoon', name: { en: 'Silver Spoon 🥄', ru: 'Silver Spoon 🥄' }, cost: 2, description: { en: 'Start with +$5,000', ru: 'Start with +$5,000' }, apply: (p) => { p.money += 5000; } },
        { id: 'gifted', name: { en: 'Gifted 🧠', ru: 'Gifted 🧠' }, cost: 2, description: { en: '+10 starting intelligence', ru: '+10 starting intelligence' }, apply: (p) => { p.intelligence = Math.min(100, (p.intelligence || 50) + 10); } },
        { id: 'charismatic', name: { en: 'Charismatic ✨', ru: 'Charismatic ✨' }, cost: 2, description: { en: '+10 starting attractiveness', ru: '+10 starting attractiveness' }, apply: (p) => { p.attractiveness = Math.min(100, (p.attractiveness || 50) + 10); } },
        { id: 'lucky', name: { en: 'Lucky 🍀', ru: 'Lucky 🍀' }, cost: 3, description: { en: '+5% positive event chance', ru: '+5% positive event chance' }, apply: (p) => { p._perkLucky = true; } },
        { id: 'resilient', name: { en: 'Resilient 🛡️', ru: 'Resilient 🛡️' }, cost: 3, description: { en: 'Health decay reduced 20%', ru: 'Health decay reduced 20%' }, apply: (p) => { p._perkResilient = true; } },
        { id: 'networker', name: { en: 'Networker 🤝', ru: 'Networker 🤝' }, cost: 3, description: { en: 'Promotion chance +15%', ru: 'Promotion chance +15%' }, apply: (p) => { p._perkNetworker = true; } },
        { id: 'investor_instinct', name: { en: 'Investor Instinct 📈', ru: 'Investor Instinct 📈' }, cost: 4, description: { en: 'Investment returns +10%', ru: 'Investment returns +10%' }, apply: (p) => { p._perkInvestor = true; } },
        { id: 'legacy_knowledge', name: { en: 'Legacy of Knowledge 📚', ru: 'Legacy of Knowledge 📚' }, cost: 4, description: { en: 'Children inherit 20% parent skills', ru: 'Children inherit 20% parent skills' }, apply: (p) => { p._perkLegacyKnowledge = true; } },
        { id: 'second_wind', name: { en: 'Second Wind 💨', ru: 'Second Wind 💨' }, cost: 5, description: { en: 'Free revive once per life', ru: 'Free revive once per life' }, apply: (p) => { p._perkSecondWind = true; } },
        { id: 'born_leader', name: { en: 'Born Leader 👑', ru: 'Born Leader 👑' }, cost: 4, description: { en: 'Unlock executive jobs at lower education', ru: 'Unlock executive jobs at lower education' }, apply: (p) => { p._perkBornLeader = true; } },
        { id: 'frugal', name: { en: 'Frugal 💰', ru: 'Frugal 💰' }, cost: 2, description: { en: 'Expenses reduced 10%', ru: 'Expenses reduced 10%' }, apply: (p) => { p._perkFrugal = true; } },
        { id: 'adventurer', name: { en: 'Adventurer 🌍', ru: 'Adventurer 🌍' }, cost: 3, description: { en: 'Unlock rare event arcs from life 1', ru: 'Unlock rare event arcs from life 1' }, apply: (p) => { p._perkAdventurer = true; } }
    ];

    // ============================================================================
    // STARTING TRAITS (Randomly assigned, influenced by perks)
    // ============================================================================
    const STARTING_TRAITS = [
        { id: 'trait_born_wealthy', name: { en: 'Born Wealthy', ru: 'Born Wealthy' }, weight: 1, perkBoost: 'silver_spoon', apply: (p) => { p.money += 10000; } },
        { id: 'trait_prodigy', name: { en: 'Prodigy', ru: 'Prodigy' }, weight: 1, perkBoost: 'gifted', apply: (p) => { p.intelligence = Math.min(100, (p.intelligence || 50) + 15); } },
        { id: 'trait_athletic', name: { en: 'Athletic', ru: 'Athletic' }, weight: 1, perkBoost: 'resilient', apply: (p) => { p.health = Math.min(100, (p.health || 80) + 10); p.sportsSkill += 10; } },
        { id: 'trait_popular', name: { en: 'Popular', ru: 'Popular' }, weight: 1, perkBoost: 'charismatic', apply: (p) => { p.socialSkill += 15; p.happiness = Math.min(100, (p.happiness || 80) + 5); } },
        { id: 'trait_stubborn', name: { en: 'Stubborn', ru: 'Stubborn' }, weight: 2, apply: (p) => { p.stress = Math.max(0, (p.stress || 0) + 5); p.careerSkill += 8; } },
        { id: 'trait_creative', name: { en: 'Creative', ru: 'Creative' }, weight: 2, apply: (p) => { p.intelligence = Math.min(100, (p.intelligence || 50) + 5); p.happiness = Math.min(100, (p.happiness || 80) + 5); } },
        { id: 'trait_sensitive', name: { en: 'Sensitive', ru: 'Sensitive' }, weight: 2, apply: (p) => { p.happiness = Math.min(100, (p.happiness || 80) + 10); p.stress = Math.max(0, (p.stress || 0) + 8); } },
        { id: 'trait_tough', name: { en: 'Tough', ru: 'Tough' }, weight: 1, perkBoost: 'resilient', apply: (p) => { p.health = Math.min(100, (p.health || 80) + 5); } }
    ];

    // ============================================================================
    // META PROGRESSION CLASS
    // ============================================================================
    class MetaProgression {
        constructor() {
            this.legacyPoints = 0;
            this.totalLivesPlayed = 0;
            this.unlockedPerks = [];     // perk IDs
            this.activePerks = [];       // perk IDs to apply next life
            this.lifetimeStats = {
                bestAge: 0,
                maxNetWorth: 0,
                totalGoalsAchieved: 0,
                totalUniqueEvents: 0,
                totalArcsCompleted: 0
            };
            this._loaded = false;
        }

        /**
         * Load meta-progression from localStorage
         */
        load() {
            try {
                const raw = localStorage.getItem(META_STORAGE_KEY);
                if (raw) {
                    const data = JSON.parse(raw);
                    this.legacyPoints = data.legacyPoints || 0;
                    this.totalLivesPlayed = data.totalLivesPlayed || 0;
                    this.unlockedPerks = data.unlockedPerks || [];
                    this.activePerks = data.activePerks || [];
                    this.lifetimeStats = { ...this.lifetimeStats, ...(data.lifetimeStats || {}) };
                }
            } catch (e) {
                console.warn('MetaProgression: Failed to load', e);
            }
            this._loaded = true;
        }

        /**
         * Save meta-progression to localStorage
         */
        save() {
            try {
                const data = {
                    legacyPoints: this.legacyPoints,
                    totalLivesPlayed: this.totalLivesPlayed,
                    unlockedPerks: this.unlockedPerks,
                    activePerks: this.activePerks,
                    lifetimeStats: this.lifetimeStats
                };
                localStorage.setItem(META_STORAGE_KEY, JSON.stringify(data));
            } catch (e) {
                console.warn('MetaProgression: Failed to save', e);
            }
        }

        /**
         * Calculate Legacy Points earned from a completed life
         */
        calculateLP(player, goals, seenEventIds, completedArcs) {
            let lp = 0;

            // Age contribution: 1 LP per 10 years lived
            lp += Math.floor((player.age || 0) / 10);

            // Net worth: 1 LP per $100,000
            lp += Math.floor(Math.max(0, player.netWorth || 0) / 100000);

            // Goals: LP from goal definitions
            if (goals?.totalLegacyPoints) {
                lp += goals.totalLegacyPoints;
            }

            // Unique events: 1 LP per 5 unique events
            const uniqueEvents = (seenEventIds?.length || 0);
            lp += Math.floor(uniqueEvents / 5);

            // Completed arcs: 2 LP each
            lp += (completedArcs || 0) * 2;

            return Math.max(1, lp); // Minimum 1 LP per life
        }

        /**
         * Process end-of-life: award LP, update lifetime stats
         */
        processLifeEnd(player, goals, seenEventIds, completedArcs) {
            if (!this._loaded) this.load();

            const lpEarned = this.calculateLP(player, goals, seenEventIds, completedArcs);
            this.legacyPoints += lpEarned;
            this.totalLivesPlayed++;

            // Update lifetime stats
            if ((player.age || 0) > this.lifetimeStats.bestAge) {
                this.lifetimeStats.bestAge = player.age;
            }
            if ((player.netWorth || 0) > this.lifetimeStats.maxNetWorth) {
                this.lifetimeStats.maxNetWorth = player.netWorth;
            }
            this.lifetimeStats.totalGoalsAchieved += (goals?.achievedCount || 0);
            this.lifetimeStats.totalUniqueEvents += (seenEventIds?.length || 0);
            this.lifetimeStats.totalArcsCompleted += (completedArcs || 0);

            this.save();
            return lpEarned;
        }

        /**
         * Try to unlock a perk
         */
        unlockPerk(perkId) {
            if (!this._loaded) this.load();

            const perk = PERK_TREE.find(p => p.id === perkId);
            if (!perk) return { success: false, reason: 'Perk not found' };
            if (this.unlockedPerks.includes(perkId)) return { success: false, reason: 'Already unlocked' };
            if (this.legacyPoints < perk.cost) return { success: false, reason: 'Not enough LP' };

            this.legacyPoints -= perk.cost;
            this.unlockedPerks.push(perkId);
            this.activePerks.push(perkId);
            this.save();

            return { success: true, perk };
        }

        /**
         * Toggle a perk active/inactive
         */
        togglePerk(perkId) {
            if (!this.unlockedPerks.includes(perkId)) return false;

            const idx = this.activePerks.indexOf(perkId);
            if (idx >= 0) {
                this.activePerks.splice(idx, 1);
            } else {
                this.activePerks.push(perkId);
            }
            this.save();
            return true;
        }

        /**
         * Apply active perks to a freshly created player
         */
        applyPerks(player) {
            if (!this._loaded) this.load();

            for (const perkId of this.activePerks) {
                const perk = PERK_TREE.find(p => p.id === perkId);
                if (perk?.apply) {
                    perk.apply(player);
                }
            }
        }

        /**
         * Roll for a starting trait (1 trait per life, influenced by perks)
         */
        rollStartingTrait(player) {
            if (!this._loaded) this.load();

            // Build weighted pool
            const pool = STARTING_TRAITS.map(t => {
                let weight = t.weight;
                // If player has the perk that boosts this trait, increase weight
                if (t.perkBoost && this.activePerks.includes(t.perkBoost)) {
                    weight *= 3;
                }
                return { trait: t, weight };
            });

            // Weighted random selection
            const totalWeight = pool.reduce((s, p) => s + p.weight, 0);
            let roll = Math.random() * totalWeight;
            for (const p of pool) {
                roll -= p.weight;
                if (roll <= 0) {
                    if (p.trait.apply) p.trait.apply(player);
                    return p.trait;
                }
            }

            return null;
        }

        /**
         * Get all perk definitions with unlock status
         */
        getPerkTree() {
            if (!this._loaded) this.load();
            const lang = Alive.i18n?.currentLang || 'en';

            return PERK_TREE.map(p => ({
                id: p.id,
                name: p.name?.[lang] || p.name?.en || p.id,
                description: p.description?.[lang] || p.description?.en || '',
                cost: p.cost,
                unlocked: this.unlockedPerks.includes(p.id),
                active: this.activePerks.includes(p.id)
            }));
        }

        /**
         * Get full meta-progression summary for UI
         */
        getSummary() {
            if (!this._loaded) this.load();

            return {
                legacyPoints: this.legacyPoints,
                totalLivesPlayed: this.totalLivesPlayed,
                perksUnlocked: this.unlockedPerks.length,
                perksTotal: PERK_TREE.length,
                lifetimeStats: { ...this.lifetimeStats }
            };
        }
    }

    // ============================================================================
    // EXPORT
    // ============================================================================
    Alive.MetaProgression = MetaProgression;
    Alive.PERK_TREE = PERK_TREE;
    Alive.STARTING_TRAITS = STARTING_TRAITS;
    Alive.meta = new MetaProgression();

})(window);
