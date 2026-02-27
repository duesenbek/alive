/**
 * Self-Development Module - Alive Life Simulator
 * Hyper-realistic progression paths: Education, Career, Business, Investing
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  // ============================================================================
  // CONSTANTS
  // ============================================================================

  const EDUCATION_STAGES = {
    NONE: { id: "none", level: 0, nameKey: "edu.none" },
    ELEMENTARY: { id: "elementary", level: 1, nameKey: "edu.elementary", minAge: 6, maxAge: 11, yearsRequired: 6 },
    MIDDLE_SCHOOL: { id: "middle_school", level: 2, nameKey: "edu.middle_school", minAge: 11, maxAge: 14, yearsRequired: 3 },
    HIGH_SCHOOL: { id: "high_school", level: 3, nameKey: "edu.high_school", minAge: 14, maxAge: 18, yearsRequired: 4 },
    UNIVERSITY: { id: "university", level: 4, nameKey: "edu.university", minAge: 18, cost: 15000, yearsRequired: 4 },
    MASTERS: { id: "masters", level: 5, nameKey: "edu.masters", minAge: 22, cost: 25000, yearsRequired: 2 },
    PHD: { id: "phd", level: 6, nameKey: "edu.phd", minAge: 24, cost: 40000, yearsRequired: 4 },
    CERTIFICATION: { id: "certification", level: 3.5, nameKey: "edu.certification", minAge: 18, cost: 5000, yearsRequired: 1 }
  };

  const CAREER_LEVELS = [
    { id: "intern", level: 0, nameKey: "career.level.intern", salaryMult: 0.4, minYears: 0 },
    { id: "junior", level: 1, nameKey: "career.level.junior", salaryMult: 0.7, minYears: 1 },
    { id: "mid", level: 2, nameKey: "career.level.mid", salaryMult: 1.0, minYears: 3 },
    { id: "senior", level: 3, nameKey: "career.level.senior", salaryMult: 1.4, minYears: 5 },
    { id: "lead", level: 4, nameKey: "career.level.lead", salaryMult: 1.8, minYears: 7 },
    { id: "manager", level: 5, nameKey: "career.level.manager", salaryMult: 2.2, minYears: 9 },
    { id: "director", level: 6, nameKey: "career.level.director", salaryMult: 3.0, minYears: 12 },
    { id: "vp", level: 7, nameKey: "career.level.vp", salaryMult: 4.0, minYears: 15 },
    { id: "clevel", level: 8, nameKey: "career.level.clevel", salaryMult: 6.0, minYears: 18 }
  ];

  const BUSINESS_STATES = {
    IDEA: { id: "idea", nameKey: "business.state.idea", monthlyRevenue: 0, failChance: 0 },
    LAUNCH: { id: "launch", nameKey: "business.state.launch", monthlyRevenue: 500, failChance: 0.15 },
    STRUGGLING: { id: "struggling", nameKey: "business.state.struggling", monthlyRevenue: 200, failChance: 0.25 },
    BREAKEVEN: { id: "breakeven", nameKey: "business.state.breakeven", monthlyRevenue: 2000, failChance: 0.08 },
    GROWTH: { id: "growth", nameKey: "business.state.growth", monthlyRevenue: 8000, failChance: 0.04 },
    PROFITABLE: { id: "profitable", nameKey: "business.state.profitable", monthlyRevenue: 20000, failChance: 0.02 },
    SCALING: { id: "scaling", nameKey: "business.state.scaling", monthlyRevenue: 50000, failChance: 0.03 },
    EXIT: { id: "exit", nameKey: "business.state.exit", monthlyRevenue: 0, failChance: 0 },
    FAILED: { id: "failed", nameKey: "business.state.failed", monthlyRevenue: 0, failChance: 0 }
  };

  const BUSINESS_TYPES = [
    { id: "freelance", nameKey: "business.type.freelance", startupCost: 500, skillReq: 20 },
    { id: "ecommerce", nameKey: "business.type.ecommerce", startupCost: 5000, skillReq: 30 },
    { id: "consulting", nameKey: "business.type.consulting", startupCost: 2000, skillReq: 40 },
    { id: "restaurant", nameKey: "business.type.restaurant", startupCost: 50000, skillReq: 35 },
    { id: "tech_startup", nameKey: "business.type.tech_startup", startupCost: 20000, skillReq: 50 },
    { id: "real_estate", nameKey: "business.type.real_estate", startupCost: 100000, skillReq: 45 },
    { id: "franchise", nameKey: "business.type.franchise", startupCost: 150000, skillReq: 40 },
    { id: "saas", nameKey: "business.type.saas", startupCost: 30000, skillReq: 60 }
  ];

  const INVESTMENT_TYPES = {
    SAVINGS: { id: "savings", nameKey: "invest.type.savings", baseReturn: 0.02, volatility: 0.01, riskLevel: 1 },
    BONDS: { id: "bonds", nameKey: "invest.type.bonds", baseReturn: 0.04, volatility: 0.03, riskLevel: 2 },
    INDEX_FUNDS: { id: "index_funds", nameKey: "invest.type.index_funds", baseReturn: 0.08, volatility: 0.15, riskLevel: 3 },
    STOCKS: { id: "stocks", nameKey: "invest.type.stocks", baseReturn: 0.10, volatility: 0.25, riskLevel: 4 },
    REAL_ESTATE: { id: "real_estate", nameKey: "invest.type.real_estate", baseReturn: 0.06, volatility: 0.10, riskLevel: 3 },
    CRYPTO: { id: "crypto", nameKey: "invest.type.crypto", baseReturn: 0.20, volatility: 0.60, riskLevel: 5 },
    STARTUPS: { id: "startups", nameKey: "invest.type.startups", baseReturn: 0.30, volatility: 0.80, riskLevel: 5 }
  };

  // ============================================================================
  // EDUCATION PATHS (Multiple pathways to careers)
  // ============================================================================

  const EDUCATION_PATHS = {
    NONE: {
      id: "none",
      level: 0,
      nameKey: "edu.path.none",
      cost: 0,
      years: 0,
      opensJobFamilies: ["service", "entry"],
      description: { en: "No formal education", ru: "No formal education" }
    },
    COMMUNITY_COLLEGE: {
      id: "community",
      level: 1.5,
      nameKey: "edu.path.community",
      cost: 8000,
      years: 2,
      minAge: 18,
      opensJobFamilies: ["service", "admin", "some-white"],
      description: { en: "Associate's degree. Mid-tier jobs.", ru: "Associate's degree. Mid-tier jobs." }
    },
    TRADE_SCHOOL: {
      id: "trade",
      level: 2,
      nameKey: "edu.path.trade",
      cost: 15000,
      years: 2,
      minAge: 18,
      tradesOnly: true,
      opensJobFamilies: ["blue_collar"],
      description: { en: "Trade certification. Stable blue-collar careers.", ru: "Trade certification. Stable blue-collar careers." }
    },
    BOOTCAMP: {
      id: "bootcamp",
      level: 2,
      nameKey: "edu.path.bootcamp",
      cost: 5000,
      years: 1,
      minAge: 18,
      techOnly: true,
      opensJobFamilies: ["tech"],
      maxTier: 4, // Can reach Lead but not Manager+
      description: { en: "Tech skills fast track. Developer jobs.", ru: "Tech skills fast track. Developer jobs." }
    },
    UNIVERSITY: {
      id: "university",
      level: 3,
      nameKey: "edu.path.university",
      cost: 40000,
      years: 4,
      minAge: 18,
      opensJobFamilies: ["white_collar", "tech", "creative", "all"],
      description: { en: "Bachelor's degree. Wide career options.", ru: "Bachelor's degree. Wide career options." }
    },
    MASTERS: {
      id: "masters",
      level: 4,
      nameKey: "edu.path.masters",
      cost: 25000,
      years: 2,
      minAge: 22,
      requiresPrevious: "university",
      opensJobFamilies: ["white_collar", "executive"],
      description: { en: "Advanced degree. Management track.", ru: "Advanced degree. Management track." }
    },
    PHD: {
      id: "phd",
      level: 5,
      nameKey: "edu.path.phd",
      cost: 40000,
      years: 4,
      minAge: 24,
      requiresPrevious: "masters",
      opensJobFamilies: ["academic", "research"],
      description: { en: "Doctorate. Research & academia.", ru: "Doctorate. Research & academia." }
    }
  };

  // ============================================================================
  // JOB FAMILIES (Career tracks with different progression patterns)
  // ============================================================================

  const JOB_FAMILIES = {
    SERVICE: {
      id: "service",
      nameKey: "job.family.service",
      icon: "??",
      tiers: ["worker", "supervisor", "manager", "regional", "director"],
      salaryMultipliers: [1.0, 1.3, 1.7, 2.2, 3.0],
      requiredEducation: ["none", "community"],
      example: { en: "Retail, Restaurant, Customer Service", ru: "Retail, Restaurant, Customer Service" }
    },
    BLUE_COLLAR: {
      id: "blue_collar",
      nameKey: "job.family.blue_collar",
      icon: "??",
      tiers: ["apprentice", "journeyman", "master", "owner"],
      salaryMultipliers: [0.8, 1.2, 1.8, 3.0],
      requiredEducation: ["trade", "community"],
      requiresSkill: "trade",
      example: { en: "Electrician, Plumber, Mechanic", ru: "Electrician, Plumber, Mechanic" }
    },
    TECH: {
      id: "tech",
      nameKey: "job.family.tech",
      icon: "??",
      tiers: ["junior", "mid", "senior", "lead", "manager", "director"],
      salaryMultipliers: [0.7, 1.0, 1.4, 1.8, 2.4, 3.5],
      requiredEducation: ["bootcamp", "university", "community"],
      requiresSkill: "programming",
      bootcampMaxTier: 4, // Lead
      example: { en: "Developer, Designer, Data Analyst", ru: "Developer, Designer, Data Analyst" }
    },
    WHITE_COLLAR: {
      id: "white_collar",
      nameKey: "job.family.white_collar",
      icon: "??",
      tiers: ["junior", "associate", "senior", "manager", "director", "vp", "c_level"],
      salaryMultipliers: [0.7, 1.0, 1.4, 2.0, 3.0, 4.5, 7.0],
      requiredEducation: ["university", "masters"],
      requiresSkill: "management",
      example: { en: "Accountant, Lawyer, Consultant", ru: "Accountant, Lawyer, Consultant" }
    },
    CREATIVE: {
      id: "creative",
      nameKey: "job.family.creative",
      icon: "??",
      tiers: ["freelance", "studio", "senior", "lead", "director"],
      salaryMultipliers: [0.6, 0.9, 1.3, 1.8, 2.5],
      requiredEducation: ["none", "bootcamp", "university"],
      requiresSkill: "creative",
      example: { en: "Writer, Artist, Musician", ru: "Writer, Artist, Musician" }
    },
    MEDICAL: {
      id: "medical",
      nameKey: "job.family.medical",
      icon: "??",
      tiers: ["resident", "attending", "senior", "chief", "director"],
      salaryMultipliers: [0.8, 1.5, 2.2, 3.0, 4.0],
      requiredEducation: ["university", "masters"],
      requiresSkill: "medical",
      example: { en: "Doctor, Nurse, Surgeon", ru: "Doctor, Nurse, Surgeon" }
    }
  };

  // ============================================================================
  // CAREER SKILLS (Specific skills for different job families)
  // ============================================================================

  const CAREER_SKILLS = {
    programming: {
      id: "programming",
      nameKey: "skill.programming",
      icon: "??",
      usedBy: ["tech"],
      trainedBy: ["coding_bootcamp", "computer_science", "self_study"]
    },
    management: {
      id: "management",
      nameKey: "skill.management",
      icon: "??",
      usedBy: ["white_collar", "tech", "service"],
      trainedBy: ["mba", "experience", "leadership_course"]
    },
    trade: {
      id: "trade",
      nameKey: "skill.trade",
      icon: "??",
      usedBy: ["blue_collar"],
      trainedBy: ["trade_school", "apprenticeship"]
    },
    sales: {
      id: "sales",
      nameKey: "skill.sales",
      icon: "??",
      usedBy: ["service", "white_collar"],
      trainedBy: ["sales_training", "experience"]
    },
    medical: {
      id: "medical",
      nameKey: "skill.medical",
      icon: "??",
      usedBy: ["medical"],
      trainedBy: ["medical_school", "residency"]
    },
    creative: {
      id: "creative",
      nameKey: "skill.creative",
      icon: "??",
      usedBy: ["creative"],
      trainedBy: ["art_school", "practice", "portfolio"]
    },
    legal: {
      id: "legal",
      nameKey: "skill.legal",
      icon: "??",
      usedBy: ["white_collar"],
      trainedBy: ["law_school", "bar_exam"]
    }
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  function clamp(value, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  // ============================================================================
  // EDUCATION TRACK
  // ============================================================================

  function getEducationStageById(stageId) {
    return Object.values(EDUCATION_STAGES).find(s => s.id === stageId) || EDUCATION_STAGES.NONE;
  }

  function getNextEducationStage(currentStageId, playerAge) {
    const current = getEducationStageById(currentStageId);
    const stages = Object.values(EDUCATION_STAGES).filter(s => s.level > current.level);

    // Find the next appropriate stage based on age
    for (const stage of stages) {
      if (stage.minAge && playerAge >= stage.minAge) {
        return stage;
      }
    }
    return null;
  }

  function canEnrollInEducation(player, stageId) {
    if (!player) return { canEnroll: false, reason: "no_player" };

    const stage = getEducationStageById(stageId);
    if (!stage || stage.id === "none") return { canEnroll: false, reason: "invalid_stage" };

    // Check age requirement
    if (stage.minAge && player.age < stage.minAge) {
      return { canEnroll: false, reason: "too_young", minAge: stage.minAge };
    }

    // Check if already enrolled
    if (player.education?.currentlyEnrolled) {
      return { canEnroll: false, reason: "already_enrolled" };
    }

    // Check cost
    if (stage.cost && (player.money || 0) < stage.cost) {
      return { canEnroll: false, reason: "insufficient_funds", cost: stage.cost };
    }

    // Check prerequisites
    const currentLevel = player.education?.highestLevel || 0;
    if (stage.level > currentLevel + 1 && stage.id !== "certification") {
      return { canEnroll: false, reason: "missing_prerequisite" };
    }

    return { canEnroll: true };
  }

  function enrollInEducation(player, stageId) {
    const check = canEnrollInEducation(player, stageId);
    if (!check.canEnroll) return check;

    const stage = getEducationStageById(stageId);

    // Deduct cost
    if (stage.cost) {
      player.money -= stage.cost;
    }

    // Initialize education state if needed
    if (!player.education) {
      player.education = {
        highestLevel: 0,
        highestStageId: "none",
        currentlyEnrolled: false,
        currentStageId: null,
        yearsInCurrentStage: 0,
        gpa: 3.0,
        certifications: [],
        scholarships: [],
        totalYearsStudied: 0
      };
    }

    player.education.currentlyEnrolled = true;
    player.education.currentStageId = stageId;
    player.education.yearsInCurrentStage = 0;

    return { success: true, stage };
  }

  function progressEducation(player) {
    if (!player?.education?.currentlyEnrolled) return null;

    const stage = getEducationStageById(player.education.currentStageId);
    if (!stage) return null;

    player.education.yearsInCurrentStage++;
    player.education.totalYearsStudied++;

    // Intelligence boost from studying
    const intBoost = clamp(2 + Math.floor(stage.level / 2), 1, 5);
    player.intelligence = clamp((player.intelligence || 50) + intBoost, 0, 100);

    // Career skill boost
    const careerBoost = clamp(1 + Math.floor(stage.level / 3), 1, 3);
    player.careerSkill = clamp((player.careerSkill || 0) + careerBoost, 0, 100);

    // Check for graduation
    if (player.education.yearsInCurrentStage >= stage.yearsRequired) {
      return graduateEducation(player);
    }

    // Random events during education
    const events = [];

    // Exam event
    if (Math.random() < 0.4) {
      events.push({ type: "exam", stageId: stage.id });
    }

    // Scholarship opportunity
    if (stage.cost && Math.random() < 0.1 && (player.intelligence || 50) >= 70) {
      events.push({ type: "scholarship", amount: Math.round(stage.cost * 0.3) });
    }

    return { graduated: false, events, stage };
  }

  function graduateEducation(player) {
    if (!player?.education?.currentlyEnrolled) return null;

    const stage = getEducationStageById(player.education.currentStageId);

    // Update highest level
    if (stage.level > player.education.highestLevel) {
      player.education.highestLevel = stage.level;
      player.education.highestStageId = stage.id;
    }

    // Update legacy educationLevel for compatibility
    if (stage.id === "high_school") {
      player.educationLevel = 1;
    } else if (stage.id === "university" || stage.id === "masters" || stage.id === "phd") {
      player.educationLevel = 2;
    }

    // Add certification if applicable
    if (stage.id === "certification") {
      player.education.certifications.push({
        id: "cert_" + Date.now(),
        name: "Professional Certification",
        year: player.age
      });
    }

    // Clear enrollment
    player.education.currentlyEnrolled = false;
    player.education.currentStageId = null;
    player.education.yearsInCurrentStage = 0;

    // Happiness boost
    player.happiness = clamp((player.happiness || 50) + 10, 0, 100);

    return { graduated: true, stage, newLevel: player.education.highestLevel };
  }

  function dropOutOfEducation(player) {
    if (!player?.education?.currentlyEnrolled) return false;

    player.education.currentlyEnrolled = false;
    player.education.currentStageId = null;
    player.education.yearsInCurrentStage = 0;

    // Happiness penalty
    player.happiness = clamp((player.happiness || 50) - 5, 0, 100);
    player.stress = clamp((player.stress || 0) + 5, 0, 100);

    return true;
  }

  function getEducationProgress(player) {
    if (!player?.education) {
      return {
        currentStage: EDUCATION_STAGES.NONE,
        progress: 0,
        yearsRemaining: 0,
        isEnrolled: false,
        highestStage: EDUCATION_STAGES.NONE,
        nextStages: []
      };
    }

    const currentStage = player.education.currentlyEnrolled
      ? getEducationStageById(player.education.currentStageId)
      : null;

    const highestStage = getEducationStageById(player.education.highestStageId);

    const progress = currentStage
      ? (player.education.yearsInCurrentStage / currentStage.yearsRequired) * 100
      : 0;

    const yearsRemaining = currentStage
      ? currentStage.yearsRequired - player.education.yearsInCurrentStage
      : 0;

    // Get available next stages
    const nextStages = Object.values(EDUCATION_STAGES).filter(stage => {
      if (stage.id === "none") return false;
      if (stage.level <= (player.education.highestLevel || 0)) return false;
      if (stage.minAge && player.age < stage.minAge) return false;
      return true;
    });

    return {
      currentStage,
      progress,
      yearsRemaining,
      isEnrolled: player.education.currentlyEnrolled,
      highestStage,
      gpa: player.education.gpa || 3.0,
      certifications: player.education.certifications || [],
      nextStages
    };
  }

  // ============================================================================
  // CAREER TRACK
  // ============================================================================

  function getCareerLevelById(levelId) {
    return CAREER_LEVELS.find(l => l.id === levelId) || CAREER_LEVELS[0];
  }

  function getCareerLevelByIndex(index) {
    return CAREER_LEVELS[clamp(index, 0, CAREER_LEVELS.length - 1)];
  }

  function initializeCareerState(player) {
    if (!player.career) {
      player.career = {
        currentLevelIndex: 0,
        currentLevelId: "intern",
        yearsAtCurrentLevel: 0,
        totalYearsInCareer: 0,
        performanceRating: 50,
        promotionsDenied: 0,
        jobChanges: 0
      };
    }
    return player.career;
  }

  function getCareerProgress(player) {
    if (!player) return null;

    initializeCareerState(player);

    const currentLevel = getCareerLevelByIndex(player.career.currentLevelIndex);
    const nextLevel = CAREER_LEVELS[player.career.currentLevelIndex + 1] || null;

    const yearsNeeded = nextLevel ? nextLevel.minYears - currentLevel.minYears : 0;
    const yearsProgress = player.career.yearsAtCurrentLevel;
    const progressPercent = yearsNeeded > 0 ? (yearsProgress / yearsNeeded) * 100 : 100;

    // Calculate promotion chance
    let promotionChance = 0;
    if (nextLevel && yearsProgress >= yearsNeeded) {
      const careerSkill = player.careerSkill || 0;
      const intelligence = player.intelligence || 50;
      const performance = player.career.performanceRating || 50;

      promotionChance = clamp(
        0.1 + (careerSkill / 200) + (intelligence / 300) + (performance / 200),
        0.05,
        0.6
      );
    }

    return {
      currentLevel,
      currentLevelIndex: player.career.currentLevelIndex,
      nextLevel,
      yearsAtLevel: yearsProgress,
      yearsNeeded,
      progressPercent: clamp(progressPercent, 0, 100),
      promotionChance,
      performanceRating: player.career.performanceRating,
      canBePromoted: nextLevel && yearsProgress >= yearsNeeded,
      isAtTop: !nextLevel,
      path: CAREER_LEVELS
    };
  }

  function progressCareer(player) {
    if (!player?.isEmployed?.() && player?.job === "unemployed") return null;

    initializeCareerState(player);

    player.career.yearsAtCurrentLevel++;
    player.career.totalYearsInCareer++;

    // Update performance based on skills
    const careerSkill = player.careerSkill || 0;
    const intelligence = player.intelligence || 50;
    const stress = player.stress || 0;

    const performanceDelta = clamp(
      (careerSkill / 50) + (intelligence / 100) - (stress / 100) + (Math.random() - 0.5) * 10,
      -5, 5
    );
    player.career.performanceRating = clamp(
      (player.career.performanceRating || 50) + performanceDelta,
      0, 100
    );

    // Career skill improvement
    player.careerSkill = clamp((player.careerSkill || 0) + 1, 0, 100);

    // Check for promotion
    const progress = getCareerProgress(player);
    if (progress.canBePromoted && Math.random() < progress.promotionChance) {
      return promoteCareer(player);
    }

    return { promoted: false, progress };
  }

  function promoteCareer(player) {
    if (!player) return null;

    initializeCareerState(player);

    const nextIndex = player.career.currentLevelIndex + 1;
    if (nextIndex >= CAREER_LEVELS.length) return null;

    const newLevel = CAREER_LEVELS[nextIndex];
    const oldLevel = CAREER_LEVELS[player.career.currentLevelIndex];

    player.career.currentLevelIndex = nextIndex;
    player.career.currentLevelId = newLevel.id;
    player.career.yearsAtCurrentLevel = 0;

    // Happiness boost
    player.happiness = clamp((player.happiness || 50) + 8, 0, 100);

    // Salary is handled by the job system using salaryMult

    return { promoted: true, oldLevel, newLevel };
  }

  function getAdjustedSalary(player, baseSalary) {
    if (!player?.career) return baseSalary;

    const level = getCareerLevelByIndex(player.career.currentLevelIndex);
    return Math.round(baseSalary * level.salaryMult);
  }

  // ============================================================================
  // BUSINESS TRACK
  // ============================================================================

  function getBusinessTypeById(typeId) {
    return BUSINESS_TYPES.find(t => t.id === typeId) || BUSINESS_TYPES[0];
  }

  function getBusinessStateById(stateId) {
    return BUSINESS_STATES[stateId.toUpperCase()] || BUSINESS_STATES.IDEA;
  }

  function canStartBusiness(player, businessTypeId) {
    if (!player) return { canStart: false, reason: "no_player" };

    const businessType = getBusinessTypeById(businessTypeId);
    if (!businessType) return { canStart: false, reason: "invalid_type" };

    // Check if already has a business
    if (player.business?.active) {
      return { canStart: false, reason: "already_has_business" };
    }

    // Check business skill
    if ((player.businessSkill || 0) < businessType.skillReq) {
      return { canStart: false, reason: "insufficient_skill", required: businessType.skillReq };
    }

    // Check capital
    if ((player.money || 0) < businessType.startupCost) {
      return { canStart: false, reason: "insufficient_funds", required: businessType.startupCost };
    }

    // Check age
    if (player.age < 18) {
      return { canStart: false, reason: "too_young" };
    }

    return { canStart: true, businessType };
  }

  function startBusiness(player, businessTypeId) {
    const check = canStartBusiness(player, businessTypeId);
    if (!check.canStart) return check;

    const businessType = check.businessType;

    // Deduct startup cost
    player.money -= businessType.startupCost;

    // Initialize business
    player.business = {
      active: true,
      typeId: businessTypeId,
      state: "launch",
      yearsActive: 0,
      totalRevenue: 0,
      totalExpenses: businessType.startupCost,
      valuation: businessType.startupCost,
      employees: 0,
      reputation: 50,
      investorOffers: [],
      partnerConflict: false,
      monthlyRevenue: BUSINESS_STATES.LAUNCH.monthlyRevenue
    };

    // Stress from starting business
    player.stress = clamp((player.stress || 0) + 10, 0, 100);

    return { success: true, business: player.business };
  }

  function progressBusiness(player) {
    if (!player?.business?.active) return null;

    const business = player.business;
    const businessType = getBusinessTypeById(business.typeId);
    const currentState = getBusinessStateById(business.state);

    business.yearsActive++;

    // Calculate performance factors
    const businessSkill = player.businessSkill || 0;
    const intelligence = player.intelligence || 50;
    const luck = Math.random();

    const performanceScore = (businessSkill / 100) * 0.4 + (intelligence / 100) * 0.2 + luck * 0.4;

    // Check for failure
    const failChance = currentState.failChance * (1 - businessSkill / 200);
    if (Math.random() < failChance) {
      return failBusiness(player, "market_conditions");
    }

    // State transitions
    let newState = business.state;
    const events = [];

    switch (business.state) {
      case "launch":
        if (performanceScore > 0.7 && business.yearsActive >= 2) {
          newState = "breakeven";
        } else if (performanceScore < 0.3) {
          newState = "struggling";
        }
        break;
      case "struggling":
        if (performanceScore > 0.7) {
          newState = "breakeven";
        } else if (performanceScore < 0.2 && business.yearsActive > 2) {
          return failBusiness(player, "prolonged_losses");
        }
        break;
      case "breakeven":
        if (performanceScore > 0.65) {
          newState = "growth";
        } else if (performanceScore < 0.35) {
          newState = "struggling";
        }
        break;
      case "growth":
        if (performanceScore > 0.7) {
          newState = "profitable";
        } else if (performanceScore < 0.3) {
          newState = "breakeven";
        }
        break;
      case "profitable":
        if (performanceScore > 0.75 && business.yearsActive >= 5) {
          newState = "scaling";
        }
        // Investor offer chance
        if (Math.random() < 0.2) {
          const offerAmount = Math.round(business.valuation * (1.5 + Math.random()));
          events.push({ type: "investor_offer", amount: offerAmount });
        }
        break;
      case "scaling":
        // Exit opportunity
        if (Math.random() < 0.15 && business.yearsActive >= 7) {
          const exitValue = Math.round(business.valuation * (3 + Math.random() * 5));
          events.push({ type: "exit_opportunity", amount: exitValue });
        }
        break;
    }

    // Update state
    const stateChanged = newState !== business.state;
    business.state = newState;

    const newStateData = getBusinessStateById(newState);
    business.monthlyRevenue = newStateData.monthlyRevenue;

    // Calculate annual revenue
    const annualRevenue = business.monthlyRevenue * 12;
    let expenseMultiplier = 0.6;
    if (newState === 'profitable' || newState === 'scaling') {
      expenseMultiplier += 0.25;
      business.employees = Math.floor(annualRevenue / 60000) || 3;
    } else if (newState === 'growth') {
      expenseMultiplier += 0.15;
      business.employees = Math.floor(annualRevenue / 50000) || 1;
    } else {
      business.employees = 0;
    }
    const expenses = Math.round(annualRevenue * expenseMultiplier);
    const profit = annualRevenue - expenses;

    business.totalRevenue += annualRevenue;
    business.totalExpenses += expenses;

    // Update valuation
    business.valuation = Math.round(profit * 5 + businessType.startupCost);

    // Add profit to player
    player.money += profit;

    // Business skill improvement
    player.businessSkill = clamp((player.businessSkill || 0) + 2, 0, 100);

    // Random events
    if (Math.random() < 0.1) {
      events.push({ type: "partner_conflict" });
      business.partnerConflict = true;
    }

    if (Math.random() < 0.08) {
      events.push({ type: "market_change", impact: Math.random() > 0.5 ? "positive" : "negative" });
    }

    return {
      stateChanged,
      oldState: currentState.id,
      newState: business.state,
      profit,
      valuation: business.valuation,
      events
    };
  }

  function failBusiness(player, reason) {
    if (!player?.business) return null;

    const business = player.business;
    const lostInvestment = business.totalExpenses - business.totalRevenue;

    business.active = false;
    business.state = "failed";
    business.failReason = reason;

    // Emotional impact
    player.happiness = clamp((player.happiness || 50) - 15, 0, 100);
    player.stress = clamp((player.stress || 0) + 20, 0, 100);

    return { failed: true, reason, lostAmount: Math.max(0, lostInvestment) };
  }

  function exitBusiness(player, exitValue) {
    if (!player?.business?.active) return null;

    const business = player.business;

    player.money += exitValue;

    business.active = false;
    business.state = "exit";
    business.exitValue = exitValue;

    // Happiness boost
    player.happiness = clamp((player.happiness || 50) + 20, 0, 100);
    player.stress = clamp((player.stress || 0) - 10, 0, 100);

    return { exited: true, exitValue };
  }

  function getBusinessProgress(player) {
    if (!player?.business) {
      return {
        hasBusiness: false,
        availableTypes: BUSINESS_TYPES.filter(t =>
          (player?.businessSkill || 0) >= t.skillReq &&
          (player?.money || 0) >= t.startupCost &&
          (player?.age || 0) >= 18
        )
      };
    }

    const business = player.business;
    const businessType = getBusinessTypeById(business.typeId);
    const currentState = getBusinessStateById(business.state);

    // Calculate state progression
    const stateOrder = ["idea", "launch", "struggling", "breakeven", "growth", "profitable", "scaling", "exit"];
    const currentIndex = stateOrder.indexOf(business.state);
    const progressPercent = business.active ? (currentIndex / (stateOrder.length - 2)) * 100 : 0;

    return {
      hasBusiness: true,
      active: business.active,
      type: businessType,
      state: currentState,
      stateId: business.state,
      yearsActive: business.yearsActive,
      valuation: business.valuation,
      monthlyRevenue: business.monthlyRevenue,
      totalRevenue: business.totalRevenue,
      totalExpenses: business.totalExpenses,
      profit: business.totalRevenue - business.totalExpenses,
      employees: business.employees,
      reputation: business.reputation,
      progressPercent,
      stateOrder: stateOrder.slice(1, -1), // Exclude idea and exit
      investorOffers: business.investorOffers || []
    };
  }

  // ============================================================================
  // INVESTING TRACK
  // ============================================================================

  function initializePortfolio(player) {
    if (!player.portfolio) {
      player.portfolio = {
        holdings: [],
        totalInvested: 0,
        totalReturns: 0,
        riskTolerance: "moderate",
        diversificationScore: 0
      };
    }
    return player.portfolio;
  }

  function canInvest(player, investmentTypeId, amount) {
    if (!player) return { canInvest: false, reason: "no_player" };

    const investType = INVESTMENT_TYPES[investmentTypeId.toUpperCase()];
    if (!investType) return { canInvest: false, reason: "invalid_type" };

    if ((player.money || 0) < amount) {
      return { canInvest: false, reason: "insufficient_funds" };
    }

    if (amount < 100) {
      return { canInvest: false, reason: "minimum_investment", minimum: 100 };
    }

    if (player.age < 18) {
      return { canInvest: false, reason: "too_young" };
    }

    return { canInvest: true, investType };
  }

  function makeInvestment(player, investmentTypeId, amount) {
    const check = canInvest(player, investmentTypeId, amount);
    if (!check.canInvest) return check;

    initializePortfolio(player);

    const investType = check.investType;

    // Deduct money
    player.money -= amount;

    // Check if already have this investment type
    const existing = player.portfolio.holdings.find(h => h.typeId === investType.id);

    if (existing) {
      existing.amount += amount;
      existing.currentValue += amount;
    } else {
      player.portfolio.holdings.push({
        typeId: investType.id,
        amount: amount,
        currentValue: amount,
        purchaseYear: player.age,
        returns: 0
      });
    }

    player.portfolio.totalInvested += amount;

    // Update diversification score
    updateDiversificationScore(player);

    // Investing skill improvement
    player.investingSkill = clamp((player.investingSkill || 0) + 1, 0, 100);

    return { success: true, holding: existing || player.portfolio.holdings[player.portfolio.holdings.length - 1] };
  }

  function sellInvestment(player, investmentTypeId, fraction = 1) {
    if (!player?.portfolio?.holdings) return null;

    const holdingIndex = player.portfolio.holdings.findIndex(h => h.typeId === investmentTypeId);
    if (holdingIndex === -1) return null;

    const holding = player.portfolio.holdings[holdingIndex];
    const sellAmount = Math.round(holding.currentValue * clamp(fraction, 0, 1));

    if (fraction >= 1) {
      player.portfolio.holdings.splice(holdingIndex, 1);
    } else {
      holding.amount = Math.round(holding.amount * (1 - fraction));
      holding.currentValue = Math.round(holding.currentValue * (1 - fraction));
    }

    player.money += sellAmount;

    updateDiversificationScore(player);

    return { sold: true, amount: sellAmount };
  }

  function progressInvestments(player, marketConditions = {}) {
    if (!player?.portfolio?.holdings?.length) return null;

    const investingSkill = player.investingSkill || 0;
    const results = [];
    let totalReturn = 0;

    player.portfolio.holdings.forEach(holding => {
      const investType = INVESTMENT_TYPES[holding.typeId.toUpperCase()];
      if (!investType) return;

      // Calculate return based on skill and market
      let baseReturn = investType.baseReturn;
      let volatility = investType.volatility;

      // Skill reduces volatility and slightly improves returns
      const skillFactor = investingSkill / 100;
      volatility *= (1 - skillFactor * 0.4); // Up to 40% volatility reduction
      baseReturn += skillFactor * 0.02; // Up to 2% bonus return

      // Market conditions
      const marketMod = marketConditions[holding.typeId] || 0;

      // Calculate actual return with volatility
      const randomFactor = (Math.random() - 0.5) * 2 * volatility;
      const actualReturn = baseReturn + randomFactor + marketMod;

      const returnAmount = Math.round(holding.currentValue * actualReturn);
      holding.currentValue = Math.max(0, holding.currentValue + returnAmount);
      holding.returns += returnAmount;

      totalReturn += returnAmount;

      results.push({
        typeId: holding.typeId,
        returnPercent: actualReturn * 100,
        returnAmount,
        newValue: holding.currentValue
      });
    });

    player.portfolio.totalReturns += totalReturn;

    // Investing skill improvement
    player.investingSkill = clamp((player.investingSkill || 0) + 0.5, 0, 100);

    return { results, totalReturn };
  }

  function updateDiversificationScore(player) {
    if (!player?.portfolio?.holdings) return;

    const holdings = player.portfolio.holdings;
    if (holdings.length === 0) {
      player.portfolio.diversificationScore = 0;
      return;
    }

    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    if (totalValue === 0) {
      player.portfolio.diversificationScore = 0;
      return;
    }

    // Calculate Herfindahl-Hirschman Index (lower = more diversified)
    let hhi = 0;
    holdings.forEach(h => {
      const share = h.currentValue / totalValue;
      hhi += share * share;
    });

    // Convert to 0-100 score (100 = perfectly diversified)
    const maxDiversification = 1 / Object.keys(INVESTMENT_TYPES).length;
    player.portfolio.diversificationScore = clamp(
      ((1 - hhi) / (1 - maxDiversification)) * 100,
      0, 100
    );
  }

  function getPortfolioSummary(player) {
    initializePortfolio(player);

    const portfolio = player.portfolio;
    const holdings = portfolio.holdings || [];

    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalInvested = portfolio.totalInvested || 0;
    const totalReturns = portfolio.totalReturns || 0;
    const overallReturn = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

    // Calculate risk level
    let weightedRisk = 0;
    holdings.forEach(h => {
      const investType = INVESTMENT_TYPES[h.typeId.toUpperCase()];
      if (investType && totalValue > 0) {
        weightedRisk += (h.currentValue / totalValue) * investType.riskLevel;
      }
    });

    const riskLevel = holdings.length > 0 ? Math.round(weightedRisk) : 0;
    const riskLabel = riskLevel <= 2 ? "low" : riskLevel <= 3 ? "moderate" : riskLevel <= 4 ? "high" : "very_high";

    // Holdings breakdown
    const breakdown = holdings.map(h => {
      const investType = INVESTMENT_TYPES[h.typeId.toUpperCase()];
      return {
        typeId: h.typeId,
        name: investType?.nameKey || h.typeId,
        amount: h.amount,
        currentValue: h.currentValue,
        returns: h.returns,
        returnPercent: h.amount > 0 ? ((h.currentValue - h.amount) / h.amount) * 100 : 0,
        allocation: totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0
      };
    });

    return {
      totalValue,
      totalInvested,
      totalReturns,
      overallReturn,
      riskLevel,
      riskLabel,
      diversificationScore: portfolio.diversificationScore || 0,
      holdings: breakdown,
      availableTypes: Object.values(INVESTMENT_TYPES),
      investingSkill: player.investingSkill || 0
    };
  }

  // ============================================================================
  // I18N PATCHES
  // ============================================================================

  function patchI18n() {
    const i18n = Alive.i18n;
    if (!i18n || !i18n.texts) return;
    const en = (i18n.texts.en = i18n.texts.en || {});
    const ru = (i18n.texts.ru = i18n.texts.ru || {});

    Object.assign(en, {
      // Education
      "edu.none": "No Education",
      "edu.elementary": "Elementary School",
      "edu.middle_school": "Middle School",
      "edu.high_school": "High School",
      "edu.university": "University",
      "edu.masters": "Master's Degree",
      "edu.phd": "PhD",
      "edu.certification": "Professional Certification",
      "edu.enroll": "Enroll",
      "edu.graduate": "Graduate",
      "edu.dropout": "Drop Out",
      "edu.gpa": "GPA",
      "edu.years_remaining": "{years} years remaining",
      "edu.scholarship": "Scholarship Awarded!",
      "edu.exam_passed": "Exam Passed!",
      "edu.exam_failed": "Exam Failed",

      // Education Paths
      "edu.path.none": "No Education",
      "edu.path.community": "Community College",
      "edu.path.trade": "Trade School",
      "edu.path.bootcamp": "Coding Bootcamp",
      "edu.path.university": "University",
      "edu.path.masters": "Master's Program",
      "edu.path.phd": "PhD Program",

      // Job Families
      "job.family.service": "Service Industry",
      "job.family.blue_collar": "Skilled Trades",
      "job.family.tech": "Technology",
      "job.family.white_collar": "Professional",
      "job.family.creative": "Creative",
      "job.family.medical": "Healthcare",

      // Career Skills
      "skill.programming": "Programming",
      "skill.management": "Management",
      "skill.trade": "Trade Skills",
      "skill.sales": "Sales",
      "skill.medical": "Medical",
      "skill.creative": "Creative",
      "skill.legal": "Legal",

      // Career Levels
      "career.level.intern": "Intern",
      "career.level.junior": "Junior",
      "career.level.mid": "Mid-Level",
      "career.level.senior": "Senior",
      "career.level.lead": "Team Lead",
      "career.level.manager": "Manager",
      "career.level.director": "Director",
      "career.level.vp": "Vice President",
      "career.level.clevel": "C-Level Executive",
      "career.promotion": "Promoted!",
      "career.path_to_top": "Path to Top",
      "career.years_at_level": "{years} years at this level",
      "career.promotion_chance": "{chance}% promotion chance",

      // Business
      "business.state.idea": "Idea Stage",
      "business.state.launch": "Launch",
      "business.state.struggling": "Struggling",
      "business.state.breakeven": "Break-even",
      "business.state.growth": "Growth",
      "business.state.profitable": "Profitable",
      "business.state.scaling": "Scaling",
      "business.state.exit": "Exited",
      "business.state.failed": "Failed",
      "business.type.freelance": "Freelancing",
      "business.type.ecommerce": "E-Commerce Store",
      "business.type.consulting": "Consulting Firm",
      "business.type.restaurant": "Restaurant",
      "business.type.tech_startup": "Tech Startup",
      "business.type.real_estate": "Real Estate Agency",
      "business.type.franchise": "Franchise",
      "business.type.saas": "SaaS Company",
      "business.start": "Start Business",
      "business.valuation": "Valuation",
      "business.monthly_revenue": "Monthly Revenue",
      "business.investor_offer": "Investor Offer: {amount}",
      "business.exit_opportunity": "Exit Opportunity: {amount}",
      "business.partner_conflict": "Partner Conflict!",
      "business.market_change": "Market Conditions Changed",

      // Investing
      "invest.type.savings": "Savings Account",
      "invest.type.bonds": "Government Bonds",
      "invest.type.index_funds": "Index Funds",
      "invest.type.stocks": "Individual Stocks",
      "invest.type.real_estate": "Real Estate Investment",
      "invest.type.crypto": "Cryptocurrency",
      "invest.type.startups": "Startup Investments",
      "invest.portfolio": "Portfolio",
      "invest.total_value": "Total Value",
      "invest.total_return": "Total Return",
      "invest.risk_level": "Risk Level",
      "invest.diversification": "Diversification",
      "invest.buy": "Invest",
      "invest.sell": "Sell",
      "invest.risk.low": "Low Risk",
      "invest.risk.moderate": "Moderate Risk",
      "invest.risk.high": "High Risk",
      "invest.risk.very_high": "Very High Risk",

      // Self Development UI
      "selfdev.title": "Self Development",
      "selfdev.education": "Education",
      "selfdev.career": "Career",
      "selfdev.business": "Business",
      "selfdev.investing": "Investing",
      "selfdev.current_stage": "Current Stage",
      "selfdev.next_steps": "Next Steps",
      "selfdev.progress": "Progress",
      "selfdev.requirements": "Requirements",
      "selfdev.cost": "Cost"
    });

    Object.assign(ru, {
      "edu.none": "Без образования",
      "edu.elementary": "Начальная школа",
      "edu.middle_school": "Средняя школа",
      "edu.high_school": "Старшая школа",
      "edu.university": "Университет",
      "edu.masters": "Магистратура",
      "edu.phd": "Докторантура",
      "edu.certification": "Сертификация",
      "edu.enroll": "Поступить",
      "edu.graduate": "Выпуск",
      "edu.dropout": "Отчисление",
      "edu.gpa": "Средний балл",
      "edu.years_remaining": "Осталось лет",
      "edu.scholarship": "Стипендия",
      "edu.exam_passed": "Экзамен сдан",
      "edu.exam_failed": "Экзамен не сдан",
      "career.level.intern": "Стажёр",
      "career.level.junior": "Младший специалист",
      "career.level.mid": "Специалист",
      "career.level.senior": "Старший специалист",
      "career.level.lead": "Руководитель группы",
      "career.level.manager": "Менеджер",
      "career.level.director": "Директор",
      "career.level.vp": "Вице-президент",
      "career.level.clevel": "Топ-менеджер",
      "career.promotion": "Повышение",
      "career.path_to_top": "Путь к вершине",
      "career.years_at_level": "Лет на уровне",
      "career.promotion_chance": "Шанс повышения",
      "business.state.idea": "Идея",
      "business.state.launch": "Запуск",
      "business.state.struggling": "Трудности",
      "business.state.breakeven": "Безубыточность",
      "business.state.growth": "Рост",
      "business.state.profitable": "Прибыльность",
      "business.state.scaling": "Масштабирование",
      "business.state.exit": "Выход",
      "business.state.failed": "Провал",
      "business.type.freelance": "Фриланс",
      "business.type.ecommerce": "Электронная коммерция",
      "business.type.consulting": "Консалтинг",
      "business.type.restaurant": "Ресторан",
      "business.type.tech_startup": "Техно-стартап",
      "business.type.real_estate": "Недвижимость",
      "business.type.franchise": "Франшиза",
      "business.type.saas": "SaaS",
      "business.start": "Начать бизнес",
      "business.valuation": "Оценка",
      "business.monthly_revenue": "Месячный доход",
      "business.investor_offer": "Предложение инвестора",
      "business.exit_opportunity": "Возможность выхода",
      "business.partner_conflict": "Конфликт с партнёром",
      "business.market_change": "Изменение рынка",
      "invest.type.savings": "Вклады",
      "invest.type.bonds": "Облигации",
      "invest.type.index_funds": "Индексные фонды",
      "invest.type.stocks": "Акции",
      "invest.type.real_estate": "Недвижимость",
      "invest.type.crypto": "Криптовалюта",
      "invest.type.startups": "Стартапы",
      "invest.portfolio": "Портфель",
      "invest.total_value": "Общая стоимость",
      "invest.total_return": "Общая доходность",
      "invest.risk_level": "Уровень риска",
      "invest.diversification": "Диверсификация",
      "invest.buy": "Купить",
      "invest.sell": "Продать",
      "invest.risk.low": "Низкий",
      "invest.risk.moderate": "Умеренный",
      "invest.risk.high": "Высокий",
      "invest.risk.very_high": "Очень высокий",
      "selfdev.title": "Саморазвитие",
      "selfdev.education": "Образование",
      "selfdev.career": "Карьера",
      "selfdev.business": "Бизнес",
      "selfdev.investing": "Инвестиции",
      "selfdev.current_stage": "Текущий этап",
      "selfdev.next_steps": "Следующие шаги",
      "selfdev.progress": "Прогресс",
      "selfdev.requirements": "Требования",
      "selfdev.cost": "Стоимость"
    });
  }

  patchI18n();

  // ============================================================================
  // EXPORT MODULE
  // ============================================================================

  Alive.selfDevelopment = {
    // Constants
    EDUCATION_STAGES,
    CAREER_LEVELS,
    BUSINESS_STATES,
    BUSINESS_TYPES,
    INVESTMENT_TYPES,

    // Education
    getEducationStageById,
    getNextEducationStage,
    canEnrollInEducation,
    enrollInEducation,
    progressEducation,
    graduateEducation,
    dropOutOfEducation,
    getEducationProgress,

    // Career
    getCareerLevelById,
    getCareerLevelByIndex,
    initializeCareerState,
    getCareerProgress,
    progressCareer,
    promoteCareer,
    getAdjustedSalary,

    // Business
    getBusinessTypeById,
    getBusinessStateById,
    canStartBusiness,
    startBusiness,
    progressBusiness,
    failBusiness,
    exitBusiness,
    getBusinessProgress,

    // Investing
    initializePortfolio,
    canInvest,
    makeInvestment,
    sellInvestment,
    progressInvestments,
    getPortfolioSummary,

    // New: Education Paths & Job Families
    EDUCATION_PATHS,
    JOB_FAMILIES,
    CAREER_SKILLS
  };

})(window);
