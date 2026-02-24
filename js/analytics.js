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
        }
    };

    Alive.Analytics = Analytics;

})(window);
