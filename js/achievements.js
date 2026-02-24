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
      name: { en: "Half Century", ru: "�������" },
      description: { en: "Reach age 50", ru: "������ �� 50 ���" },
      category: "age",
      check: ({ player }) => player && player.age >= 50
    },
    {
      id: "age_70",
      icon: "🏆",
      name: { en: "Golden Years", ru: "������� ����" },
      description: { en: "Reach age 70", ru: "������ �� 70 ���" },
      category: "age",
      check: ({ player }) => player && player.age >= 70
    },
    {
      id: "age_80",
      icon: "🏆",
      name: { en: "Long Life", ru: "������ �����" },
      description: { en: "Reach age 80", ru: "������ �� 80 ���" },
      category: "age",
      check: ({ player }) => player && player.age >= 80
    },
    {
      id: "age_90",
      icon: "🏆",
      name: { en: "Living Legend", ru: "����� �������" },
      description: { en: "Reach age 90", ru: "������ �� 90 ���" },
      category: "age",
      check: ({ player }) => player && player.age >= 90
    },
    {
      id: "age_100",
      icon: "🏆",
      name: { en: "Centenarian", ru: "���������" },
      description: { en: "Reach age 100", ru: "������ �� 100 ���" },
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
      name: { en: "Getting Started", ru: "������" },
      description: { en: "Reach net worth $10,000", ru: "������� �������� $10,000" },
      category: "wealth",
      check: ({ player }) => player && (player.netWorth || 0) >= 10000
    },
    {
      id: "networth_50k",
      icon: "🏆",
      name: { en: "Comfortable", ru: "������������" },
      description: { en: "Reach net worth $50,000", ru: "������� �������� $50,000" },
      category: "wealth",
      check: ({ player }) => player && (player.netWorth || 0) >= 50000
    },
    {
      id: "networth_100k",
      icon: "🏆",
      name: { en: "Well Off", ru: "��� �������" },
      description: { en: "Reach net worth $100,000", ru: "������� �������� $100,000" },
      category: "wealth",
      check: ({ player }) => player && (player.netWorth || 0) >= 100000
    },
    {
      id: "networth_500k",
      icon: "🏆",
      name: { en: "Half Millionaire", ru: "�������������" },
      description: { en: "Reach net worth $500,000", ru: "������� �������� $500,000" },
      category: "wealth",
      check: ({ player }) => player && (player.netWorth || 0) >= 500000
    },
    {
      id: "networth_1m",
      icon: "🏆",
      name: { en: "Millionaire", ru: "���������" },
      description: { en: "Reach net worth $1,000,000", ru: "������� �������� $1,000,000" },
      category: "wealth",
      unlocks: ["crypto"],
      check: ({ player }) => player && (player.netWorth || 0) >= 1000000
    },
    {
      id: "networth_10m",
      icon: "🏆",
      name: { en: "Multi-Millionaire", ru: "���������������" },
      description: { en: "Reach net worth $10,000,000", ru: "������� �������� $10,000,000" },
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
      name: { en: "Employed", ru: "������������" },
      description: { en: "Get your first job", ru: "�������� ������ ������" },
      category: "career",
      check: ({ player }) => player && player.job && player.job !== "unemployed"
    },
    {
      id: "job_programmer",
      icon: "🏆",
      name: { en: "Code Master", ru: "������ ����" },
      description: { en: "Work as a programmer", ru: "�������� �������������" },
      category: "career",
      check: ({ player }) => player && player.job === "programmer"
    },
    {
      id: "job_doctor",
      icon: "🏆",
      name: { en: "Healer", ru: "��������" },
      description: { en: "Work as a doctor", ru: "�������� ������" },
      category: "career",
      check: ({ player }) => player && player.job === "doctor"
    },
    {
      id: "job_ceo",
      icon: "🏆",
      name: { en: "Top Executive", ru: "���-��������" },
      description: { en: "Become a CEO", ru: "����� CEO" },
      category: "career",
      rarity: "rare",
      check: ({ player }) => player && player.job === "ceo"
    },
    {
      id: "job_entrepreneur",
      icon: "🏆",
      name: { en: "Business Owner", ru: "�������� �������" },
      description: { en: "Become an entrepreneur", ru: "����� ����������������" },
      category: "career",
      check: ({ player }) => player && player.job === "entrepreneur"
    },
    {
      id: "job_artist",
      icon: "🏆",
      name: { en: "Creative Soul", ru: "���������� ����" },
      description: { en: "Work as an artist", ru: "�������� ����������" },
      category: "career",
      check: ({ player }) => player && player.job === "artist"
    },
    {
      id: "job_actor",
      icon: "🏆",
      name: { en: "Performer", ru: "����" },
      description: { en: "Work as an actor", ru: "�������� ������" },
      category: "career",
      check: ({ player }) => player && player.job === "actor"
    },
    {
      id: "career_10_years",
      icon: "?",
      name: { en: "Dedicated Worker", ru: "��������� ��������" },
      description: { en: "Work 10 years total", ru: "���������� 10 ���" },
      category: "career",
      check: ({ player }) => player && (player.totalYearsWorked || 0) >= 10
    },
    {
      id: "career_30_years",
      icon: "🏆",
      name: { en: "Career Professional", ru: "������������" },
      description: { en: "Work 30 years total", ru: "���������� 30 ���" },
      category: "career",
      check: ({ player }) => player && (player.totalYearsWorked || 0) >= 30
    },
    {
      id: "jobs_5_different",
      icon: "🏆",
      name: { en: "Jack of All Trades", ru: "������ �� ��� ����" },
      description: { en: "Hold 5 different jobs", ru: "����������� 5 ������ �����" },
      category: "career",
      check: ({ player }) => player && safeArray(player.jobsHeld).length >= 5
    },

    // --------------------------------------------------------------------------
    // FAMILY ACHIEVEMENTS
    // --------------------------------------------------------------------------
    {
      id: "first_relationship",
      icon: "🏆",
      name: { en: "Dating", ru: "��������" },
      description: { en: "Start a relationship", ru: "������ ���������" },
      category: "family",
      check: ({ player }) => player && player.marriageStatus !== "single"
    },
    {
      id: "married",
      icon: "🏆",
      name: { en: "Just Married", ru: "���������" },
      description: { en: "Get married", ru: "�������� � ����" },
      category: "family",
      check: ({ player }) => player && player.marriageStatus === "married"
    },
    {
      id: "married_25_years",
      icon: "🏆",
      name: { en: "Silver Anniversary", ru: "���������� �������" },
      description: { en: "Stay married 25 years", ru: "������� � ����� 25 ���" },
      category: "family",
      check: ({ player }) => player && (player.marriedYears || 0) >= 25
    },
    {
      id: "married_50_years",
      icon: "🏆",
      name: { en: "Golden Anniversary", ru: "������� �������" },
      description: { en: "Stay married 50 years", ru: "������� � ����� 50 ���" },
      category: "family",
      rarity: "legendary",
      check: ({ player }) => player && (player.marriedYears || 0) >= 50
    },
    {
      id: "divorced",
      icon: "🏆",
      name: { en: "Moving On", ru: "����� �����" },
      description: { en: "Get divorced", ru: "����������" },
      category: "family",
      check: ({ player }) => player && player.marriageStatus === "divorced"
    },
    {
      id: "first_child",
      icon: "🏆",
      name: { en: "Parent", ru: "��������" },
      description: { en: "Have a child", ru: "������ ������" },
      category: "family",
      check: ({ player }) => player && (player.totalChildrenHad || 0) >= 1
    },
    {
      id: "children_3",
      icon: "???????????",
      name: { en: "Growing Family", ru: "������� �����" },
      description: { en: "Have 3 children", ru: "����� 3 �����" },
      category: "family",
      check: ({ player }) => player && (player.totalChildrenHad || 0) >= 3
    },
    {
      id: "children_5",
      icon: "🏆",
      name: { en: "Full House", ru: "������ ���" },
      description: { en: "Have 5 children", ru: "����� 5 �����" },
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
      name: { en: "Relocated", ru: "�������" },
      description: { en: "Move to a new city", ru: "��������� � ������ �����" },
      category: "travel",
      check: ({ player }) => player && safeArray(player.citiesVisited).length >= 2
    },
    {
      id: "cities_3",
      icon: "🏆",
      name: { en: "World Traveler", ru: "��������������" },
      description: { en: "Live in 3 different cities", ru: "���� � 3 ������ �������" },
      category: "travel",
      unlocks: ["prestige_mode"],
      check: ({ player }) => player && safeArray(player.citiesVisited).length >= 3
    },
    {
      id: "cities_5",
      icon: "???",
      name: { en: "Globetrotter", ru: "�����������" },
      description: { en: "Live in 5 different cities", ru: "���� � 5 ������ �������" },
      category: "travel",
      check: ({ player }) => player && safeArray(player.citiesVisited).length >= 5
    },
    {
      id: "cities_all",
      icon: "🏆",
      name: { en: "Citizen of the World", ru: "��������� ����" },
      description: { en: "Live in all 10 cities", ru: "���� �� ���� 10 �������" },
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
      name: { en: "Graduate", ru: "���������" },
      description: { en: "Graduate high school", ru: "�������� �����" },
      category: "education",
      check: ({ player }) => player && (player.educationLevel || 0) >= 1
    },
    {
      id: "university",
      icon: "🏆",
      name: { en: "Degree Holder", ru: "������" },
      description: { en: "Graduate university", ru: "�������� �����������" },
      category: "education",
      check: ({ player }) => player && (player.educationLevel || 0) >= 2
    },
    {
      id: "intelligence_80",
      icon: "🏆",
      name: { en: "Smart", ru: "�����" },
      description: { en: "Reach 80 intelligence", ru: "������� ���������� 80" },
      category: "education",
      check: ({ player }) => player && (player.intelligence || 0) >= 80
    },
    {
      id: "intelligence_95",
      icon: "🏆",
      name: { en: "Genius", ru: "�����" },
      description: { en: "Reach 95 intelligence", ru: "������� ���������� 95" },
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
      name: { en: "Peak Condition", ru: "�������� �����" },
      description: { en: "Reach 90 health", ru: "������� �������� 90" },
      category: "stats",
      check: ({ player }) => player && (player.health || 0) >= 90
    },
    {
      id: "happiness_90",
      icon: "🏆",
      name: { en: "True Happiness", ru: "�������� �������" },
      description: { en: "Reach 90 happiness", ru: "������� ������� 90" },
      category: "stats",
      check: ({ player }) => player && (player.happiness || 0) >= 90
    },
    {
      id: "attractiveness_90",
      icon: "?",
      name: { en: "Head Turner", ru: "��������" },
      description: { en: "Reach 90 attractiveness", ru: "������� ����������������� 90" },
      category: "stats",
      check: ({ player }) => player && (player.attractiveness || 0) >= 90
    },
    {
      id: "all_stats_70",
      icon: "?",
      name: { en: "Well Rounded", ru: "��������������" },
      description: { en: "All stats above 70", ru: "��� �������������� ���� 70" },
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
      name: { en: "Investor", ru: "��������" },
      description: { en: "Make your first investment", ru: "������� ������ ����������" },
      category: "investment",
      check: ({ player }) => player && safeArray(player.investments).length > 0
    },
    {
      id: "diverse_portfolio",
      icon: "🏆",
      name: { en: "Diversified", ru: "��������������" },
      description: { en: "Invest in 3+ different types", ru: "������������� � 3+ ����" },
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
      name: { en: "Crypto Enthusiast", ru: "���������������" },
      description: { en: "Invest in cryptocurrency", ru: "������������� � ������������" },
      category: "investment",
      check: ({ player }) => {
        if (!player) return false;
        return safeArray(player.investments).some(i => i.type === "crypto");
      }
    },
    {
      id: "real_estate_investor",
      icon: "???",
      name: { en: "Real Estate Mogul", ru: "������ ������������" },
      description: { en: "Invest in real estate", ru: "������������� � ������������" },
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
      name: { en: "Rags to Riches", ru: "�� ����� � �����" },
      description: { en: "Go from $0 to $100,000", ru: "����� �� $0 �� $100,000" },
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
      name: { en: "Survivor", ru: "��������" },
      description: { en: "Recover from health below 20", ru: "������ ��� �������� ���� 20" },
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
      name: { en: "Bounce Back", ru: "�����������" },
      description: { en: "Recover from minimal happiness", ru: "������������ ������� � ����" },
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
      name: { en: "Completionist", ru: "������������" },
      description: { en: "Unlock 40 achievements", ru: "������� 40 ����������" },
      category: "special",
      rarity: "legendary",
      check: () => safeArray(progression.unlockedAchievementIds).length >= 40
    },
    {
      id: "lives_5",
      icon: "🏆",
      name: { en: "Reincarnation", ru: "������������" },
      description: { en: "Play 5 lives", ru: "������� 5 ������" },
      category: "special",
      check: () => (progression.totalLivesPlayed || 0) >= 5
    },
    {
      id: "lives_20",
      icon: "🏆",
      name: { en: "Eternal Player", ru: "������ �����" },
      description: { en: "Play 20 lives", ru: "������� 20 ������" },
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
