/**
 * Analytics Module - Alive Life Simulator
 * Tracks game events, manages A/B testing, and logs to localStorage
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});

    const LOG_STORAGE_KEY = "alive_analytics_log";
    const AB_STORAGE_KEY = "alive_ab_flags";
    const MAX_LOG_SIZE = 1000; // Keep last 1000 events locally

    // Default Flags
    const DEFAULT_FLAGS = {
        onboarding_length: "10s", // 10s vs 20s
        ad_reward_size: "large",  // small vs large
        restart_ux: "instant"     // instant vs confirm
    };

    let eventQueue = [];
    let isInitialized = false;
    let sessionFlags = null;

    const Analytics = {

        init: function () {
            this.loadOrAssignFlags();

            // Check for Yandex Metrica
            if (typeof ym === 'function') {
                isInitialized = true;
                this.processQueue();
                console.log("Analytics: Initialized (Yandex Metrica Active)");
            } else {
                console.log("Analytics: Local Logging Mode (Metrica not found)");
            }

            // Expose export function globally for debugging
            global.exportAnalyticsLog = this.exportLog.bind(this);
        },

        // ===========================================
        // A/B TESTING
        // ===========================================

        loadOrAssignFlags: function () {
            try {
                const stored = localStorage.getItem(AB_STORAGE_KEY);
                if (stored) {
                    sessionFlags = JSON.parse(stored);
                }
            } catch (e) { console.warn("Analytics: Failed to load flags", e); }

            if (!sessionFlags) {
                // Assign random flags for new users
                sessionFlags = {
                    onboarding_length: Math.random() > 0.5 ? "20s" : "10s",
                    ad_reward_size: Math.random() > 0.5 ? "small" : "large",
                    restart_ux: Math.random() > 0.5 ? "confirm" : "instant"
                };
                try {
                    localStorage.setItem(AB_STORAGE_KEY, JSON.stringify(sessionFlags));
                } catch (e) { }
            }

            console.log("Analytics: A/B Flags", sessionFlags);
        },

        getFlag: function (key) {
            return (sessionFlags && sessionFlags[key]) || DEFAULT_FLAGS[key];
        },

        // ===========================================
        // TRACKING
        // ===========================================

        trackEvent: function (eventName, params = {}) {
            const payload = {
                ...params,
                ab_flags: sessionFlags,
                timestamp: Date.now()
            };

            // 1. Local Log
            this.logToStorage(eventName, payload);

            // 2. Queue or Send to SDK
            if (isInitialized && typeof ym === 'function') {
                // Determine Counter ID if needed, or rely on global `ym` finding default counter
                // Standard YM call: ym(counterId, 'reachGoal', target, params)
                // We'll use a generic wrapper approach assuming global setup is correct
                try {
                    // Try to find counter ID from config or global scope if we want to be precise
                    // For now, we assume the global `ym` works as intended for the default counter
                    // But `ym` usually requires an ID. 
                    // Let's try to get it from Alive.config if exists, else we might be in trouble logs-wise.
                    // Implementation Detail: We won't crash, just try.
                    const counterId = Alive.config?.yandexMetricaId || 99999999;
                    // Note: 99999999 is placeholder.
                    ym(counterId, 'reachGoal', eventName, payload);
                } catch (e) {
                    // console.warn("Analytics: YM send failed", e);
                }
            } else {
                eventQueue.push({ name: eventName, payload: payload });
            }
        },

        // Helpers for Core Events

        trackLifeStart: function (player) {
            this.trackEvent('life_start', {
                country: player.countryId,
                gender: player.gender,
                wealth: player.familyWealthTier
            });
        },

        trackChoice: function (actionId, result) {
            this.trackEvent('choice_made', {
                action_id: actionId,
                result_type: result // 'success', 'fail'
            });
        },

        trackLifeEnd: function (player, cause) {
            this.trackEvent('life_end', {
                age: player.age,
                cause: cause,
                netWorth: player.netWorth,
                score: player.score
            });
        },

        trackAdOffer: function (type, source) {
            this.trackEvent('ad_offer_shown', { type, source });
        },

        trackAdRewarded: function (type, reward) {
            this.trackEvent('ad_rewarded', { type, reward });
        },

        // ===========================================
        // LOCAL LOGGING & EXPORT
        // ===========================================

        logToStorage: function (eventName, payload) {
            try {
                const entry = { event: eventName, params: payload };
                let log = this.getLog();
                log.push(entry);

                // Rotation
                if (log.length > MAX_LOG_SIZE) {
                    log = log.slice(log.length - MAX_LOG_SIZE);
                }

                localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(log));
            } catch (e) {
                // Quota exceeded or private mode
            }
        },

        getLog: function () {
            try {
                const raw = localStorage.getItem(LOG_STORAGE_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                return [];
            }
        },

        exportLog: function () {
            const log = this.getLog();
            const blob = new Blob([JSON.stringify(log, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `alive_analytics_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log(`Analytics: Exported ${log.length} events.`);
            return log;
        },

        processQueue: function () {
            while (eventQueue.length > 0) {
                const item = eventQueue.shift();
                this.trackEvent(item.name, item.params);
            }
        },

        // ===========================================
        // RETENTION TELEMETRY (NEW)
        // ===========================================

        /**
         * Track session start — records first play date for D1 retention.
         */
        trackSessionStart: function () {
            const RETENTION_KEY = 'alive_retention_v1';
            try {
                let data = JSON.parse(localStorage.getItem(RETENTION_KEY) || '{}');
                if (!data.firstPlayDate) {
                    data.firstPlayDate = Date.now();
                }
                data.sessions = (data.sessions || []);
                data.sessions.push(Date.now());
                // Keep last 30 sessions
                if (data.sessions.length > 30) data.sessions = data.sessions.slice(-30);
                data.lastSessionDate = Date.now();
                localStorage.setItem(RETENTION_KEY, JSON.stringify(data));
            } catch (e) { /* storage error */ }

            this.trackEvent('session_start', {});
        },

        /**
         * Track D1 retention: did the player return 24h after first session?
         */
        trackRetention: function () {
            const RETENTION_KEY = 'alive_retention_v1';
            try {
                const data = JSON.parse(localStorage.getItem(RETENTION_KEY) || '{}');
                if (data.firstPlayDate && data.sessions && data.sessions.length >= 2) {
                    const firstSession = data.firstPlayDate;
                    const secondSession = data.sessions.find(s => s - firstSession >= 24 * 60 * 60 * 1000);
                    if (secondSession) {
                        this.trackEvent('retention_d1', { hoursToReturn: Math.floor((secondSession - firstSession) / 3600000) });
                    }
                }
            } catch (e) { /* storage error */ }
        },

        /**
         * Track life depth: average years played per life.
         */
        trackLifeDepth: function (player) {
            const DEPTH_KEY = 'alive_depth_v1';
            try {
                let data = JSON.parse(localStorage.getItem(DEPTH_KEY) || '{}');
                data.lives = (data.lives || []);
                data.lives.push(player.age || 0);
                if (data.lives.length > 50) data.lives = data.lives.slice(-50);
                const avg = data.lives.reduce((a, b) => a + b, 0) / data.lives.length;
                data.avgYearsPlayed = Math.round(avg * 10) / 10;
                localStorage.setItem(DEPTH_KEY, JSON.stringify(data));
            } catch (e) { /* storage error */ }

            this.trackEvent('life_depth', { age: player.age, avgYears: player.age });
        },

        /**
         * Track event diversity: unique events seen / total available events ratio.
         */
        trackEventDiversity: function (seenEventIds) {
            if (!seenEventIds) return;
            const unique = [...new Set(seenEventIds)].length;
            // Estimate total available events
            const totalEvents = (Alive.events?.events?.length || 15) + (Alive.controlledEvents?.CONTROLLED_EVENTS?.length || 12);
            const ratio = totalEvents > 0 ? Math.round((unique / totalEvents) * 100) / 100 : 0;

            this.trackEvent('event_diversity', { uniqueSeen: unique, totalAvailable: totalEvents, ratio: ratio });
        },

        /**
         * Track goal completion stats.
         */
        trackGoalCompletion: function (goals) {
            if (!goals) return;
            this.trackEvent('goal_completion', {
                assigned: goals.assignedGoals?.length || 0,
                achieved: goals.achievedCount || 0,
                failed: goals.failedCount || 0,
                legacyPoints: goals.totalLegacyPoints || 0
            });
        },

        /**
         * Track meta-progression stats.
         */
        trackMetaProgression: function (lpEarned, perks) {
            this.trackEvent('meta_progression', {
                lpEarned: lpEarned,
                totalPerks: perks?.length || 0
            });
        },

        /**
         * Track each year advance (for depth metrics).
         */
        trackYearAdvance: function (player) {
            // Lightweight — just increment a counter
            const DEPTH_KEY = 'alive_depth_v1';
            try {
                let data = JSON.parse(localStorage.getItem(DEPTH_KEY) || '{}');
                data.totalYearsPlayed = (data.totalYearsPlayed || 0) + 1;
                localStorage.setItem(DEPTH_KEY, JSON.stringify(data));
            } catch (e) { /* storage error */ }
        },

        /**
         * Get retention dashboard — for dev console inspection.
         */
        getRetentionDashboard: function () {
            const RETENTION_KEY = 'alive_retention_v1';
            const DEPTH_KEY = 'alive_depth_v1';
            try {
                const retention = JSON.parse(localStorage.getItem(RETENTION_KEY) || '{}');
                const depth = JSON.parse(localStorage.getItem(DEPTH_KEY) || '{}');
                const dashboard = {
                    firstPlayDate: retention.firstPlayDate ? new Date(retention.firstPlayDate).toISOString() : 'N/A',
                    totalSessions: retention.sessions?.length || 0,
                    lastSession: retention.lastSessionDate ? new Date(retention.lastSessionDate).toISOString() : 'N/A',
                    d1Retention: !!(retention.sessions?.find(s => s - retention.firstPlayDate >= 86400000)),
                    avgYearsPerLife: depth.avgYearsPlayed || 0,
                    totalYearsPlayed: depth.totalYearsPlayed || 0,
                    livesTracked: depth.lives?.length || 0,
                    metaSummary: Alive.meta?.getSummary?.() || {}
                };
                console.table(dashboard);
                return dashboard;
            } catch (e) {
                console.warn('Dashboard error', e);
                return {};
            }
        }
    };

    Alive.Analytics = Analytics;

})(window);
