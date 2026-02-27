/**
 * Achievements Module - Alive Life Simulator
 * 50+ achievements with progression tracking and unlock system
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function clampNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function getLang() {
    return Alive.i18n && Alive.i18n.getLanguage ? Alive.i18n.getLanguage() : "ru";
  }

  function tLocal(localized) {
    if (!localized) return "";
    // If it's a string (i18n key), use Alive.i18n
    if (typeof localized === "string") {
      if (Alive.i18n && Alive.i18n.t) return Alive.i18n.t(localized);
      return localized;
    }
    const lang = getLang();
    return localized[lang] || localized.en || "";
  }

  // ============================================================================
  // PROGRESSION STATE
  // ============================================================================

  const DEFAULT_PROGRESSION = {
    version: 1,
    totalLivesPlayed: 0,
    unlockedAchievementIds: [],
    unlockedCities: ["almaty"],
    unlockedJobs: ["unemployed", "janitor", "retailWorker"],
    unlockedFeatures: []
  };

  let progression = { ...DEFAULT_PROGRESSION };

  function loadProgression() {
    try {
      const saved = localStorage.getItem("alive_progression");
      if (saved) {
        const parsed = JSON.parse(saved);
        progression = { ...DEFAULT_PROGRESSION, ...parsed };
      }
    } catch (e) {
      progression = { ...DEFAULT_PROGRESSION };
    }
  }

  function saveProgression() {
    try {
      localStorage.setItem("alive_progression", JSON.stringify(progression));
    } catch (e) { /* ignore */ }
  }

  function getProgression() {
    return { ...progression };
  }

  function resetProgression() {
    progression = { ...DEFAULT_PROGRESSION };
    saveProgression();
  }

  // ============================================================================
  // ACHIEVEMENTS DATABASE - 50+ achievements
  // ============================================================================

  const achievements = [
    // --------------------------------------------------------------------------
    // AGE MILESTONES
    // --------------------------------------------------------------------------
    {
      id: "age_50",
      icon: "🏆",
      nameKey: "ach.age_50.name",
      descKey: "ach.age_50.desc",
      category: "age",
      check: ({ player }) => player && player.age >= 50
    },
    {
      id: "age_70",
      icon: "🏆",
      nameKey: "ach.age_70.name",
      descKey: "ach.age_70.desc",
      category: "age",
      check: ({ player }) => player && player.age >= 70
    },
    {
      id: "age_80",
      icon: "🏆",
      nameKey: "ach.age_80.name",
      descKey: "ach.age_80.desc",
      category: "age",
      check: ({ player }) => player && player.age >= 80
    },
    {
      id: "age_90",
      icon: "🏆",
      nameKey: "ach.age_90.name",
      descKey: "ach.age_90.desc",
      category: "age",
      check: ({ player }) => player && player.age >= 90
    },
    {
      id: "age_100",
      icon: "🏆",
      nameKey: "ach.age_100.name",
      descKey: "ach.age_100.desc",
      category: "age",
      rarity: "legendary",
      check: ({ player }) => player && player.age >= 100
    },

    // --------------------------------------------------------------------------
    // WEALTH MILESTONES
    // --------------------------------------------------------------------------
    {
      id: "networth_10k",
      icon: "🏆",
      nameKey: "ach.networth_10k.name",
      descKey: "ach.networth_10k.desc",
      category: "wealth",
      check: ({ player }) => player && (player.netWorth || 0) >= 10000
    },
    {
      id: "networth_50k",
      icon: "🏆",
      nameKey: "ach.networth_50k.name",
      descKey: "ach.networth_50k.desc",
      category: "wealth",
      check: ({ player }) => player && (player.netWorth || 0) >= 50000
    },
    {
      id: "networth_100k",
      icon: "🏆",
      nameKey: "ach.networth_100k.name",
      descKey: "ach.networth_100k.desc",
      category: "wealth",
      check: ({ player }) => player && (player.netWorth || 0) >= 100000
    },
    {
      id: "networth_500k",
      icon: "🏆",
      nameKey: "ach.networth_500k.name",
      descKey: "ach.networth_500k.desc",
      category: "wealth",
      check: ({ player }) => player && (player.netWorth || 0) >= 500000
    },
    {
      id: "networth_1m",
      icon: "🏆",
      nameKey: "ach.networth_1m.name",
      descKey: "ach.networth_1m.desc",
      category: "wealth",
      unlocks: ["crypto"],
      check: ({ player }) => player && (player.netWorth || 0) >= 1000000
    },
    {
      id: "networth_10m",
      icon: "🏆",
      nameKey: "ach.networth_10m.name",
      descKey: "ach.networth_10m.desc",
      category: "wealth",
      rarity: "epic",
      check: ({ player }) => player && (player.netWorth || 0) >= 10000000
    },

    // --------------------------------------------------------------------------
    // CAREER ACHIEVEMENTS
    // --------------------------------------------------------------------------
    {
      id: "first_job",
      icon: "🏆",
      nameKey: "ach.first_job.name",
      descKey: "ach.first_job.desc",
      category: "career",
      check: ({ player }) => player && player.job && player.job !== "unemployed"
    },
    {
      id: "job_programmer",
      icon: "🏆",
      nameKey: "ach.job_programmer.name",
      descKey: "ach.job_programmer.desc",
      category: "career",
      check: ({ player }) => player && player.job === "programmer"
    },
    {
      id: "job_doctor",
      icon: "🏆",
      nameKey: "ach.job_doctor.name",
      descKey: "ach.job_doctor.desc",
      category: "career",
      check: ({ player }) => player && player.job === "doctor"
    },
    {
      id: "job_ceo",
      icon: "🏆",
      nameKey: "ach.job_ceo.name",
      descKey: "ach.job_ceo.desc",
      category: "career",
      rarity: "rare",
      check: ({ player }) => player && player.job === "ceo"
    },
    {
      id: "job_entrepreneur",
      icon: "🏆",
      nameKey: "ach.job_entrepreneur.name",
      descKey: "ach.job_entrepreneur.desc",
      category: "career",
      check: ({ player }) => player && player.job === "entrepreneur"
    },
    {
      id: "job_artist",
      icon: "🏆",
      nameKey: "ach.job_artist.name",
      descKey: "ach.job_artist.desc",
      category: "career",
      check: ({ player }) => player && player.job === "artist"
    },
    {
      id: "job_actor",
      icon: "🏆",
      nameKey: "ach.job_actor.name",
      descKey: "ach.job_actor.desc",
      category: "career",
      check: ({ player }) => player && player.job === "actor"
    },
    {
      id: "career_10_years",
      icon: "?",
      nameKey: "ach.career_10_years.name",
      descKey: "ach.career_10_years.desc",
      category: "career",
      check: ({ player }) => player && (player.totalYearsWorked || 0) >= 10
    },
    {
      id: "career_30_years",
      icon: "🏆",
      nameKey: "ach.career_30_years.name",
      descKey: "ach.career_30_years.desc",
      category: "career",
      check: ({ player }) => player && (player.totalYearsWorked || 0) >= 30
    },
    {
      id: "jobs_5_different",
      icon: "🏆",
      nameKey: "ach.jobs_5_different.name",
      descKey: "ach.jobs_5_different.desc",
      category: "career",
      check: ({ player }) => player && safeArray(player.jobsHeld).length >= 5
    },

    // --------------------------------------------------------------------------
    // FAMILY ACHIEVEMENTS
    // --------------------------------------------------------------------------
    {
      id: "first_relationship",
      icon: "🏆",
      nameKey: "ach.first_relationship.name",
      descKey: "ach.first_relationship.desc",
      category: "family",
      check: ({ player }) => player && player.marriageStatus !== "single"
    },
    {
      id: "married",
      icon: "🏆",
      nameKey: "ach.married.name",
      descKey: "ach.married.desc",
      category: "family",
      check: ({ player }) => player && player.marriageStatus === "married"
    },
    {
      id: "married_25_years",
      icon: "🏆",
      nameKey: "ach.married_25_years.name",
      descKey: "ach.married_25_years.desc",
      category: "family",
      check: ({ player }) => player && (player.marriedYears || 0) >= 25
    },
    {
      id: "married_50_years",
      icon: "🏆",
      nameKey: "ach.married_50_years.name",
      descKey: "ach.married_50_years.desc",
      category: "family",
      rarity: "legendary",
      check: ({ player }) => player && (player.marriedYears || 0) >= 50
    },
    {
      id: "divorced",
      icon: "🏆",
      nameKey: "ach.divorced.name",
      descKey: "ach.divorced.desc",
      category: "family",
      check: ({ player }) => player && player.marriageStatus === "divorced"
    },
    {
      id: "first_child",
      icon: "🏆",
      nameKey: "ach.first_child.name",
      descKey: "ach.first_child.desc",
      category: "family",
      check: ({ player }) => player && (player.totalChildrenHad || 0) >= 1
    },
    {
      id: "children_3",
      icon: "???????????",
      nameKey: "ach.children_3.name",
      descKey: "ach.children_3.desc",
      category: "family",
      check: ({ player }) => player && (player.totalChildrenHad || 0) >= 3
    },
    {
      id: "children_5",
      icon: "🏆",
      nameKey: "ach.children_5.name",
      descKey: "ach.children_5.desc",
      category: "family",
      unlocks: ["daycare_events"],
      check: ({ player }) => player && (player.totalChildrenHad || 0) >= 5
    },

    // --------------------------------------------------------------------------
    // TRAVEL ACHIEVEMENTS
    // --------------------------------------------------------------------------
    {
      id: "moved_city",
      icon: "🏆",
      nameKey: "ach.moved_city.name",
      descKey: "ach.moved_city.desc",
      category: "travel",
      check: ({ player }) => player && safeArray(player.citiesVisited).length >= 2
    },
    {
      id: "cities_3",
      icon: "🏆",
      nameKey: "ach.cities_3.name",
      descKey: "ach.cities_3.desc",
      category: "travel",
      unlocks: ["prestige_mode"],
      check: ({ player }) => player && safeArray(player.citiesVisited).length >= 3
    },
    {
      id: "cities_5",
      icon: "???",
      nameKey: "ach.cities_5.name",
      descKey: "ach.cities_5.desc",
      category: "travel",
      check: ({ player }) => player && safeArray(player.citiesVisited).length >= 5
    },
    {
      id: "cities_all",
      icon: "🏆",
      nameKey: "ach.cities_all.name",
      descKey: "ach.cities_all.desc",
      category: "travel",
      rarity: "legendary",
      check: ({ player }) => player && safeArray(player.citiesVisited).length >= 10
    },

    // --------------------------------------------------------------------------
    // EDUCATION ACHIEVEMENTS
    // --------------------------------------------------------------------------
    {
      id: "high_school",
      icon: "🏆",
      nameKey: "ach.high_school.name",
      descKey: "ach.high_school.desc",
      category: "education",
      check: ({ player }) => player && (player.educationLevel || 0) >= 1
    },
    {
      id: "university",
      icon: "🏆",
      nameKey: "ach.university.name",
      descKey: "ach.university.desc",
      category: "education",
      check: ({ player }) => player && (player.educationLevel || 0) >= 2
    },
    {
      id: "intelligence_80",
      icon: "🏆",
      nameKey: "ach.intelligence_80.name",
      descKey: "ach.intelligence_80.desc",
      category: "education",
      check: ({ player }) => player && (player.intelligence || 0) >= 80
    },
    {
      id: "intelligence_95",
      icon: "🏆",
      nameKey: "ach.intelligence_95.name",
      descKey: "ach.intelligence_95.desc",
      category: "education",
      rarity: "rare",
      check: ({ player }) => player && (player.intelligence || 0) >= 95
    },

    // --------------------------------------------------------------------------
    // HEALTH & STATS ACHIEVEMENTS
    // --------------------------------------------------------------------------
    {
      id: "health_90",
      icon: "🏆",
      nameKey: "ach.health_90.name",
      descKey: "ach.health_90.desc",
      category: "stats",
      check: ({ player }) => player && (player.health || 0) >= 90
    },
    {
      id: "happiness_90",
      icon: "🏆",
      nameKey: "ach.happiness_90.name",
      descKey: "ach.happiness_90.desc",
      category: "stats",
      check: ({ player }) => player && (player.happiness || 0) >= 90
    },
    {
      id: "attractiveness_90",
      icon: "?",
      nameKey: "ach.attractiveness_90.name",
      descKey: "ach.attractiveness_90.desc",
      category: "stats",
      check: ({ player }) => player && (player.attractiveness || 0) >= 90
    },
    {
      id: "all_stats_70",
      icon: "?",
      nameKey: "ach.all_stats_70.name",
      descKey: "ach.all_stats_70.desc",
      category: "stats",
      check: ({ player }) => player &&
        (player.health || 0) >= 70 &&
        (player.happiness || 0) >= 70 &&
        (player.intelligence || 0) >= 70 &&
        (player.attractiveness || 0) >= 70
    },

    // --------------------------------------------------------------------------
    // INVESTMENT ACHIEVEMENTS
    // --------------------------------------------------------------------------
    {
      id: "first_investment",
      icon: "🏆",
      nameKey: "ach.first_investment.name",
      descKey: "ach.first_investment.desc",
      category: "investment",
      check: ({ player }) => player && safeArray(player.investments).length > 0
    },
    {
      id: "diverse_portfolio",
      icon: "🏆",
      nameKey: "ach.diverse_portfolio.name",
      descKey: "ach.diverse_portfolio.desc",
      category: "investment",
      check: ({ player }) => {
        if (!player) return false;
        const types = new Set(safeArray(player.investments).map(i => i.type));
        return types.size >= 3;
      }
    },
    {
      id: "crypto_investor",
      icon: "?",
      nameKey: "ach.crypto_investor.name",
      descKey: "ach.crypto_investor.desc",
      category: "investment",
      check: ({ player }) => {
        if (!player) return false;
        return safeArray(player.investments).some(i => i.type === "crypto");
      }
    },
    {
      id: "real_estate_investor",
      icon: "???",
      nameKey: "ach.real_estate_investor.name",
      descKey: "ach.real_estate_investor.desc",
      category: "investment",
      check: ({ player }) => {
        if (!player) return false;
        return safeArray(player.investments).some(i => i.type === "realestate");
      }
    },

    // --------------------------------------------------------------------------
    // SPECIAL ACHIEVEMENTS
    // --------------------------------------------------------------------------
    {
      id: "rags_to_riches",
      icon: "🏆",
      nameKey: "ach.rags_to_riches.name",
      descKey: "ach.rags_to_riches.desc",
      category: "special",
      rarity: "epic",
      check: ({ player, game }) => {
        if (!player || !game) return false;
        // Check if player ever had very low money
        const history = safeArray(player.history);
        const wasDebt = history.some(h => (h.money || 0) <= 0);
        return wasDebt && (player.netWorth || 0) >= 100000;
      }
    },
    {
      id: "survivor",
      icon: "???",
      nameKey: "ach.survivor.name",
      descKey: "ach.survivor.desc",
      category: "special",
      check: ({ player }) => {
        if (!player) return false;
        const history = safeArray(player.history);
        return (player.health || 0) >= 50 && player.age >= 40;
      }
    },
    {
      id: "bounce_back",
      icon: "???",
      nameKey: "ach.bounce_back.name",
      descKey: "ach.bounce_back.desc",
      category: "special",
      check: ({ player }) => {
        if (!player) return false;
        // Check if player ever had very low happiness
        const history = safeArray(player.history);
        const wasSad = history.some(h => (h.happiness || 0) <= 10);
        return wasSad && (player.happiness || 0) >= 80;
      }
    },
    {
      id: "completionist",
      icon: "🏆",
      nameKey: "ach.completionist.name",
      descKey: "ach.completionist.desc",
      category: "special",
      rarity: "legendary",
      check: () => safeArray(progression.unlockedAchievementIds).length >= 40
    },
    {
      id: "lives_5",
      icon: "🏆",
      nameKey: "ach.lives_5.name",
      descKey: "ach.lives_5.desc",
      category: "special",
      check: () => (progression.totalLivesPlayed || 0) >= 5
    },
    {
      id: "lives_20",
      icon: "🏆",
      nameKey: "ach.lives_20.name",
      descKey: "ach.lives_20.desc",
      category: "special",
      check: () => (progression.totalLivesPlayed || 0) >= 20
    }
  ];

  // ============================================================================
  // ACHIEVEMENT MANAGER
  // ============================================================================

  class AchievementManager {
    constructor(achievementList) {
      this.list = achievementList || [];
      this.progression = { ...DEFAULT_PROGRESSION };
      this.init();
    }

    init() {
      this.loadProgression();
    }

    get achievements() {
      return this.list;
    }

    getAchievementById(id) {
      return this.list.find(a => a.id === id) || null;
    }

    getAllAchievements() {
      return this.list;
    }

    isAchievementUnlocked(id) {
      return safeArray(this.progression.unlockedAchievementIds).includes(id);
    }

    unlockAchievement(id) {
      if (this.isAchievementUnlocked(id)) return false;

      const achievement = this.getAchievementById(id);
      if (!achievement) return false;

      this.progression.unlockedAchievementIds.push(id);

      // Handle unlocks
      if (achievement.unlocks) {
        achievement.unlocks.forEach(unlock => {
          if (!this.progression.unlockedFeatures.includes(unlock)) {
            this.progression.unlockedFeatures.push(unlock);
          }
        });
      }

      this.saveProgression();

      // Dispatch event for UI notification
      global.dispatchEvent(new CustomEvent("alive:achievementUnlocked", {
        detail: { achievement }
      }));

      return true;
    }

    evaluate(context) {
      const unlocked = [];

      this.list.forEach(achievement => {
        if (this.isAchievementUnlocked(achievement.id)) return;

        try {
          if (achievement.check(context)) {
            if (this.unlockAchievement(achievement.id)) {
              unlocked.push(achievement);
            }
          }
        } catch (e) {
          // Ignore check errors
        }
      });

      return unlocked;
    }

    onNewLifeStarted() {
      this.progression.totalLivesPlayed = (this.progression.totalLivesPlayed || 0) + 1;
      this.saveProgression();
    }

    getUnlockedCount() {
      return safeArray(this.progression.unlockedAchievementIds).length;
    }

    getTotalCount() {
      return this.list.length;
    }

    getProgress() {
      return {
        unlocked: this.getUnlockedCount(),
        total: this.getTotalCount(),
        percentage: Math.round((this.getUnlockedCount() / this.getTotalCount()) * 100)
      };
    }

    getProgression() {
      return { ...this.progression };
    }

    isFeatureUnlocked(feature) {
      return safeArray(this.progression.unlockedFeatures).includes(feature);
    }

    loadProgression() {
      try {
        const saved = localStorage.getItem("alive_progression");
        if (saved) {
          const parsed = JSON.parse(saved);
          this.progression = { ...DEFAULT_PROGRESSION, ...parsed };
        }
      } catch (e) {
        this.progression = { ...DEFAULT_PROGRESSION };
      }
    }

    saveProgression() {
      try {
        localStorage.setItem("alive_progression", JSON.stringify(this.progression));
      } catch (e) { /* ignore */ }
    }

    resetProgression() {
      this.progression = { ...DEFAULT_PROGRESSION };
      this.saveProgression();
    }
  }

  // ============================================================================
  // EXPORT MODULE
  // ============================================================================

  Alive.achievements = new AchievementManager(achievements);

})(window);
