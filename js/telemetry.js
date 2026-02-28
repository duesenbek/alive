/**
 * Telemetry Module — Alive Life Simulator
 * In-memory engagement metrics for gameplay tuning.
 * No external calls — purely local tracking for debug/balance reports.
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});

    class Telemetry {
        constructor() {
            this.reset();
        }

        reset() {
            this.yearsPlayed = 0;
            this.uniqueEventIds = new Set();
            this.totalEvents = 0;
            this.polarityHistory = [];       // sequence of 'positive'/'negative'/'lifechanging'
            this.eventGaps = [];             // years between consecutive events
            this.yearOfLastEvent = 0;
            this.tensionReadings = [];       // sampled each year
            this.phaseHistory = [];          // phase at each year
            this.startTime = Date.now();
        }

        // Call every year from game.processYear
        recordYear(player, director) {
            this.yearsPlayed++;
            if (director) {
                this.tensionReadings.push(director.tension);
                this.phaseHistory.push(director.phase);
            }
        }

        // Call when an event fires
        recordEvent(eventId, tag, playerAge) {
            this.totalEvents++;
            if (eventId) this.uniqueEventIds.add(eventId);

            // Polarity tracking
            const polarity = this._tagToPolarity(tag);
            this.polarityHistory.push(polarity);

            // Gap tracking
            const gap = playerAge - this.yearOfLastEvent;
            if (this.totalEvents > 1) {
                this.eventGaps.push(gap);
            }
            this.yearOfLastEvent = playerAge;
        }

        // Generate end-of-life telemetry report
        getReport() {
            const unique = this.uniqueEventIds.size;
            const total = this.totalEvents;

            // Event diversity index: ratio of unique events to total (1.0 = perfect diversity)
            const eventDiversityIndex = total > 0 ? unique / total : 0;

            // Repeated event ratio
            const repeatedEventRatio = total > 0 ? (total - unique) / total : 0;

            // Average years between events
            const avgGap = this.eventGaps.length > 0
                ? this.eventGaps.reduce((a, b) => a + b, 0) / this.eventGaps.length
                : 0;

            // Longest drought
            const longestDrought = this.eventGaps.length > 0
                ? Math.max(...this.eventGaps)
                : this.yearsPlayed;

            // Early quit risk: life < 30yr with < 3 events suggests boring game
            const earlyQuitRisk = this.yearsPlayed < 30 && total < 3;

            // Tension variance — higher = more dramatic
            const tensionVariance = this._variance(this.tensionReadings);

            // Session duration
            const sessionDurationSec = Math.round((Date.now() - this.startTime) / 1000);

            // Events per decade
            const eventsPerDecade = this.yearsPlayed > 0
                ? (total / this.yearsPlayed) * 10
                : 0;

            // Phase distribution
            const phaseCounts = {};
            for (const p of this.phaseHistory) {
                phaseCounts[p] = (phaseCounts[p] || 0) + 1;
            }

            return {
                yearsPlayed: this.yearsPlayed,
                totalEvents: total,
                uniqueEvents: unique,
                eventDiversityIndex: Math.round(eventDiversityIndex * 100) / 100,
                repeatedEventRatio: Math.round(repeatedEventRatio * 100) / 100,
                avgYearsBetweenEvents: Math.round(avgGap * 10) / 10,
                longestDrought,
                eventsPerDecade: Math.round(eventsPerDecade * 10) / 10,
                earlyQuitRisk,
                tensionVariance: Math.round(tensionVariance * 10) / 10,
                sessionDurationSec,
                phaseCounts
            };
        }

        // Print formatted report to console
        printReport() {
            const r = this.getReport();
            console.log('\n📊 ═══ TELEMETRY REPORT ═══');
            console.log(`  Years lived: ${r.yearsPlayed}`);
            console.log(`  Events: ${r.totalEvents} total, ${r.uniqueEvents} unique`);
            console.log(`  Diversity index: ${r.eventDiversityIndex} (1.0 = perfect)`);
            console.log(`  Repeated ratio: ${r.repeatedEventRatio}`);
            console.log(`  Avg gap: ${r.avgYearsBetweenEvents} years`);
            console.log(`  Longest drought: ${r.longestDrought} years`);
            console.log(`  Events/decade: ${r.eventsPerDecade}`);
            console.log(`  Tension σ²: ${r.tensionVariance}`);
            console.log(`  Early quit risk: ${r.earlyQuitRisk ? '⚠️ YES' : '✅ NO'}`);
            console.log(`  Session: ${r.sessionDurationSec}s`);
            console.log(`  Phases: ${JSON.stringify(r.phaseCounts)}`);
            console.log('═══════════════════════════\n');
            return r;
        }

        _tagToPolarity(tag) {
            const map = {
                minor_positive: 'positive', major_positive: 'positive',
                minor_negative: 'negative', major_negative: 'negative',
                lifechanging: 'lifechanging', crisis: 'negative', career: 'positive'
            };
            return map[tag] || 'positive';
        }

        _variance(arr) {
            if (arr.length < 2) return 0;
            const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
            return arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length;
        }
    }

    // ============================================================================
    // EXPORT
    // ============================================================================
    Alive.Telemetry = Telemetry;
    Alive.telemetry = new Telemetry();

})(window);
