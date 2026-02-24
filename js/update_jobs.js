const fs = require('fs');
let data = fs.readFileSync('c:/Users/Bekzat/Desktop/alive/js/jobs.js', 'utf8');

const jobsToAdd = `
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
  ];`;

// Replace the end of the jobs array
data = data.replace(/}[\s\r\n]*\];[\s\r\n]*\/\/ ============================================================================\s*\/\/\s*HELPER FUNCTIONS/g, jobsToAdd + '\n\n  // ============================================================================\n  // HELPER FUNCTIONS');

fs.writeFileSync('c:/Users/Bekzat/Desktop/alive/js/jobs.js', data, 'utf8');
console.log('Successfully updated jobs.js');
