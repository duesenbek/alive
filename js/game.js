/**
 * Game Module - Alive Life Simulator
 * Enhanced game loop with proper event triggers, market system, and death logic
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  // ============================================================================
  // GAME CLASS
  // ============================================================================

  class Game {
    constructor() {
      this.player = null;
      this.ended = false;

      this.startYear = 2000;
      this.currentYear = this.startYear;

      this.activeEvent = null;
      this.seenEventIds = [];
      this.eventQueue = [];

      this.phase = "event";
      this.pendingActionIds = [];

      // Prevent rapid year progression
      this.isProcessingYear = false;

      // Market modifiers for investments
      this.marketModifiers = {
        stocks: 0,
        realestate: 0,
        crypto: 0,
        business: 0
      };

      // Tracking
      this.lifeStats = {
        totalMoneyEarned: 0,
        totalMoneySpent: 0,
        maxNetWorth: 0,
        eventsExperienced: 0,
        choicesMade: 0
      };

      // Monetization
      this.gems = 5;
      this.incomeBoostYearsLeft = 0;
      this.lastEventUndo = null;

      // Yandex SDK integration
      this.ysdk = null;
      this.adsReady = false;

      // Callbacks
      this.onUpdate = null;

      // Best results tracking (persists across lives)
      this.bestResults = {
        bestAge: 0,
        maxNetWorth: 0,
        highScore: 0,
        livesPlayed: 0,
        tutorialComplete: false
      };

      // Current life's fail cause (set when life ends)
      this.failCause = null; // 'old_age', 'poor_health', 'bankruptcy', 'burnout'

      // Onboarding state
      this.isOnboarding = false;
      this.onboardingStep = 0;

      // Ad reward progress tracking
      this._adRewardInProgress = false;

      // === NEW: Director-driven systems ===
      // Dynamic Event Director
      this.director = Alive.director || (Alive.EventDirector ? new Alive.EventDirector() : null);

      // Load meta-progression from localStorage
      if (Alive.meta?.load) Alive.meta.load();
    }

    // NOTE: startNewLife is defined once in the GAME LIFECYCLE section below.
    // Do NOT re-define it here — see ~line 602.

    completeOnboarding() {
      this.isOnboarding = false;
      this.bestResults.tutorialComplete = true;
      this.syncState();
      // Ensure we start properly

      if (this.player.age === 18 && this.player.money === 100) {
        // Keep the reward
      }
    }

    /**
     * Apply a reward from a watched ad
     * @param {string} type - 'MONEY_BOOST', 'HEALTH_RESTORE', 'REVIVE'
     */
    applyReward(type) {
      if (!this.player) return;

      switch (type) {
        case 'MONEY_BOOST':
          const boost = Math.max(1000, Math.floor(this.player.money * 0.5));
          this.player.money += boost;
          Alive.ui?.showToast(`💰 Received +${boost} money!`);
          break;

        case 'HEALTH_RESTORE':
          this.player.health = 100;
          this.player.happiness = Math.max(this.player.happiness, 80);
          Alive.ui?.showToast("❤️ Health fully restored!");
          break;

        case 'REVIVE':
          this.revivePlayer();
          break;

        default:
          console.warn("Unknown reward type:", type);
      }

      this.emitUpdate();
      if (Alive.storage) Alive.storage.save(this.getState());

      // track analytics
      if (this.monetization) {
        this.monetization.trackEvent('reward_claimed', { type });
      }
    }

    // NOTE: revivePlayer is defined once in the AD INTEGRATION section below.
    // Do NOT re-define it here — see ~line 423.

    getStartingMoneyForWealthTier(familyWealthTier) {
      switch (familyWealthTier) {
        case "low":
        case "poor":
          return 100;
        case "high":
        case "rich":
          return 15000;
        case "very_high":
        case "elite":
          return 100000;
        case "medium":
        default:
          return 2500;
      }
    }

    // ==========================================================================
    // GEMS & MONETIZATION
    // ==========================================================================

    getGems() {
      return this.gems;
    }

    addGems(amount) {
      this.gems += amount;
      this.emitUpdate();
    }

    spendGems(amount) {
      if (this.gems >= amount) {
        this.gems -= amount;
        return true;
      }
      return false;
    }

    getIncomeBoostYearsLeft() {
      return this.incomeBoostYearsLeft;
    }

    applyIncomeBoostIfAny() {
      if (this.incomeBoostYearsLeft > 0 && this.player) {
        const boost = Math.round(this.player.annualIncome * 0.25);
        this.player.money += boost;
        this.incomeBoostYearsLeft--;
        return boost;
      }
      return 0;
    }

    // ==========================================================================
    // AD INTEGRATION
    // ==========================================================================

    async initYandexSDK() {
      try {
        if (typeof YaGames !== "undefined") {
          this.ysdk = await YaGames.init();
          this.adsReady = true;

          // Init payments
          await this.initPayments();

          // Init cloud storage
          if (Alive.storage?.initCloudStorage) {
            await Alive.storage.initCloudStorage(this.ysdk);
          }
        }
      } catch (e) {
        console.warn("Yandex SDK not available, using mock");
        this.adsReady = false;
      }
    }

    async syncState() {
      if (!Alive.storage) return;

      const state = this.getState();
      Alive.storage.save(state); // Local
      if (Alive.storage.saveCloud) {
        await Alive.storage.saveCloud(state); // Cloud
      }
    }

    async reportScore(score) {
      if (!this.ysdk) return;
      try {
        const lb = await this.ysdk.getLeaderboards();
        await lb.setLeaderboardScore('wealth', score);
        console.log("Score reported to leaderboard:", score);
      } catch (e) {
        console.warn("Failed to report score:", e);
      }
    }

    async initPayments() {
      if (!this.ysdk) return;
      try {
        this.payments = await this.ysdk.getPayments({ signed: true });
        console.log("Yandex Payments initialized");
      } catch (e) {
        console.warn("Payments not available:", e);
      }
    }

    async buyGems(amountId) {
      if (!this.payments) {
        // Fallback or mock for testing
        console.warn("Payments not ready, using mock gem purchase");
        const success = await this._mockBuyGems(amountId);
        if (success) await this.syncState();
        return success;
      }

      try {
        const purchase = await this.payments.purchase({ id: `gems_${amountId}` });
        // Handle successful purchase
        const rewards = { "small": 50, "medium": 150, "large": 500 };
        this.gems += (rewards[amountId] || 0);
        this.emitUpdate();
        await this.syncState();
        return true;
      } catch (e) {
        console.error("Purchase failed:", e);
        return false;
      }
    }

    async _mockBuyGems(amountId) {
      const rewards = { "small": 50, "medium": 150, "large": 500 };
      this.gems += (rewards[amountId] || 0);
      this.emitUpdate();
      return true;
    }

    async showRewardedAd(type) {
      if (!this.adsReady || !this.ysdk) {
        console.warn("Ads not ready, falling back to mock");
        return this._mockShowRewardedAd(type);
      }

      return new Promise((resolve) => {
        this.ysdk.adv.showRewardedVideo({
          callbacks: {
            onOpen: () => {
              console.log('Video ad open.');
              if (Alive.sound) Alive.sound.setMuted(true);
            },
            onRewarded: () => {
              console.log('Rewarded!');
              this._applyAdReward(type);
              resolve(true);
            },
            onClose: () => {
              console.log('Video ad closed.');
              if (Alive.sound) Alive.sound.setMuted(false);
            },
            onError: (e) => {
              console.error('Error while open video ad:', e);
              resolve(false);
            }
          }
        });
      });
    }

    _applyAdReward(type) {
      // Prevent duplicate reward applications - guard at entry
      const now = Date.now();
      if (this._adRewardInProgress || (this._lastAdRewardTime && now - this._lastAdRewardTime < 5000)) return;
      this._adRewardInProgress = true;
      this._lastAdRewardTime = now;

      if (this.player && this.player.adsWatched !== undefined) {
        this.player.adsWatched++;
      }

      switch (type) {
        case "money":
          if (this.player) this.player.money += 5000;
          if (Alive.ui && Alive.ui.triggerConfetti) Alive.ui.triggerConfetti();
          if (Alive.sound && Alive.sound.playMajorPositive) Alive.sound.playMajorPositive();
          break;
        case "gems":
          this.gems += 10;
          if (Alive.ui && Alive.ui.triggerConfetti) Alive.ui.triggerConfetti();
          if (Alive.sound && Alive.sound.playMajorPositive) Alive.sound.playMajorPositive();
          break;
        case "boost":
          this.incomeBoostYearsLeft += 5;
          break;
        case "revive":
          if (this.player) {
            this.player.health = 50;
            this.ended = false;
          }
          break;
        case "year_bonus":
          if (this.player) this.player.money += Math.round(this.player.annualIncome * 0.5) + 1000;
          break;
        case "cheap_car_ad":
          if (this.player) this.player.car = "sedan_used"; // Assumes this ID exists or maps to one
          break;
        case "cheap_house_ad":
          if (this.player) this.player.housing = "tiny_apartment"; // Assumes this ID exists
          break;

        // CRISIS REWARDS (Refined "Mercy" Logic)
        case "bailout":
          if (this.player) {
            // "Refinancing": Halve the debt
            const debt = this.player.money;
            if (debt < 0) {
              this.player.money = Math.floor(debt / 2);
              Alive.ui?.showToast("Debt Reduced by 50%. Keep fighting.");
            }
          }
          break;
        case "health_restore_crisis":
          if (this.player) {
            // "Stabilize": +15 Health, -10 Stress
            this.player.health = Math.min(100, this.player.health + 15);
            this.player.stress = Math.max(0, this.player.stress - 10);
            Alive.ui?.showToast("Vital signs stabilized (+15 Health).");
          }
          break;
        case "emergency_cash":
          if (this.player) {
            this.player.money += 1000;
            Alive.ui?.showToast("Emergency funds received (+$1000).");
          }
          break;
        case "guaranteed_job":
          if (this.player) {
            this.player.job = "officeClerk";
            this.player.money += 500; // Smaller bonus
            Alive.ui?.showToast("You got the job! Don't lose it.");
          }
          break;
      }
      this.emitUpdate();

      // Defer flag reset to prevent duplicate rewards from rapid ad callbacks
      setTimeout(() => { this._adRewardInProgress = false; }, 500);
    }

    /**
     * Revive the player after death
     */
    revivePlayer() {
      if (!this.ended || !this.player) return;

      if (this.player.flags?.revivedOnce) {
        console.warn("Player already revived once. No more second chances.");
        return;
      }

      console.log("Player revived!");
      this.ended = false;
      this.failCause = null;

      // Mark as revived
      if (!this.player.flags) this.player.flags = {};
      this.player.flags.revivedOnce = true;

      // Penalty/Reset - "Diminished Capacity"
      this.player.health = 40; // Weak
      this.player.happiness = 40;

      Alive.ui?.showGame();
      Alive.ui?.showToast("✨ You have been given a second chance!");
    }

    async _mockShowRewardedAd(type) {
      return new Promise((resolve) => {
        setTimeout(() => {
          this._applyAdReward(type);
          resolve(true);
        }, 500);
      });
    }

    async maybeShowInterstitial(reason) {
      if (!this.adsReady || !this.ysdk) return;

      const showChance = {
        death: 0.8,
        cityMove: 0.5
      };

      if (Math.random() < (showChance[reason] || 0.1)) {
        this.ysdk.adv.showFullscreenAdv({
          callbacks: {
            onOpen: () => {
              if (Alive.sound) Alive.sound.setMuted(true);
            },
            onClose: (wasShown) => {
              if (Alive.sound) Alive.sound.setMuted(false);
            },
            onError: (error) => {
              console.warn("Error showing interstitial:", error);
              if (Alive.sound) Alive.sound.setMuted(false);
            },
            onOffline: () => {
              console.log('Offline mode: Ad skipped');
              if (Alive.sound) Alive.sound.setMuted(false);
            }
          }
        });
      }
    }

    // ==========================================================================
    // LIFE STATS TRACKING
    // ==========================================================================

    resetLifeStats() {
      this.lifeStats = {
        totalMoneyEarned: 0,
        totalMoneySpent: 0,
        maxNetWorth: 0,
        eventsExperienced: 0,
        choicesMade: 0,
        mistakes: [], // { age, choice, statLost, amount }
        missedOpportunities: [] // { age, type, potentialGain }
      };

      // Reset controlled events controller
      if (Alive.controlledEvents?.reset) {
        Alive.controlledEvents.reset();
      }
    }

    trackLifeStats() {
      if (!this.player) return;

      const nw = this.player.netWorth || 0;
      if (nw > this.lifeStats.maxNetWorth) {
        this.lifeStats.maxNetWorth = nw;
      }
    }

    tickLifeStatsYear() {
      if (!this.player) return;

      const income = this.player.annualIncome || 0;
      const expenses = this.player.annualExpenses || 0;

      this.lifeStats.totalMoneyEarned += Math.max(0, income);
      this.lifeStats.totalMoneySpent += Math.max(0, expenses);
    }

    // ==========================================================================
    // MARKET SYSTEM
    // ==========================================================================

    generateMarketModifiers() {
      // Base market performance generation
      const modifiers = {
        savings: 0.05, // fixed 5% interest
        bonds: 0.07,   // fixed 7% interest
        index_funds: 0.08 + (Math.random() - 0.5) * 0.1, // 3% to 13%
        stocks: (Math.random() - 0.5) * 0.25,      // -12.5% to +12.5%
        real_estate: (Math.random() - 0.5) * 0.1 + 0.02,  // -3% to +7%
        crypto: (Math.random() - 0.5) * 0.8,       // -40% to +40%
        startups: (Math.random() - 0.5) * 0.4     // -20% to +20%
      };

      // Rare market crash (only affects volatile assets)
      if (Math.random() < 0.05) {
        const crashType = ["stocks", "crypto", "startups"][Math.floor(Math.random() * 3)];
        modifiers[crashType] = -0.3 - Math.random() * 0.3; // -30% to -60%
        if (global.Alive.ui) global.Alive.ui.showToast("📉 Market Crash in " + crashType.toUpperCase().replace("_", " ") + "!");
      }

      // Rare boom
      if (Math.random() < 0.05) {
        const boomType = ["stocks", "crypto", "real_estate", "startups"][Math.floor(Math.random() * 4)];
        modifiers[boomType] = 0.2 + Math.random() * 0.4; // +20% to +60%
        if (global.Alive.ui) global.Alive.ui.showToast("📈 Market Boom in " + boomType.toUpperCase().replace("_", " ") + "!");
      }

      // Keep old aliases for compatibility just in case
      modifiers.realestate = modifiers.real_estate;
      modifiers.business = modifiers.startups;

      this.marketModifiers = modifiers;
      return this.marketModifiers;
    }

    // ==========================================================================
    // ACHIEVEMENT EVALUATION
    // ==========================================================================

    evaluateAchievements(context) {
      if (!Alive.achievements || !Alive.achievements.evaluate) return;

      const unlocked = Alive.achievements.evaluate({
        player: this.player,
        game: this,
        ...context
      });

      return unlocked;
    }

    /**
     * Queue a crisis/scripted event (used by player_core checkCrisisStates)
     */
    triggerEvent(eventId) {
      if (!eventId || this.ended) return;
      if (!this.eventQueue.includes(eventId)) {
        this.eventQueue.push(eventId);
      }
      this.emitUpdate();
    }

    /** Called when player dies from player_core (e.g. old age in checkCrisisStates) */
    triggerGameOver(cause) {
      if (this.ended) return;
      this.failCause = cause === "Old Age" ? "old_age" : (cause || "unknown");
      this.endGame();
    }

    // ==========================================================================
    // GAME LIFECYCLE
    // ==========================================================================

    /**
     * Start a new life — SINGLE SOURCE OF TRUTH.
     * Merges logic from both original definitions:
     *   - V1: onboarding, processing-flag resets, analytics
     *   - V2: config-driven player creation, economy, achievements
     *
     * @param {object} [config]
     * @param {object} [config.playerState]  — full player state (legacy mode)
     * @param {string} [config.gender]
     * @param {string} [config.name]
     * @param {string} [config.countryId]
     * @param {string} [config.cityId]
     * @param {string} [config.familyWealthTier]
     * @returns {object} player instance
     */
    startNewLife(config = {}) {
      // --- Player creation (from V2) ---
      if (config.playerState) {
        const state = { ...config.playerState, age: config.playerState.age || 0 };
        this.player = new Alive.Player(state);
      } else {
        this.player = Alive.Player.createNew({
          gender: config.gender,
          name: config.name,
          countryId: config.countryId,
          cityId: config.cityId,
          familyWealthTier: config.familyWealthTier
        });
      }

      if (this.player) {
        const startingMoney = this.getStartingMoneyForWealthTier(this.player.familyWealthTier);
        this.player.money = startingMoney;
        this.player.updateNetWorth();
        this.player.recalculateEconomy();
      }

      // --- Game state reset (from V2) ---
      this.ended = false;
      this.currentYear = this.startYear;
      this.seenEventIds = [];
      this.eventQueue = [];
      this.activeEvent = null;

      this.phase = "event";
      this.pendingActionIds = [];

      // Reset gems for new life (keep some)
      this.incomeBoostYearsLeft = 0;

      // --- Processing-flag resets (from V1, was lost) ---
      this.isProcessingYear = false;
      this._adRewardInProgress = false;

      this.resetLifeStats();

      // --- Reset fail cause (from both V1 & V2) ---
      this.failCause = null;

      // --- Onboarding check (from V1, was lost) ---
      if (!this.bestResults.tutorialComplete) {
        this.isOnboarding = true;
        this.onboardingStep = 0;
      }

      // --- Achievement tracking (from V2) ---
      if (Alive.achievements?.onNewLifeStarted) {
        Alive.achievements.onNewLifeStarted();
      }

      // === NEW: Director + Goals + Meta + Arcs reset ===
      // Reset director
      if (this.director?.reset) this.director.reset();

      // Reset event arcs
      if (Alive.eventArcs?.reset) Alive.eventArcs.reset();

      // Reset telemetry
      if (Alive.telemetry?.reset) Alive.telemetry.reset();

      // Assign mid-term goals
      if (Alive.goals?.assignGoals && this.player) {
        Alive.goals.assignGoals(this.player);
      }

      // Apply meta-progression perks and roll starting trait
      if (Alive.meta && this.player) {
        if (Alive.meta.applyPerks) Alive.meta.applyPerks(this.player);
        if (Alive.meta.rollStartingTrait) {
          this.player._startingTrait = Alive.meta.rollStartingTrait(this.player);
        }
      }

      // --- Analytics (from V1, was lost) ---
      if (Alive.Analytics) {
        Alive.Analytics.trackLifeStart(this.player);
        if (Alive.Analytics.trackSessionStart) Alive.Analytics.trackSessionStart();
      }

      this.emitUpdate();
      return this.player;
    }
    startLegacy(childIndex = 0) {
      if (!this.player || !this.player.children || !this.player.children[childIndex]) return false;

      const child = this.player.children[childIndex];
      // Simple inheritance: split net worth evenly among children
      const inheritance = Math.floor(Math.max(0, this.player.netWorth) / this.player.children.length);

      const newState = {
        name: child.name,
        gender: child.gender,
        age: child.age || 0,
        countryId: child.countryId || this.player.countryId || "US",
        city: child.cityId || this.player.city,
        money: inheritance,
        // Reset stats but influence them heavily by parent
        health: 100,
        happiness: 50,
        stress: 0,
        intelligence: Math.min(100, Math.max(0, (this.player.intelligence || 50) + (Math.floor(Math.random() * 40) - 20))),
        looks: Math.min(100, Math.max(0, (this.player.looks || 50) + (Math.floor(Math.random() * 40) - 20))),
        karma: this.player.karma || 50,
        generation: (this.player.generation || 1) + 1
      };

      this.startNewLife({ playerState: newState });

      // Override starting money since startNewLife recalculates it otherwise
      this.player.money = inheritance;
      this.player.updateNetWorth();
      this.player.recalculateEconomy();

      // Notify UI
      this.emitUpdate();
      return true;
    }

    // Check if tutorial is complete (at least 1 life finished)
    isTutorialComplete() {
      return this.bestResults.tutorialComplete || this.bestResults.livesPlayed >= 1;
    }

    // Quick restart for one-click new life (preserves gems)
    startQuickRestart() {
      const preservedGems = this.gems;
      const preservedBestResults = { ...this.bestResults };

      // Random quick start config
      const gender = Math.random() < 0.5 ? "M" : "F";
      const defaultCountryId = Alive.countries?.getAllCountries?.()[0]?.id || "kz";
      const cities = Alive.countries?.getCitiesByCountryId?.(defaultCountryId) || [];
      const cityId = cities[0]?.id || "almaty";
      const name = Alive.names?.getFullName?.(defaultCountryId, gender) || (gender === "F" ? "Emma" : "Alex");

      this.startNewLife({
        gender,
        name,
        countryId: defaultCountryId,
        cityId,
        familyWealthTier: "medium"
      });

      // Restore preserved values
      this.gems = preservedGems;
      this.bestResults = preservedBestResults;
    }

    startYearActionsPhase() {
      if (this.ended || !this.player) return false;
      this.phase = "actions";
      this.pendingActionIds = [];
      this.emitUpdate();
      return true;
    }

    setYearActions(actionIds) {
      if (!Array.isArray(actionIds)) return false;
      this.pendingActionIds = actionIds.filter((x) => typeof x === "string");
      return true;
    }

    commitYearActionsAndAdvance() {
      if (this.ended || !this.player) return;

      const ids = Array.isArray(this.pendingActionIds) ? this.pendingActionIds : [];
      if (Alive.actions && typeof Alive.actions.applyAction === "function") {
        ids.forEach((id) => {
          try {
            Alive.actions.applyAction(id, { player: this.player, game: this });
          } catch (e) {
            // ignore single-action failure
          }
        });
      }

      this.phase = "event";
      this.pendingActionIds = [];
      this.nextYear();
    }

    // ==========================================================================
    // YEAR PROGRESSION
    // ==========================================================================

    nextYear() {
      if (this.ended || !this.player) return;

      // Prevent race conditions - don't allow multiple year advances at once
      if (this.isProcessingYear || this.phase === "actions") {
        return;
      }

      // Early death check - don't process if already dead
      if (!this.isAlive()) {
        this.endGame();
        return;
      }

      this.isProcessingYear = true;

      // Advance year counter and player age together
      this.currentYear++;
      if (this.player) {
        this.player.age++;
      }

      // Generate market conditions
      this.generateMarketModifiers();

      // Apply yearly updates to player
      const economy = this.player.applyYearlyUpdate(this.marketModifiers);

      if (!this.isAlive() || this.ended) {
        this.isProcessingYear = false;
        return;
      }

      // Track stats
      this.tickLifeStatsYear();
      this.trackLifeStats();

      // Apply income boost
      this.applyIncomeBoostIfAny();

      // Check career progression
      this.checkCareerProgression();

      // Check for career risks
      this.checkCareerRisks();

      // Apply skill-based bonuses
      this.applySkillBonuses();

      // Progress self-development tracks
      this.progressSelfDevelopment();

      // Process consequences (health neglect, expired flags, reputation)
      if (Alive.consequences?.processYearlyConsequences) {
        Alive.consequences.processYearlyConsequences(this.player);
      }

      // Apply needs decay (Sims-style needs system)
      if (Alive.needs?.applyNeedsDecay) {
        Alive.needs.applyNeedsDecay(this.player);
      }

      // Apply yearly stat decay (health/happiness based on age/conditions)
      if (Alive.stats?.applyYearlyStatDecay) {
        Alive.stats.applyYearlyStatDecay(this.player);
      }

      // Check stat thresholds and queue crisis events
      if (Alive.stats?.checkStatThresholds) {
        const thresholdEvents = Alive.stats.checkStatThresholds(this.player);
        thresholdEvents.forEach(event => {
          if (event.type === 'health_crisis') {
            this.eventQueue.push('needs_health_crisis');
          } else if (event.type === 'depression') {
            this.eventQueue.push('needs_depression_crisis');
          } else if (event.type === 'bankruptcy') {
            this.eventQueue.push('bankruptcy_crisis');
          }
        });
      }

      // Check for needs crises and queue crisis events
      if (Alive.needs?.getCrisisEvents) {
        const crisisEvents = Alive.needs.getCrisisEvents(this.player);
        if (crisisEvents.length > 0) {
          const crisisChance = Math.min(0.9, 0.3 + (crisisEvents.length * 0.2));
          if (Math.random() < crisisChance) {
            const crisis = crisisEvents[0];
            this.eventQueue.unshift(crisis.eventId);
          }
        }
      }

      // Scripted events
      this.checkScriptedEvents();

      // === NEW: Evaluate mid-term goals ===
      if (Alive.goals?.evaluateGoals) {
        const goalResults = Alive.goals.evaluateGoals(this.player);
        if (goalResults && goalResults.length > 0) {
          const lang = Alive.i18n?.currentLang || 'en';
          for (const result of goalResults) {
            const desc = result.goal.description?.[lang] || result.goal.description?.en || result.goal.id;
            if (result.type === 'achieved') {
              Alive.ui?.showToast('🎯 Goal Achieved: ' + desc);

              // Reward loops: Goal Achievement Bonus
              this.player.happiness = Math.min(100, this.player.happiness + 5);
              if (Alive.economy) Alive.economy.addGems(1, 'goal_achieved');
              else this.addGems(1);
            } else {
              Alive.ui?.showToast('❌ Goal Failed: ' + desc);
            }
          }
        }
      }

      // === NEW: Director-driven event selection ===
      // The director replaces the old flat-random event rolling with
      // tension-aware, phase-driven, weighted selection.
      if (this.director?.evaluateYear && !this.activeEvent && this.eventQueue.length === 0) {
        const directorResults = this.director.evaluateYear(this.player, this);
        for (const result of directorResults) {
          if (result.event) {
            if (result.source === 'controlled') {
              this.queueControlledEvent(result.event);
            } else if (result.source === 'arc') {
              // Arc events get displayed directly as active event
              this.activeEvent = result.event;
              this.lifeStats.eventsExperienced++;
              this.seenEventIds.push(result.event.id);
            } else {
              // JSON events
              const normalized = Alive.events?.normalizeEvent?.(result.event) || result.event;
              this.activeEvent = normalized;
              this.seenEventIds.push(normalized.id);
              this.lifeStats.eventsExperienced++;
            }
            break; // One director event per year
          }
        }
      }

      // Fallback: if no director available, use legacy controlled + random events
      if (!this.director && !this.activeEvent && this.eventQueue.length === 0) {
        // Legacy controlled events
        if (Alive.controlledEvents?.selectEvent) {
          const controlledEvent = Alive.controlledEvents.selectEvent(this.player);
          if (controlledEvent) {
            this.queueControlledEvent(controlledEvent);
          }
        }
        // Legacy random events
        if (!this.activeEvent && this.eventQueue.length === 0) {
          if (Alive.events && Alive.events.getRandomEvent) {
            if (Math.random() < 0.5) {
              const randomEvent = Alive.events.getRandomEvent(this.player, [], this.seenEventIds);
              if (randomEvent) {
                this.activeEvent = randomEvent;
                this.seenEventIds.push(randomEvent.id);
                this.lifeStats.eventsExperienced++;
              }
            }
          }
        }
      }

      // Early death catch: abort if the year's actions killed the player
      if (!this.isAlive() || this.ended) {
        this.endGame();
        this.isProcessingYear = false;
        return;
      }

      // If we have something in queue but no active event, set it active
      if (!this.activeEvent && this.eventQueue.length > 0) {
        const nextId = this.eventQueue.shift();
        let ev = Alive.events?.getEventById?.(nextId);
        if (ev) {
          this.activeEvent = ev;
          this.seenEventIds.push(ev.id);
          this.lifeStats.eventsExperienced++;
        }
      }

      // Telemetry: track year depth
      if (Alive.Analytics?.trackYearAdvance) {
        Alive.Analytics.trackYearAdvance(this.player);
      }
      if (Alive.telemetry) {
        Alive.telemetry.recordYear(this.player, this.director);
      }

      // Decade milestones
      if (this.player && this.player.age > 0 && this.player.age % 10 === 0 && this.player.age <= 80) {
        Alive.ui?.showToast(`🎂 Happy ${this.player.age}th Birthday!`);
        if (this.player.age === 20) Alive.ui?.showToast('🌟 Welcome to adulthood! Goals unlocked.');
        if (this.player.age === 30) Alive.ui?.showToast('⏱️ The decisive decade begins.');
        if (this.player.age === 40) Alive.ui?.showToast('🏔️ Midlife milestone reached.');
        if (this.player.age === 50) Alive.ui?.showToast('🎯 Half a century! Keep going.');
        if (this.player.age === 60) Alive.ui?.showToast('🌅 The golden years approach.');
      }

      // Defer reset to prevent race: queued duplicate clicks still see flag=true
      setTimeout(() => { this.isProcessingYear = false; }, 0);
    }

    checkScriptedEvents() {
      if (!this.player) return;
      const age = this.player.age;

      const scripted = {
        5: "scripted_school_start",
        9: "scripted_family_drama",
        10: "scripted_talent_discovery",
        12: "scripted_life_goals_reveal"
      };

      if (scripted[age]) {
        // Check if event already queued to prevent duplication
        const eventId = scripted[age];
        if (!this.eventQueue.includes(eventId) &&
          (!this.activeEvent || this.activeEvent.id !== eventId) &&
          !this.seenEventIds.includes(eventId)) {
          // Prioritize scripted events
          this.eventQueue.unshift(eventId);
        }
      }
    }

    /**
     * Queue and display a controlled event (high-impact events with built-in i18n)
     */
    queueControlledEvent(controlledEvent) {
      if (!controlledEvent) return;

      const lang = Alive.i18n?.currentLang || 'en';

      // Convert controlled event format to game event format
      const gameEvent = {
        id: controlledEvent.id,
        category: 'controlled',
        rarity: 'special',
        isControlledEvent: true,
        titleKey: controlledEvent.id + '.title',
        descriptionKey: controlledEvent.id + '.desc',
        // Use built-in translations
        title: controlledEvent.title?.[lang] || controlledEvent.title?.en || 'Event',
        description: controlledEvent.description?.[lang] || controlledEvent.description?.en || '',
        choices: controlledEvent.choices.map(c => ({
          id: c.id,
          labelKey: controlledEvent.id + '.choice.' + c.id,
          label: c.label?.[lang] || c.label?.en || c.id,
          effects: c.effects || {},
          conditions: c.conditions
        }))
      };

      // Record in controller
      if (Alive.controlledEvents?.recordEvent) {
        Alive.controlledEvents.recordEvent(controlledEvent.id, this.player.age);
      }

      // Set as active event
      this.activeEvent = gameEvent;
      this.lifeStats.eventsExperienced++;
      this.emitUpdate();
    }


    rollForNextEvent() {
      // Evaluate achievements (year end)
      this.evaluateAchievements({ type: "yearEnd" });

      if (!Alive.events) return;

      // Check queued events first
      if (this.eventQueue.length > 0) {
        const queuedEventId = this.eventQueue.shift();
        const queuedEvent = Alive.events.getEventById(queuedEventId);
        if (queuedEvent) {
          this.activeEvent = queuedEvent;
          this.seenEventIds.push(queuedEventId);
          this.lifeStats.eventsExperienced++;
          this.emitUpdate();
          return;
        }
      }

      // Roll for random event
      const event = Alive.events.rollForEvent(this.player, this.seenEventIds);

      if (event) {
        this.activeEvent = event;
        if (event.conditions?.oneTime) {
          this.seenEventIds.push(event.id);
        }
        this.lifeStats.eventsExperienced++;
      } else {
        this.activeEvent = null;
      }

      // Emit update at the end of turn processing
      this.emitUpdate();
      this.syncState();
    }

    checkCareerProgression() {
      if (!this.player?.isEmployed() || !Alive.jobs) return;

      const progression = Alive.jobs.checkCareerProgression(
        this.player,
        this.player.jobYearsInRole
      );

      if (progression?.eventId) {
        this.eventQueue.push(progression.eventId);
      }
    }

    checkCareerRisks() {
      if (!this.player?.isEmployed() || !Alive.jobs) return;

      // Career skill reduces risk of being fired
      const careerSkill = this.player.careerSkill || 0;
      const riskReduction = careerSkill / 200; // Up to 50% reduction at skill 100

      const risk = Alive.jobs.rollCareerRisk(this.player);

      if (risk) {
        // Career skill can prevent some risks
        if (risk.name === "fired" && Math.random() < riskReduction) {
          // Skill saved you from being fired
          return;
        }

        // Handle different risk types
        switch (risk.name) {
          case "fired":
            this.eventQueue.push("career_fired");
            break;
          case "burnout":
            this.eventQueue.push("career_burnout");
            break;
          case "injury":
            this.eventQueue.push("work_injury");
            break;
          case "accident":
            this.eventQueue.push("car_accident");
            break;
        }
      }
    }

    // ==========================================================================
    // SKILL-BASED BONUSES
    // ==========================================================================

    applySkillBonuses() {
      if (!this.player) return;

      // Prevent multiple applications per year
      if (this.lastSkillBonusYear === this.currentYear) return;
      this.lastSkillBonusYear = this.currentYear;

      const p = this.player;

      // Sports skill: Health bonus
      if ((p.sportsSkill || 0) >= 30) {
        const healthBonus = Math.floor((p.sportsSkill - 30) / 20); // 0-3 bonus
        if (Math.random() < 0.3) {
          p.applyEffects({ healthDelta: healthBonus });
        }
      }

      // Social skill: Relationship maintenance
      if ((p.socialSkill || 0) >= 30) {
        // Better relationship decay prevention
        if (p.partner) {
          const socialBonus = Math.floor((p.socialSkill - 30) / 25);
          p.partner.relationshipScore = Math.min(100, (p.partner.relationshipScore || 50) + socialBonus);
        }
      }

      // Investing skill: Better returns (handled in investment logic)
      // Business skill: Better business outcomes (handled in business logic)
      // Career skill: Faster promotions (handled in career progression)
    }

    // ==========================================================================
    // SELF-DEVELOPMENT PROGRESSION
    // ==========================================================================

    progressSelfDevelopment() {
      if (!this.player || !Alive.selfDevelopment) return;

      const selfDev = Alive.selfDevelopment;

      // Progress education if enrolled
      if (this.player.education?.currentlyEnrolled) {
        const result = selfDev.progressEducation(this.player);
        if (result?.graduated) {
          // Queue graduation event based on stage
          if (result.stage.id === "university") {
            this.eventQueue.push("edu_university_graduation");
          }
        }
        if (result?.events) {
          result.events.forEach(evt => {
            if (evt.type === "scholarship") {
              this.eventQueue.push("edu_scholarship");
            }
          });
        }
      }

      // Progress career if employed
      if (this.player.isEmployed?.() || this.player.job !== "unemployed") {
        const careerResult = selfDev.progressCareer(this.player);
        if (careerResult?.promoted) {
          this.eventQueue.push("career_promotion_offer");
        }
      }

      // Progress business if active
      if (this.player.business?.active) {
        const bizResult = selfDev.progressBusiness(this.player);
        if (bizResult?.failed) {
          // Business failed - could trigger event
        }
        if (bizResult?.events) {
          bizResult.events.forEach(evt => {
            if (evt.type === "investor_offer") {
              this.eventQueue.push("business_investor_meeting");
            }
            if (evt.type === "exit_opportunity") {
              this.eventQueue.push("business_exit_offer");
            }
          });
        }
      }

      // Progress investments
      if (this.player.portfolio?.holdings?.length > 0) {
        selfDev.progressInvestments(this.player, this.marketModifiers);
      }

      // Progress relationships (family, friends, pets)
      this.progressRelationships();
    }

    // ==========================================================================
    // RELATIONSHIP PROGRESSION
    // ==========================================================================

    progressRelationships() {
      if (!this.player || !Alive.relationships) return;

      const rel = Alive.relationships;

      // Ensure state is initialized
      rel.ensureExtendedRelationshipsState(this.player);

      // Age all extended relationships (parents, siblings, friends, pets)
      rel.ageExtendedRelationshipsOneYear(this.player);

      // Check for parent mortality
      const parentDeaths = rel.checkParentMortality(this.player);
      parentDeaths.forEach(death => {
        this.eventQueue.push("parent_death");
        // Apply inheritance
        const inheritance = rel.getInheritance(this.player, death.type);
        if (inheritance > 0) {
          this.player.applyEffects({ moneyDelta: inheritance });
        }
      });

      // Check for pet mortality
      const petDeaths = rel.checkPetMortality(this.player);
      petDeaths.forEach(() => {
        this.player.applyEffects({ happinessDelta: -8, stressDelta: 5 });
      });

      // Roll for family events
      const familyEvent = rel.rollForFamilyEvent(this.player);
      if (familyEvent) {
        if (familyEvent.type === "parent_illness") {
          this.eventQueue.push("parent_illness");
        } else if (familyEvent.type === "family_needs_money") {
          this.eventQueue.push("friend_needs_help"); // Reuse similar event
        } else if (familyEvent.type === "sibling_milestone") {
          this.eventQueue.push("sibling_wedding");
        }
      }

      // Roll for friend events
      const friendEvent = rel.rollForFriendEvent(this.player);
      if (friendEvent) {
        if (friendEvent.type === "friend_betrayal") {
          this.eventQueue.push("friend_betrayal");
        } else if (friendEvent.type === "friend_success") {
          this.eventQueue.push("friend_success");
        } else if (friendEvent.type === "friend_opportunity") {
          this.eventQueue.push("friend_startup_idea");
        } else if (friendEvent.type === "friend_needs_help") {
          this.eventQueue.push("friend_needs_help");
        }
      }

      // Roll for pet events
      const petEvent = rel.rollForPetEvent(this.player);
      if (petEvent) {
        if (petEvent.type === "pet_sick") {
          this.eventQueue.push("pet_sick");
        } else if (petEvent.type === "pet_trick") {
          this.eventQueue.push("pet_trick");
        } else if (petEvent.type === "dog_hero") {
          this.eventQueue.push("pet_hero");
        }
      }

      // Remove friends with very low closeness
      const friends = this.player.friends || [];
      friends.forEach(friend => {
        if (friend.alive !== false && friend.closeness < 10) {
          rel.loseFriend(this.player, friend.id, "drifted_apart");
        }
      });

      // Apply pet costs to yearly expenses (handled in player.recalculateEconomy)
      // Pets provide happiness bonus based on bond
      const alivePets = (this.player.pets || []).filter(p => p.alive !== false);
      if (alivePets.length > 0) {
        const avgBond = alivePets.reduce((sum, p) => sum + (p.bond || 50), 0) / alivePets.length;
        const happinessBonus = Math.floor(avgBond / 25); // 0-4 happiness per year from pets
        this.player.applyEffects({ happinessDelta: happinessBonus });
      }
    }

    // ==========================================================================
    // EVENT HANDLING
    // ==========================================================================

    // ==========================================================================
    // EVENT HANDLING
    // ==========================================================================

    /**
     * Alias for UI compatibility
     */
    makeChoice(optionId) {
      return this.handleChoice(optionId);
    }

    async handleChoice(optionId) {
      if (!this.activeEvent || !this.player) return;

      const choice = this.activeEvent.choices?.find(c => c.id === optionId);
      if (!choice) return;

      // Check if choice is available
      if (Alive.events?.isChoiceAvailable && !Alive.events.isChoiceAvailable(choice, this.player)) {
        return;
      }

      // HANDLE ADS: If choice has adReward, show Ad first
      if (choice.adReward) {
        console.log(`Choice requires Ad: ${choice.adReward}`);
        // Pause game flow? (It's already paused by event)
        const success = await this.showRewardedAd(choice.adReward);

        if (!success) {
          Alive.ui?.showToast("Ad unavailable. Try again...");
          // Re-enable the button so player can retry
          this.emitUpdate();
          return;
        }
        // If success, logic continues below (or applyAdReward handles it)
        // Actually, applyAdReward handles the *benefit*. 
        // The choice might also have stats (like Empty stats for "Call Headhunter").
      }

      // Store undo state (only for normal events, expensive for ads?)
      if (!choice.adReward) {
        // Limit undo state size to prevent memory issues
        const playerState = this.player.toJSON();
        const undoState = {
          event: this.activeEvent,
          choice: optionId,
          playerSnapshot: JSON.stringify(playerState)
        };

        // Limit the snapshot size to prevent memory bloat
        const snapshotStr = JSON.stringify(playerState);
        if (snapshotStr.length < 50000) { // Limit to ~50KB
          this.lastEventUndo = undoState;
        }
      }

      // Apply effects via Event Engine
      // Note: Alive.events.applyChoice returns 'outcome' with specialEffect/adReward flags
      // We already handled adReward above via direct check, or applyChoice gives us the signal?
      // Let's rely on choice object directly since we have it.

      const outcome = Alive.events.applyChoice(choice, this.player);

      // HANDLE SPECIAL EFFECTS (Bankruptcy/Death/Etc)
      if (outcome.specialEffect) {
        this.handleSpecialEffect(outcome.specialEffect);
      }

      // Track history
      this.player.addHistoryEntry(this.activeEvent.id, optionId);

      // Analytics: Choice Made
      if (Alive.Analytics) {
        Alive.Analytics.trackChoice(optionId, 'success');
      }

      // Handle consequences (standard event chain)
      if (this.activeEvent.consequences) {
        this.activeEvent.consequences.forEach(cons => {
          if (cons.condition && cons.condition.includes(optionId)) {
            if (cons.eventId) {
              this.eventQueue.push(cons.eventId);
            }
          }
        });
      }

      // Track stats
      this.lifeStats.choicesMade++;

      // Clear active event
      this.activeEvent = null;

      // Check if alive after effects
      if (!this.isAlive()) {
        this.endGame();
        return;
      }

      // Evaluate achievements
      this.evaluateAchievements({ type: "choice", choiceId: optionId });

      this.emitUpdate();
    }

    handleSpecialEffect(effect) {
      if (!this.player) return;
      switch (effect) {
        case 'bankruptcy_penalty':
          this.player.money = 100; // Reset to tiny positive
          this.player.housing = "homeless"; // Lose house
          this.player.car = null; // Lose car
          Alive.ui?.showToast("Assets liquidated. Debt cleared. A fresh start.");
          break;
        case 'risk_death_high':
          // 50% chance to die instantly
          if (Math.random() < 0.5) {
            this.player.health = 0; // Will trigger death in main loop check or immediate
          } else {
            this.player.health = 5; // Barely alive
            Alive.ui?.showToast("Miraculously, you survived via sheer will.");
          }
          break;
      }
    }

    rerollActiveEvent(cost = 10) {
      if (!this.activeEvent) return false;
      if (!this.spendGems(cost)) return false;

      // Get a new event
      const newEvent = Alive.events?.rollForEvent(this.player, this.seenEventIds);

      if (newEvent && newEvent.id !== this.activeEvent.id) {
        this.activeEvent = newEvent;
        if (newEvent.conditions?.oneTime) {
          this.seenEventIds.push(newEvent.id);
        }
      }

      this.emitUpdate();
      return true;
    }

    undoLastChoice(cost = 20) {
      if (!this.lastEventUndo) return false;
      if (!this.spendGems(cost)) return false;

      // Restore player state
      const snapshot = JSON.parse(this.lastEventUndo.playerSnapshot);
      this.player = new Alive.Player(snapshot);

      // Restore event
      this.activeEvent = this.lastEventUndo.event;

      this.lastEventUndo = null;
      this.emitUpdate();
      return true;
    }

    // ==========================================================================
    // INVESTMENTS
    // ==========================================================================

    invest(type, amount) {
      if (!this.player) return false;

      const success = this.player.invest(type, amount);
      if (success) {
        this.evaluateAchievements({ type: "investment" });
        this.emitUpdate();
      }
      return success;
    }

    sellInvestment(type, fraction = 1) {
      if (!this.player) return 0;

      const amount = this.player.sellInvestment(type, fraction);
      this.emitUpdate();
      return amount;
    }

    // ==========================================================================
    // DEATH & END GAME
    // ==========================================================================

    isAlive() {
      if (!this.player) return false;

      // Death by old age
      if (this.player.age >= 110) {
        this.failCause = 'old_age';
        return false;
      }

      // Death by health
      if (this.player.health <= 0) {
        this.failCause = 'poor_health';
        return false;
      }

      // Fail state: Bankruptcy (debt exceeds threshold)
      if (this.player.money <= -5000) {
        this.failCause = 'bankruptcy';
        return false;
      }

      // Fail state: Severe burnout (stressed for too long)
      if ((this.player.burnoutYears || 0) >= 2) {
        this.failCause = 'burnout';
        return false;
      }

      // Random death chance increases with age and low health
      if (this.player.age > 70) {
        const deathChance = ((this.player.age - 70) / 100) * ((100 - this.player.health) / 100);
        if (Math.random() < deathChance) {
          this.failCause = 'old_age';
          return false;
        }
      }

      return true;
    }

    endGame() {
      this.ended = true;
      this.isProcessingYear = false; // Reset year processing flag

      // Clean up event history to prevent memory leaks
      if (this.eventHistory && this.eventHistory.length > 50) {
        this.eventHistory = this.eventHistory.slice(-20); // Keep last 20 events
      }

      // Final achievements check
      this.evaluateAchievements({ type: "death" });

      // Analytics: Life End
      if (Alive.Analytics && this.player) {
        Alive.Analytics.trackLifeEnd(this.player, this.failCause || "unknown");
      }

      // === NEW: Telemetry hooks ===
      if (Alive.Analytics && this.player) {
        if (Alive.Analytics.trackLifeDepth) Alive.Analytics.trackLifeDepth(this.player);
        if (Alive.Analytics.trackEventDiversity) Alive.Analytics.trackEventDiversity(this.seenEventIds);
        if (Alive.Analytics.trackGoalCompletion && Alive.goals) Alive.Analytics.trackGoalCompletion(Alive.goals);
      }
      if (Alive.telemetry) {
        Alive.telemetry.printReport();
      }

      // === NEW: Meta-progression — award Legacy Points ===
      if (Alive.meta?.processLifeEnd && this.player) {
        const completedArcs = Alive.eventArcs?.completedArcIds?.length || 0;
        const lpEarned = Alive.meta.processLifeEnd(
          this.player,
          Alive.goals,
          this.seenEventIds,
          completedArcs
        );
        // Store LP earned for death summary
        this._lastLPEarned = lpEarned;

        if (Alive.Analytics?.trackMetaProgression) {
          Alive.Analytics.trackMetaProgression(lpEarned, Alive.meta.unlockedPerks);
        }
      }

      // Emotional Polish: Flash failure and sound
      if (Alive.ui && Alive.ui.triggerFlashFail) Alive.ui.triggerFlashFail();
      if (Alive.sound && Alive.sound.playFail) Alive.sound.playFail();

      // Update best results
      if (this.player) {
        const age = this.player.age || 0;
        const netWorth = this.player.netWorth || 0;
        const score = age * 100 + Math.floor(netWorth / 1000);

        if (age > this.bestResults.bestAge) {
          this.bestResults.bestAge = age;
        }
        if (netWorth > this.bestResults.maxNetWorth) {
          this.bestResults.maxNetWorth = netWorth;
        }
        if (score > this.bestResults.highScore) {
          this.bestResults.highScore = score;
        }

        this.bestResults.livesPlayed++;
        this.bestResults.tutorialComplete = true;
      }

      // Show interstitial
      this.maybeShowInterstitial("death");

      // Report score and sync
      if (this.player) {
        this.reportScore(this.player.netWorth);
      }
      this.syncState();

      this.emitUpdate();
    }

    buildDeathSummary() {
      if (!this.player) return null;

      const p = this.player;

      const cityId = p.cityId || p.city;
      const lastHistory = Array.isArray(p.history) && p.history.length > 0 ? p.history[p.history.length - 1] : null;

      // Generate clear death explanation based on cause
      let deathExplanation = "";
      if (this.failCause === 'poor_health') {
        if (p.health <= 0) {
          deathExplanation = "Your health reached zero. Years of neglect or critical illness took their toll.";
        } else if (p.age > 70) {
          deathExplanation = "At your advanced age, poor health became too much to handle.";
        } else {
          deathExplanation = "Your health deteriorated to critical levels with no recovery possible.";
        }
      } else if (this.failCause === 'bankruptcy') {
        deathExplanation = "You drowned in debt ($" + Math.abs(p.money).toLocaleString() + "). Financial ruin was unavoidable.";
      } else if (this.failCause === 'old_age') {
        deathExplanation = "You lived a long life and passed away peacefully at age " + p.age + ".";
      } else if (this.failCause === 'burnout') {
        deathExplanation = "Chronic stress and exhaustion overwhelmed your system. Your body simply gave up.";
      } else {
        deathExplanation = "Your life came to an end under mysterious circumstances.";
      }

      const regrets = [];
      const nearMisses = [];

      // 1. FINANCIAL REGRET
      // "Earned Millions, Died Broke"
      if (this.lifeStats.totalMoneyEarned > 1000000 && p.netWorth < 50000) {
        regrets.push("You earned over $1M but saved nothing.");
      }
      // "Almost Escaped Poverty"
      if (p.familyWealthTier === 'poor' && p.netWorth > 10000 && p.netWorth < 50000) {
        nearMisses.push("You were just starting to build real wealth.");
      }

      // 2. CAREER REGRET
      // "Wasted Potential"
      const maxSkill = Math.max(p.careerSkill || 0, p.businessSkill || 0, p.sportsSkill || 0, p.intelligence || 0);
      if (maxSkill > 80 && p.money < 10000) {
        regrets.push("A genius mind wasted on survival.");
      }
      // "Just missed retirement"
      if (this.failCause !== 'old_age' && p.age > 55 && p.age < 65) {
        nearMisses.push("You were so close to retirement age.");
      }

      // 3. FAILURE ANALYSIS
      if (this.failCause === 'bankruptcy') {
        regrets.push("Debt finally caught up to you.");
      } else if (this.failCause === 'poor_health') {
        regrets.push("You traded your health for money, and lost both.");
      }

      return {
        name: p.name,
        age: p.age,
        // ... (existing fields)
        gender: p.gender,

        // Location
        countryId: p.countryId,
        cityId,

        // Final stats
        finalNetWorth: p.netWorth,
        finalMoney: p.money,
        maxNetWorth: this.lifeStats.maxNetWorth,

        // Final core stats
        health: p.health,
        happiness: p.happiness,
        intelligence: p.intelligence,
        stress: p.stress,

        // Assets
        housing: p.housing,
        car: p.car,
        followers: p.followers,

        // Career
        lastJob: p.job,
        totalYearsWorked: p.totalYearsWorked,
        jobsHeld: p.jobsHeld,

        // Family
        marriageStatus: p.marriageStatus,
        totalChildren: p.totalChildrenHad,
        partner: p.partner ? { name: p.partner.name, gender: p.partner.gender } : null,
        children: Array.isArray(p.children)
          ? p.children.map((c) => ({ name: c.name, gender: c.gender, age: c.age }))
          : [],

        // Travel
        citiesVisited: p.citiesVisited,

        // Stats
        eventsExperienced: this.lifeStats.eventsExperienced,
        choicesMade: this.lifeStats.choicesMade,
        totalEarned: this.lifeStats.totalMoneyEarned,
        totalSpent: this.lifeStats.totalMoneySpent,

        // Last known event context (if any)
        lastEventId: lastHistory?.eventId || null,
        lastChoiceId: lastHistory?.choiceMade || null,

        // History for graph
        netWorthHistory: p.netWorthHistory,

        // NEW: Psychological Retention Hooks
        regrets: regrets,
        nearMisses: nearMisses,
        deathExplanation: deathExplanation
      };
    }

    // ==========================================================================
    // STATE MANAGEMENT
    // ==========================================================================

    getState() {
      return {
        player: this.player?.toJSON(),
        ended: this.ended,
        currentYear: this.currentYear,
        seenEventIds: this.seenEventIds,
        eventQueue: this.eventQueue,
        activeEvent: this.activeEvent,
        phase: this.phase,
        pendingActionIds: this.pendingActionIds,
        gems: this.gems,
        incomeBoostYearsLeft: this.incomeBoostYearsLeft,
        lifeStats: this.lifeStats,
        marketModifiers: this.marketModifiers,
        failCause: this.failCause
      };
    }

    load(state) {
      if (!state) return false;

      try {
        // Restore player
        if (state.player) {
          this.player = new Alive.Player(state.player);
        } else {
          this.player = new Alive.Player();
        }

        // Reset processing flags on load to prevent stuck states
        this.isProcessingYear = false;
        this._adRewardInProgress = false;

        // Restore game state
        this.ended = state.ended || false;
        this.currentYear = state.currentYear || 0;
        this.seenEventIds = state.seenEventIds || [];
        this.eventQueue = state.eventQueue || [];
        this.activeEvent = state.activeEvent || null;
        this.phase = state.phase || "idle";
        this.pendingActionIds = state.pendingActionIds || [];
        this.gems = state.gems ?? 5;
        this.incomeBoostYearsLeft = state.incomeBoostYearsLeft || 0;
        this.lifeStats = state.lifeStats || this.lifeStats;
        this.marketModifiers = state.marketModifiers || this.marketModifiers;
        this.failCause = state.failCause || null;

        // Restore best results if available
        if (state.bestResults) {
          this.bestResults = { ...this.bestResults, ...state.bestResults };
        }

        this.emitUpdate();
        return true;
      } catch (e) {
        console.error("Failed to load game state:", e);
        return false;
      }
    }

    /** Alias for UI/storage compatibility */
    loadState(state) {
      return this.load(state);
    }

    emitUpdate() {
      const state = this.getState();
      if (typeof this.onUpdate === "function") {
        this.onUpdate(state);
      }

      global.dispatchEvent(new CustomEvent("alive:gameUpdate", {
        detail: {
          ...state,
          game: this
        }
      }));
    }

    // Debug simulation for balance testing
    // Usage: game.runDebugSimulation(1000) or Alive.stats.runDebugSimulation(1000)
    runDebugSimulation(numLives = 1000) {
      if (Alive.stats?.runDebugSimulation) {
        return Alive.stats.runDebugSimulation(numLives);
      }
      console.error('Stats module not loaded');
      return null;
    }
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  Alive.Game = Game;

})(window);
