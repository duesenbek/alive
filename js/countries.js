(function (global) {
  "use strict";

  const Alive = (global.Alive = global.Alive || {});

  const REGIONS = {
    CIS: "cis",
    EUROPE: "europe",
    NORTH_AMERICA: "north_america",
    SOUTH_AMERICA: "south_america",
    ASIA: "asia",
    MIDDLE_EAST: "middle_east",
    AFRICA: "africa",
    OCEANIA: "oceania"
  };

  const WEALTH_TIERS = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    VERY_HIGH: "very_high"
  };

  const JOB_LISTS = {
    basic: ["unemployed", "janitor", "retailWorker", "waiter", "fastFoodWorker", "deliveryDriver"],
    skilled: [
      "unemployed",
      "janitor",
      "retailWorker",
      "waiter",
      "fastFoodWorker",
      "deliveryDriver",
      "mechanic",
      "electrician",
      "constructionWorker",
      "securityGuard",
      "driver"
    ],
    professional: [
      "unemployed",
      "janitor",
      "retailWorker",
      "waiter",
      "fastFoodWorker",
      "deliveryDriver",
      "mechanic",
      "electrician",
      "constructionWorker",
      "securityGuard",
      "driver",
      "teacher",
      "nurse",
      "programmer",
      "engineer",
      "accountant",
      "marketingManager"
    ],
    globalHub: [
      "unemployed",
      "janitor",
      "retailWorker",
      "waiter",
      "fastFoodWorker",
      "deliveryDriver",
      "mechanic",
      "electrician",
      "constructionWorker",
      "securityGuard",
      "driver",
      "teacher",
      "nurse",
      "programmer",
      "engineer",
      "accountant",
      "marketingManager",
      "lawyer",
      "doctor",
      "architect",
      "scientist",
      "ceo",
      "cfo",
      "cto",
      "artist",
      "musician",
      "actor",
      "model",
      "influencer",
      "entrepreneur"
    ]
  };

  const IMAGE_POOL = {
    skyline1: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=1200&q=80",
    skyline2: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80",
    skyline3: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80",
    skyline4: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80",
    skyline5: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=1200&q=80",
    skyline6: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80",
    mountains1: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80",
    desert1: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80",
    historic1: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80",
    beach1: "https://images.unsplash.com/photo-1491166617655-0723a0999cfc?w=1200&q=80"
  };

  const countries = [];

  countries.push(
    {
      id: "kz",
      nameKey: "country.kz",
      flag: "🇰🇿",
      region: REGIONS.CIS,
      wealthTier: WEALTH_TIERS.MEDIUM,
      defaultLanguage: "ru",
      currency: "KZT",
      cities: [
        {
          id: "almaty",
          nameKey: "city.almaty",
          populationTier: "large",
          costOfLivingMultiplier: 0.7,
          salaryMultiplier: 0.65,
          imageUrl: IMAGE_POOL.mountains1,
          tags: ["business", "culture", "mountains"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "astana",
          nameKey: "city.astana",
          populationTier: "large",
          costOfLivingMultiplier: 0.65,
          salaryMultiplier: 0.7,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["capital", "government", "modern"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "ru",
      nameKey: "country.ru",
      flag: "🇷🇺",
      region: REGIONS.CIS,
      wealthTier: WEALTH_TIERS.MEDIUM,
      defaultLanguage: "ru",
      currency: "RUB",
      cities: [
        {
          id: "moscow",
          nameKey: "city.moscow",
          populationTier: "mega",
          costOfLivingMultiplier: 1.0,
          salaryMultiplier: 0.9,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["capital", "business", "power"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "spb",
          nameKey: "city.spb",
          populationTier: "mega",
          costOfLivingMultiplier: 0.85,
          salaryMultiplier: 0.8,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["culture", "historic", "tourism"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "ae",
      nameKey: "country.ae",
      flag: "🇦🇪",
      region: REGIONS.MIDDLE_EAST,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "AED",
      cities: [
        {
          id: "dubai",
          nameKey: "city.dubai",
          populationTier: "mega",
          costOfLivingMultiplier: 1.5,
          salaryMultiplier: 1.6,
          imageUrl: IMAGE_POOL.desert1,
          tags: ["luxury", "business", "modern"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "abuDhabi",
          nameKey: "city.abuDhabi",
          populationTier: "large",
          costOfLivingMultiplier: 1.4,
          salaryMultiplier: 1.55,
          imageUrl: IMAGE_POOL.skyline6,
          tags: ["capital", "oil", "luxury"],
          availableJobs: JOB_LISTS.globalHub
        }
      ]
    },
    {
      id: "us",
      nameKey: "country.us",
      flag: "🇺🇸",
      region: REGIONS.NORTH_AMERICA,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "USD",
      cities: [
        {
          id: "newYork",
          nameKey: "city.newYork",
          populationTier: "mega",
          costOfLivingMultiplier: 1.4,
          salaryMultiplier: 1.35,
          imageUrl: IMAGE_POOL.skyline2,
          tags: ["finance", "culture", "business"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "losAngeles",
          nameKey: "city.losAngeles",
          populationTier: "mega",
          costOfLivingMultiplier: 1.3,
          salaryMultiplier: 1.25,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["entertainment", "beach", "influencers"],
          availableJobs: JOB_LISTS.globalHub
        }
      ]
    },
    {
      id: "jp",
      nameKey: "country.jp",
      flag: "🇯🇵",
      region: REGIONS.ASIA,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "JPY",
      cities: [
        {
          id: "tokyo",
          nameKey: "city.tokyo",
          populationTier: "mega",
          costOfLivingMultiplier: 1.25,
          salaryMultiplier: 1.2,
          imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80",
          tags: ["tech", "culture", "mega"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "osaka",
          nameKey: "city.osaka",
          populationTier: "mega",
          costOfLivingMultiplier: 1.05,
          salaryMultiplier: 1.05,
          imageUrl: IMAGE_POOL.skyline5,
          tags: ["food", "business", "culture"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "fr",
      nameKey: "country.fr",
      flag: "🇫🇷",
      region: REGIONS.EUROPE,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "EUR",
      cities: [
        {
          id: "paris",
          nameKey: "city.paris",
          populationTier: "mega",
          costOfLivingMultiplier: 1.35,
          salaryMultiplier: 1.25,
          imageUrl: IMAGE_POOL.skyline4,
          tags: ["capital", "fashion", "culture"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "lyon",
          nameKey: "city.lyon",
          populationTier: "large",
          costOfLivingMultiplier: 1.05,
          salaryMultiplier: 1.05,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["food", "business", "historic"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "gb",
      nameKey: "country.gb",
      flag: "🇬🇧",
      region: REGIONS.EUROPE,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "GBP",
      cities: [
        {
          id: "london",
          nameKey: "city.london",
          populationTier: "mega",
          costOfLivingMultiplier: 1.4,
          salaryMultiplier: 1.35,
          imageUrl: IMAGE_POOL.skyline3,
          tags: ["capital", "finance", "culture"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "manchester",
          nameKey: "city.manchester",
          populationTier: "large",
          costOfLivingMultiplier: 1.0,
          salaryMultiplier: 1.0,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["sports", "music", "industry"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "sg",
      nameKey: "country.sg",
      flag: "🇸🇬",
      region: REGIONS.ASIA,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "SGD",
      cities: [
        {
          id: "singapore",
          nameKey: "city.singapore",
          populationTier: "mega",
          costOfLivingMultiplier: 1.3,
          salaryMultiplier: 1.35,
          imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80",
          tags: ["finance", "clean", "tech"],
          availableJobs: JOB_LISTS.globalHub
        }
      ]
    },
    {
      id: "hk",
      nameKey: "country.hk",
      flag: "🇭🇰",
      region: REGIONS.ASIA,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "HKD",
      cities: [
        {
          id: "hongKong",
          nameKey: "city.hongKong",
          populationTier: "mega",
          costOfLivingMultiplier: 1.35,
          salaryMultiplier: 1.35,
          imageUrl: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=1200&q=80",
          tags: ["finance", "dense", "harbor"],
          availableJobs: JOB_LISTS.globalHub
        }
      ]
    },
    {
      id: "th",
      nameKey: "country.th",
      flag: "🇹🇭",
      region: REGIONS.ASIA,
      wealthTier: WEALTH_TIERS.MEDIUM,
      defaultLanguage: "en",
      currency: "THB",
      cities: [
        {
          id: "bangkok",
          nameKey: "city.bangkok",
          populationTier: "mega",
          costOfLivingMultiplier: 0.8,
          salaryMultiplier: 0.65,
          imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80",
          tags: ["nightlife", "streetFood", "culture"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "phuket",
          nameKey: "city.phuket",
          populationTier: "medium",
          costOfLivingMultiplier: 0.9,
          salaryMultiplier: 0.6,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["resort", "beach", "tourism"],
          availableJobs: JOB_LISTS.basic
        }
      ]
    }
  );

  countries.push(
    {
      id: "ca",
      nameKey: "country.ca",
      flag: "🇨🇦",
      region: REGIONS.NORTH_AMERICA,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "CAD",
      cities: [
        {
          id: "toronto",
          nameKey: "city.toronto",
          populationTier: "mega",
          costOfLivingMultiplier: 1.25,
          salaryMultiplier: 1.2,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["finance", "diverse", "business"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "vancouver",
          nameKey: "city.vancouver",
          populationTier: "large",
          costOfLivingMultiplier: 1.3,
          salaryMultiplier: 1.15,
          imageUrl: IMAGE_POOL.mountains1,
          tags: ["nature", "tech", "port"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "mx",
      nameKey: "country.mx",
      flag: "🇲🇽",
      region: REGIONS.NORTH_AMERICA,
      wealthTier: WEALTH_TIERS.MEDIUM,
      defaultLanguage: "en",
      currency: "MXN",
      cities: [
        {
          id: "mexicoCity",
          nameKey: "city.mexicoCity",
          populationTier: "mega",
          costOfLivingMultiplier: 0.8,
          salaryMultiplier: 0.6,
          imageUrl: IMAGE_POOL.skyline5,
          tags: ["capital", "culture", "business"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "cancun",
          nameKey: "city.cancun",
          populationTier: "medium",
          costOfLivingMultiplier: 1.05,
          salaryMultiplier: 0.7,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["beach", "tourism", "resort"],
          availableJobs: JOB_LISTS.basic
        }
      ]
    },
    {
      id: "br",
      nameKey: "country.br",
      flag: "🇧🇷",
      region: REGIONS.SOUTH_AMERICA,
      wealthTier: WEALTH_TIERS.MEDIUM,
      defaultLanguage: "en",
      currency: "BRL",
      cities: [
        {
          id: "saoPaulo",
          nameKey: "city.saoPaulo",
          populationTier: "mega",
          costOfLivingMultiplier: 0.85,
          salaryMultiplier: 0.7,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["business", "finance", "mega"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "rio",
          nameKey: "city.rio",
          populationTier: "mega",
          costOfLivingMultiplier: 0.9,
          salaryMultiplier: 0.68,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["beach", "culture", "tourism"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "ar",
      nameKey: "country.ar",
      flag: "🇦🇷",
      region: REGIONS.SOUTH_AMERICA,
      wealthTier: WEALTH_TIERS.MEDIUM,
      defaultLanguage: "en",
      currency: "ARS",
      cities: [
        {
          id: "buenosAires",
          nameKey: "city.buenosAires",
          populationTier: "mega",
          costOfLivingMultiplier: 0.75,
          salaryMultiplier: 0.55,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["capital", "culture", "tango"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "cordoba",
          nameKey: "city.cordoba",
          populationTier: "medium",
          costOfLivingMultiplier: 0.6,
          salaryMultiplier: 0.45,
          imageUrl: IMAGE_POOL.skyline4,
          tags: ["students", "culture"],
          availableJobs: JOB_LISTS.skilled
        }
      ]
    },
    {
      id: "cl",
      nameKey: "country.cl",
      flag: "🇨🇱",
      region: REGIONS.SOUTH_AMERICA,
      wealthTier: WEALTH_TIERS.MEDIUM,
      defaultLanguage: "en",
      currency: "CLP",
      cities: [
        {
          id: "santiago",
          nameKey: "city.santiago",
          populationTier: "large",
          costOfLivingMultiplier: 0.9,
          salaryMultiplier: 0.75,
          imageUrl: IMAGE_POOL.mountains1,
          tags: ["capital", "mountains", "business"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "valparaiso",
          nameKey: "city.valparaiso",
          populationTier: "medium",
          costOfLivingMultiplier: 0.75,
          salaryMultiplier: 0.6,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["port", "culture", "tourism"],
          availableJobs: JOB_LISTS.skilled
        }
      ]
    },
    {
      id: "de",
      nameKey: "country.de",
      flag: "🇩🇪",
      region: REGIONS.EUROPE,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "EUR",
      cities: [
        {
          id: "berlin",
          nameKey: "city.berlin",
          populationTier: "mega",
          costOfLivingMultiplier: 1.1,
          salaryMultiplier: 1.2,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["capital", "tech", "culture"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "munich",
          nameKey: "city.munich",
          populationTier: "large",
          costOfLivingMultiplier: 1.3,
          salaryMultiplier: 1.35,
          imageUrl: IMAGE_POOL.skyline6,
          tags: ["business", "engineering", "quality"],
          availableJobs: JOB_LISTS.globalHub
        }
      ]
    },
    {
      id: "it",
      nameKey: "country.it",
      flag: "🇮🇹",
      region: REGIONS.EUROPE,
      wealthTier: WEALTH_TIERS.HIGH,
      defaultLanguage: "en",
      currency: "EUR",
      cities: [
        {
          id: "rome",
          nameKey: "city.rome",
          populationTier: "mega",
          costOfLivingMultiplier: 1.1,
          salaryMultiplier: 1.0,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["capital", "historic", "tourism"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "milan",
          nameKey: "city.milan",
          populationTier: "large",
          costOfLivingMultiplier: 1.25,
          salaryMultiplier: 1.15,
          imageUrl: IMAGE_POOL.skyline5,
          tags: ["fashion", "finance", "business"],
          availableJobs: JOB_LISTS.globalHub
        }
      ]
    },
    {
      id: "es",
      nameKey: "country.es",
      flag: "🇪🇸",
      region: REGIONS.EUROPE,
      wealthTier: WEALTH_TIERS.HIGH,
      defaultLanguage: "en",
      currency: "EUR",
      cities: [
        {
          id: "madrid",
          nameKey: "city.madrid",
          populationTier: "mega",
          costOfLivingMultiplier: 1.0,
          salaryMultiplier: 0.95,
          imageUrl: IMAGE_POOL.skyline4,
          tags: ["capital", "culture", "business"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "barcelona",
          nameKey: "city.barcelona",
          populationTier: "mega",
          costOfLivingMultiplier: 1.1,
          salaryMultiplier: 1.0,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["beach", "culture", "tourism"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "nl",
      nameKey: "country.nl",
      flag: "🇳🇱",
      region: REGIONS.EUROPE,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "EUR",
      cities: [
        {
          id: "amsterdam",
          nameKey: "city.amsterdam",
          populationTier: "large",
          costOfLivingMultiplier: 1.35,
          salaryMultiplier: 1.35,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["tech", "culture", "canals"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "rotterdam",
          nameKey: "city.rotterdam",
          populationTier: "medium",
          costOfLivingMultiplier: 1.2,
          salaryMultiplier: 1.25,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["port", "architecture", "business"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "se",
      nameKey: "country.se",
      flag: "🇸🇪",
      region: REGIONS.EUROPE,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "SEK",
      cities: [
        {
          id: "stockholm",
          nameKey: "city.stockholm",
          populationTier: "large",
          costOfLivingMultiplier: 1.35,
          salaryMultiplier: 1.45,
          imageUrl: IMAGE_POOL.skyline6,
          tags: ["capital", "tech", "design"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "gothenburg",
          nameKey: "city.gothenburg",
          populationTier: "medium",
          costOfLivingMultiplier: 1.2,
          salaryMultiplier: 1.25,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["port", "industry", "culture"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "au",
      nameKey: "country.au",
      flag: "🇦🇺",
      region: REGIONS.OCEANIA,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "AUD",
      cities: [
        {
          id: "sydney",
          nameKey: "city.sydney",
          populationTier: "large",
          costOfLivingMultiplier: 1.35,
          salaryMultiplier: 1.3,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["beach", "finance", "harbor"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "melbourne",
          nameKey: "city.melbourne",
          populationTier: "large",
          costOfLivingMultiplier: 1.25,
          salaryMultiplier: 1.2,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["culture", "education", "coffee"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "nz",
      nameKey: "country.nz",
      flag: "🇦🇺",
      region: REGIONS.OCEANIA,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "NZD",
      cities: [
        {
          id: "auckland",
          nameKey: "city.auckland",
          populationTier: "medium",
          costOfLivingMultiplier: 1.2,
          salaryMultiplier: 1.1,
          imageUrl: IMAGE_POOL.skyline6,
          tags: ["nature", "harbor", "clean"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "wellington",
          nameKey: "city.wellington",
          populationTier: "small",
          costOfLivingMultiplier: 1.15,
          salaryMultiplier: 1.05,
          imageUrl: IMAGE_POOL.mountains1,
          tags: ["capital", "windy", "government"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    }
  );

  countries.push(
    {
      id: "cn",
      nameKey: "country.cn",
      flag: "????",
      region: REGIONS.ASIA,
      wealthTier: WEALTH_TIERS.HIGH,
      defaultLanguage: "en",
      currency: "CNY",
      cities: [
        {
          id: "shanghai",
          nameKey: "city.shanghai",
          populationTier: "mega",
          costOfLivingMultiplier: 1.1,
          salaryMultiplier: 1.05,
          imageUrl: IMAGE_POOL.skyline6,
          tags: ["finance", "business", "mega"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "beijing",
          nameKey: "city.beijing",
          populationTier: "mega",
          costOfLivingMultiplier: 1.05,
          salaryMultiplier: 1.0,
          imageUrl: IMAGE_POOL.skyline5,
          tags: ["capital", "government", "culture"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "shenzhen",
          nameKey: "city.shenzhen",
          populationTier: "mega",
          costOfLivingMultiplier: 1.0,
          salaryMultiplier: 1.1,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["tech", "startups", "manufacturing"],
          availableJobs: JOB_LISTS.globalHub
        }
      ]
    },
    {
      id: "in",
      nameKey: "country.in",
      flag: "????",
      region: REGIONS.ASIA,
      wealthTier: WEALTH_TIERS.MEDIUM,
      defaultLanguage: "en",
      currency: "INR",
      cities: [
        {
          id: "mumbai",
          nameKey: "city.mumbai",
          populationTier: "mega",
          costOfLivingMultiplier: 0.9,
          salaryMultiplier: 0.75,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["finance", "bollywood", "business"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "delhi",
          nameKey: "city.delhi",
          populationTier: "mega",
          costOfLivingMultiplier: 0.75,
          salaryMultiplier: 0.65,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["capital", "government", "historic"],
          availableJobs: JOB_LISTS.skilled
        },
        {
          id: "bengaluru",
          nameKey: "city.bengaluru",
          populationTier: "mega",
          costOfLivingMultiplier: 0.8,
          salaryMultiplier: 0.85,
          imageUrl: IMAGE_POOL.skyline6,
          tags: ["tech", "startups", "education"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "kr",
      nameKey: "country.kr",
      flag: "🇮🇳",
      region: REGIONS.ASIA,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "KRW",
      cities: [
        {
          id: "seoul",
          nameKey: "city.seoul",
          populationTier: "mega",
          costOfLivingMultiplier: 1.2,
          salaryMultiplier: 1.2,
          imageUrl: IMAGE_POOL.skyline6,
          tags: ["tech", "culture", "mega"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "busan",
          nameKey: "city.busan",
          populationTier: "large",
          costOfLivingMultiplier: 0.95,
          salaryMultiplier: 0.95,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["port", "beach", "industry"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "vn",
      nameKey: "country.vn",
      flag: "🇰🇷",
      region: REGIONS.ASIA,
      wealthTier: WEALTH_TIERS.MEDIUM,
      defaultLanguage: "en",
      currency: "VND",
      cities: [
        {
          id: "hanoi",
          nameKey: "city.hanoi",
          populationTier: "large",
          costOfLivingMultiplier: 0.6,
          salaryMultiplier: 0.45,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["capital", "culture", "historic"],
          availableJobs: JOB_LISTS.skilled
        },
        {
          id: "hcmc",
          nameKey: "city.hcmc",
          populationTier: "mega",
          costOfLivingMultiplier: 0.75,
          salaryMultiplier: 0.55,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["business", "startups", "nightlife"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "daNang",
          nameKey: "city.daNang",
          populationTier: "medium",
          costOfLivingMultiplier: 0.55,
          salaryMultiplier: 0.4,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["beach", "tourism", "affordable"],
          availableJobs: JOB_LISTS.basic
        }
      ]
    },
    {
      id: "id",
      nameKey: "country.id",
      flag: "????",
      region: REGIONS.ASIA,
      wealthTier: WEALTH_TIERS.MEDIUM,
      defaultLanguage: "en",
      currency: "IDR",
      cities: [
        {
          id: "jakarta",
          nameKey: "city.jakarta",
          populationTier: "mega",
          costOfLivingMultiplier: 0.8,
          salaryMultiplier: 0.6,
          imageUrl: IMAGE_POOL.skyline5,
          tags: ["capital", "business", "traffic"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "bali",
          nameKey: "city.bali",
          populationTier: "medium",
          costOfLivingMultiplier: 0.95,
          salaryMultiplier: 0.55,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["resort", "beach", "tourism"],
          availableJobs: JOB_LISTS.basic
        },
        {
          id: "surabaya",
          nameKey: "city.surabaya",
          populationTier: "large",
          costOfLivingMultiplier: 0.65,
          salaryMultiplier: 0.5,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["port", "industry", "business"],
          availableJobs: JOB_LISTS.skilled
        }
      ]
    },
    {
      id: "my",
      nameKey: "country.my",
      flag: "🇮🇩",
      region: REGIONS.ASIA,
      wealthTier: WEALTH_TIERS.HIGH,
      defaultLanguage: "en",
      currency: "MYR",
      cities: [
        {
          id: "kualaLumpur",
          nameKey: "city.kualaLumpur",
          populationTier: "large",
          costOfLivingMultiplier: 0.95,
          salaryMultiplier: 0.85,
          imageUrl: IMAGE_POOL.skyline6,
          tags: ["capital", "business", "modern"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "penang",
          nameKey: "city.penang",
          populationTier: "medium",
          costOfLivingMultiplier: 0.85,
          salaryMultiplier: 0.75,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["food", "tourism", "tech"],
          availableJobs: JOB_LISTS.skilled
        }
      ]
    },
    {
      id: "ph",
      nameKey: "country.ph",
      flag: "????",
      region: REGIONS.ASIA,
      wealthTier: WEALTH_TIERS.MEDIUM,
      defaultLanguage: "en",
      currency: "PHP",
      cities: [
        {
          id: "manila",
          nameKey: "city.manila",
          populationTier: "mega",
          costOfLivingMultiplier: 0.75,
          salaryMultiplier: 0.55,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["capital", "business", "dense"],
          availableJobs: JOB_LISTS.skilled
        },
        {
          id: "cebu",
          nameKey: "city.cebu",
          populationTier: "medium",
          costOfLivingMultiplier: 0.65,
          salaryMultiplier: 0.5,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["beach", "tourism", "affordable"],
          availableJobs: JOB_LISTS.basic
        }
      ]
    },
    {
      id: "pk",
      nameKey: "country.pk",
      flag: "????",
      region: REGIONS.ASIA,
      wealthTier: WEALTH_TIERS.LOW,
      defaultLanguage: "en",
      currency: "PKR",
      cities: [
        {
          id: "karachi",
          nameKey: "city.karachi",
          populationTier: "mega",
          costOfLivingMultiplier: 0.55,
          salaryMultiplier: 0.35,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["port", "business", "dense"],
          availableJobs: JOB_LISTS.skilled
        },
        {
          id: "lahore",
          nameKey: "city.lahore",
          populationTier: "large",
          costOfLivingMultiplier: 0.5,
          salaryMultiplier: 0.32,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["culture", "historic", "food"],
          availableJobs: JOB_LISTS.basic
        }
      ]
    },
    {
      id: "bd",
      nameKey: "country.bd",
      flag: "????",
      region: REGIONS.ASIA,
      wealthTier: WEALTH_TIERS.LOW,
      defaultLanguage: "en",
      currency: "BDT",
      cities: [
        {
          id: "dhaka",
          nameKey: "city.dhaka",
          populationTier: "mega",
          costOfLivingMultiplier: 0.45,
          salaryMultiplier: 0.28,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["capital", "dense", "industry"],
          availableJobs: JOB_LISTS.basic
        },
        {
          id: "chittagong",
          nameKey: "city.chittagong",
          populationTier: "large",
          costOfLivingMultiplier: 0.4,
          salaryMultiplier: 0.26,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["port", "industry"],
          availableJobs: JOB_LISTS.basic
        }
      ]
    },
    {
      id: "lk",
      nameKey: "country.lk",
      flag: "????",
      region: REGIONS.ASIA,
      wealthTier: WEALTH_TIERS.LOW,
      defaultLanguage: "en",
      currency: "LKR",
      cities: [
        {
          id: "colombo",
          nameKey: "city.colombo",
          populationTier: "medium",
          costOfLivingMultiplier: 0.65,
          salaryMultiplier: 0.45,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["port", "capital", "tropical"],
          availableJobs: JOB_LISTS.skilled
        },
        {
          id: "kandy",
          nameKey: "city.kandy",
          populationTier: "small",
          costOfLivingMultiplier: 0.5,
          salaryMultiplier: 0.35,
          imageUrl: IMAGE_POOL.mountains1,
          tags: ["culture", "mountains", "tourism"],
          availableJobs: JOB_LISTS.basic
        }
      ]
    },
    {
      id: "np",
      nameKey: "country.np",
      flag: "????",
      region: REGIONS.ASIA,
      wealthTier: WEALTH_TIERS.LOW,
      defaultLanguage: "en",
      currency: "NPR",
      cities: [
        {
          id: "kathmandu",
          nameKey: "city.kathmandu",
          populationTier: "medium",
          costOfLivingMultiplier: 0.45,
          salaryMultiplier: 0.25,
          imageUrl: IMAGE_POOL.mountains1,
          tags: ["capital", "mountains", "culture"],
          availableJobs: JOB_LISTS.basic
        },
        {
          id: "pokhara",
          nameKey: "city.pokhara",
          populationTier: "small",
          costOfLivingMultiplier: 0.4,
          salaryMultiplier: 0.22,
          imageUrl: IMAGE_POOL.mountains1,
          tags: ["nature", "tourism", "lakes"],
          availableJobs: JOB_LISTS.basic
        }
      ]
    },
    {
      id: "tw",
      nameKey: "country.tw",
      flag: "????",
      region: REGIONS.ASIA,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "TWD",
      cities: [
        {
          id: "taipei",
          nameKey: "city.taipei",
          populationTier: "large",
          costOfLivingMultiplier: 1.05,
          salaryMultiplier: 1.05,
          imageUrl: IMAGE_POOL.skyline6,
          tags: ["capital", "tech", "nightMarkets"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "kaohsiung",
          nameKey: "city.kaohsiung",
          populationTier: "medium",
          costOfLivingMultiplier: 0.85,
          salaryMultiplier: 0.9,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["port", "industry", "culture"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    }
  );

  countries.push(
    {
      id: "ua",
      nameKey: "country.ua",
      flag: "????",
      region: REGIONS.CIS,
      wealthTier: WEALTH_TIERS.LOW,
      defaultLanguage: "ru",
      currency: "UAH",
      cities: [
        {
          id: "kyiv",
          nameKey: "city.kyiv",
          populationTier: "mega",
          costOfLivingMultiplier: 0.6,
          salaryMultiplier: 0.5,
          imageUrl: IMAGE_POOL.skyline4,
          tags: ["capital", "tech", "historic"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "lviv",
          nameKey: "city.lviv",
          populationTier: "medium",
          costOfLivingMultiplier: 0.5,
          salaryMultiplier: 0.42,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["culture", "historic", "tourism"],
          availableJobs: JOB_LISTS.skilled
        }
      ]
    },
    {
      id: "by",
      nameKey: "country.by",
      flag: "????",
      region: REGIONS.CIS,
      wealthTier: WEALTH_TIERS.LOW,
      defaultLanguage: "ru",
      currency: "BYN",
      cities: [
        {
          id: "minsk",
          nameKey: "city.minsk",
          populationTier: "large",
          costOfLivingMultiplier: 0.6,
          salaryMultiplier: 0.5,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["capital", "clean", "tech"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "brest",
          nameKey: "city.brest",
          populationTier: "medium",
          costOfLivingMultiplier: 0.5,
          salaryMultiplier: 0.42,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["historic", "border"],
          availableJobs: JOB_LISTS.skilled
        }
      ]
    },
    {
      id: "uz",
      nameKey: "country.uz",
      flag: "????",
      region: REGIONS.CIS,
      wealthTier: WEALTH_TIERS.LOW,
      defaultLanguage: "ru",
      currency: "UZS",
      cities: [
        {
          id: "tashkent",
          nameKey: "city.tashkent",
          populationTier: "mega",
          costOfLivingMultiplier: 0.45,
          salaryMultiplier: 0.35,
          imageUrl: IMAGE_POOL.skyline5,
          tags: ["capital", "business", "historic"],
          availableJobs: JOB_LISTS.skilled
        },
        {
          id: "samarkand",
          nameKey: "city.samarkand",
          populationTier: "medium",
          costOfLivingMultiplier: 0.4,
          salaryMultiplier: 0.3,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["historic", "tourism", "culture"],
          availableJobs: JOB_LISTS.basic
        }
      ]
    },
    {
      id: "ge",
      nameKey: "country.ge",
      flag: "????",
      region: REGIONS.CIS,
      wealthTier: WEALTH_TIERS.MEDIUM,
      defaultLanguage: "ru",
      currency: "GEL",
      cities: [
        {
          id: "tbilisi",
          nameKey: "city.tbilisi",
          populationTier: "large",
          costOfLivingMultiplier: 0.65,
          salaryMultiplier: 0.55,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["capital", "culture", "wine"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "batumi",
          nameKey: "city.batumi",
          populationTier: "medium",
          costOfLivingMultiplier: 0.7,
          salaryMultiplier: 0.55,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["beach", "tourism", "resort"],
          availableJobs: JOB_LISTS.skilled
        }
      ]
    },
    {
      id: "am",
      nameKey: "country.am",
      flag: "????",
      region: REGIONS.CIS,
      wealthTier: WEALTH_TIERS.LOW,
      defaultLanguage: "ru",
      currency: "AMD",
      cities: [
        {
          id: "yerevan",
          nameKey: "city.yerevan",
          populationTier: "large",
          costOfLivingMultiplier: 0.6,
          salaryMultiplier: 0.5,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["capital", "culture", "tech"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "gyumri",
          nameKey: "city.gyumri",
          populationTier: "small",
          costOfLivingMultiplier: 0.45,
          salaryMultiplier: 0.38,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["culture", "affordable"],
          availableJobs: JOB_LISTS.basic
        }
      ]
    },
    {
      id: "az",
      nameKey: "country.az",
      flag: "????",
      region: REGIONS.CIS,
      wealthTier: WEALTH_TIERS.MEDIUM,
      defaultLanguage: "ru",
      currency: "AZN",
      cities: [
        {
          id: "baku",
          nameKey: "city.baku",
          populationTier: "mega",
          costOfLivingMultiplier: 0.85,
          salaryMultiplier: 0.75,
          imageUrl: IMAGE_POOL.skyline6,
          tags: ["capital", "oil", "modern"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "ganja",
          nameKey: "city.ganja",
          populationTier: "medium",
          costOfLivingMultiplier: 0.6,
          salaryMultiplier: 0.5,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["culture", "industry"],
          availableJobs: JOB_LISTS.skilled
        }
      ]
    },
    {
      id: "kg",
      nameKey: "country.kg",
      flag: "????",
      region: REGIONS.CIS,
      wealthTier: WEALTH_TIERS.LOW,
      defaultLanguage: "ru",
      currency: "KGS",
      cities: [
        {
          id: "bishkek",
          nameKey: "city.bishkek",
          populationTier: "medium",
          costOfLivingMultiplier: 0.45,
          salaryMultiplier: 0.32,
          imageUrl: IMAGE_POOL.mountains1,
          tags: ["capital", "mountains"],
          availableJobs: JOB_LISTS.skilled
        },
        {
          id: "osh",
          nameKey: "city.osh",
          populationTier: "small",
          costOfLivingMultiplier: 0.35,
          salaryMultiplier: 0.25,
          imageUrl: IMAGE_POOL.mountains1,
          tags: ["historic", "mountains"],
          availableJobs: JOB_LISTS.basic
        }
      ]
    },
    {
      id: "md",
      nameKey: "country.md",
      flag: "????",
      region: REGIONS.CIS,
      wealthTier: WEALTH_TIERS.LOW,
      defaultLanguage: "ru",
      currency: "MDL",
      cities: [
        {
          id: "chisinau",
          nameKey: "city.chisinau",
          populationTier: "medium",
          costOfLivingMultiplier: 0.5,
          salaryMultiplier: 0.35,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["capital", "wine"],
          availableJobs: JOB_LISTS.skilled
        },
        {
          id: "balti",
          nameKey: "city.balti",
          populationTier: "small",
          costOfLivingMultiplier: 0.4,
          salaryMultiplier: 0.28,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["affordable", "local"],
          availableJobs: JOB_LISTS.basic
        }
      ]
    }
  );

  countries.push(
    {
      id: "tr",
      nameKey: "country.tr",
      flag: "????",
      region: REGIONS.MIDDLE_EAST,
      wealthTier: WEALTH_TIERS.MEDIUM,
      defaultLanguage: "en",
      currency: "TRY",
      cities: [
        {
          id: "istanbul",
          nameKey: "city.istanbul",
          populationTier: "mega",
          costOfLivingMultiplier: 0.9,
          salaryMultiplier: 0.75,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["culture", "business", "tourism"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "ankara",
          nameKey: "city.ankara",
          populationTier: "large",
          costOfLivingMultiplier: 0.75,
          salaryMultiplier: 0.7,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["capital", "government"],
          availableJobs: JOB_LISTS.skilled
        }
      ]
    },
    {
      id: "sa",
      nameKey: "country.sa",
      flag: "🇹🇷",
      region: REGIONS.MIDDLE_EAST,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "SAR",
      cities: [
        {
          id: "riyadh",
          nameKey: "city.riyadh",
          populationTier: "mega",
          costOfLivingMultiplier: 1.1,
          salaryMultiplier: 1.3,
          imageUrl: IMAGE_POOL.desert1,
          tags: ["capital", "business", "desert"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "jeddah",
          nameKey: "city.jeddah",
          populationTier: "large",
          costOfLivingMultiplier: 1.05,
          salaryMultiplier: 1.25,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["port", "business", "coast"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "qa",
      nameKey: "country.qa",
      flag: "🇸🇦",
      region: REGIONS.MIDDLE_EAST,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "QAR",
      cities: [
        {
          id: "doha",
          nameKey: "city.doha",
          populationTier: "large",
          costOfLivingMultiplier: 1.4,
          salaryMultiplier: 1.6,
          imageUrl: IMAGE_POOL.skyline6,
          tags: ["capital", "luxury", "business"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "alWakrah",
          nameKey: "city.alWakrah",
          populationTier: "medium",
          costOfLivingMultiplier: 1.15,
          salaryMultiplier: 1.25,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["coast", "quiet"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "il",
      nameKey: "country.il",
      flag: "????",
      region: REGIONS.MIDDLE_EAST,
      wealthTier: WEALTH_TIERS.VERY_HIGH,
      defaultLanguage: "en",
      currency: "ILS",
      cities: [
        {
          id: "telAviv",
          nameKey: "city.telAviv",
          populationTier: "large",
          costOfLivingMultiplier: 1.6,
          salaryMultiplier: 1.55,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["tech", "startup", "beach"],
          availableJobs: JOB_LISTS.globalHub
        },
        {
          id: "jerusalem",
          nameKey: "city.jerusalem",
          populationTier: "medium",
          costOfLivingMultiplier: 1.35,
          salaryMultiplier: 1.2,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["capital", "historic", "culture"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "ir",
      nameKey: "country.ir",
      flag: "????",
      region: REGIONS.MIDDLE_EAST,
      wealthTier: WEALTH_TIERS.MEDIUM,
      defaultLanguage: "en",
      currency: "IRR",
      cities: [
        {
          id: "tehran",
          nameKey: "city.tehran",
          populationTier: "mega",
          costOfLivingMultiplier: 0.65,
          salaryMultiplier: 0.5,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["capital", "business", "mountains"],
          availableJobs: JOB_LISTS.skilled
        },
        {
          id: "isfahan",
          nameKey: "city.isfahan",
          populationTier: "large",
          costOfLivingMultiplier: 0.55,
          salaryMultiplier: 0.45,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["culture", "historic"],
          availableJobs: JOB_LISTS.basic
        }
      ]
    },
    {
      id: "eg",
      nameKey: "country.eg",
      flag: "????",
      region: REGIONS.AFRICA,
      wealthTier: WEALTH_TIERS.LOW,
      defaultLanguage: "en",
      currency: "EGP",
      cities: [
        {
          id: "cairo",
          nameKey: "city.cairo",
          populationTier: "mega",
          costOfLivingMultiplier: 0.6,
          salaryMultiplier: 0.4,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["capital", "historic", "culture"],
          availableJobs: JOB_LISTS.skilled
        },
        {
          id: "alexandria",
          nameKey: "city.alexandria",
          populationTier: "large",
          costOfLivingMultiplier: 0.55,
          salaryMultiplier: 0.38,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["port", "historic", "coast"],
          availableJobs: JOB_LISTS.basic
        }
      ]
    },
    {
      id: "ma",
      nameKey: "country.ma",
      flag: "🇪🇬",
      region: REGIONS.AFRICA,
      wealthTier: WEALTH_TIERS.LOW,
      defaultLanguage: "en",
      currency: "MAD",
      cities: [
        {
          id: "casablanca",
          nameKey: "city.casablanca",
          populationTier: "large",
          costOfLivingMultiplier: 0.65,
          salaryMultiplier: 0.45,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["business", "port", "culture"],
          availableJobs: JOB_LISTS.skilled
        },
        {
          id: "marrakesh",
          nameKey: "city.marrakesh",
          populationTier: "medium",
          costOfLivingMultiplier: 0.6,
          salaryMultiplier: 0.4,
          imageUrl: IMAGE_POOL.historic1,
          tags: ["tourism", "culture", "markets"],
          availableJobs: JOB_LISTS.basic
        }
      ]
    },
    {
      id: "za",
      nameKey: "country.za",
      flag: "????",
      region: REGIONS.AFRICA,
      wealthTier: WEALTH_TIERS.MEDIUM,
      defaultLanguage: "en",
      currency: "ZAR",
      cities: [
        {
          id: "johannesburg",
          nameKey: "city.johannesburg",
          populationTier: "large",
          costOfLivingMultiplier: 0.75,
          salaryMultiplier: 0.7,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["business", "finance", "urban"],
          availableJobs: JOB_LISTS.professional
        },
        {
          id: "capeTown",
          nameKey: "city.capeTown",
          populationTier: "large",
          costOfLivingMultiplier: 0.9,
          salaryMultiplier: 0.75,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["nature", "tourism", "coast"],
          availableJobs: JOB_LISTS.professional
        }
      ]
    },
    {
      id: "ng",
      nameKey: "country.ng",
      flag: "????",
      region: REGIONS.AFRICA,
      wealthTier: WEALTH_TIERS.LOW,
      defaultLanguage: "en",
      currency: "NGN",
      cities: [
        {
          id: "lagos",
          nameKey: "city.lagos",
          populationTier: "mega",
          costOfLivingMultiplier: 0.65,
          salaryMultiplier: 0.5,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["business", "music", "dense"],
          availableJobs: JOB_LISTS.skilled
        },
        {
          id: "abuja",
          nameKey: "city.abuja",
          populationTier: "large",
          costOfLivingMultiplier: 0.6,
          salaryMultiplier: 0.48,
          imageUrl: IMAGE_POOL.skyline5,
          tags: ["capital", "government"],
          availableJobs: JOB_LISTS.skilled
        }
      ]
    },
    {
      id: "ke",
      nameKey: "country.ke",
      flag: "🇳🇬",
      region: REGIONS.AFRICA,
      wealthTier: WEALTH_TIERS.LOW,
      defaultLanguage: "en",
      currency: "KES",
      cities: [
        {
          id: "nairobi",
          nameKey: "city.nairobi",
          populationTier: "large",
          costOfLivingMultiplier: 0.6,
          salaryMultiplier: 0.5,
          imageUrl: IMAGE_POOL.skyline1,
          tags: ["capital", "tech", "safari"],
          availableJobs: JOB_LISTS.skilled
        },
        {
          id: "mombasa",
          nameKey: "city.mombasa",
          populationTier: "medium",
          costOfLivingMultiplier: 0.65,
          salaryMultiplier: 0.48,
          imageUrl: IMAGE_POOL.beach1,
          tags: ["beach", "port", "tourism"],
          availableJobs: JOB_LISTS.basic
        }
      ]
    }
  );

  function getCountryById(countryId) {
    return countries.find((c) => c.id === countryId) || null;
  }

  function getAllCountries() {
    return countries;
  }

  function getCityById(cityId) {
    for (const c of countries) {
      const city = c.cities.find((x) => x.id === cityId);
      if (city) return { ...city, countryId: c.id };
    }
    return null;
  }

  function getCitiesByCountryId(countryId) {
    const c = getCountryById(countryId);
    return c ? c.cities : [];
  }

  Alive.countries = {
    countries,
    REGIONS,
    WEALTH_TIERS,
    JOB_LISTS,
    IMAGE_POOL,
    getCountryById,
    getAllCountries,
    getCityById,
    getCitiesByCountryId
  };
})(window);
