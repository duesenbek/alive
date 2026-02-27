/**
 * Jobs Module - Alive Life Simulator
 * 30 jobs with progression paths, requirements, and career risks
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  // ============================================================================
  // CONSTANTS
  // ============================================================================

  const EDUCATION_LEVELS = {
    NONE: 0,      // No formal education
    HIGH_SCHOOL: 1,  // High school diploma
    UNIVERSITY: 2    // University degree
  };

  // ============================================================================
  // JOBS DATA - 30 unique jobs organized by career tracks
  // ============================================================================


  const jobs = [
    // ==========================================================================
    // TIER 1: POVERTY TRAPS (Safe, Low Pay, High Inflation Risk)
    // Goal: Player slowly starves as expenses outpace income.
    // ==========================================================================
    {
      id: "unemployed",
      nameKey: "job.unemployed",
      name: { en: "Unemployed", ru: "Unemployed" },
      minEducationLevel: EDUCATION_LEVELS.NONE,
      minIntelligence: 0,
      minAttractiveness: 0,
      baseIncomePerMonth: 0,
      stress: 30, // Being poor is stressful
      happinessModifier: -20,
      visualIndicator: "ph-prohibit",
      availableInCities: ["all"],
      progressionPath: [], // Stuck
      careerRisks: []
    },
    {
      id: "janitor",
      nameKey: "job.janitor",
      name: { en: "Janitor", ru: "Уборщик" },
      minEducationLevel: EDUCATION_LEVELS.NONE,
      minIntelligence: 0,
      minAttractiveness: 0,
      baseIncomePerMonth: 1200, // Barely covers costs
      stress: 10, // Low stress
      happinessModifier: -5,
      visualIndicator: "ph-broom",
      availableInCities: ["all"],
      progressionPath: [],
      careerRisks: [] // Safe
    },
    {
      id: "fastFoodWorker",
      nameKey: "job.fastFoodWorker",
      name: { en: "Fast Food Worker", ru: "Работник фастфуда" },
      minEducationLevel: EDUCATION_LEVELS.NONE,
      minIntelligence: 10,
      minAttractiveness: 0,
      baseIncomePerMonth: 1400,
      stress: 40, // High stress for low pay (The worst trade)
      happinessModifier: -10,
      visualIndicator: "ph-hamburger",
      availableInCities: ["all"],
      progressionPath: [{ atYears: 5, eventId: "career_fastfood_manager" }],
      careerRisks: [{ name: "burnout", chance: 0.05 }]
    },
    {
      id: "retailWorker",
      nameKey: "job.retailWorker",
      name: { en: "Retail Worker", ru: "Продавец" },
      minEducationLevel: EDUCATION_LEVELS.NONE,
      minIntelligence: 20,
      minAttractiveness: 20,
      baseIncomePerMonth: 1600,
      stress: 30,
      happinessModifier: -5,
      visualIndicator: "ph-shopping-cart",
      availableInCities: ["all"],
      progressionPath: [{ atYears: 5, eventId: "career_retail_manager" }],
      careerRisks: [{ name: "fired", chance: 0.05 }]
    },
    {
      id: "securityGuard",
      nameKey: "job.securityGuard",
      name: { en: "Security Guard", ru: "Охранник" },
      minEducationLevel: EDUCATION_LEVELS.HIGH_SCHOOL,
      minIntelligence: 20,
      minAttractiveness: 0,
      baseIncomePerMonth: 1800,
      stress: 15,
      happinessModifier: 0,
      visualIndicator: "ph-shield",
      availableInCities: ["all"],
      progressionPath: [],
      careerRisks: [{ name: "injury", chance: 0.02 }]
    },
    {
      id: "deliveryDriver",
      nameKey: "job.deliveryDriver",
      name: { en: "Delivery Driver", ru: "Курьер" },
      minEducationLevel: EDUCATION_LEVELS.NONE,
      minIntelligence: 10,
      minAttractiveness: 0,
      baseIncomePerMonth: 2000, // Good entry pay
      stress: 50, // Very stressful
      happinessModifier: -5,
      visualIndicator: "ph-package",
      availableInCities: ["all"],
      progressionPath: [],
      careerRisks: [{ name: "accident", chance: 0.10 }] // High risk of injury
    },

    // ==========================================================================
    // TIER 2: THE GRIND (Middle Class Trap)
    // Goal: Pays well, but Health/Stress costs cause Burnout (expensive).
    // ==========================================================================
    {
      id: "officeClerk",
      nameKey: "job.officeClerk",
      name: { en: "Office Clerk", ru: "Office Clerk" },
      minEducationLevel: EDUCATION_LEVELS.HIGH_SCHOOL,
      minIntelligence: 40,
      minAttractiveness: 0,
      baseIncomePerMonth: 3000,
      stress: 40,
      happinessModifier: -10, // Boring
      visualIndicator: "ph-briefcase",
      availableInCities: ["all"],
      progressionPath: [{ atYears: 10, eventId: "career_middle_management" }],
      careerRisks: [{ name: "layoff", chance: 0.05 }]
    },
    {
      id: "salesManager",
      nameKey: "job.marketingManager", // Reusing key
      name: { en: "Sales Manager", ru: "Sales Manager" },
      minEducationLevel: EDUCATION_LEVELS.HIGH_SCHOOL,
      minIntelligence: 50,
      minAttractiveness: 40,
      baseIncomePerMonth: 4500, // Decent money
      stress: 70, // High stress
      happinessModifier: -15, // Hate life
      visualIndicator: "ph-trend-up",
      availableInCities: ["all"],
      progressionPath: [],
      careerRisks: [{ name: "burnout", chance: 0.15 }] // High burnout risk
    },
    {
      id: "teacher",
      nameKey: "job.teacher",
      name: { en: "Teacher", ru: "Учитель" },
      minEducationLevel: EDUCATION_LEVELS.UNIVERSITY,
      minIntelligence: 50,
      minAttractiveness: 0,
      baseIncomePerMonth: 3500,
      stress: 60,
      happinessModifier: 10, // Meaningful work
      visualIndicator: "ph-chalkboard-teacher",
      availableInCities: ["all"],
      progressionPath: [{ atYears: 15, eventId: "career_principal" }],
      careerRisks: [{ name: "burnout", chance: 0.08 }]
    },
    {
      id: "nurse",
      nameKey: "job.nurse",
      name: { en: "Nurse", ru: "Медсестра" },
      minEducationLevel: EDUCATION_LEVELS.UNIVERSITY,
      minIntelligence: 45,
      minAttractiveness: 0,
      baseIncomePerMonth: 4000,
      stress: 65,
      happinessModifier: 5,
      visualIndicator: "ph-first-aid",
      availableInCities: ["all"],
      progressionPath: [],
      careerRisks: [{ name: "health_issue", chance: 0.10 }] // Exposure to sickness
    },
    {
      id: "mechanic",
      nameKey: "job.mechanic",
      name: { en: "Mechanic", ru: "Механик" },
      minEducationLevel: EDUCATION_LEVELS.HIGH_SCHOOL,
      minIntelligence: 30,
      minAttractiveness: 0,
      baseIncomePerMonth: 3500,
      stress: 40,
      happinessModifier: 0,
      visualIndicator: "ph-wrench",
      availableInCities: ["all"],
      progressionPath: [{ atYears: 10, eventId: "career_shop_owner" }],
      careerRisks: [{ name: "injury", chance: 0.05 }]
    },
    {
      id: "accountant",
      nameKey: "job.accountant",
      name: { en: "Accountant", ru: "Бухгалтер" },
      minEducationLevel: EDUCATION_LEVELS.UNIVERSITY,
      minIntelligence: 60,
      minAttractiveness: 0,
      baseIncomePerMonth: 5000,
      stress: 50,
      happinessModifier: -5, // Boring
      visualIndicator: "ph-calculator",
      availableInCities: ["all"],
      progressionPath: [],
      careerRisks: [{ name: "burnout", chance: 0.05 }]
    },
    {
      id: "programmer",
      nameKey: "job.programmer",
      name: { en: "Programmer", ru: "Программист" },
      minEducationLevel: EDUCATION_LEVELS.UNIVERSITY,
      minIntelligence: 70,
      minAttractiveness: 0,
      baseIncomePerMonth: 7000, // High pay
      stress: 60,
      happinessModifier: 5,
      visualIndicator: "ph-laptop",
      availableInCities: ["all"],
      progressionPath: [{ atYears: 5, eventId: "career_senior_dev" }],
      careerRisks: [
        { name: "burnout", chance: 0.12 }, // Common
        { name: "layoff", chance: 0.08 }  // Asset bubble risk
      ]
    },
    {
      id: "engineer",
      nameKey: "job.engineer",
      name: { en: "Engineer", ru: "Инженер" },
      minEducationLevel: EDUCATION_LEVELS.UNIVERSITY,
      minIntelligence: 65,
      minAttractiveness: 0,
      baseIncomePerMonth: 6500,
      stress: 55,
      happinessModifier: 5,
      visualIndicator: "ph-gear-six",
      availableInCities: ["all"],
      progressionPath: [],
      careerRisks: [{ name: "layoff", chance: 0.05 }]
    },

    // ==========================================================================
    // TIER 3: HIGH ROLLERS (Wealth Trap)
    // Goal: Extreme Income, Extreme Risk. Losing job = Bankruptcy (due to lifestyle).
    // ==========================================================================
    {
      id: "lawyer",
      nameKey: "job.lawyer",
      name: { en: "Corporate Lawyer", ru: "Corporate Lawyer" },
      minEducationLevel: EDUCATION_LEVELS.UNIVERSITY,
      minIntelligence: 75,
      minAttractiveness: 0,
      baseIncomePerMonth: 12000,
      stress: 85, // Lethal stress levels
      happinessModifier: -10,
      visualIndicator: "ph-scales",
      availableInCities: ["newYork", "london", "dubai", "singapore", "moscow", "tokyo"],
      progressionPath: [{ atYears: 8, eventId: "career_partner" }],
      careerRisks: [
        { name: "burnout", chance: 0.20 },
        { name: "alcoholism", chance: 0.10 } // Coping mechanism
      ]
    },
    {
      id: "investmentBanker",
      nameKey: "job.cfo", // Reusing closest
      name: { en: "Investment Banker", ru: "Investment Banker" },
      minEducationLevel: EDUCATION_LEVELS.UNIVERSITY,
      minIntelligence: 80,
      minAttractiveness: 50,
      baseIncomePerMonth: 15000,
      stress: 90,
      happinessModifier: 0,
      visualIndicator: "ph-currency-dollar",
      availableInCities: ["newYork", "london", "hongKong", "singapore"],
      progressionPath: [],
      careerRisks: [
        { name: "burnout", chance: 0.25 },
        { name: "fired", chance: 0.15 } // Cutthroat
      ]
    },
    {
      id: "surgeon",
      nameKey: "job.doctor",
      name: { en: "Surgeon", ru: "Surgeon" },
      minEducationLevel: EDUCATION_LEVELS.UNIVERSITY,
      minIntelligence: 85,
      minAttractiveness: 0,
      baseIncomePerMonth: 18000,
      stress: 95, // Lives in hands
      happinessModifier: 15, // God complex
      visualIndicator: "ph-stethoscope",
      availableInCities: ["all"],
      progressionPath: [],
      careerRisks: [
        { name: "malpractice", chance: 0.05 }, // Lose license
        { name: "burnout", chance: 0.15 }
      ]
    },
    {
      id: "ceo",
      nameKey: "job.ceo",
      name: { en: "CEO", ru: "Генеральный директор" },
      minEducationLevel: EDUCATION_LEVELS.UNIVERSITY,
      minIntelligence: 80,
      minAttractiveness: 60,
      baseIncomePerMonth: 30000,
      stress: 95,
      happinessModifier: 20,
      visualIndicator: "ph-user-focus",
      availableInCities: ["newYork", "london", "dubai", "tokyo"],
      progressionPath: [],
      careerRisks: [
        { name: "scandal", chance: 0.08 }, // Fired + Fine
        { name: "burnout", chance: 0.20 }
      ]
    },
    {
      id: "influencer",
      nameKey: "job.influencer",
      name: { en: "Influencer", ru: "Блогер" },
      minEducationLevel: EDUCATION_LEVELS.NONE,
      minIntelligence: 40,
      minAttractiveness: 80,
      baseIncomePerMonth: 10000, // Highly volatile
      stress: 60,
      happinessModifier: 25,
      visualIndicator: "ph-camera",
      availableInCities: ["all"],
      progressionPath: [],
      careerRisks: [
        { name: "cancelled", chance: 0.15 }, // Career over
        { name: "stalker", chance: 0.05 }
      ]
    },
    {
      id: "model",
      nameKey: "job.model",
      name: { en: "Supermodel", ru: "Supermodel" },
      minEducationLevel: EDUCATION_LEVELS.NONE,
      minIntelligence: 20,
      minAttractiveness: 90,
      baseIncomePerMonth: 15000,
      stress: 50,
      happinessModifier: 10,
      visualIndicator: "ph-star",
      availableInCities: ["paris", "newYork", "milan", "london"],
      progressionPath: [],
      careerRisks: [
        { name: "aging_out", chance: 0.20 }, // Short career
        { name: "scandal", chance: 0.05 }
      ]
    
    },
    // ==========================================================================
    // TIER 4: PROMOTED ROLES (Result of career progressions)
    // ==========================================================================
    {
      id: "fastFoodManager",
      nameKey: "job.fastFoodManager",
      name: { en: "Fast Food Manager", ru: "Менеджер фастфуда" },
      minEducationLevel: EDUCATION_LEVELS.NONE,
      minIntelligence: 30,
      minAttractiveness: 0,
      baseIncomePerMonth: 3000,
      stress: 60,
      happinessModifier: -5,
      visualIndicator: "ph-storefront",
      availableInCities: ["all"],
      progressionPath: [],
      careerRisks: [{ name: "burnout", chance: 0.10 }]
    },
    {
      id: "retailManager",
      nameKey: "job.retailManager",
      name: { en: "Retail Manager", ru: "Менеджер магазина" },
      minEducationLevel: EDUCATION_LEVELS.NONE,
      minIntelligence: 40,
      minAttractiveness: 30,
      baseIncomePerMonth: 3500,
      stress: 50,
      happinessModifier: 0,
      visualIndicator: "ph-buildings",
      availableInCities: ["all"],
      progressionPath: [],
      careerRisks: [{ name: "burnout", chance: 0.08 }]
    },
    {
      id: "middleManager",
      nameKey: "job.middleManager",
      name: { en: "Middle Manager", ru: "Менеджер среднего звена" },
      minEducationLevel: EDUCATION_LEVELS.HIGH_SCHOOL,
      minIntelligence: 55,
      minAttractiveness: 0,
      baseIncomePerMonth: 5500,
      stress: 70,
      happinessModifier: -10,
      visualIndicator: "ph-users",
      availableInCities: ["all"],
      progressionPath: [],
      careerRisks: [{ name: "layoff", chance: 0.10 }]
    },
    {
      id: "principal",
      nameKey: "job.principal",
      name: { en: "School Principal", ru: "Директор школы" },
      minEducationLevel: EDUCATION_LEVELS.UNIVERSITY,
      minIntelligence: 70,
      minAttractiveness: 0,
      baseIncomePerMonth: 6500,
      stress: 80,
      happinessModifier: 5,
      visualIndicator: "ph-bank",
      availableInCities: ["all"],
      progressionPath: [],
      careerRisks: [{ name: "burnout", chance: 0.15 }]
    },
    {
      id: "shopOwner",
      nameKey: "job.shopOwner",
      name: { en: "Shop Owner", ru: "Владелец мастерской" },
      minEducationLevel: EDUCATION_LEVELS.HIGH_SCHOOL,
      minIntelligence: 50,
      minAttractiveness: 0,
      baseIncomePerMonth: 7000,
      stress: 75,
      happinessModifier: 15,
      visualIndicator: "ph-wrench",
      availableInCities: ["all"],
      progressionPath: [],
      careerRisks: [{ name: "bankruptcy", chance: 0.05 }]
    },
    {
      id: "seniorDev",
      nameKey: "job.seniorDev",
      name: { en: "Senior Developer", ru: "Старший разработчик" },
      minEducationLevel: EDUCATION_LEVELS.UNIVERSITY,
      minIntelligence: 85,
      minAttractiveness: 0,
      baseIncomePerMonth: 14000,
      stress: 85,
      happinessModifier: 10,
      visualIndicator: "ph-code",
      availableInCities: ["all"],
      progressionPath: [],
      careerRisks: [{ name: "burnout", chance: 0.20 }]
    },
    {
      id: "partnerLawyer",
      nameKey: "job.partnerLawyer",
      name: { en: "Law Firm Partner", ru: "Партнер юр. фирмы" },
      minEducationLevel: EDUCATION_LEVELS.UNIVERSITY,
      minIntelligence: 90,
      minAttractiveness: 0,
      baseIncomePerMonth: 25000,
      stress: 95,
      happinessModifier: 15,
      visualIndicator: "ph-scales",
      availableInCities: ["newYork", "london", "dubai", "singapore", "moscow", "tokyo"],
      progressionPath: [],
      careerRisks: [{ name: "scandal", chance: 0.05 }]
    }
  ];

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Get job by ID
   * @param {string} jobId - Job identifier
   * @returns {Object} Job object or unemployed
   */
  function getJobById(jobId) {
    return jobs.find((j) => j.id === jobId) || jobs[0];
  }

  /**
   * Get all jobs
   * @returns {Array} All jobs
   */
  function getAllJobs() {
    return jobs;
  }

  /**
   * Check if player meets education requirement
   * @param {number} playerEducationLevel - Player's education level
   * @param {number} jobMinEducationLevel - Job's required education level
   * @returns {boolean} True if education is sufficient
   */
  function isEducationEnough(playerEducationLevel, jobMinEducationLevel) {
    const p = Number(playerEducationLevel);
    const r = Number(jobMinEducationLevel);
    return (Number.isFinite(p) ? p : 0) >= (Number.isFinite(r) ? r : 0);
  }

  /**
   * Check if player meets intelligence requirement
   * @param {number} playerIntelligence - Player's intelligence stat
   * @param {number} jobMinIntelligence - Job's required intelligence
   * @returns {boolean} True if intelligence is sufficient
   */
  function isIntelligenceEnough(playerIntelligence, jobMinIntelligence) {
    const p = Number(playerIntelligence);
    const r = Number(jobMinIntelligence);
    return (Number.isFinite(p) ? p : 0) >= (Number.isFinite(r) ? r : 0);
  }

  /**
   * Check if player meets attractiveness requirement
   * @param {number} playerAttractiveness - Player's attractiveness stat
   * @param {number} jobMinAttractiveness - Job's required attractiveness
   * @returns {boolean} True if attractiveness is sufficient
   */
  function isAttractivenessEnough(playerAttractiveness, jobMinAttractiveness) {
    const p = Number(playerAttractiveness);
    const r = Number(jobMinAttractiveness);
    return (Number.isFinite(p) ? p : 0) >= (Number.isFinite(r) ? r : 0);
  }

  /**
   * Check if job is available in a city
   * @param {string} cityId - City ID
   * @param {string} jobId - Job ID
   * @returns {boolean} True if job is available in city
   */
  function isJobAvailableInCity(cityId, jobId) {
    const job = getJobById(jobId);
    if (!job) return false;

    // "all" means available everywhere
    if (job.availableInCities.includes("all")) return true;

    // Check city's available jobs list (if cities module is loaded)
    if (Alive.cities && Alive.cities.isJobAvailableInCity) {
      return Alive.cities.isJobAvailableInCity(cityId, jobId);
    }

    // Check job's city restrictions
    return job.availableInCities.includes(cityId);
  }

  /**
   * Check if player is eligible for a job (Enhanced with Education Paths)
   * @param {Object} player - Player object
   * @param {string} jobId - Job ID
   * @param {string} cityId - Optional city ID (defaults to player's city)
   * @returns {Object} { eligible: boolean, reason?: string }
   */
  function isEligibleForPlayer(player, jobId, cityId) {
    if (!player) return false;

    const job = getJobById(jobId);
    const city = typeof cityId === "string" ? cityId : player.city;

    // Check education (legacy system)
    if (!isEducationEnough(player.educationLevel, job.minEducationLevel)) return false;

    // Check intelligence
    if (!isIntelligenceEnough(player.intelligence, job.minIntelligence)) return false;

    // Check attractiveness
    if (!isAttractivenessEnough(player.attractiveness, job.minAttractiveness)) return false;

    // Check city availability
    if (!isJobAvailableInCity(city, job.id)) return false;

    // ============================================================
    // NEW: Education Path & Job Family Checks
    // ============================================================

    // Check education path compatibility if job has family metadata
    if (job.family && Alive.selfdevelopment?.JOB_FAMILIES) {
      const family = Alive.selfdevelopment.JOB_FAMILIES[job.family.toUpperCase()];
      if (family) {
        const playerPath = player.educationPath || "none";

        // Check if player's education path is accepted by this job family
        if (family.requiredEducation && family.requiredEducation.length > 0) {
          if (!family.requiredEducation.includes(playerPath) && !family.requiredEducation.includes("any")) {
            // Allow university grads to do anything
            if (playerPath !== "university" && playerPath !== "masters" && playerPath !== "phd") {
              return false;
            }
          }
        }

        // Check bootcamp tier limits
        if (playerPath === "bootcamp" && family.bootcampMaxTier) {
          const jobTier = job.tier || 1;
          if (jobTier > family.bootcampMaxTier) {
            return false; // Bootcamp grads can't reach Manager+ in tech
          }
        }

        // Check career skill requirement
        if (family.requiresSkill) {
          const requiredSkill = family.requiresSkill;
          const playerSkillLevel = player.careerSkills?.[requiredSkill] || 0;
          const minSkillForJob = (job.tier || 1) * 15; // Higher tiers need more skill
          if (playerSkillLevel < minSkillForJob) {
            return false;
          }
        }
      }
    }

    // Check years of experience requirement
    if (job.minYearsExperience) {
      const familyExp = player.careerHistory?.[job.family]?.years || 0;
      const totalExp = player.totalYearsWorked || 0;
      if (familyExp < job.minYearsExperience && totalExp < job.minYearsExperience * 1.5) {
        return false;
      }
    }

    // Consequence system checks
    if (Alive.consequences) {
      // Executive jobs blocked by criminal record
      if (job.isExecutive && Alive.consequences.hasFlag(player, "criminal_record")) {
        return false;
      }

      // Government jobs blocked by criminal record
      if (job.isGovernment && Alive.consequences.hasFlag(player, "criminal_record")) {
        return false;
      }

      // Fired twice - must wait 2 years or change city
      if (Alive.consequences.hasFlag(player, "fired_twice")) {
        const flag = Alive.consequences.getFlag(player, "fired_twice");
        const yearsSince = player.age - flag.addedAge;
        const sameCity = (player.city === flag.city || player.cityId === flag.city);
        if (yearsSince < 2 && sameCity) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get detailed eligibility result with reasons
   * @param {Object} player - Player object
   * @param {string} jobId - Job ID
   * @param {string} cityId - Optional city ID
   * @returns {Object} { eligible: boolean, reasons: string[] }
   */
  function getEligibilityDetails(player, jobId, cityId) {
    const reasons = [];
    const job = getJobById(jobId);
    const city = typeof cityId === "string" ? cityId : player?.city;

    if (!player) {
      return { eligible: false, reasons: ["no_player"] };
    }

    if (!isEducationEnough(player.educationLevel, job.minEducationLevel)) {
      reasons.push("education");
    }

    if (!isIntelligenceEnough(player.intelligence, job.minIntelligence)) {
      reasons.push("intelligence");
    }

    if (!isAttractivenessEnough(player.attractiveness, job.minAttractiveness)) {
      reasons.push("attractiveness");
    }

    if (!isJobAvailableInCity(city, job.id)) {
      reasons.push("city");
    }

    // Check education path
    if (job.family && Alive.selfdevelopment?.JOB_FAMILIES) {
      const family = Alive.selfdevelopment.JOB_FAMILIES[job.family.toUpperCase()];
      if (family?.requiredEducation) {
        const playerPath = player.educationPath || "none";
        if (!family.requiredEducation.includes(playerPath)) {
          if (playerPath !== "university" && playerPath !== "masters" && playerPath !== "phd") {
            reasons.push("education_path");
          }
        }
      }
    }

    // Check skills
    if (job.family && Alive.selfdevelopment?.JOB_FAMILIES) {
      const family = Alive.selfdevelopment.JOB_FAMILIES[job.family.toUpperCase()];
      if (family?.requiresSkill) {
        const playerSkillLevel = player.careerSkills?.[family.requiresSkill] || 0;
        const minSkill = (job.tier || 1) * 15;
        if (playerSkillLevel < minSkill) {
          reasons.push("skill_" + family.requiresSkill);
        }
      }
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }

  /**
   * Get all eligible jobs for a player in a city
   * @param {Object} player - Player object
   * @param {string} cityId - Optional city ID
   * @returns {Array} Array of eligible jobs
   */
  function getEligibleJobsForPlayer(player, cityId) {
    const city = typeof cityId === "string" ? cityId : player && player.city;
    return jobs.filter((j) => isEligibleForPlayer(player, j.id, city));
  }

  /**
   * Calculate annual income for a job in a city
   * @param {string} jobId - Job ID
   * @param {string} cityId - City ID
   * @returns {number} Annual income adjusted for city
   */
  function getJobAnnualIncome(jobId, cityId) {
    const job = getJobById(jobId);
    const baseAnnual = job.baseIncomePerMonth * 12;

    // Prefer explicit salary multiplier from world data
    if (Alive.countries && Alive.countries.getCityById) {
      const info = Alive.countries.getCityById(cityId);
      const mul = Number(info?.salaryMultiplier);
      if (Number.isFinite(mul) && mul > 0) {
        return Math.round(baseAnnual * mul);
      }
    }

    // Apply city cost of living multiplier (higher cost = higher salary usually)
    if (Alive.cities && Alive.cities.getCityById) {
      const city = Alive.cities.getCityById(cityId);
      const adjustment = 0.5 + (city.costOfLivingMultiplier * 0.5);
      return Math.round(baseAnnual * adjustment);
    }

    return baseAnnual;
  }

  /**
   * Check if player should get a career progression event
   * @param {Object} player - Player object
   * @param {number} yearsInJob - How many years player has been in current job
   * @returns {Object|null} Progression event or null
   */
  function checkCareerProgression(player, yearsInJob) {
    if (!player || !player.job) return null;

    const job = getJobById(player.job);
    if (!job.progressionPath || job.progressionPath.length === 0) return null;

    // Find applicable progression events
    const event = job.progressionPath.find(p => p.atYears === yearsInJob);
    return event || null;
  }

  /**
   * Roll for career risks
   * @param {Object} player - Player object
   * @returns {Object|null} Risk event that triggered, or null
   */
  function rollCareerRisk(player) {
    if (!player || !player.job) return null;

    const job = getJobById(player.job);
    if (!job.careerRisks || job.careerRisks.length === 0) return null;

    const careerSkill = clamp(player.careerSkill || 0, 0, 100);
    const riskMul = clamp(1 - careerSkill / 180, 0.45, 1);

    // Roll each risk
    for (const risk of job.careerRisks) {
      const chance = clamp((risk.chance || 0) * riskMul, 0, 1);
      if (Math.random() < chance) {
        return risk;
      }
    }

    return null;
  }

  /**
   * Get job happiness effect
   * @param {string} jobId - Job ID
   * @returns {number} Happiness modifier
   */
  function getJobHappinessModifier(jobId) {
    const job = getJobById(jobId);
    return job.happinessModifier || 0;
  }

  /**
   * Get job stress level
   * @param {string} jobId - Job ID
   * @returns {number} Stress level (0-100)
   */
  function getJobStress(jobId) {
    const job = getJobById(jobId);
    return job.stress || 0;
  }

  // ============================================================================
  // EXPORT MODULE
  // ============================================================================

  Alive.jobs = {
    jobs,
    EDUCATION_LEVELS,
    getJobById,
    getAllJobs,
    isEducationEnough,
    isIntelligenceEnough,
    isAttractivenessEnough,
    isJobAvailableInCity,
    isEligibleForPlayer,
    getEligibilityDetails,
    getEligibleJobsForPlayer,
    getJobAnnualIncome,
    checkCareerProgression,
    rollCareerRisk,
    getJobHappinessModifier,
    getJobStress
  };

})(window);
