/**
 * Event Director — Alive Life Simulator
 * AI-driven pacing system: tension tracking, dramatic arcs, context-aware event selection.
 * Inspired by Left 4 Dead's AI Director, adapted for a life-sim.
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});

    // ============================================================================
    // LIFE STAGE DEFINITIONS
    // ============================================================================
    const LIFE_STAGES = {
        CHILDHOOD: { min: 0, max: 17, label: 'childhood', biasPositive: 0.6, biasNegative: 0.2, biasLifechanging: 0.2 },
        YOUNG_ADULT: { min: 18, max: 35, label: 'young_adult', biasPositive: 0.4, biasNegative: 0.2, biasLifechanging: 0.4 },
        MIDLIFE: { min: 36, max: 55, label: 'midlife', biasPositive: 0.25, biasNegative: 0.35, biasLifechanging: 0.4 },
        SENIOR: { min: 56, max: 75, label: 'senior', biasPositive: 0.3, biasNegative: 0.4, biasLifechanging: 0.3 },
        ELDER: { min: 76, max: 120, label: 'elder', biasPositive: 0.35, biasNegative: 0.35, biasLifechanging: 0.3 }
    };

    // ============================================================================
    // TAG → POLARITY MAPPING
    // ============================================================================
    const TAG_POLARITY = {
        minor_positive: 'positive',
        major_positive: 'positive',
        minor_negative: 'negative',
        major_negative: 'negative',
        lifechanging: 'lifechanging',
        crisis: 'negative',
        career: 'positive'
    };

    // ============================================================================
    // EVENT DIRECTOR CLASS
    // ============================================================================
    class EventDirector {
        constructor() {
            this.reset();
        }

        reset() {
            this.tension = 30;                 // 0-100, starts moderate
            this.yearsSinceLastEvent = 0;
            this.recentEventTags = [];         // last 5 event tags
            this.recentEventIds = [];          // last 15 event IDs for anti-repetition
            this.recentPolarities = [];        // last 5 event polarities for diversity
            this.eventsThisLife = 0;
            this.maxEventsPerLife = 25;        // generous cap for long lives
            this.calmYearsTarget = 0;         // how many calm years before next event
            this.lastEventAge = -3;

            // Pacing state
            this.phase = 'calm';              // 'calm' | 'building' | 'climax' | 'recovery'
            this.phaseYearsRemaining = 2;
            this.arcIntensity = 0;            // tracks escalation within a sequence
        }

        // =========================================================================
        // CORE: Evaluate this year and decide which events (0-2) to fire
        // =========================================================================
        evaluateYear(player, game) {
            const results = [];
            this.yearsSinceLastEvent++;

            // 1. Update tension from player state
            this._updateTension(player);

            // 2. Update pacing phase
            this._advancePhase(player);

            // 3. Determine if an event should fire this year
            const eventChance = this._calculateEventChance(player);

            if (Math.random() > eventChance) {
                // No event this year — but still check active arcs
                if (Alive.eventArcs?.advanceArcs) {
                    const arcEvent = Alive.eventArcs.advanceArcs(player);
                    if (arcEvent) {
                        results.push({ source: 'arc', event: arcEvent });
                        this._recordEvent(arcEvent.tag || 'lifechanging', arcEvent.id, player.age);
                    }
                }
                return results;
            }

            // 4. Gather all candidates
            const candidates = this._gatherCandidates(player, game);
            if (candidates.length === 0) return results;

            // 5. Score and select via weighted selection
            const selected = this._weightedSelect(candidates, player);
            if (selected) {
                results.push(selected);
                this._recordEvent(selected.event.tag || 'unknown', selected.event.id, player.age);
            }

            // 6. Check event arcs for progression
            if (Alive.eventArcs?.advanceArcs) {
                const arcEvent = Alive.eventArcs.advanceArcs(player);
                if (arcEvent && (!selected || arcEvent.id !== selected.event?.id)) {
                    results.push({ source: 'arc', event: arcEvent });
                    this._recordEvent(arcEvent.tag || 'lifechanging', arcEvent.id, player.age);
                }
            }

            return results;
        }

        // =========================================================================
        // TENSION SYSTEM
        // =========================================================================
        _updateTension(player) {
            // Tension rises with negative player state
            let tensionDelta = 0;

            // Health pressure
            if (player.health < 30) tensionDelta += 5;
            else if (player.health < 50) tensionDelta += 2;
            else if (player.health > 80) tensionDelta -= 2;

            // Financial pressure
            if (player.money < 0) tensionDelta += 8;
            else if (player.money < 1000) tensionDelta += 4;
            else if (player.money > 50000) tensionDelta -= 2;
            else if (player.money > 200000) tensionDelta -= 4;

            // Stress pressure
            if (player.stress > 80) tensionDelta += 5;
            else if (player.stress > 60) tensionDelta += 2;
            else if (player.stress < 20) tensionDelta -= 3;

            // Happiness dampens tension
            if (player.happiness < 20) tensionDelta += 4;
            else if (player.happiness > 80) tensionDelta -= 3;

            // Unemployed adults
            if (player.age >= 18 && (!player.job || player.job === 'unemployed')) {
                tensionDelta += 3;
            }

            // Natural decay toward baseline (50)
            const baseline = 50;
            tensionDelta += (baseline - this.tension) * 0.05;

            this.tension = Math.max(0, Math.min(100, this.tension + tensionDelta));
        }

        // =========================================================================
        // PACING PHASE MACHINE
        // =========================================================================
        _advancePhase(player) {
            this.phaseYearsRemaining--;

            if (this.phaseYearsRemaining <= 0) {
                switch (this.phase) {
                    case 'calm':
                        this.phase = 'building';
                        this.phaseYearsRemaining = 2 + Math.floor(Math.random() * 2); // 2-3yr
                        this.arcIntensity = 0;
                        break;
                    case 'building':
                        this.phase = 'climax';
                        this.phaseYearsRemaining = 1 + Math.floor(Math.random() * 2); // 1-2yr
                        this.arcIntensity = Math.min(100, this.arcIntensity + 30);
                        break;
                    case 'climax':
                        this.phase = 'recovery';
                        this.phaseYearsRemaining = 1 + Math.floor(Math.random() * 2); // 1-2yr (was 2-4)
                        this.arcIntensity = Math.max(0, this.arcIntensity - 40);
                        break;
                    case 'recovery':
                        this.phase = 'calm';
                        this.phaseYearsRemaining = 1 + Math.floor(Math.random() * 2); // 1-2yr (was 1-3)
                        this.arcIntensity = 0;
                        break;
                }
            }
        }

        // =========================================================================
        // EVENT CHANCE CALCULATION
        // =========================================================================
        _calculateEventChance(player) {
            // Base: depends on phase
            const phaseChance = {
                calm: 0.20,      // was 0.15
                building: 0.40,  // was 0.35
                climax: 0.65,    // was 0.60
                recovery: 0.25   // was 0.20
            };
            let chance = phaseChance[this.phase] || 0.25;

            // Pity timer: guaranteed event after 5yr drought
            if (this.yearsSinceLastEvent >= 5) return 0.95;
            if (this.yearsSinceLastEvent >= 4) chance += 0.30;  // was 0.25
            else if (this.yearsSinceLastEvent >= 3) chance += 0.20;  // was 0.15
            else if (this.yearsSinceLastEvent >= 2) chance += 0.10;  // was 0.08

            // Too many events recently? Cool down
            if (this.yearsSinceLastEvent === 0) chance *= 0.3;
            if (this.yearsSinceLastEvent === 1) chance *= 0.6;

            // Tension pressure: high tension → more events
            if (this.tension > 70) chance += 0.15;
            else if (this.tension > 50) chance += 0.05;

            // Cap at max events per life
            if (this.eventsThisLife >= this.maxEventsPerLife) chance = 0;

            return Math.min(0.90, Math.max(0.05, chance));  // raised cap from 0.85
        }

        // =========================================================================
        // CANDIDATE GATHERING
        // =========================================================================
        _gatherCandidates(player, game) {
            const candidates = [];
            const seenIds = game?.seenEventIds || [];

            // 1. Controlled events (high-quality, handcrafted)
            if (Alive.controlledEvents?.controller) {
                const ctrl = Alive.controlledEvents;
                const pool = ctrl.CONTROLLED_EVENTS || [];
                for (const event of pool) {
                    if (ctrl.controller.canTrigger(event, player)) {
                        candidates.push({
                            source: 'controlled',
                            event: event,
                            baseWeight: 3.0  // controlled events have priority
                        });
                    }
                }
            }

            // 2. JSON events (events.json pool)
            if (Alive.events?.events && Alive.events.loaded) {
                const pool = Alive.events.events;
                for (const event of pool) {
                    // Basic eligibility
                    if (player.age < (event.minAge || 0)) continue;
                    if (player.age > (event.maxAge || 120)) continue;
                    if (event.unique && seenIds.includes(event.id)) continue;
                    // Skip crisis events — those are triggered by stat thresholds
                    if (event.tag === 'crisis') continue;
                    candidates.push({
                        source: 'json',
                        event: event,
                        baseWeight: 1.0
                    });
                }
            }

            return candidates;
        }

        // =========================================================================
        // WEIGHTED EVENT SELECTION
        // =========================================================================
        _weightedSelect(candidates, player) {
            if (candidates.length === 0) return null;

            const stage = this._getLifeStage(player.age);
            const scored = [];

            for (const c of candidates) {
                let weight = c.baseWeight;

                // 1. Rarity factor
                const rarityMult = { common: 1.0, uncommon: 0.7, rare: 0.4, special: 0.2 };
                weight *= rarityMult[c.event.rarity] || 1.0;

                // 2. Life stage bias
                const polarity = TAG_POLARITY[c.event.tag] || 'positive';
                if (polarity === 'positive') weight *= stage.biasPositive * 2;
                else if (polarity === 'negative') weight *= stage.biasNegative * 2;
                else if (polarity === 'lifechanging') weight *= stage.biasLifechanging * 2;

                // 3. Tension-based bias
                if (this.tension > 60 && polarity === 'positive') {
                    weight *= 1.5; // Relief when tense
                } else if (this.tension < 30 && polarity === 'negative') {
                    weight *= 1.4; // Introduce conflict when calm
                }

                // 4. Phase bias
                if (this.phase === 'climax' && (polarity === 'negative' || polarity === 'lifechanging')) {
                    weight *= 1.8;
                }
                if (this.phase === 'recovery' && polarity === 'positive') {
                    weight *= 1.6;
                }

                // 5. Stat-trigger boost (from controlled events)
                if (c.event.statTriggers && c.source === 'controlled') {
                    const statWeight = Alive.controlledEvents?.controller?.getStatWeight?.(c.event, player) || 1.0;
                    weight *= statWeight;
                }

                // 6. Anti-repetition: penalize recently-seen tags, IDs, and polarities
                const eventTag = c.event.tag || 'unknown';
                const recentTagCount = this.recentEventTags.filter(t => t === eventTag).length;
                if (recentTagCount >= 2) weight *= 0.15;   // was 0.2
                else if (recentTagCount === 1) weight *= 0.5;

                if (this.recentEventIds.includes(c.event.id)) weight *= 0.01;  // was 0.05 — near-block

                // Polarity diversity: penalize if 3+ recent events share same polarity
                const recentSamePolarity = this.recentPolarities.filter(p => p === polarity).length;
                if (recentSamePolarity >= 3) weight *= 0.3;

                // 7. Cumulative player tendencies (if consequences module available)
                if (Alive.consequences?.getCumulativeScores) {
                    const scores = Alive.consequences.getCumulativeScores(player);
                    if (scores) {
                        if (eventTag === 'career' && scores.career_ambition > 5) weight *= 1.3;
                        if ((polarity === 'negative') && scores.risk_tolerance > 5) weight *= 1.2;
                        if (eventTag === 'lifechanging' && scores.family_focus > 5) weight *= 1.3;
                    }
                }

                // Ensure minimum weight
                weight = Math.max(0.01, weight);
                scored.push({ ...c, weight });
            }

            // Weighted random pick
            const totalWeight = scored.reduce((sum, s) => sum + s.weight, 0);
            let roll = Math.random() * totalWeight;

            for (const s of scored) {
                roll -= s.weight;
                if (roll <= 0) return s;
            }

            return scored[scored.length - 1]; // fallback
        }

        // =========================================================================
        // HELPERS
        // =========================================================================
        _getLifeStage(age) {
            for (const stage of Object.values(LIFE_STAGES)) {
                if (age >= stage.min && age <= stage.max) return stage;
            }
            return LIFE_STAGES.ELDER;
        }

        _recordEvent(tag, eventId, playerAge) {
            this.eventsThisLife++;
            this.yearsSinceLastEvent = 0;
            this.lastEventAge = playerAge;

            this.recentEventTags.push(tag);
            if (this.recentEventTags.length > 5) this.recentEventTags.shift();

            if (eventId) {
                this.recentEventIds.push(eventId);
                if (this.recentEventIds.length > 15) this.recentEventIds.shift();  // was 10
            }

            // Track polarity for diversity enforcement
            const polarity = TAG_POLARITY[tag] || 'positive';
            this.recentPolarities.push(polarity);
            if (this.recentPolarities.length > 5) this.recentPolarities.shift();

            // Tension adjustment — wider swings for more dramatic arcs
            if (polarity === 'negative') this.tension = Math.min(100, this.tension + 15);  // was +10
            else if (polarity === 'positive') this.tension = Math.max(0, this.tension - 12);  // was -8
            else this.tension = Math.min(100, this.tension + 8);  // was +5

            // Record to telemetry
            if (Alive.telemetry) {
                Alive.telemetry.recordEvent(eventId, tag, playerAge);
            }
        }

        // =========================================================================
        // SERIALIZATION
        // =========================================================================
        getState() {
            return {
                tension: this.tension,
                yearsSinceLastEvent: this.yearsSinceLastEvent,
                recentEventTags: [...this.recentEventTags],
                recentEventIds: [...this.recentEventIds],
                recentPolarities: [...this.recentPolarities],
                eventsThisLife: this.eventsThisLife,
                lastEventAge: this.lastEventAge,
                phase: this.phase,
                phaseYearsRemaining: this.phaseYearsRemaining,
                arcIntensity: this.arcIntensity
            };
        }

        loadState(state) {
            if (!state) return;
            this.tension = state.tension ?? 30;
            this.yearsSinceLastEvent = state.yearsSinceLastEvent ?? 0;
            this.recentEventTags = state.recentEventTags || [];
            this.recentEventIds = state.recentEventIds || [];
            this.recentPolarities = state.recentPolarities || [];
            this.eventsThisLife = state.eventsThisLife ?? 0;
            this.lastEventAge = state.lastEventAge ?? -3;
            this.phase = state.phase || 'calm';
            this.phaseYearsRemaining = state.phaseYearsRemaining ?? 2;
            this.arcIntensity = state.arcIntensity ?? 0;
        }
    }

    // ============================================================================
    // EXPORT
    // ============================================================================
    Alive.EventDirector = EventDirector;
    Alive.director = new EventDirector();

})(window);
