/**
 * Cities Module - Alive Life Simulator
 * 10 cities with full data structure including housing, cars, costs, and visuals
 * UPDATED: Integrates with Alive.Assets
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  // ============================================================================
  // CITIES DATA - Using Alive.Assets for buildings and vehicles
  // ============================================================================

  const BASE_COST_OF_LIVING = {
    food: 250,
    utilities: 100,
    transport: 80,
    entertainment: 140
  };

  function clamp(value, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  function scaleMoney(n, multiplier) {
    const num = Number(n);
    if (!Number.isFinite(num)) return 0;
    return Math.round(num * multiplier);
  }

  /**
   * Helper to select assets for a city based on wealth/region
   */
  function getAssetsForCity(cityId, multiplier) {
    // Default fallback lists if Assets module isn't loaded yet (though it should be)
    let buildings = ["poor_house_0", "poor_house_1", "mid_house_0"];
    let vehicles = ["hatch_0", "sedan_0"];

    // Use Alive.Assets if available to ensure IDs are valid
    if (Alive.Assets && Alive.Assets.BUILDINGS) {
      // Logic to pick buildings similar to wealth
      // Basic set
      buildings = ["poor_house_0", "poor_house_1", "poor_house_2", "mid_house_0", "mid_house_1"];
      vehicles = ["hatch_0", "hatch_1", "hatch_2", "sedan_0", "sedan_1"];

      if (multiplier >= 1.0) {
        buildings.push("mid_house_2", "mid_house_3", "mid_house_4");
        vehicles.push("sedan_2", "sedan_3", "suv_0");
      }
      if (multiplier >= 1.3) {
        buildings.push("mid_house_5", "rich_house_0", "rich_house_1", "rich_house_2");
        vehicles.push("sedan_4", "sedan_5", "suv_1", "suv_2", "suv_3", "sport_0", "ev_0", "ev_1");
      }
      if (multiplier >= 1.5) {
        buildings.push("rich_house_3", "rich_house_4", "rich_house_5", "com_5");
        vehicles.push("suv_4", "suv_5", "sport_1", "sport_2", "sport_3", "sport_4", "sport_5", "ev_3", "ev_4", "ev_5");
      }
    }

    return { buildings, vehicles };
  }

  function normalizeCity(city) {
    if (!city) return null;

    const c = { ...city };

    const col = Number(c.costOfLivingMultiplier);
    c.costOfLivingMultiplier = Number.isFinite(col) ? col : 1;

    if (!c.costOfLiving) {
      c.costOfLiving = { ...BASE_COST_OF_LIVING };
    }

    // Assign assets if not present
    if (!c.availableBuildingIds || !c.availableVehicleIds) {
      const assets = getAssetsForCity(c.id, c.costOfLivingMultiplier);
      c.availableBuildingIds = c.availableBuildingIds || assets.buildings;
      c.availableVehicleIds = c.availableVehicleIds || assets.vehicles;
    }

    return c;
  }

  function buildDerivedCityFromWorld(cityId) {
    if (!Alive.countries?.getCityById) return null;
    const info = Alive.countries.getCityById(cityId);
    if (!info) return null;

    const mul = clamp(Number(info.costOfLivingMultiplier) || 1, 0.25, 3);
    const assets = getAssetsForCity(cityId, mul);

    const derived = {
      id: info.id,
      nameKey: info.nameKey || ("city." + info.id),
      costOfLivingMultiplier: mul,
      colorTheme: "#00d4ff",
      populationVibe: (info.tags || []).join(", "),
      imageUrl: info.imageUrl,
      availableJobs: info.availableJobs || ["unemployed"],
      availableBuildingIds: assets.buildings,
      availableVehicleIds: assets.vehicles,
      costOfLiving: {
        food: BASE_COST_OF_LIVING.food,
        utilities: BASE_COST_OF_LIVING.utilities,
        transport: BASE_COST_OF_LIVING.transport,
        entertainment: BASE_COST_OF_LIVING.entertainment
      },
      citySpecificEvents: []
    };

    return normalizeCity(derived);
  }

  const cities = [
    // --------------------------------------------------------------------------
    // ALMATY, KAZAKHSTAN
    // --------------------------------------------------------------------------
    {
      id: "almaty",
      nameKey: "city.almaty",
      name: { en: "Almaty, Kazakhstan", ru: "Almaty, Kazakhstan" },
      costOfLivingMultiplier: 0.7,
      colorTheme: "#8B6914",
      populationVibe: "Mountain city with modern growth",
      imageUrl: "assets/cities/city_1.webp",
      availableJobs: [
        "unemployed", "janitor", "retailWorker", "waiter", "fastFoodWorker",
        "deliveryDriver", "mechanic", "securityGuard", "driver",
        "teacher", "nurse", "programmer", "engineer", "accountant"
      ],
      citySpecificEvents: ["almaty_mountain_trip", "almaty_bazaar", "almaty_earthquake"]
    },

    // --------------------------------------------------------------------------
    // DUBAI, UAE
    // --------------------------------------------------------------------------
    {
      id: "dubai",
      nameKey: "city.dubai",
      name: { en: "Dubai, UAE", ru: "Dubai, UAE" },
      costOfLivingMultiplier: 1.5,
      colorTheme: "#D4AF37",
      populationVibe: "Ultra-modern desert metropolis",
      imageUrl: "assets/cities/city_2.webp",
      availableJobs: [
        "unemployed", "retailWorker", "waiter", "deliveryDriver",
        "securityGuard", "driver", "nurse", "programmer", "engineer",
        "accountant", "lawyer", "architect", "marketingManager",
        "ceo", "cfo", "entrepreneur", "model", "influencer"
      ],
      citySpecificEvents: ["dubai_desert_safari", "dubai_yacht_party", "dubai_business_opportunity"]
    },

    // --------------------------------------------------------------------------
    // NEW YORK, USA
    // --------------------------------------------------------------------------
    {
      id: "newYork",
      nameKey: "city.newYork",
      name: { en: "New York, USA", ru: "New York, USA" },
      costOfLivingMultiplier: 1.4,
      colorTheme: "#4A90A4",
      populationVibe: "Fast-paced financial capital",
      imageUrl: "assets/cities/city_3.webp",
      availableJobs: [
        "unemployed", "janitor", "retailWorker", "waiter", "fastFoodWorker",
        "deliveryDriver", "securityGuard", "driver",
        "teacher", "nurse", "programmer", "engineer", "accountant",
        "lawyer", "doctor", "architect", "scientist", "marketingManager",
        "ceo", "cfo", "cto", "artist", "musician", "actor", "entrepreneur"
      ],
      citySpecificEvents: ["newyork_broadway", "newyork_wallstreet", "newyork_subway_encounter"]
    },

    // --------------------------------------------------------------------------
    // TOKYO, JAPAN
    // --------------------------------------------------------------------------
    {
      id: "tokyo",
      nameKey: "city.tokyo",
      name: { en: "Tokyo, Japan", ru: "Tokyo, Japan" },
      costOfLivingMultiplier: 1.25,
      colorTheme: "#E91E63",
      populationVibe: "Cutting-edge technology meets traditions",
      imageUrl: "assets/cities/city_4.webp",
      availableJobs: [
        "unemployed", "retailWorker", "waiter", "fastFoodWorker",
        "deliveryDriver", "securityGuard", "driver",
        "teacher", "nurse", "programmer", "engineer", "accountant",
        "doctor", "architect", "scientist", "marketingManager",
        "ceo", "cto", "artist", "musician", "entrepreneur"
      ],
      citySpecificEvents: ["tokyo_cherry_blossom", "tokyo_tech_startup", "tokyo_anime_convention"]
    },

    // --------------------------------------------------------------------------
    // PARIS, FRANCE
    // --------------------------------------------------------------------------
    {
      id: "paris",
      nameKey: "city.paris",
      name: { en: "Paris, France", ru: "Paris, France" },
      costOfLivingMultiplier: 1.35,
      colorTheme: "#FFB6C1",
      populationVibe: "Romantic capital of art, fashion",
      imageUrl: "assets/cities/city_5.webp",
      availableJobs: [
        "unemployed", "retailWorker", "waiter", "fastFoodWorker",
        "deliveryDriver", "driver",
        "teacher", "nurse", "programmer", "engineer", "accountant",
        "lawyer", "doctor", "architect", "marketingManager",
        "artist", "musician", "model", "entrepreneur"
      ],
      citySpecificEvents: ["paris_louvre_visit", "paris_fashion_week", "paris_romantic_dinner"]
    },

    // --------------------------------------------------------------------------
    // LONDON, UK
    // --------------------------------------------------------------------------
    {
      id: "london",
      nameKey: "city.london",
      name: { en: "London, UK", ru: "London, UK" },
      costOfLivingMultiplier: 1.4,
      colorTheme: "#708090",
      populationVibe: "Historic grandeur meets modern finance",
      imageUrl: "assets/cities/city_6.webp",
      availableJobs: [
        "unemployed", "janitor", "retailWorker", "waiter", "fastFoodWorker",
        "deliveryDriver", "securityGuard", "driver",
        "teacher", "nurse", "programmer", "engineer", "accountant",
        "lawyer", "doctor", "architect", "scientist", "marketingManager",
        "ceo", "cfo", "cto", "artist", "musician", "actor", "entrepreneur"
      ],
      citySpecificEvents: ["london_royal_event", "london_theatre", "london_financial_crisis"]
    },

    // --------------------------------------------------------------------------
    // SINGAPORE
    // --------------------------------------------------------------------------
    {
      id: "singapore",
      nameKey: "city.singapore",
      name: { en: "Singapore", ru: "Сингапур" },
      costOfLivingMultiplier: 1.3,
      colorTheme: "#00CED1",
      populationVibe: "Clean, efficient city-state",
      imageUrl: "assets/cities/city_7.webp",
      availableJobs: [
        "unemployed", "retailWorker", "waiter", "deliveryDriver",
        "securityGuard", "driver",
        "teacher", "nurse", "programmer", "engineer", "accountant",
        "lawyer", "doctor", "architect", "scientist", "marketingManager",
        "ceo", "cfo", "cto", "entrepreneur"
      ],
      citySpecificEvents: ["singapore_hawker_center", "singapore_casino", "singapore_fine"]
    },

    // --------------------------------------------------------------------------
    // HONG KONG
    // --------------------------------------------------------------------------
    {
      id: "hongKong",
      nameKey: "city.hongKong",
      name: { en: "Hong Kong", ru: "Гонконг" },
      costOfLivingMultiplier: 1.35,
      colorTheme: "#4169E1",
      populationVibe: "Dense vertical city",
      imageUrl: "assets/cities/city_8.webp",
      availableJobs: [
        "unemployed", "retailWorker", "waiter", "deliveryDriver",
        "securityGuard", "driver",
        "teacher", "nurse", "programmer", "engineer", "accountant",
        "lawyer", "doctor", "architect", "marketingManager",
        "ceo", "cfo", "cto", "entrepreneur", "actor"
      ],
      citySpecificEvents: ["hongkong_dim_sum", "hongkong_stock_crash", "hongkong_typhoon"]
    },

    // --------------------------------------------------------------------------
    // BANGKOK, THAILAND
    // --------------------------------------------------------------------------
    {
      id: "bangkok",
      nameKey: "city.bangkok",
      name: { en: "Bangkok, Thailand", ru: "Bangkok, Thailand" },
      costOfLivingMultiplier: 0.8,
      colorTheme: "#FF8C00",
      populationVibe: "Colorful temples and nightlife",
      imageUrl: "assets/cities/city_9.webp",
      availableJobs: [
        "unemployed", "janitor", "retailWorker", "waiter", "fastFoodWorker",
        "deliveryDriver", "mechanic", "securityGuard", "driver",
        "teacher", "nurse", "programmer", "engineer",
        "marketingManager", "entrepreneur", "influencer"
      ],
      citySpecificEvents: ["bangkok_temple_visit", "bangkok_street_food", "bangkok_flood"]
    },

    // --------------------------------------------------------------------------
    // MOSCOW, RUSSIA
    // --------------------------------------------------------------------------
    {
      id: "moscow",
      nameKey: "city.moscow",
      name: { en: "Moscow, Russia", ru: "Moscow, Russia" },
      costOfLivingMultiplier: 1.0,
      colorTheme: "#B22222",
      populationVibe: "Grand architecture",
      imageUrl: "assets/cities/city_10.webp",
      availableJobs: [
        "unemployed", "janitor", "retailWorker", "waiter", "fastFoodWorker",
        "deliveryDriver", "mechanic", "securityGuard", "driver",
        "teacher", "nurse", "programmer", "engineer", "accountant",
        "lawyer", "doctor", "scientist", "marketingManager", "ceo"
      ],
      citySpecificEvents: ["moscow_kremlin_tour", "moscow_winter", "moscow_oligarch_meeting"]
    }
  ];

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  function getCityById(cityId) {
    const local = cities.find((c) => c.id === cityId);
    if (local) return normalizeCity(local);

    const derived = buildDerivedCityFromWorld(cityId);
    if (derived) return derived;

    return normalizeCity(cities[0]);
  }

  function getDefaultCityId() {
    return "almaty";
  }

  function getAllCities() {
    const localById = new Map(cities.map((c) => [c.id, normalizeCity(c)]));
    const result = [];

    if (Alive.countries?.getAllCountries) {
      const countries = Alive.countries.getAllCountries();
      countries.forEach((country) => {
        (country.cities || []).forEach((city) => {
          if (localById.has(city.id)) {
            result.push(localById.get(city.id));
          } else {
            const derived = buildDerivedCityFromWorld(city.id);
            if (derived) result.push(derived);
          }
        });
      });
    }

    if (result.length === 0) {
      return cities.map((c) => normalizeCity(c));
    }

    return result;
  }

  function getAffordableCities(playerMoney) {
    return getAllCities().filter((city) => {
      const movingCost = getCityMovingCost(city.id);
      return playerMoney >= movingCost;
    });
  }

  function getCityTravelCost(fromCityId, toCityId) {
    const toCity = getCityById(toCityId);
    if (!toCity) return 0;
    const toMul = Number(toCity.costOfLivingMultiplier) || 1;
    const baseCost = 2000;
    return Math.round(baseCost * toMul);
  }

  function getCityMovingCost(cityId) {
    const city = getCityById(cityId);
    const baseCost = 2000;
    return Math.round(baseCost * city.costOfLivingMultiplier);
  }

  function getMonthlyCostOfLiving(cityId, buildingId = null) {
    const city = getCityById(cityId);
    const costs = city.costOfLiving;
    let rent = 0;

    // Check if buildingId is provided and valid (it could be "apartment" legacy string or ID)
    // If it's a new ID, we look it up.
    if (Alive.Assets && Alive.Assets.getBuildingById) {
      const building = Alive.Assets.getBuildingById(buildingId);
      if (building) {
        // Assuming monthly rent is ~0.8% of value if not specified
        rent = Math.round(building.price * 0.008);
      } else if (buildingId && buildingId !== "apartment") {
        // Fallback legacy calculation?
        rent = 500;
      } else {
        // Basic apartment default
        rent = 400 * city.costOfLivingMultiplier;
      }
    } else {
      rent = 400 * city.costOfLivingMultiplier;
    }

    return rent + costs.food + costs.utilities + costs.transport + costs.entertainment;
  }

  function getAnnualCostOfLiving(cityId, buildingId = null) {
    return getMonthlyCostOfLiving(cityId, buildingId) * 12;
  }

  function isJobAvailableInCity(cityId, jobId) {
    const city = getCityById(cityId);
    return city.availableJobs.includes(jobId);
  }

  // UPDATED: Returns array of building objects with adjusted prices
  function getCityAvailableBuildings(cityId) {
    const city = getCityById(cityId);
    if (!city || !city.availableBuildingIds) return [];

    if (!Alive.Assets || !Alive.Assets.getBuildingById) return [];

    return city.availableBuildingIds.map(id => {
      const b = Alive.Assets.getBuildingById(id);
      if (!b) return null;
      // Adjust price by city multiplier? User said "Deduct its price...".
      // Usually real estate varies by city.
      // Let's multiply by costOfLivingMultiplier
      return {
        ...b,
        price: scaleMoney(b.price, city.costOfLivingMultiplier)
      };
    }).filter(x => x);
  }

  // UPDATED: Returns array of vehicle objects with adjusted prices
  function getCityAvailableVehicles(cityId) {
    const city = getCityById(cityId);
    if (!city || !city.availableVehicleIds) return [];

    if (!Alive.Assets || !Alive.Assets.getVehicleById) return [];

    return city.availableVehicleIds.map(id => {
      const v = Alive.Assets.getVehicleById(id);
      if (!v) return null;
      // Cars might be slightly more expensive in expensive cities (taxes/shipping)
      return {
        ...v,
        price: scaleMoney(v.price, Math.max(1, city.costOfLivingMultiplier * 0.8))
        // Cars fluctuate less than housing
      };
    }).filter(x => x);
  }

  function getCitySpecificEvents(cityId) {
    const city = getCityById(cityId);
    return city.citySpecificEvents || [];
  }

  function getCityColorTheme(cityId) {
    const city = getCityById(cityId);
    return city.colorTheme;
  }

  function getCityImageUrl(cityId) {
    const city = getCityById(cityId);
    return city.imageUrl;
  }

  // ============================================================================
  // EXPORT MODULE
  // ============================================================================

  Alive.cities = {
    cities,
    getCityById,
    getDefaultCityId,
    getAllCities,
    getAffordableCities,
    getCityTravelCost,
    getCityMovingCost,
    getMonthlyCostOfLiving, // Updated signature
    getAnnualCostOfLiving,  // Updated signature
    isJobAvailableInCity,
    getCityAvailableBuildings, // NEW
    getCityAvailableVehicles,   // NEW
    getCitySpecificEvents,
    getCityColorTheme,
    getCityImageUrl
  };

})(window);
