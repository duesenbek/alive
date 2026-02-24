/**
 * Controlled Events Module - Alive Life Simulator
 * Quality-focused event system with 4-8 high-impact events per life
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});

    // ============================================================================
    // EVENT TAGS
    // ============================================================================
    const EVENT_TAGS = {
        MINOR_POSITIVE: "minor_positive",   // Small wins (+happiness, +small money)
        MINOR_NEGATIVE: "minor_negative",   // Setbacks (-health, -money)
        MAJOR_POSITIVE: "major_positive",   // Big wins (+big money, bonus)
        MAJOR_NEGATIVE: "major_negative",   // Crises (-big money, -health)
        LIFECHANGING: "lifechanging"        // Marriage, death, career change
    };

    // ============================================================================
    // CONTROLLED EVENT POOL - 12 High-Impact Events
    // ============================================================================
    const CONTROLLED_EVENTS = [
        // === MINOR POSITIVE ===
        {
            id: "ctrl_found_money",
            tag: EVENT_TAGS.MINOR_POSITIVE,
            title: { en: "Found Money! ??", ru: "Нашли деньги! ??" },
            description: { en: "You found $200 on the street. What do you do?", ru: "Вы нашли $200 на улице. Что вы сделаете?" },
            minAge: 12, maxAge: 80,
            statTriggers: { moneyBelow: 5000 }, // More likely when broke
            cooldown: 10,
            choices: [
                { id: "keep", label: { en: "Keep it ??", ru: "Оставить себе ??" }, effects: { moneyDelta: 200, happinessDelta: 3 } },
                { id: "donate", label: { en: "Donate it ??", ru: "Пожертвовать ??" }, effects: { happinessDelta: 5, stressDelta: -5 } }
            ]
        },
        {
            id: "ctrl_promotion_offer",
            tag: EVENT_TAGS.MINOR_POSITIVE,
            title: { en: "Promotion Offer! ??", ru: "Предложение повышения! ??" },
            description: { en: "Your boss offers you a promotion. More money, but more responsibility.", ru: "Босс предлагает повышение. Больше денег, но больше ответственности." },
            minAge: 22, maxAge: 60,
            requiresJob: true,
            cooldown: 5,
            choices: [
                { id: "accept", label: { en: "Accept (+$3000, +Stress) ??", ru: "Принять (+$3000, +стресс) ??" }, effects: { moneyDelta: 3000, stressDelta: 15, happinessDelta: 5 } },
                { id: "decline", label: { en: "Decline (Keep balance) ??", ru: "Отказаться (сохранить баланс) ??" }, effects: { happinessDelta: 2, stressDelta: -5 } }
            ]
        },

        // === MINOR NEGATIVE ===
        {
            id: "ctrl_car_breakdown",
            tag: EVENT_TAGS.MINOR_NEGATIVE,
            title: { en: "Car Breakdown ????", ru: "Поломка машины ????" },
            description: { en: "Your car broke down on the highway. Repair costs are high.", ru: "Машина сломалась на трассе. Ремонт дорогой." },
            minAge: 18, maxAge: 80,
            requiresCar: true,
            cooldown: 8,
            choices: [
                { id: "fix", label: { en: "Fix it (-$800) ??", ru: "Починить (-$800) ??" }, effects: { moneyDelta: -800, stressDelta: 5 } },
                { id: "sell", label: { en: "Sell it for parts ??", ru: "Продать на запчасти ??" }, effects: { moneyDelta: 500, happinessDelta: -5, carChange: null } }
            ]
        },
        {
            id: "ctrl_got_sick",
            tag: EVENT_TAGS.MINOR_NEGATIVE,
            title: { en: "Fell Sick ??", ru: "Заболели ??" },
            description: { en: "You caught a bad flu. You need rest, but work is piling up.", ru: "Вы подхватили грипп. Нужен отдых, но работа накапливается." },
            minAge: 5, maxAge: 90,
            statTriggers: { healthBelow: 50 }, // More likely when health is low
            cooldown: 3,
            choices: [
                { id: "rest", label: { en: "Rest at home (-Work) ???", ru: "Отлежаться дома (-работа) ???" }, effects: { healthDelta: 10, moneyDelta: -500, stressDelta: -10 } },
                { id: "push", label: { en: "Push through (-Health) ??", ru: "Перетерпеть (-здоровье) ??" }, effects: { healthDelta: -10, moneyDelta: 200, stressDelta: 10 } }
            ]
        },

        // === MAJOR POSITIVE ===
        {
            id: "ctrl_lottery_win",
            tag: EVENT_TAGS.MAJOR_POSITIVE,
            title: { en: "Lottery Win! ??", ru: "Выигрыш в лотерею! ??" },
            description: { en: "You won $10,000 in the lottery! What will you do with it?", ru: "Вы выиграли $10,000 в лотерею! Что вы сделаете?" },
            minAge: 18, maxAge: 80,
            maxPerLife: 1,
            baseChance: 0.02, // Very rare
            cooldown: 999,
            choices: [
                { id: "invest", label: { en: "Invest wisely ??", ru: "Вложить с умом ??" }, effects: { moneyDelta: 10000, intelligenceDelta: 2 } },
                { id: "splurge", label: { en: "Splurge on fun! ??", ru: "Потратить на развлечения! ??" }, effects: { moneyDelta: 5000, happinessDelta: 15 } }
            ]
        },
        {
            id: "ctrl_inheritance",
            tag: EVENT_TAGS.MAJOR_POSITIVE,
            title: { en: "Inheritance ??", ru: "Наследство ??" },
            description: { en: "A distant relative passed away and left you $15,000.", ru: "Дальний родственник умер и оставил вам $15,000." },
            minAge: 30, maxAge: 70,
            maxPerLife: 1,
            baseChance: 0.03,
            cooldown: 999,
            choices: [
                { id: "accept", label: { en: "Accept gratefully ??", ru: "Принять с благодарностью ??" }, effects: { moneyDelta: 15000, happinessDelta: -2 } },
                { id: "share", label: { en: "Share with family ????????", ru: "Поделиться с семьей ????????" }, effects: { moneyDelta: 7500, happinessDelta: 8 } }
            ]
        },

        // === MAJOR NEGATIVE ===
        {
            id: "ctrl_medical_emergency",
            tag: EVENT_TAGS.MAJOR_NEGATIVE,
            title: { en: "Medical Emergency ??", ru: "Медицинская срочность ??" },
            description: { en: "You need emergency surgery. Without it, your health is at serious risk.", ru: "Вам нужна срочная операция. Без нее ваше здоровье под угрозой." },
            minAge: 25, maxAge: 90,
            statTriggers: { healthBelow: 30 }, // More likely when health critical
            cooldown: 10,
            choices: [
                { id: "surgery", label: { en: "Emergency surgery (-$8000) ??", ru: "Срочная операция (-$8000) ??" }, effects: { moneyDelta: -8000, healthDelta: 30, stressDelta: 10 } },
                { id: "risk", label: { en: "Risk it (Dangerous!) ??", ru: "Рискнуть (Опасно!) ??" }, effects: { healthDelta: -25, happinessDelta: -10, stressDelta: 20 } }
            ]
        },
        {
            id: "ctrl_job_loss",
            tag: EVENT_TAGS.MAJOR_NEGATIVE,
            title: { en: "Laid Off ??", ru: "Уволены ??" },
            description: { en: "The company is downsizing. You've lost your job.", ru: "Компания сокращает штат. Вы потеряли работу." },
            minAge: 20, maxAge: 60,
            requiresJob: true,
            cooldown: 8,
            choices: [
                { id: "severance", label: { en: "Take severance (+$2000) ??", ru: "Взять выходное пособие (+$2000) ??" }, effects: { moneyDelta: 2000, happinessDelta: -10, stressDelta: 15, jobChange: "unemployed" } },
                { id: "sue", label: { en: "Sue for wrongful termination ??", ru: "Подать в суд ??" }, effects: { moneyDelta: -3000, stressDelta: 25, intelligenceDelta: 2, jobChange: "unemployed" } }
            ]
        },

        // === LIFECHANGING ===
        {
            id: "ctrl_marriage_proposal",
            tag: EVENT_TAGS.LIFECHANGING,
            title: { en: "Marriage Proposal ??", ru: "Предложение руки и сердца ??" },
            description: { en: "Your partner proposes marriage. This is a huge decision.", ru: "Ваш партнер делает предложение. Это огромное решение." },
            minAge: 20, maxAge: 50,
            requiresPartner: true,
            maxPerLife: 2,
            cooldown: 10,
            choices: [
                { id: "accept", label: { en: "Say yes! ??", ru: "Сказать да! ??" }, effects: { happinessDelta: 20, moneyDelta: -5000, marriageStart: true } },
                { id: "decline", label: { en: "Not ready... ??", ru: "Не готов(а)... ??" }, effects: { happinessDelta: -15, stressDelta: 10, relationshipEnd: true } }
            ]
        },
        {
            id: "ctrl_divorce_papers",
            tag: EVENT_TAGS.LIFECHANGING,
            title: { en: "Divorce Papers ????", ru: "Документы о разводе ????" },
            description: { en: "Your spouse wants a divorce. There's no going back.", ru: "Ваш супруг хочет развода. Пути назад нет." },
            minAge: 25, maxAge: 70,
            requiresMarried: true,
            statTriggers: { happinessBelow: 30 },
            maxPerLife: 1,
            cooldown: 999,
            choices: [
                { id: "contest", label: { en: "Contest it (-$10000) ??", ru: "Оспорить (-$10000) ??" }, effects: { moneyDelta: -10000, stressDelta: 30, happinessDelta: -10 } },
                { id: "accept", label: { en: "Accept and move on ??", ru: "Принять и двигаться дальше ??" }, effects: { moneyDelta: -5000, happinessDelta: -20, divorceStart: true } }
            ]
        },
        {
            id: "ctrl_child_born",
            tag: EVENT_TAGS.LIFECHANGING,
            title: { en: "A Child is Born! ??", ru: "Родился ребенок! ??" },
            description: { en: "Congratulations! You have a new baby. Life will never be the same.", ru: "Поздравляем! У вас родился ребенок. Жизнь изменится навсегда." },
            minAge: 20, maxAge: 45,
            requiresMarried: true,
            maxPerLife: 3,
            cooldown: 3,
            choices: [
                { id: "celebrate", label: { en: "Celebrate! ??", ru: "Праздновать! ??" }, effects: { happinessDelta: 25, moneyDelta: -3000, stressDelta: 15, triggerChild: true } }
            ]
        },
        {
            id: "ctrl_terminal_diagnosis",
            tag: EVENT_TAGS.LIFECHANGING,
            title: { en: "Terminal Diagnosis ??", ru: "Смертельный диагноз ??" },
            description: { en: "The doctor delivers devastating news. You have limited time left.", ru: "Врач сообщает ужасную новость. У вас осталось мало времени." },
            minAge: 50, maxAge: 100,
            statTriggers: { healthBelow: 20 },
            maxPerLife: 1,
            cooldown: 999,
            choices: [
                { id: "fight", label: { en: "Fight it with everything ??", ru: "Бороться до конца ??" }, effects: { moneyDelta: -20000, healthDelta: 10, stressDelta: 25, happinessDelta: 5 } },
                { id: "accept", label: { en: "Accept peacefully ???", ru: "Принять спокойно ???" }, effects: { happinessDelta: -5, stressDelta: -20, healthDelta: -20 } }
            ]
        }
    ];

    // ============================================================================
    // EVENT CONTROLLER
    // ============================================================================
    class EventController {
        constructor() {
            this.reset();
        }

        reset() {
            this.eventsTriggeredThisLife = 0;
            this.maxEventsPerLife = 8;
            this.eventHistory = []; // { eventId, age }
            this.cooldowns = {}; // { eventId: lastAgeTriggered }
            this.minGapBetweenEvents = 5; // Years
            this.lastEventAge = -10;
        }

        /**
         * Check if an event can trigger based on conditions and cooldowns
         */
        canTrigger(event, player) {
            // Max events per life
            if (this.eventsTriggeredThisLife >= this.maxEventsPerLife) {
                return false;
            }

            // Min gap between any events
            if (player.age - this.lastEventAge < this.minGapBetweenEvents) {
                return false;
            }

            // Age range
            if (event.minAge && player.age < event.minAge) return false;
            if (event.maxAge && player.age > event.maxAge) return false;

            // Cooldown check
            if (this.cooldowns[event.id]) {
                const yearsSinceLastTrigger = player.age - this.cooldowns[event.id];
                if (yearsSinceLastTrigger < (event.cooldown || 5)) {
                    return false;
                }
            }

            // Max per life check
            if (event.maxPerLife) {
                const count = this.eventHistory.filter(e => e.eventId === event.id).length;
                if (count >= event.maxPerLife) return false;
            }

            // Requirement checks
            if (event.requiresJob && (!player.job || player.job === 'unemployed')) return false;
            if (event.requiresPartner && !player.partner) return false;
            if (event.requiresMarried && !player.married) return false;
            if (event.requiresCar && !player.car) return false;

            return true;
        }

        /**
         * Calculate trigger weight based on player stats
         */
        getStatWeight(event, player) {
            let weight = 1.0;

            if (event.statTriggers) {
                // Health-based
                if (event.statTriggers.healthBelow && player.health < event.statTriggers.healthBelow) {
                    weight += (event.statTriggers.healthBelow - player.health) / 20;
                }
                // Money-based
                if (event.statTriggers.moneyBelow && player.money < event.statTriggers.moneyBelow) {
                    weight += 0.5;
                }
                // Stress-based
                if (event.statTriggers.stressAbove && player.stress > event.statTriggers.stressAbove) {
                    weight += (player.stress - event.statTriggers.stressAbove) / 30;
                }
                // Happiness-based
                if (event.statTriggers.happinessBelow && player.happiness < event.statTriggers.happinessBelow) {
                    weight += 0.5;
                }
            }

            return weight;
        }

        /**
         * Select an event for this year (may return null)
         */
        selectEvent(player) {
            // Base chance for any event this year
            const baseEventChance = 0.12; // ~12% chance per year = ~6-8 events in 60 years

            if (Math.random() > baseEventChance) {
                return null;
            }

            // Filter eligible events
            const eligibleEvents = CONTROLLED_EVENTS.filter(e => this.canTrigger(e, player));

            if (eligibleEvents.length === 0) {
                return null;
            }

            // Weight events by stat triggers
            const weightedEvents = eligibleEvents.map(e => ({
                event: e,
                weight: this.getStatWeight(e, player) * (e.baseChance || 0.5)
            }));

            // Sort by weight (higher = more likely)
            weightedEvents.sort((a, b) => b.weight - a.weight);

            // Pick from top weighted events with some randomness
            const topPicks = weightedEvents.slice(0, Math.min(3, weightedEvents.length));
            const selected = topPicks[Math.floor(Math.random() * topPicks.length)];

            return selected ? selected.event : null;
        }

        /**
         * Record that an event was triggered
         */
        recordEvent(eventId, playerAge) {
            this.eventsTriggeredThisLife++;
            this.eventHistory.push({ eventId, age: playerAge });
            this.cooldowns[eventId] = playerAge;
            this.lastEventAge = playerAge;
        }

        /**
         * Get event count for this life
         */
        getEventCount() {
            return this.eventsTriggeredThisLife;
        }

        /**
         * Get state for saving
         */
        getState() {
            return {
                eventsTriggeredThisLife: this.eventsTriggeredThisLife,
                eventHistory: this.eventHistory,
                cooldowns: this.cooldowns,
                lastEventAge: this.lastEventAge
            };
        }

        /**
         * Load state
         */
        loadState(state) {
            if (!state) return;
            this.eventsTriggeredThisLife = state.eventsTriggeredThisLife || 0;
            this.eventHistory = state.eventHistory || [];
            this.cooldowns = state.cooldowns || {};
            this.lastEventAge = state.lastEventAge || -10;
        }
    }

    // ============================================================================
    // EXPORT
    // ============================================================================
    const eventController = new EventController();

    Alive.controlledEvents = {
        EVENT_TAGS,
        CONTROLLED_EVENTS,
        EventController,
        controller: eventController,

        // Convenience methods
        selectEvent: (player) => eventController.selectEvent(player),
        recordEvent: (eventId, age) => eventController.recordEvent(eventId, age),
        reset: () => eventController.reset(),
        getEventCount: () => eventController.getEventCount(),
        getState: () => eventController.getState(),
        loadState: (state) => eventController.loadState(state)
    };

})(window);
