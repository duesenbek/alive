/**
 * Relationships Module - Alive Life Simulator
 * Enhanced personality system, partner matching, and child generation
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  // ============================================================================
  // PERSONALITY TRAITS
  // ============================================================================

  const PERSONALITY_TRAITS = [
    "optimistic",   // Happy, sees good in everything
    "ambitious",    // Career-focused, goal-driven
    "creative",     // Artistic, imaginative
    "athletic",     // Sporty, health-conscious
    "intellectual", // Smart, loves learning
    "lazy",         // Low energy, relaxed
    "kind",         // Generous, caring
    "serious",      // Focused, no-nonsense
    "funny",        // Humorous, lighthearted
    "adventurous"   // Risk-taker, loves new experiences
  ];

  const APPEARANCE_FEATURES = [
    "tall", "short", "athletic_build", "slim", "curvy",
    "glasses", "freckles", "dimples", "beard", "long_hair", "short_hair"
  ];

  // ============================================================================
  // TRUST TIERS (Deep Relationships System)
  // ============================================================================

  const TRUST_TIERS = {
    ACQUAINTANCE: { id: "acquaintance", min: 0, max: 20, nameKey: "trust.acquaintance", icon: "👋" },
    FRIEND: { id: "friend", min: 20, max: 50, nameKey: "trust.friend", icon: "🙂" },
    CLOSE: { id: "close", min: 50, max: 75, nameKey: "trust.close", icon: "😊" },
    DEEP: { id: "deep", min: 75, max: 90, nameKey: "trust.deep", icon: "💕" },
    LIFE: { id: "life", min: 90, max: 100, nameKey: "trust.life", icon: "💖" }
  };

  // ============================================================================
  // RELATIONSHIP MEMORY TYPES
  // ============================================================================

  const MEMORY_TYPES = {
    // Positive memories
    FIRST_MEETING: { id: "first_meeting", trustImpact: 5, icon: "👋", nameKey: "memory.first_meeting" },
    QUALITY_TIME: { id: "quality_time", trustImpact: 5, icon: "☕", nameKey: "memory.quality_time" },
    DEEP_TALK: { id: "deep_talk", trustImpact: 8, icon: "💬", nameKey: "memory.deep_talk" },
    SUPPORT_CRISIS: { id: "support_crisis", trustImpact: 15, icon: "🤝", nameKey: "memory.support_crisis" },
    MILESTONE: { id: "milestone", trustImpact: 5, icon: "🎉", nameKey: "memory.milestone" },
    RECONCILIATION: { id: "reconciliation", trustImpact: 10, icon: "🕊️", nameKey: "memory.reconciliation" },

    // Negative memories
    ARGUMENT: { id: "argument", trustImpact: -15, icon: "😤", nameKey: "memory.argument" },
    NEGLECT: { id: "neglect", trustImpact: -10, icon: "😔", nameKey: "memory.neglect" },
    BETRAYAL: { id: "betrayal", trustImpact: -40, icon: "💔", nameKey: "memory.betrayal" },
    LIE_DISCOVERED: { id: "lie_discovered", trustImpact: -20, icon: "🤥", nameKey: "memory.lie_discovered" },

    // Partner-specific
    FIRST_DATE: { id: "first_date", trustImpact: 8, icon: "🌹", nameKey: "memory.first_date" },
    PROPOSAL: { id: "proposal", trustImpact: 12, icon: "💍", nameKey: "memory.proposal" },
    WEDDING: { id: "wedding", trustImpact: 15, icon: "💒", nameKey: "memory.wedding" },
    AFFAIR: { id: "affair", trustImpact: -50, icon: "💔", nameKey: "memory.affair" },
    DIVORCE: { id: "divorce", trustImpact: -30, icon: "📜", nameKey: "memory.divorce" }
  };

  // ============================================================================
  // PARENTING STYLES
  // ============================================================================

  const PARENTING_STYLES = {
    STRICT: { id: "strict", nameKey: "parenting.strict", childTraits: ["disciplined", "resentful"], icon: "📏" },
    LENIENT: { id: "lenient", nameKey: "parenting.lenient", childTraits: ["creative", "undisciplined"], icon: "🎈" },
    BALANCED: { id: "balanced", nameKey: "parenting.balanced", childTraits: ["well_adjusted", "grateful"], icon: "⚖️" },
    NEGLECTFUL: { id: "neglectful", nameKey: "parenting.neglectful", childTraits: ["troubled", "independent"], icon: "🚫" },
    HELICOPTER: { id: "helicopter", nameKey: "parenting.helicopter", childTraits: ["anxious", "dependent"], icon: "🚁" }
  };

  // ============================================================================
  // CHILD OUTCOME TRAITS
  // ============================================================================

  const CHILD_TRAITS = {
    // Positive
    DISCIPLINED: { id: "disciplined", effect: { intelligence: 5, careerSkill: 5 } },
    CREATIVE: { id: "creative", effect: { happiness: 5 } },
    WELL_ADJUSTED: { id: "well_adjusted", effect: { happiness: 10, stress: -5 } },
    GRATEFUL: { id: "grateful", effect: { relationshipBonus: 10 } },
    INDEPENDENT: { id: "independent", effect: { businessSkill: 10 } },
    AMBITIOUS: { id: "ambitious", effect: { careerSkill: 10 } },

    // Negative
    RESENTFUL: { id: "resentful", effect: { relationshipWithPlayer: -20 } },
    UNDISCIPLINED: { id: "undisciplined", effect: { careerSkill: -5 } },
    TROUBLED: { id: "troubled", effect: { happiness: -10, stress: 10 } },
    ANXIOUS: { id: "anxious", effect: { stress: 15 } },
    DEPENDENT: { id: "dependent", effect: { independence: -10 } }
  };

  // ============================================================================
  // NAME POOLS
  // ============================================================================

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  function clamp(value, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  function pickRandom(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pickMultipleRandom(arr, count) {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  function generatePersonName(countryId, gender) {
    if (Alive.names?.getFullName) return Alive.names.getFullName(countryId, gender);
    return gender === "F" ? "Emma" : "Alex";
  }

  // ============================================================================
  // TRUST & MEMORY FUNCTIONS (Deep Relationships)
  // ============================================================================

  /**
   * Get trust tier from score
   */
  function getTrustTier(score) {
    if (score >= 90) return TRUST_TIERS.LIFE;
    if (score >= 75) return TRUST_TIERS.DEEP;
    if (score >= 50) return TRUST_TIERS.CLOSE;
    if (score >= 20) return TRUST_TIERS.FRIEND;
    return TRUST_TIERS.ACQUAINTANCE;
  }

  /**
   * Get trust tier ID string
   */
  function getTrustTierId(score) {
    return getTrustTier(score).id;
  }

  /**
   * Add a memory to a relationship
   */
  function addMemory(relationship, memoryTypeId, playerAge, details = {}) {
    if (!relationship) return null;

    const memType = MEMORY_TYPES[memoryTypeId.toUpperCase()] || MEMORY_TYPES.QUALITY_TIME;

    // Initialize memories array if needed
    if (!relationship.memories) {
      relationship.memories = [];
    }

    const memory = {
      type: memType.id,
      age: playerAge,
      icon: memType.icon,
      ...details
    };

    relationship.memories.push(memory);

    // Apply trust impact
    if (relationship.trustScore !== undefined) {
      relationship.trustScore = clamp(relationship.trustScore + memType.trustImpact, 0, 100);
    } else if (relationship.relationshipScore !== undefined) {
      // Legacy compatibility
      relationship.relationshipScore = clamp(relationship.relationshipScore + memType.trustImpact, 0, 100);
    }

    return memory;
  }

  /**
   * Get recent memories (last N)
   */
  function getRecentMemories(relationship, count = 5) {
    if (!relationship?.memories) return [];
    return relationship.memories.slice(-count);
  }

  /**
   * Check if relationship has a specific memory type
   */
  function hasMemory(relationship, memoryTypeId) {
    if (!relationship?.memories) return false;
    return relationship.memories.some(m => m.type === memoryTypeId);
  }

  /**
   * Count positive vs negative memories
   */
  function getMemoryBalance(relationship) {
    if (!relationship?.memories) return { positive: 0, negative: 0, balance: 0 };

    let positive = 0, negative = 0;
    relationship.memories.forEach(m => {
      const memType = Object.values(MEMORY_TYPES).find(t => t.id === m.type);
      if (memType?.trustImpact > 0) positive++;
      else if (memType?.trustImpact < 0) negative++;
    });

    return { positive, negative, balance: positive - negative };
  }

  /**
   * Enhance a relationship object with trust system fields
   */
  function enhanceWithTrustSystem(relationship, playerAge) {
    if (!relationship) return relationship;

    // Convert legacy relationshipScore to trustScore if needed
    if (relationship.relationshipScore !== undefined && relationship.trustScore === undefined) {
      relationship.trustScore = relationship.relationshipScore;
    }

    // Initialize new fields
    relationship.trustScore = relationship.trustScore ?? 50;
    relationship.memories = relationship.memories || [];
    relationship.lastInteractionAge = relationship.lastInteractionAge ?? playerAge;
    relationship.neglectYears = relationship.neglectYears || 0;

    return relationship;
  }

  /**
   * Update relationship yearly (decay from neglect)
   */
  function updateRelationshipYearly(relationship, playerAge) {
    if (!relationship) return;

    const yearsSinceInteraction = playerAge - (relationship.lastInteractionAge || playerAge);

    // Neglect decay
    if (yearsSinceInteraction >= 2) {
      const decayAmount = Math.min(yearsSinceInteraction * 5, 20);
      relationship.trustScore = clamp((relationship.trustScore || 50) - decayAmount, 0, 100);
      relationship.neglectYears = (relationship.neglectYears || 0) + 1;

      // Add neglect memory if significant
      if (yearsSinceInteraction >= 3 && !hasMemory(relationship, "neglect")) {
        addMemory(relationship, "NEGLECT", playerAge, { years: yearsSinceInteraction });
      }
    }

    // Check for "lost contact" status
    if ((relationship.trustScore || 50) < 10 && relationship.neglectYears >= 3) {
      relationship.status = "lost_contact";
    }
  }

  // ============================================================================
  // STATE CREATION
  // ============================================================================

  function createEmptyRelationshipsState() {
    return {
      marriageStatus: "single", // single, dating, married, divorced, widowed
      partner: null,
      children: [],
      parents: {
        mother: null,
        father: null
      },
      siblings: [],
      friends: [],
      pets: []
    };
  }

  function generateParent(player, gender) {
    const playerAge = Number(player?.age) || 0;
    const baseAge = 22 + Math.floor(Math.random() * 18);
    const age = Math.max(18, baseAge + playerAge);
    const countryId = typeof player?.countryId === "string" ? player.countryId : null;
    const personality = pickMultipleRandom(PERSONALITY_TRAITS, 2);
    const relationshipScore = clamp(60 + Math.floor(Math.random() * 35), 0, 100);
    return {
      name: generatePersonName(countryId, gender),
      gender,
      age,
      countryId,
      relationshipScore,
      personality,
      alive: true
    };
  }

  function generateSibling(player, overrides = {}) {
    const gender = Math.random() < 0.5 ? "M" : "F";
    const playerAge = Number(player?.age) || 0;
    const ageDiff = Math.floor(Math.random() * 9) - 4;
    const age = Math.max(0, playerAge + ageDiff);
    const countryId = typeof overrides.countryId === "string"
      ? overrides.countryId
      : (typeof player?.countryId === "string" ? player.countryId : null);
    const relationshipScore = clamp(45 + Math.floor(Math.random() * 35), 0, 100);
    return {
      name: generatePersonName(countryId, gender),
      gender,
      age,
      countryId,
      relationshipScore,
      alive: true,
      ...overrides
    };
  }

  function generateFriend(player, overrides = {}) {
    const gender = Math.random() < 0.5 ? "M" : "F";
    const playerAge = Number(player?.age) || 0;
    const ageDiff = Math.floor(Math.random() * 7) - 3;
    const countryId = typeof overrides.countryId === "string"
      ? overrides.countryId
      : (typeof player?.countryId === "string" ? player.countryId : null);
    const personality = pickMultipleRandom(PERSONALITY_TRAITS, 2);
    const closeness = clamp(35 + Math.floor(Math.random() * 35), 0, 100);
    return {
      id: `friend_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      name: generatePersonName(countryId, gender),
      gender,
      age: Math.max(0, playerAge + ageDiff),
      countryId,
      personality,
      closeness,
      metAtAge: playerAge,
      alive: true,
      ...overrides
    };
  }

  function generatePet(player, type, overrides = {}) {
    const petType = String(type || "").toLowerCase() || "other";
    const countryId = typeof overrides.countryId === "string"
      ? overrides.countryId
      : (typeof player?.countryId === "string" ? player.countryId : null);
    const baseNames = petType === "dog"
      ? ["Buddy", "Rocky", "Charlie", "Max", "Bella"]
      : petType === "cat"
        ? ["Luna", "Milo", "Oliver", "Leo", "Nala"]
        : ["Coco", "Lucky", "Mochi", "Pepper", "Sunny"];
    const name = typeof overrides.name === "string" && overrides.name.trim()
      ? overrides.name.trim()
      : (pickRandom(baseNames) || "Buddy");
    const bond = clamp(40 + Math.floor(Math.random() * 30), 0, 100);

    // Look up pet asset for image
    let imageUrl = "";
    let petCost = 0;
    let annualCost = 350;
    if (Alive.Assets && Alive.Assets.getRandomPet) {
      const petAsset = Alive.Assets.getRandomPet(petType);
      if (petAsset) {
        imageUrl = petAsset.image || "";
        petCost = petAsset.cost || 0;
        annualCost = petAsset.annualCost || 350;
      }
    }

    return {
      id: `pet_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      type: petType,
      name,
      bond,
      age: 0,
      countryId,
      alive: true,
      imageUrl,
      cost: petCost,
      annualCost,
      ...overrides
    };
  }

  function ensureExtendedRelationshipsState(player) {
    if (!player) return;

    if (!player.parents || typeof player.parents !== "object" || Array.isArray(player.parents)) {
      player.parents = { mother: null, father: null };
    }

    if (!player.parents.mother || typeof player.parents.mother !== "object") {
      player.parents.mother = generateParent(player, "F");
    }

    if (!player.parents.father || typeof player.parents.father !== "object") {
      player.parents.father = generateParent(player, "M");
    }

    if (!Array.isArray(player.siblings)) {
      player.siblings = [];
    }
    player.siblings = player.siblings
      .filter((s) => s && typeof s === "object")
      .map((s) => {
        s.relationshipScore = clamp(s.relationshipScore ?? 50, 0, 100);
        s.age = Math.max(0, Number(s.age) || 0);
        if (s.alive === undefined) s.alive = true;
        return s;
      });

    if (!Array.isArray(player.friends)) {
      player.friends = [];
    }
    player.friends = player.friends
      .filter((f) => f && typeof f === "object")
      .map((f) => {
        f.closeness = clamp(f.closeness ?? 50, 0, 100);
        f.age = Math.max(0, Number(f.age) || 0);
        if (f.alive === undefined) f.alive = true;
        if (typeof f.id !== "string" || !f.id.trim()) {
          f.id = `friend_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        }
        return f;
      })
      .slice(0, 5);

    if (!Array.isArray(player.pets)) {
      player.pets = [];
    }
    player.pets = player.pets
      .filter((p) => p && typeof p === "object")
      .map((p) => {
        p.bond = clamp(p.bond ?? 50, 0, 100);
        p.age = Math.max(0, Number(p.age) || 0);
        p.type = String(p.type || "other").toLowerCase() || "other";
        if (p.alive === undefined) p.alive = true;
        if (typeof p.id !== "string" || !p.id.trim()) {
          p.id = `pet_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        }
        return p;
      });
  }

  function addSibling(player, overrides = {}) {
    if (!player) return null;
    ensureExtendedRelationshipsState(player);
    const sibling = generateSibling(player, overrides);
    player.siblings.push(sibling);
    return sibling;
  }

  function addFriend(player, overrides = {}) {
    if (!player) return null;
    ensureExtendedRelationshipsState(player);
    if (player.friends.length >= 5) return null;
    const friend = generateFriend(player, overrides);
    player.friends.push(friend);
    return friend;
  }

  function adoptPet(player, type, overrides = {}) {
    if (!player) return null;
    ensureExtendedRelationshipsState(player);
    const pet = generatePet(player, type, overrides);
    player.pets.push(pet);
    return pet;
  }

  function getPetAnnualCost(pet) {
    const type = String(pet?.type || "other").toLowerCase();
    const base = type === "dog" ? 650 : type === "cat" ? 450 : 350;
    const age = Math.max(0, Number(pet?.age) || 0);
    const ageExtra = age >= 10 ? 250 : age >= 5 ? 120 : 0;
    return Math.max(0, base + ageExtra);
  }

  function ageExtendedRelationshipsOneYear(player) {
    if (!player) return;
    ensureExtendedRelationshipsState(player);

    const mother = player.parents?.mother;
    const father = player.parents?.father;
    if (mother && mother.alive !== false) mother.age = Math.max(0, (Number(mother.age) || 0) + 1);
    if (father && father.alive !== false) father.age = Math.max(0, (Number(father.age) || 0) + 1);

    player.siblings.forEach((s) => {
      if (s.alive === false) return;
      s.age = Math.max(0, (Number(s.age) || 0) + 1);
      s.relationshipScore = clamp((Number(s.relationshipScore) || 50) - 0.4, 0, 100);
    });

    const socialSkill = clamp(player.socialSkill || 0, 0, 100);
    player.friends.forEach((f) => {
      if (f.alive === false) return;
      f.age = Math.max(0, (Number(f.age) || 0) + 1);
      const drift = -1.2 + (socialSkill / 100) * 1.0;
      f.closeness = clamp((Number(f.closeness) || 50) + drift, 0, 100);

      // Track neglect for consequence system
      if (!f.lastInteractionAge) f.lastInteractionAge = player.age;
      const yearsSinceInteraction = player.age - f.lastInteractionAge;

      // Record neglect if 2+ years without contact
      if (yearsSinceInteraction >= 2 && Alive.consequences) {
        f.neglectYears = (f.neglectYears || 0) + 1;
        if (f.neglectYears === 2) {
          Alive.consequences.recordRelationshipEvent(
            player,
            f.id || f.name,
            "neglect",
            `Went ${yearsSinceInteraction} years without contact`
          );
        }
      }
    });

    player.pets.forEach((p) => {
      if (p.alive === false) return;
      p.age = Math.max(0, (Number(p.age) || 0) + 1);
      p.bond = clamp((Number(p.bond) || 50) - 1.5, 0, 100);
    });
  }

  // ============================================================================
  // PARTNER MANAGEMENT
  // ============================================================================

  function generatePartner(playerAge, playerCity, playerCountryId, partnerCountryId) {
    const gender = Math.random() < 0.5 ? "M" : "F";
    const ageDiff = Math.floor(Math.random() * 11) - 5; // -5 to +5 years difference

    const personality = pickMultipleRandom(PERSONALITY_TRAITS, 2);
    const appearance = pickMultipleRandom(APPEARANCE_FEATURES, 3);

    // Generate compatibility score based on randomness
    const baseScore = 50 + Math.floor(Math.random() * 30); // 50-80
    const attraction = 40 + Math.floor(Math.random() * 40); // 40-80 initial attraction
    const compatibility = 30 + Math.floor(Math.random() * 50); // 30-80 long-term compatibility

    const countryId = typeof partnerCountryId === "string"
      ? partnerCountryId
      : (typeof playerCountryId === "string" ? playerCountryId : null);

    return {
      name: generatePersonName(countryId, gender),
      gender,
      age: Math.max(18, playerAge + ageDiff),
      ageDifference: ageDiff,
      personality,
      appearance,

      // Legacy field (for backward compatibility)
      relationshipScore: baseScore,

      // Deep Relationships System fields
      trustScore: baseScore,
      attraction: attraction,
      compatibility: compatibility,
      memories: [],

      // Relationship tracking
      metAtAge: playerAge,
      metInCity: playerCity,
      countryId,
      anniversaries: 0,
      lowScoreYears: 0,
      lastInteractionAge: playerAge,
      neglectYears: 0,

      // Marriage arc
      status: "dating", // dating, engaged, married, separated, divorced
      yearsTogetherTotal: 0,
      yearsMarried: 0,
      prenup: false,
      sharedFinances: false,
      affairs: 0,
      reconciliations: 0,

      // Conflict tracking
      unresolvedConflicts: 0,
      majorArgumentsThisYear: 0
    };
  }

  function startRelationship(player, overrides = {}) {
    if (!player) return null;

    const partner = generatePartner(player.age, player.city, player.countryId, overrides.countryId);
    Object.assign(partner, overrides);

    const socialSkill = clamp(player.socialSkill || 0, 0, 100);
    partner.relationshipScore = clamp((partner.relationshipScore || 50) + Math.floor(socialSkill / 20), 0, 100);

    player.partner = partner;
    player.marriageStatus = "dating";

    return partner;
  }

  function progressRelationship(player) {
    if (!player || !player.partner) {
      return { happinessDelta: 0, relationshipScoreDelta: 0 };
    }

    const p = player.partner;
    let drift = 0;

    // Marriage bonus
    if (player.marriageStatus === "married") {
      drift += 0.5;
      p.anniversaries = (p.anniversaries || 0) + 1;
    }

    // Age factor (older = more stable)
    if (player.age > 40 && player.marriageStatus === "married") {
      drift += 0.3;
    }

    // Negative factors
    if (player.age > 55) drift -= 0.3;
    if ((player.money || 0) < 0) drift -= 1.5; // Debt hurts relationships
    if ((player.stress || 0) > 70) drift -= 1; // High stress
    if ((player.happiness || 0) < 30) drift -= 0.5; // Unhappy person

    // Positive factors
    if ((player.happiness || 0) > 70) drift += 0.5;
    if ((player.money || 0) > 50000) drift += 0.3; // Financial stability

    // Social skill makes it easier to keep relationships stable
    const socialSkill = clamp(player.socialSkill || 0, 0, 100);
    drift += (socialSkill / 100) * 0.8;

    // Personality compatibility bonus (if player has matching traits)
    // This is simplified - could be expanded

    // Random variation
    const randomSwing = (Math.random() - 0.5) * 8;
    const delta = drift + randomSwing;

    p.relationshipScore = clamp((p.relationshipScore || 50) + delta, 0, 100);

    // Track consecutive low score years
    if (p.relationshipScore < 30) {
      p.lowScoreYears = (p.lowScoreYears || 0) + 1;
    } else {
      p.lowScoreYears = Math.max(0, (p.lowScoreYears || 0) - 1);
    }

    // Relationship affects happiness
    const happinessDelta = (p.relationshipScore - 50) / 25;
    player.happiness = clamp((player.happiness || 50) + happinessDelta, 0, 100);

    return { happinessDelta, relationshipScoreDelta: delta };
  }

  function shouldConsiderDivorce(player) {
    if (!player || player.marriageStatus !== "married" || !player.partner) {
      return false;
    }

    const p = player.partner;
    // Consider divorce if score below 30 for 3+ consecutive years
    return p.relationshipScore < 30 && (p.lowScoreYears || 0) >= 3;
  }

  function shouldConsiderBreakup(player) {
    if (!player || player.marriageStatus !== "dating" || !player.partner) {
      return false;
    }

    return player.partner.relationshipScore < 25;
  }

  function breakUp(player) {
    if (!player) return;

    // Add breakup memory to partner before clearing
    if (player.partner) {
      addMemory(player.partner, "DIVORCE", player.age, { type: "breakup" });
    }

    player.partner = null;
    player.marriageStatus = "single";
    player.happiness = clamp((player.happiness || 50) - 10, 0, 100);
    player.stress = clamp((player.stress || 0) + 10, 0, 100);
  }

  /**
   * Propose/Engage (trust 75+ required)
   */
  function engage(player, withPrenup = false) {
    if (!player || !player.partner) return { success: false, reason: "no_partner" };
    if (player.marriageStatus !== "dating") return { success: false, reason: "not_dating" };

    const trust = player.partner.trustScore || player.partner.relationshipScore || 50;
    if (trust < 75) return { success: false, reason: "trust_too_low", required: 75, current: trust };

    // Set engaged status
    player.marriageStatus = "engaged";
    player.partner.status = "engaged";
    player.partner.prenup = withPrenup;

    // Add proposal memory
    addMemory(player.partner, "PROPOSAL", player.age);

    // Happiness boost
    player.happiness = clamp((player.happiness || 50) + 15, 0, 100);

    return { success: true, withPrenup };
  }

  /**
   * Marry (trust 85+ required, or engaged)
   */
  function marry(player, weddingBudget = 10000) {
    if (!player || !player.partner) return { success: false, reason: "no_partner" };
    if (player.marriageStatus !== "dating" && player.marriageStatus !== "engaged") {
      return { success: false, reason: "not_dating_or_engaged" };
    }

    const trust = player.partner.trustScore || player.partner.relationshipScore || 50;
    // Lower requirement if already engaged
    const minTrust = player.marriageStatus === "engaged" ? 75 : 85;
    if (trust < minTrust) return { success: false, reason: "trust_too_low", required: minTrust, current: trust };

    // Deduct wedding cost
    if ((player.money || 0) >= weddingBudget) {
      player.money -= weddingBudget;
    }

    player.marriageStatus = "married";
    player.marriedYears = 0;
    player.partner.status = "married";
    player.partner.yearsMarried = 0;

    // Trust and happiness boost
    player.partner.trustScore = clamp((player.partner.trustScore || 50) + 15, 0, 100);
    player.partner.relationshipScore = player.partner.trustScore; // Sync legacy field
    player.happiness = clamp((player.happiness || 50) + 20, 0, 100);

    // Add wedding memory
    addMemory(player.partner, "WEDDING", player.age, { budget: weddingBudget });

    return { success: true, weddingCost: weddingBudget };
  }

  /**
   * Divorce (with asset splitting based on prenup)
   */
  function divorce(player) {
    if (!player) return null;

    const partner = player.partner;
    const yearsMarried = player.marriedYears || partner?.yearsMarried || 0;
    const hasPrenup = partner?.prenup || false;

    // Calculate asset split
    const totalAssets = Math.max(0, player.money || 0);
    let playerKeeps, partnerGets;

    if (hasPrenup) {
      // Prenup: Keep 80% of assets
      playerKeeps = Math.round(totalAssets * 0.8);
      partnerGets = totalAssets - playerKeeps;
    } else {
      // No prenup: 50/50 split, plus alimony based on years married
      const baseShare = Math.round(totalAssets * 0.5);
      const alimony = Math.min(yearsMarried * 1000, 20000); // Up to $20k alimony
      playerKeeps = Math.max(0, baseShare - alimony);
      partnerGets = totalAssets - playerKeeps;
    }

    // Apply financial impact
    player.money = playerKeeps;

    // Add divorce memory
    if (partner) {
      addMemory(partner, "DIVORCE", player.age, {
        assetsLost: partnerGets,
        yearsMarried,
        hasPrenup
      });
    }

    // Emotional impact
    player.happiness = clamp((player.happiness || 50) - 20, 0, 100);
    player.stress = clamp((player.stress || 0) + 25, 0, 100);

    // Update needs if available
    if (Alive.needs) {
      Alive.needs.modifyNeed(player, "social", -20);
      Alive.needs.modifyNeed(player, "comfort", -15);
    }

    player.partner = null;
    player.marriageStatus = "divorced";
    player.marriedYears = 0;

    return {
      assetsLost: partnerGets,
      playerKeeps,
      yearsMarried,
      hasPrenup
    };
  }

  function widowed(player) {
    if (!player) return;

    // Add mourning impact
    player.happiness = clamp((player.happiness || 50) - 30, 0, 100);
    player.stress = clamp((player.stress || 0) + 20, 0, 100);

    // Needs impact
    if (Alive.needs) {
      Alive.needs.modifyNeed(player, "social", -25);
    }

    player.partner = null;
    player.marriageStatus = "widowed";
  }

  // ============================================================================
  // CHILDREN MANAGEMENT
  // ============================================================================

  function generateChild(player, overrides = {}) {
    const gender = Math.random() < 0.5 ? "M" : "F";

    // Inherit some traits from parents
    let inheritedPersonality = [];
    if (player.partner?.personality) {
      inheritedPersonality = pickMultipleRandom(player.partner.personality, 1);
    }

    // Add random traits
    const randomTraits = pickMultipleRandom(PERSONALITY_TRAITS, 1);
    const personality = [...new Set([...inheritedPersonality, ...randomTraits])];

    // Random talents
    const allTalents = ["sports", "music", "arts", "academics", "social"];
    const talents = pickMultipleRandom(allTalents, Math.floor(Math.random() * 2) + 1);

    // Base intelligence influenced by player
    const baseIntelligence = player.intelligence || 50;
    const childIntelligence = clamp(baseIntelligence + (Math.random() - 0.5) * 30, 20, 90);

    const childCountryId = typeof overrides.countryId === "string"
      ? overrides.countryId
      : (typeof player.countryId === "string" ? player.countryId : null);

    return {
      name: generatePersonName(childCountryId, gender),
      gender,
      age: 0,
      personality,
      talents,
      grades: 50 + Math.floor(Math.random() * 30), // 50-80 starting grades
      intelligence: childIntelligence,
      educationLevel: 0,
      isAtHome: true,
      alive: true,
      birthCity: player.city,
      countryId: childCountryId,
      ...overrides
    };
  }

  function haveChild(player, overrides = {}) {
    if (!player) return null;

    const child = generateChild(player, overrides);

    if (!Array.isArray(player.children)) {
      player.children = [];
    }

    player.children.push(child);

    // Having a child affects relationship positively
    if (player.partner) {
      player.partner.relationshipScore = clamp(
        (player.partner.relationshipScore || 50) + 10, 0, 100
      );
    }

    return child;
  }

  function ageChildrenOneYear(player) {
    if (!player || !Array.isArray(player.children)) return;

    player.children.forEach(child => {
      if (!child.alive) return;

      child.age = Math.max(0, (child.age || 0) + 1);

      // Education milestones
      if (child.age >= 6 && child.educationLevel < 1) {
        child.educationLevel = 1; // Started school
      }
      if (child.age >= 18 && child.educationLevel < 2) {
        // Chance to go to university based on grades
        if (child.grades >= 70 && Math.random() < 0.7) {
          child.educationLevel = 2;
        }
      }

      // Grades progression
      const gradeChange = (Math.random() - 0.4) * 10; // Slight positive bias
      child.grades = clamp((child.grades || 50) + gradeChange, 0, 100);

      // Leave home at 18-22
      if (child.age >= 18 && child.isAtHome) {
        const leaveChance = (child.age - 17) * 0.2; // 20% at 18, 40% at 19, etc.
        if (Math.random() < leaveChance) {
          child.isAtHome = false;
        }
      }
    });
  }

  function getChildrenAtHome(player) {
    if (!player || !Array.isArray(player.children)) return [];
    return player.children.filter(c => c.isAtHome && c.alive);
  }

  function getChildrenCount(player) {
    if (!player || !Array.isArray(player.children)) return 0;
    return player.children.filter(c => c.alive).length;
  }

  // ============================================================================
  // RELATIONSHIP SCORE INTERPRETATION
  // ============================================================================

  function getRelationshipQuality(score) {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    if (score >= 40) return "neutral";
    if (score >= 25) return "troubled";
    return "critical";
  }

  function getRelationshipQualityKey(score) {
    return `relationship.quality.${getRelationshipQuality(score)}`;
  }

  // ============================================================================
  // FAMILY INTERACTIONS
  // ============================================================================

  function callParent(player, parentType) {
    if (!player) return { success: false };
    ensureExtendedRelationshipsState(player);

    const parent = parentType === "mother" ? player.parents?.mother : player.parents?.father;
    if (!parent || parent.alive === false) return { success: false, reason: "not_available" };

    const socialBonus = Math.floor((player.socialSkill || 0) / 25);
    const scoreGain = 3 + socialBonus + Math.floor(Math.random() * 3);
    parent.relationshipScore = clamp((parent.relationshipScore || 50) + scoreGain, 0, 100);

    return {
      success: true,
      effects: { happinessDelta: 2 + Math.floor(scoreGain / 3) },
      scoreGain
    };
  }

  function visitFamily(player) {
    if (!player) return { success: false };
    ensureExtendedRelationshipsState(player);

    const results = { parentsVisited: 0, siblingsVisited: 0, totalScoreGain: 0 };
    const socialBonus = Math.floor((player.socialSkill || 0) / 20);

    // Visit parents
    ["mother", "father"].forEach(parentType => {
      const parent = player.parents?.[parentType];
      if (parent && parent.alive !== false) {
        const gain = 5 + socialBonus + Math.floor(Math.random() * 4);
        parent.relationshipScore = clamp((parent.relationshipScore || 50) + gain, 0, 100);
        results.parentsVisited++;
        results.totalScoreGain += gain;
      }
    });

    // Visit siblings
    player.siblings.forEach(sibling => {
      if (sibling.alive !== false) {
        const gain = 4 + Math.floor(socialBonus / 2) + Math.floor(Math.random() * 3);
        sibling.relationshipScore = clamp((sibling.relationshipScore || 50) + gain, 0, 100);
        results.siblingsVisited++;
        results.totalScoreGain += gain;
      }
    });

    const happinessGain = Math.min(8, 2 + results.parentsVisited * 2 + results.siblingsVisited);

    return {
      success: true,
      effects: { happinessDelta: happinessGain, stressDelta: -2 },
      ...results
    };
  }

  function helpFamilyFinancially(player, amount) {
    if (!player) return { success: false };
    const money = player.money || 0;
    const helpAmount = Math.min(amount, money);
    if (helpAmount <= 0) return { success: false, reason: "no_money" };

    ensureExtendedRelationshipsState(player);

    // Improve relationship with parents
    const scoreGain = Math.min(15, Math.floor(helpAmount / 500) + 3);
    ["mother", "father"].forEach(parentType => {
      const parent = player.parents?.[parentType];
      if (parent && parent.alive !== false) {
        parent.relationshipScore = clamp((parent.relationshipScore || 50) + scoreGain, 0, 100);
      }
    });

    return {
      success: true,
      effects: { moneyDelta: -helpAmount, happinessDelta: 3 },
      amountGiven: helpAmount,
      scoreGain
    };
  }

  function spendFamilyTime(player, person) {
    if (!player || !person) return { success: false };

    // Determine relationship
    const isPartner = player.partner === person;
    const isChild = Array.isArray(player.children) && player.children.includes(person);
    const isParent = (player.parents?.mother === person) || (player.parents?.father === person);
    const isSibling = Array.isArray(player.siblings) && player.siblings.includes(person);

    if (!isPartner && !isChild && !isParent && !isSibling) return { success: false, reason: "not_family" };

    const scoreGain = 2 + Math.floor(Math.random() * 4);
    person.relationshipScore = clamp((person.relationshipScore || 50) + scoreGain, 0, 100);

    return {
      success: true,
      effects: { happinessDelta: 2, stressDelta: -1 },
      scoreGain,
      personName: person.name
    };
  }

  // ============================================================================
  // FRIEND INTERACTIONS
  // ============================================================================

  function hangOutWithFriends(player) {
    if (!player) return { success: false };
    ensureExtendedRelationshipsState(player);

    const aliveFriends = player.friends.filter(f => f.alive !== false);
    if (aliveFriends.length === 0) return { success: false, reason: "no_friends" };

    const socialBonus = Math.floor((player.socialSkill || 0) / 20);
    let totalClosenessGain = 0;

    aliveFriends.forEach(friend => {
      const gain = 4 + socialBonus + Math.floor(Math.random() * 4);
      friend.closeness = clamp((friend.closeness || 50) + gain, 0, 100);
      totalClosenessGain += gain;
    });

    // Random chance for special event trigger
    const specialEvent = Math.random() < 0.15 ? pickRandom([
      "friend_startup_idea",
      "friend_travel_invite",
      "friend_networking",
      "friend_advice"
    ]) : null;

    return {
      success: true,
      effects: {
        happinessDelta: 3 + Math.min(5, aliveFriends.length),
        stressDelta: -3,
        socialSkillDelta: Math.random() < 0.3 ? 1 : 0
      },
      friendsCount: aliveFriends.length,
      totalClosenessGain,
      specialEvent
    };
  }

  function hangOutWithFriend(player, friendId) {
    if (!player) return { success: false };
    ensureExtendedRelationshipsState(player);

    const friend = player.friends.find(f => f.id === friendId && f.alive !== false);
    if (!friend) return { success: false, reason: "friend_not_found" };

    const socialBonus = Math.floor((player.socialSkill || 0) / 15);
    const gain = 6 + socialBonus + Math.floor(Math.random() * 5);
    friend.closeness = clamp((friend.closeness || 50) + gain, 0, 100);

    // Special events based on friend personality
    let specialEvent = null;
    if (Math.random() < 0.2) {
      if (friend.personality?.includes("ambitious")) {
        specialEvent = "friend_business_opportunity";
      } else if (friend.personality?.includes("adventurous")) {
        specialEvent = "friend_adventure_invite";
      } else if (friend.personality?.includes("intellectual")) {
        specialEvent = "friend_learning_opportunity";
      }
    }

    return {
      success: true,
      effects: { happinessDelta: 4, stressDelta: -2 },
      closenessGain: gain,
      friend,
      specialEvent
    };
  }

  function makeFriend(player) {
    if (!player) return { success: false };
    ensureExtendedRelationshipsState(player);

    if (player.friends.length >= 5) {
      return { success: false, reason: "max_friends" };
    }

    const socialSkill = player.socialSkill || 0;
    const successChance = 0.3 + (socialSkill / 200);

    if (Math.random() > successChance) {
      return { success: false, reason: "failed_to_connect" };
    }

    const friend = addFriend(player);
    return {
      success: true,
      effects: { happinessDelta: 5, socialSkillDelta: 1 },
      friend
    };
  }

  function loseFriend(player, friendId, reason = "drifted_apart") {
    if (!player) return { success: false };
    ensureExtendedRelationshipsState(player);

    const friendIndex = player.friends.findIndex(f => f.id === friendId);
    if (friendIndex === -1) return { success: false };

    const friend = player.friends[friendIndex];
    player.friends.splice(friendIndex, 1);

    return {
      success: true,
      effects: { happinessDelta: -5 },
      friend,
      reason
    };
  }

  // ============================================================================
  // PET INTERACTIONS
  // ============================================================================

  function playWithPet(player, petId) {
    if (!player) return { success: false };
    ensureExtendedRelationshipsState(player);

    let pet;
    if (petId) {
      pet = player.pets.find(p => p.id === petId && p.alive !== false);
    } else {
      pet = player.pets.find(p => p.alive !== false);
    }

    if (!pet) return { success: false, reason: "no_pet" };

    const bondGain = 5 + Math.floor(Math.random() * 5);
    pet.bond = clamp((pet.bond || 50) + bondGain, 0, 100);

    const happinessGain = 3 + Math.floor(pet.bond / 25);

    return {
      success: true,
      effects: {
        happinessDelta: happinessGain,
        stressDelta: -3,
        healthDelta: pet.type === "dog" ? 1 : 0
      },
      pet,
      bondGain
    };
  }

  function walkDog(player, petId) {
    if (!player) return { success: false };
    ensureExtendedRelationshipsState(player);

    let dog;
    if (petId) {
      dog = player.pets.find(p => p.id === petId && p.type === "dog" && p.alive !== false);
    } else {
      dog = player.pets.find(p => p.type === "dog" && p.alive !== false);
    }

    if (!dog) return { success: false, reason: "no_dog" };

    const bondGain = 6 + Math.floor(Math.random() * 4);
    dog.bond = clamp((dog.bond || 50) + bondGain, 0, 100);

    // Walking dog can lead to social encounters
    const socialEncounter = Math.random() < 0.2;

    return {
      success: true,
      effects: {
        happinessDelta: 4,
        healthDelta: 2,
        stressDelta: -4,
        socialSkillDelta: socialEncounter ? 1 : 0
      },
      pet: dog,
      bondGain,
      socialEncounter
    };
  }

  function adoptNewPet(player, type, name) {
    if (!player) return { success: false };
    ensureExtendedRelationshipsState(player);

    const adoptionCost = type === "dog" ? 300 : type === "cat" ? 150 : 100;
    if ((player.money || 0) < adoptionCost) {
      return { success: false, reason: "not_enough_money" };
    }

    const pet = adoptPet(player, type, { name });

    return {
      success: true,
      effects: { moneyDelta: -adoptionCost, happinessDelta: 8 },
      pet,
      cost: adoptionCost
    };
  }

  function petPassesAway(player, petId) {
    if (!player) return { success: false };
    ensureExtendedRelationshipsState(player);

    const pet = player.pets.find(p => p.id === petId);
    if (!pet) return { success: false };

    pet.alive = false;

    const sadness = Math.floor(pet.bond / 10) + 5;

    return {
      success: true,
      effects: { happinessDelta: -sadness, stressDelta: 5 },
      pet
    };
  }

  function getTotalPetAnnualCost(player) {
    if (!player) return 0;
    ensureExtendedRelationshipsState(player);

    return player.pets
      .filter(p => p.alive !== false)
      .reduce((sum, pet) => sum + getPetAnnualCost(pet), 0);
  }

  // ============================================================================
  // FAMILY LIFE EVENTS
  // ============================================================================

  function checkParentMortality(player) {
    if (!player) return [];
    ensureExtendedRelationshipsState(player);

    const deaths = [];

    ["mother", "father"].forEach(parentType => {
      const parent = player.parents?.[parentType];
      if (!parent || parent.alive === false) return;

      const age = parent.age || 50;
      // Mortality increases with age
      let deathChance = 0;
      if (age >= 90) deathChance = 0.25;
      else if (age >= 85) deathChance = 0.15;
      else if (age >= 80) deathChance = 0.08;
      else if (age >= 75) deathChance = 0.04;
      else if (age >= 70) deathChance = 0.02;
      else if (age >= 60) deathChance = 0.005;

      if (Math.random() < deathChance) {
        parent.alive = false;
        deaths.push({ type: parentType, parent });
      }
    });

    return deaths;
  }

  function checkPetMortality(player) {
    if (!player) return [];
    ensureExtendedRelationshipsState(player);

    const deaths = [];

    player.pets.forEach(pet => {
      if (pet.alive === false) return;

      const age = pet.age || 0;
      const type = pet.type || "other";

      // Life expectancy varies by pet type
      const maxAge = type === "dog" ? 14 : type === "cat" ? 18 : 10;

      let deathChance = 0;
      if (age >= maxAge + 3) deathChance = 0.5;
      else if (age >= maxAge) deathChance = 0.25;
      else if (age >= maxAge - 2) deathChance = 0.1;
      else if (age >= maxAge - 4) deathChance = 0.03;

      if (Math.random() < deathChance) {
        pet.alive = false;
        deaths.push({ pet });
      }
    });

    return deaths;
  }

  function getInheritance(player, parentType) {
    if (!player) return 0;

    // Base inheritance based on family wealth
    const familyWealth = player.familyWealth || "medium";
    const baseAmounts = {
      low: 5000,
      medium: 25000,
      high: 100000,
      very_high: 500000
    };

    const base = baseAmounts[familyWealth] || 25000;
    const variance = Math.floor(Math.random() * base * 0.5);

    return base + variance;
  }

  function rollForFamilyEvent(player) {
    if (!player) return null;
    ensureExtendedRelationshipsState(player);

    const events = [];

    // Parent illness (if alive and old)
    ["mother", "father"].forEach(parentType => {
      const parent = player.parents?.[parentType];
      if (parent && parent.alive !== false && parent.age >= 60) {
        if (Math.random() < 0.03) {
          events.push({ type: "parent_illness", parentType, parent });
        }
      }
    });

    // Family needs money
    if (Math.random() < 0.02) {
      events.push({ type: "family_needs_money", amount: 1000 + Math.floor(Math.random() * 4000) });
    }

    // Sibling milestone
    player.siblings.forEach(sibling => {
      if (sibling.alive === false) return;
      if (sibling.age === 18 || sibling.age === 25 || sibling.age === 30) {
        if (Math.random() < 0.5) {
          events.push({ type: "sibling_milestone", sibling, milestone: sibling.age });
        }
      }
    });

    return events.length > 0 ? pickRandom(events) : null;
  }

  function rollForFriendEvent(player) {
    if (!player) return null;
    ensureExtendedRelationshipsState(player);

    const aliveFriends = player.friends.filter(f => f.alive !== false);
    if (aliveFriends.length === 0) return null;

    const friend = pickRandom(aliveFriends);

    // Various friend events
    const roll = Math.random();

    if (roll < 0.02) {
      return { type: "friend_betrayal", friend };
    } else if (roll < 0.05) {
      return { type: "friend_success", friend };
    } else if (roll < 0.08) {
      return { type: "friend_opportunity", friend };
    } else if (roll < 0.10) {
      return { type: "friend_needs_help", friend, amount: 500 + Math.floor(Math.random() * 2000) };
    }

    return null;
  }

  function rollForPetEvent(player) {
    if (!player) return null;
    ensureExtendedRelationshipsState(player);

    const alivePets = player.pets.filter(p => p.alive !== false);
    if (alivePets.length === 0) return null;

    const pet = pickRandom(alivePets);

    const roll = Math.random();

    if (roll < 0.03) {
      return { type: "pet_sick", pet, vetCost: 200 + Math.floor(Math.random() * 800) };
    } else if (roll < 0.06) {
      return { type: "pet_trick", pet };
    } else if (roll < 0.08 && pet.type === "dog") {
      return { type: "dog_hero", pet };
    }

    return null;
  }

  // ============================================================================
  // RELATIONSHIP SUMMARY
  // ============================================================================

  function getRelationshipsSummary(player) {
    if (!player) return null;
    ensureExtendedRelationshipsState(player);

    const aliveParents = [player.parents?.mother, player.parents?.father]
      .filter(p => p && p.alive !== false);
    const aliveSiblings = player.siblings.filter(s => s.alive !== false);
    const aliveFriends = player.friends.filter(f => f.alive !== false);
    const alivePets = player.pets.filter(p => p.alive !== false);
    const aliveChildren = (player.children || []).filter(c => c.alive !== false);

    const avgParentScore = aliveParents.length > 0
      ? aliveParents.reduce((sum, p) => sum + (p.relationshipScore || 50), 0) / aliveParents.length
      : 0;

    const avgSiblingScore = aliveSiblings.length > 0
      ? aliveSiblings.reduce((sum, s) => sum + (s.relationshipScore || 50), 0) / aliveSiblings.length
      : 0;

    const avgFriendCloseness = aliveFriends.length > 0
      ? aliveFriends.reduce((sum, f) => sum + (f.closeness || 50), 0) / aliveFriends.length
      : 0;

    const avgPetBond = alivePets.length > 0
      ? alivePets.reduce((sum, p) => sum + (p.bond || 50), 0) / alivePets.length
      : 0;

    return {
      hasPartner: !!player.partner,
      partnerScore: player.partner?.relationshipScore || 0,
      marriageStatus: player.marriageStatus || "single",
      childrenCount: aliveChildren.length,
      childrenAtHome: aliveChildren.filter(c => c.isAtHome).length,
      parentsAlive: aliveParents.length,
      avgParentScore: Math.round(avgParentScore),
      siblingsCount: aliveSiblings.length,
      avgSiblingScore: Math.round(avgSiblingScore),
      friendsCount: aliveFriends.length,
      avgFriendCloseness: Math.round(avgFriendCloseness),
      petsCount: alivePets.length,
      avgPetBond: Math.round(avgPetBond),
      totalPetCost: getTotalPetAnnualCost(player)
    };
  }

  // ============================================================================
  // EXPORT MODULE
  // ============================================================================

  Alive.relationships = {
    // Constants
    PERSONALITY_TRAITS,
    APPEARANCE_FEATURES,

    // State
    createEmptyRelationshipsState,
    ensureExtendedRelationshipsState,

    // Partner
    generatePartner,
    startRelationship,
    progressRelationship,
    shouldConsiderDivorce,
    shouldConsiderBreakup,
    breakUp,
    marry,
    divorce,
    widowed,

    // Children
    generateChild,
    haveChild,
    ageChildrenOneYear,
    getChildrenAtHome,
    getChildrenCount,

    // Extended relationships
    generateParent,
    generateSibling,
    generateFriend,
    generatePet,
    addSibling,
    addFriend,
    adoptPet,
    getPetAnnualCost,
    ageExtendedRelationshipsOneYear,

    // Family interactions
    callParent,
    visitFamily,
    helpFamilyFinancially,
    spendFamilyTime,

    // Friend interactions
    hangOutWithFriends,
    hangOutWithFriend,
    makeFriend,
    loseFriend,

    // Pet interactions
    playWithPet,
    walkDog,
    adoptNewPet,
    petPassesAway,
    getTotalPetAnnualCost,

    // Life events
    checkParentMortality,
    checkPetMortality,
    getInheritance,
    rollForFamilyEvent,
    rollForFriendEvent,
    rollForPetEvent,

    // Summary
    getRelationshipsSummary,

    // Utilities
    getRelationshipQuality,
    getRelationshipQualityKey,

    // Deep Relationships System exports
    TRUST_TIERS,
    MEMORY_TYPES,
    PARENTING_STYLES,
    CHILD_TRAITS,
    getTrustTier,
    getTrustTierId,
    addMemory,
    getRecentMemories,
    hasMemory,
    getMemoryBalance,
    enhanceWithTrustSystem,
    updateRelationshipYearly,
    engage
  };

})(window);
