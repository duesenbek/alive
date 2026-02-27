/**
 * Event Arcs Module — Alive Life Simulator
 * Multi-step event chains that span 3-10 years for deep narrative engagement.
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});

    // ============================================================================
    // ARC DEFINITIONS
    // ============================================================================
    const ARC_DEFINITIONS = [
        // --- STARTUP JOURNEY (5 stages) ---
        {
            id: 'arc_startup',
            name: { en: 'Startup Journey', ru: 'Startup Journey' },
            triggerConditions: { minAge: 22, maxAge: 45, minIntelligence: 40, requiresJob: true },
            baseChance: 0.08,
            stages: [
                {
                    id: 'startup_idea',
                    title: { en: 'The Big Idea 💡', ru: 'The Big Idea 💡' },
                    description: { en: 'You have a revolutionary business idea! But it needs investment.', ru: 'You have a revolutionary business idea! But it needs investment.' },
                    choices: [
                        { id: 'invest', label: { en: 'Invest $5,000 to start 🚀', ru: 'Invest $5,000 to start 🚀' }, effects: { moneyDelta: -5000, stressDelta: 10, happinessDelta: 10 }, advancesArc: true },
                        { id: 'pass', label: { en: 'Too risky, pass 😐', ru: 'Too risky, pass 😐' }, effects: { happinessDelta: -3 }, endsArc: true }
                    ]
                },
                {
                    id: 'startup_funding',
                    title: { en: 'Investor Meeting 🤝', ru: 'Investor Meeting 🤝' },
                    description: { en: 'An investor is interested! They want 40% equity. Deal or bootstrap?', ru: 'An investor is interested! They want 40% equity. Deal or bootstrap?' },
                    minYearsAfterPrev: 1,
                    choices: [
                        { id: 'deal', label: { en: 'Take the deal (+$20,000) 💼', ru: 'Take the deal (+$20,000) 💼' }, effects: { moneyDelta: 20000, stressDelta: 5 }, advancesArc: true, setFlag: 'took_investor' },
                        { id: 'bootstrap', label: { en: 'Bootstrap it (-$3,000) 💪', ru: 'Bootstrap it (-$3,000) 💪' }, effects: { moneyDelta: -3000, stressDelta: 15 }, advancesArc: true, setFlag: 'bootstrapped' }
                    ]
                },
                {
                    id: 'startup_growth',
                    title: { en: 'Rapid Growth 📈', ru: 'Rapid Growth 📈' },
                    description: { en: 'Business is booming! But the pace is burning you out.', ru: 'Business is booming! But the pace is burning you out.' },
                    minYearsAfterPrev: 2,
                    choices: [
                        { id: 'double_down', label: { en: 'Double down! All in! 🔥', ru: 'Double down! All in! 🔥' }, effects: { moneyDelta: 15000, stressDelta: 25, healthDelta: -10 }, advancesArc: true },
                        { id: 'balance', label: { en: 'Slow growth, stay healthy ⚖️', ru: 'Slow growth, stay healthy ⚖️' }, effects: { moneyDelta: 5000, stressDelta: -5 }, advancesArc: true }
                    ]
                },
                {
                    id: 'startup_crisis',
                    title: { en: 'Startup Crisis! ⚠️', ru: 'Startup Crisis! ⚠️' },
                    description: { en: 'A competitor just launched the same product. Your revenue is dropping fast.', ru: 'A competitor just launched the same product. Your revenue is dropping fast.' },
                    minYearsAfterPrev: 1,
                    choices: [
                        { id: 'pivot', label: { en: 'Pivot the business (-$10,000) 🔄', ru: 'Pivot the business (-$10,000) 🔄' }, effects: { moneyDelta: -10000, stressDelta: 20, intelligenceDelta: 5 }, advancesArc: true },
                        { id: 'sell', label: { en: 'Sell to the competitor (+$25,000) 💰', ru: 'Sell to the competitor (+$25,000) 💰' }, effects: { moneyDelta: 25000, happinessDelta: -10 }, endsArc: true }
                    ]
                },
                {
                    id: 'startup_exit',
                    title: { en: 'IPO or Bust! 🎯', ru: 'IPO or Bust! 🎯' },
                    description: { en: 'Your company is ready for a big exit. IPO or acquisition?', ru: 'Your company is ready for a big exit. IPO or acquisition?' },
                    minYearsAfterPrev: 2,
                    isRisk: true,
                    choices: [
                        { id: 'ipo', label: { en: 'Go for IPO! 🚀', ru: 'Go for IPO! 🚀' }, riskLevel: 'high', successEffects: { moneyDelta: 200000, happinessDelta: 30 }, failEffects: { moneyDelta: -30000, happinessDelta: -20, stressDelta: 30 }, endsArc: true },
                        { id: 'acquisition', label: { en: 'Accept acquisition ($80,000) 🤝', ru: 'Accept acquisition ($80,000) 🤝' }, effects: { moneyDelta: 80000, happinessDelta: 15, stressDelta: -15 }, endsArc: true }
                    ]
                }
            ]
        },

        // --- ROMANCE ARC (4 stages) ---
        {
            id: 'arc_romance',
            name: { en: 'Unexpected Romance', ru: 'Unexpected Romance' },
            triggerConditions: { minAge: 18, maxAge: 50, noPartner: true },
            baseChance: 0.10,
            stages: [
                {
                    id: 'romance_meet',
                    title: { en: 'A Chance Encounter ❤️', ru: 'A Chance Encounter ❤️' },
                    description: { en: 'You meet someone special at an unexpected place. There\'s instant chemistry.', ru: 'You meet someone special at an unexpected place. There\'s instant chemistry.' },
                    choices: [
                        { id: 'pursue', label: { en: 'Ask for their number 📱', ru: 'Ask for their number 📱' }, effects: { happinessDelta: 10, stressDelta: 5 }, advancesArc: true },
                        { id: 'smile', label: { en: 'Just smile and walk away 😊', ru: 'Just smile and walk away 😊' }, effects: { happinessDelta: 2 }, endsArc: true }
                    ]
                },
                {
                    id: 'romance_dating',
                    title: { en: 'Getting Serious 💑', ru: 'Getting Serious 💑' },
                    description: { en: 'You\'ve been dating for a while. Things are getting serious. Move in together?', ru: 'You\'ve been dating for a while. Things are getting serious. Move in together?' },
                    minYearsAfterPrev: 1,
                    choices: [
                        { id: 'move_in', label: { en: 'Move in together 🏠', ru: 'Move in together 🏠' }, effects: { happinessDelta: 15, stressDelta: 5, moneyDelta: -1000 }, advancesArc: true },
                        { id: 'slow', label: { en: 'Keep things slow 🐌', ru: 'Keep things slow 🐌' }, effects: { happinessDelta: 5 }, advancesArc: true }
                    ]
                },
                {
                    id: 'romance_test',
                    title: { en: 'Relationship Test 💔', ru: 'Relationship Test 💔' },
                    description: { en: 'A big disagreement threatens your relationship. An ex reappears.', ru: 'A big disagreement threatens your relationship. An ex reappears.' },
                    minYearsAfterPrev: 1,
                    choices: [
                        { id: 'fight_for', label: { en: 'Fight for the relationship 💪', ru: 'Fight for the relationship 💪' }, effects: { stressDelta: 10, happinessDelta: 5 }, advancesArc: true },
                        { id: 'break_up', label: { en: 'Maybe we\'re not meant to be 💔', ru: 'Maybe we\'re not meant to be 💔' }, effects: { happinessDelta: -15, stressDelta: -5 }, endsArc: true }
                    ]
                },
                {
                    id: 'romance_proposal',
                    title: { en: 'The Big Question 💍', ru: 'The Big Question 💍' },
                    description: { en: 'After everything you\'ve been through, it\'s time. Will you propose?', ru: 'After everything you\'ve been through, it\'s time. Will you propose?' },
                    minYearsAfterPrev: 1,
                    choices: [
                        { id: 'propose', label: { en: 'Propose! 💍', ru: 'Propose! 💍' }, effects: { happinessDelta: 25, moneyDelta: -5000, marriageStart: true }, endsArc: true },
                        { id: 'wait', label: { en: 'Not yet... ⏳', ru: 'Not yet... ⏳' }, effects: { happinessDelta: -5, stressDelta: 5 }, endsArc: true }
                    ]
                }
            ]
        },

        // --- HEALTH SPIRAL (3 stages) ---
        {
            id: 'arc_health_spiral',
            name: { en: 'Health Warning', ru: 'Health Warning' },
            triggerConditions: { minAge: 30, maxAge: 80, maxHealth: 60 },
            baseChance: 0.07,
            stages: [
                {
                    id: 'health_warning',
                    title: { en: 'Doctor\'s Warning ⚕️', ru: 'Doctor\'s Warning ⚕️' },
                    description: { en: 'Your doctor warns you about troubling test results. Lifestyle changes needed.', ru: 'Your doctor warns you about troubling test results. Lifestyle changes needed.' },
                    choices: [
                        { id: 'change', label: { en: 'Change lifestyle completely 🥗', ru: 'Change lifestyle completely 🥗' }, effects: { healthDelta: 10, happinessDelta: -5, moneyDelta: -2000 }, advancesArc: true, setFlag: 'chose_healthy' },
                        { id: 'ignore', label: { en: 'I\'ll be fine... 🤷', ru: 'I\'ll be fine... 🤷' }, effects: { healthDelta: -5 }, advancesArc: true, setFlag: 'ignored_health' }
                    ]
                },
                {
                    id: 'health_chronic',
                    title: { en: 'Chronic Condition 🏥', ru: 'Chronic Condition 🏥' },
                    description: { en: 'The condition has become chronic. Treatment is expensive but necessary.', ru: 'The condition has become chronic. Treatment is expensive but necessary.' },
                    minYearsAfterPrev: 2,
                    choices: [
                        { id: 'treat', label: { en: 'Full treatment (-$15,000) 💊', ru: 'Full treatment (-$15,000) 💊' }, effects: { moneyDelta: -15000, healthDelta: 20, stressDelta: 10 }, advancesArc: true },
                        { id: 'manage', label: { en: 'Manage with basics (-$3,000) 🩹', ru: 'Manage with basics (-$3,000) 🩹' }, effects: { moneyDelta: -3000, healthDelta: 5, stressDelta: 5 }, advancesArc: true }
                    ]
                },
                {
                    id: 'health_resolution',
                    title: { en: 'Health Crossroads 🔀', ru: 'Health Crossroads 🔀' },
                    description: { en: 'A breakthrough treatment is available, but experimental and expensive.', ru: 'A breakthrough treatment is available, but experimental and expensive.' },
                    minYearsAfterPrev: 2,
                    isRisk: true,
                    choices: [
                        { id: 'experimental', label: { en: 'Try experimental treatment 🧬', ru: 'Try experimental treatment 🧬' }, riskLevel: 'medium', successEffects: { healthDelta: 40, happinessDelta: 20 }, failEffects: { healthDelta: -20, moneyDelta: -10000 }, endsArc: true },
                        { id: 'conventional', label: { en: 'Stick with conventional 💉', ru: 'Stick with conventional 💉' }, effects: { healthDelta: 10, moneyDelta: -5000 }, endsArc: true }
                    ]
                }
            ]
        },

        // --- CRIMINAL PATH (4 stages) ---
        {
            id: 'arc_crime',
            name: { en: 'Shadowy Opportunity', ru: 'Shadowy Opportunity' },
            triggerConditions: { minAge: 18, maxAge: 55, maxMoney: 5000 },
            baseChance: 0.06,
            stages: [
                {
                    id: 'crime_temptation',
                    title: { en: 'Easy Money? 🤫', ru: 'Easy Money? 🤫' },
                    description: { en: 'Someone offers you quick cash for a "small favor." No questions asked.', ru: 'Someone offers you quick cash for a "small favor." No questions asked.' },
                    choices: [
                        { id: 'accept', label: { en: 'Take the offer (+$3,000) 💵', ru: 'Take the offer (+$3,000) 💵' }, effects: { moneyDelta: 3000, stressDelta: 15 }, advancesArc: true },
                        { id: 'refuse', label: { en: 'Walk away 🚶', ru: 'Walk away 🚶' }, effects: { happinessDelta: 3 }, endsArc: true }
                    ]
                },
                {
                    id: 'crime_deeper',
                    title: { en: 'Deeper In 🕳️', ru: 'Deeper In 🕳️' },
                    description: { en: 'The "favors" are getting bigger. The money is too. Hard to say no now.', ru: 'The "favors" are getting bigger. The money is too. Hard to say no now.' },
                    minYearsAfterPrev: 1,
                    choices: [
                        { id: 'continue', label: { en: 'Keep going (+$10,000) 💰', ru: 'Keep going (+$10,000) 💰' }, effects: { moneyDelta: 10000, stressDelta: 20, happinessDelta: -5 }, advancesArc: true },
                        { id: 'out', label: { en: 'Get out while you can 🏃', ru: 'Get out while you can 🏃' }, effects: { stressDelta: -10, moneyDelta: -2000 }, endsArc: true }
                    ]
                },
                {
                    id: 'crime_escalation',
                    title: { en: 'Point of No Return ⚠️', ru: 'Point of No Return ⚠️' },
                    description: { en: 'The police are investigating. You need to make a choice NOW.', ru: 'The police are investigating. You need to make a choice NOW.' },
                    minYearsAfterPrev: 1,
                    choices: [
                        { id: 'double_down', label: { en: 'One last big score (+$50,000) 🎰', ru: 'One last big score (+$50,000) 🎰' }, riskLevel: 'high', successEffects: { moneyDelta: 50000, stressDelta: -10 }, failEffects: { moneyDelta: -20000, healthDelta: -20, stressDelta: 30 }, advancesArc: true },
                        { id: 'turn_self_in', label: { en: 'Turn yourself in ⚖️', ru: 'Turn yourself in ⚖️' }, effects: { moneyDelta: -5000, happinessDelta: -15, stressDelta: -20 }, endsArc: true, setFlag: 'reformed' }
                    ]
                },
                {
                    id: 'crime_resolution',
                    title: { en: 'Justice Catches Up 🔒', ru: 'Justice Catches Up 🔒' },
                    description: { en: 'The feds are at your door. This is it.', ru: 'The feds are at your door. This is it.' },
                    minYearsAfterPrev: 1,
                    isRisk: true,
                    choices: [
                        { id: 'run', label: { en: 'Run! 🏃‍♂️', ru: 'Run! 🏃‍♂️' }, riskLevel: 'high', successEffects: { moneyDelta: -10000, stressDelta: 20, happinessDelta: 5 }, failEffects: { moneyDelta: -30000, healthDelta: -15, happinessDelta: -30, stressDelta: 40 }, endsArc: true },
                        { id: 'face', label: { en: 'Face the music ⚖️', ru: 'Face the music ⚖️' }, effects: { moneyDelta: -15000, happinessDelta: -20, stressDelta: -10 }, endsArc: true }
                    ]
                }
            ]
        }
    ];

    // ============================================================================
    // EVENT ARC MANAGER
    // ============================================================================
    class EventArcManager {
        constructor() {
            this.reset();
        }

        reset() {
            this.activeArcs = [];       // { arcId, currentStage, lastStageAge, flags: {} }
            this.completedArcIds = [];
            this.arcEventsTriggered = 0;
        }

        /**
         * Try to start a new arc if conditions are met
         */
        tryStartArc(player) {
            if (this.activeArcs.length >= 2) return null; // Max 2 concurrent arcs

            const eligible = ARC_DEFINITIONS.filter(arc => {
                if (this.activeArcs.some(a => a.arcId === arc.id)) return false;
                if (this.completedArcIds.includes(arc.id)) return false;

                const cond = arc.triggerConditions;
                if (cond.minAge && player.age < cond.minAge) return false;
                if (cond.maxAge && player.age > cond.maxAge) return false;
                if (cond.minIntelligence && (player.intelligence || 0) < cond.minIntelligence) return false;
                if (cond.requiresJob && (!player.job || player.job === 'unemployed')) return false;
                if (cond.noPartner && player.partner) return false;
                if (cond.maxMoney && player.money > cond.maxMoney) return false;
                if (cond.maxHealth && player.health > cond.maxHealth) return false;

                return true;
            });

            if (eligible.length === 0) return null;

            // Weighted random by baseChance
            const totalChance = eligible.reduce((s, a) => s + a.baseChance, 0);
            let roll = Math.random() * totalChance;
            let selected = null;
            for (const arc of eligible) {
                roll -= arc.baseChance;
                if (roll <= 0) { selected = arc; break; }
            }
            if (!selected) selected = eligible[0];

            // Only start with a chance roll
            if (Math.random() > selected.baseChance * 3) return null;

            // Start the arc
            this.activeArcs.push({
                arcId: selected.id,
                currentStage: 0,
                lastStageAge: player.age,
                flags: {}
            });

            return this._buildArcEvent(selected, 0);
        }

        /**
         * Check active arcs and advance if conditions are met
         */
        advanceArcs(player) {
            for (let i = 0; i < this.activeArcs.length; i++) {
                const active = this.activeArcs[i];
                const arcDef = ARC_DEFINITIONS.find(a => a.id === active.arcId);
                if (!arcDef) continue;

                const nextStageIdx = active.currentStage + 1;
                if (nextStageIdx >= arcDef.stages.length) {
                    // Arc complete
                    this.completedArcIds.push(active.arcId);
                    this.activeArcs.splice(i, 1);
                    i--;
                    continue;
                }

                const nextStage = arcDef.stages[nextStageIdx];
                const minYears = nextStage.minYearsAfterPrev || 1;
                if (player.age - active.lastStageAge < minYears) continue;

                // Advance with some probability
                if (Math.random() < 0.5) {
                    active.currentStage = nextStageIdx;
                    active.lastStageAge = player.age;
                    this.arcEventsTriggered++;
                    return this._buildArcEvent(arcDef, nextStageIdx);
                }
            }

            // Try starting a new arc if none advanced
            if (Math.random() < 0.15) {
                const newArcEvent = this.tryStartArc(player);
                if (newArcEvent) {
                    this.arcEventsTriggered++;
                    return newArcEvent;
                }
            }

            return null;
        }

        /**
         * Process an arc choice result
         */
        processArcChoice(arcId, choiceId, player) {
            const active = this.activeArcs.find(a => a.arcId === arcId);
            if (!active) return;

            const arcDef = ARC_DEFINITIONS.find(a => a.id === arcId);
            if (!arcDef) return;

            const stageDef = arcDef.stages[active.currentStage];
            if (!stageDef) return;

            const choice = stageDef.choices.find(c => c.id === choiceId);
            if (!choice) return;

            // Handle risk/reward choices
            if (choice.riskLevel) {
                const riskChances = { low: 0.8, medium: 0.55, high: 0.35 };
                const successChance = riskChances[choice.riskLevel] || 0.5;
                // Intelligence bonus
                const intelBonus = Math.min(0.15, (player.intelligence || 0) / 500);
                const success = Math.random() < (successChance + intelBonus);

                const effects = success ? choice.successEffects : choice.failEffects;
                if (effects && player.applyEffects) player.applyEffects(effects);
            } else if (choice.effects && player.applyEffects) {
                player.applyEffects(choice.effects);
            }

            // Set arc flags
            if (choice.setFlag) active.flags[choice.setFlag] = true;

            // Handle arc progression
            if (choice.endsArc) {
                this.completedArcIds.push(active.arcId);
                const idx = this.activeArcs.indexOf(active);
                if (idx >= 0) this.activeArcs.splice(idx, 1);
            }
            // advancesArc is handled by advanceArcs() on next year tick
        }

        /**
         * Build a game-compatible event from arc stage
         */
        _buildArcEvent(arcDef, stageIdx) {
            const stage = arcDef.stages[stageIdx];
            const lang = Alive.i18n?.currentLang || 'en';

            return {
                id: `${arcDef.id}_${stage.id}`,
                category: 'arc',
                isArcEvent: true,
                arcId: arcDef.id,
                title: stage.title?.[lang] || stage.title?.en || 'Event',
                description: stage.description?.[lang] || stage.description?.en || '',
                tag: 'lifechanging',
                choices: stage.choices.map(c => ({
                    id: c.id,
                    label: c.label?.[lang] || c.label?.en || c.id,
                    effects: c.effects || {},
                    riskLevel: c.riskLevel,
                    successEffects: c.successEffects,
                    failEffects: c.failEffects,
                    advancesArc: c.advancesArc,
                    endsArc: c.endsArc,
                    setFlag: c.setFlag
                }))
            };
        }

        // =========================================================================
        // SERIALIZATION
        // =========================================================================
        getState() {
            return {
                activeArcs: JSON.parse(JSON.stringify(this.activeArcs)),
                completedArcIds: [...this.completedArcIds],
                arcEventsTriggered: this.arcEventsTriggered
            };
        }

        loadState(state) {
            if (!state) return;
            this.activeArcs = state.activeArcs || [];
            this.completedArcIds = state.completedArcIds || [];
            this.arcEventsTriggered = state.arcEventsTriggered || 0;
        }
    }

    // ============================================================================
    // EXPORT
    // ============================================================================
    Alive.EventArcManager = EventArcManager;
    Alive.eventArcs = new EventArcManager();

})(window);
