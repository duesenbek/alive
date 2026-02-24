(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  function clamp(value, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  const CATEGORIES = {
    CLOTHES: "clothes",
    TECH: "tech",
    ACCESSORIES: "accessories",
    LIFESTYLE: "lifestyle",
    DECOR: "decor"
  };

  const SLOTS = {
    OUTFIT: "outfit",
    GADGET: "gadget",
    WATCH: "watch",
    JEWELRY: "jewelry",
    BAG: "bag",
    DECOR: "decor",
    SHOES: "shoes",
    GLASSES: "glasses"
  };

  // Item tiers for visual display
  const TIERS = {
    BASIC: { id: "basic", color: "#9ca3af", label: "Basic" },
    STANDARD: { id: "standard", color: "#60a5fa", label: "Standard" },
    PREMIUM: { id: "premium", color: "#a78bfa", label: "Premium" },
    LUXURY: { id: "luxury", color: "#fbbf24", label: "Luxury" },
    ELITE: { id: "elite", color: "#f472b6", label: "Elite" }
  };

  const catalog = [
    // =========================================================================
    // CLOTHING - Multiple tiers with clear progression
    // =========================================================================
    {
      id: "outfit_basic",
      category: CATEGORIES.CLOTHES,
      slot: SLOTS.OUTFIT,
      tier: TIERS.BASIC,
      icon: "👕",
      price: 0,
      effects: { attractivenessDelta: 0 },
      unlocks: []
    },
    {
      id: "outfit_casual",
      category: CATEGORIES.CLOTHES,
      slot: SLOTS.OUTFIT,
      tier: TIERS.STANDARD,
      icon: "🧢",
      price: 200,
      effects: { attractivenessDelta: 2, happinessDelta: 1 },
      unlocks: []
    },
    {
      id: "outfit_streetwear",
      category: CATEGORIES.CLOTHES,
      slot: SLOTS.OUTFIT,
      tier: TIERS.STANDARD,
      icon: "🎽",
      price: 350,
      effects: { attractivenessDelta: 3, socialSkillDelta: 1 },
      unlocks: ["event_streetwear_compliment"]
    },
    {
      id: "outfit_smart_casual",
      category: CATEGORIES.CLOTHES,
      slot: SLOTS.OUTFIT,
      tier: TIERS.PREMIUM,
      icon: "👖",
      price: 500,
      effects: { attractivenessDelta: 4, happinessDelta: 1 },
      unlocks: []
    },
    {
      id: "outfit_business",
      category: CATEGORIES.CLOTHES,
      slot: SLOTS.OUTFIT,
      tier: TIERS.PREMIUM,
      icon: "👔",
      price: 800,
      effects: { attractivenessDelta: 5, careerSkillDelta: 2 },
      unlocks: ["event_business_impression", "job_bonus_interview"]
    },
    {
      id: "outfit_formal",
      category: CATEGORIES.CLOTHES,
      slot: SLOTS.OUTFIT,
      tier: TIERS.LUXURY,
      icon: "🤵",
      price: 2000,
      effects: { attractivenessDelta: 7, careerSkillDelta: 2, socialSkillDelta: 1 },
      unlocks: ["event_gala_invite"]
    },
    {
      id: "outfit_designer",
      category: CATEGORIES.CLOTHES,
      slot: SLOTS.OUTFIT,
      tier: TIERS.LUXURY,
      icon: "👗",
      price: 5000,
      effects: { attractivenessDelta: 10, socialSkillDelta: 3 },
      unlocks: ["event_fashion_week", "event_celebrity_party"]
    },
    {
      id: "outfit_haute_couture",
      category: CATEGORIES.CLOTHES,
      slot: SLOTS.OUTFIT,
      tier: TIERS.ELITE,
      icon: "✨",
      price: 25000,
      effects: { attractivenessDelta: 15, socialSkillDelta: 5, happinessDelta: 3 },
      unlocks: ["event_red_carpet", "event_vip_access"]
    },

    // Shoes
    {
      id: "shoes_basic",
      category: CATEGORIES.CLOTHES,
      slot: SLOTS.SHOES,
      tier: TIERS.BASIC,
      icon: "👟",
      price: 50,
      effects: { happinessDelta: 1 },
      unlocks: []
    },
    {
      id: "shoes_sneakers",
      category: CATEGORIES.CLOTHES,
      slot: SLOTS.SHOES,
      tier: TIERS.STANDARD,
      icon: "👟",
      price: 150,
      effects: { attractivenessDelta: 1, happinessDelta: 1 },
      unlocks: []
    },
    {
      id: "shoes_leather",
      category: CATEGORIES.CLOTHES,
      slot: SLOTS.SHOES,
      tier: TIERS.PREMIUM,
      icon: "👞",
      price: 400,
      effects: { attractivenessDelta: 2, careerSkillDelta: 1 },
      unlocks: []
    },
    {
      id: "shoes_designer",
      category: CATEGORIES.CLOTHES,
      slot: SLOTS.SHOES,
      tier: TIERS.LUXURY,
      icon: "👠",
      price: 1200,
      effects: { attractivenessDelta: 4, socialSkillDelta: 1 },
      unlocks: []
    },
    {
      id: "shoes_luxury",
      category: CATEGORIES.CLOTHES,
      slot: SLOTS.SHOES,
      tier: TIERS.ELITE,
      icon: "👢",
      price: 3500,
      effects: { attractivenessDelta: 6, socialSkillDelta: 2 },
      unlocks: []
    },

    // =========================================================================
    // TECH / GADGETS - Unlock events and career opportunities
    // =========================================================================
    {
      id: "gadget_phone_basic",
      category: CATEGORIES.TECH,
      slot: SLOTS.GADGET,
      tier: TIERS.BASIC,
      icon: "📱",
      price: 150,
      effects: { happinessDelta: 1 },
      unlocks: ["feature_calls"]
    },
    {
      id: "gadget_phone_mid",
      category: CATEGORIES.TECH,
      slot: SLOTS.GADGET,
      tier: TIERS.STANDARD,
      icon: "📱",
      price: 500,
      effects: { happinessDelta: 2, socialSkillDelta: 1 },
      unlocks: ["feature_social_media", "event_viral_post"]
    },
    {
      id: "gadget_phone_premium",
      category: CATEGORIES.TECH,
      slot: SLOTS.GADGET,
      tier: TIERS.PREMIUM,
      icon: "📱",
      price: 1200,
      effects: { happinessDelta: 3, socialSkillDelta: 2 },
      unlocks: ["feature_content_creation", "event_influencer_collab"]
    },
    {
      id: "gadget_phone_flagship",
      category: CATEGORIES.TECH,
      slot: SLOTS.GADGET,
      tier: TIERS.LUXURY,
      icon: "📱",
      price: 1800,
      effects: { happinessDelta: 4, socialSkillDelta: 3, attractivenessDelta: 1 },
      unlocks: ["feature_pro_photography", "event_tech_review"]
    },
    {
      id: "gadget_laptop_basic",
      category: CATEGORIES.TECH,
      slot: SLOTS.GADGET,
      tier: TIERS.STANDARD,
      icon: "💻",
      price: 600,
      effects: { intelligenceDelta: 1, careerSkillDelta: 1 },
      unlocks: ["feature_remote_work_basic"]
    },
    {
      id: "gadget_laptop",
      category: CATEGORIES.TECH,
      slot: SLOTS.GADGET,
      tier: TIERS.PREMIUM,
      icon: "💻",
      price: 1500,
      effects: { intelligenceDelta: 2, careerSkillDelta: 2 },
      unlocks: ["feature_remote_work", "event_freelance_gig", "event_online_course"]
    },
    {
      id: "gadget_laptop_pro",
      category: CATEGORIES.TECH,
      slot: SLOTS.GADGET,
      tier: TIERS.LUXURY,
      icon: "💻",
      price: 3000,
      effects: { intelligenceDelta: 3, careerSkillDelta: 3, businessSkillDelta: 1 },
      unlocks: ["feature_video_editing", "event_startup_pitch", "event_remote_job_offer"]
    },
    {
      id: "gadget_gaming_console",
      category: CATEGORIES.TECH,
      slot: SLOTS.GADGET,
      tier: TIERS.STANDARD,
      icon: "🎮",
      price: 500,
      effects: { happinessDelta: 3, stressDelta: -2 },
      unlocks: ["event_gaming_tournament", "hobby_gaming"]
    },
    {
      id: "gadget_gaming_pc",
      category: CATEGORIES.TECH,
      slot: SLOTS.GADGET,
      tier: TIERS.PREMIUM,
      icon: "🖥️",
      price: 2200,
      effects: { happinessDelta: 4, intelligenceDelta: 1 },
      unlocks: ["feature_streaming", "event_esports", "event_streaming_career"]
    },
    {
      id: "gadget_gaming_setup",
      category: CATEGORIES.TECH,
      slot: SLOTS.GADGET,
      tier: TIERS.LUXURY,
      icon: "🖥️",
      price: 5000,
      effects: { happinessDelta: 5, socialSkillDelta: 2 },
      unlocks: ["feature_pro_streaming", "event_sponsor_deal", "event_gaming_fame"]
    },
    {
      id: "gadget_tablet",
      category: CATEGORIES.TECH,
      slot: SLOTS.GADGET,
      tier: TIERS.STANDARD,
      icon: "📲",
      price: 400,
      effects: { happinessDelta: 2, intelligenceDelta: 1 },
      unlocks: ["feature_digital_art", "event_creative_project"]
    },
    {
      id: "gadget_camera",
      category: CATEGORIES.TECH,
      slot: SLOTS.GADGET,
      tier: TIERS.PREMIUM,
      icon: "📷",
      price: 1800,
      effects: { happinessDelta: 2, socialSkillDelta: 1 },
      unlocks: ["feature_photography", "event_photo_gig", "hobby_photography"]
    },
    {
      id: "gadget_drone",
      category: CATEGORIES.TECH,
      slot: SLOTS.GADGET,
      tier: TIERS.LUXURY,
      icon: "🚁",
      price: 2500,
      effects: { happinessDelta: 3, intelligenceDelta: 1 },
      unlocks: ["feature_aerial_photo", "event_drone_business"]
    },
    {
      id: "gadget_vr",
      category: CATEGORIES.TECH,
      slot: SLOTS.GADGET,
      tier: TIERS.PREMIUM,
      icon: "🥽",
      price: 800,
      effects: { happinessDelta: 4, stressDelta: -3 },
      unlocks: ["feature_vr_gaming", "event_metaverse"]
    },
    {
      id: "gadget_smartwatch",
      category: CATEGORIES.TECH,
      slot: SLOTS.WATCH,
      tier: TIERS.STANDARD,
      icon: "⌚",
      price: 350,
      effects: { healthDelta: 1, happinessDelta: 1 },
      unlocks: ["feature_fitness_tracking"]
    },

    // =========================================================================
    // ACCESSORIES - Status symbols and style boosters
    // =========================================================================
    {
      id: "accessory_watch_basic",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.WATCH,
      tier: TIERS.BASIC,
      icon: "⌚",
      price: 100,
      effects: { attractivenessDelta: 1 },
      unlocks: []
    },
    {
      id: "accessory_watch",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.WATCH,
      tier: TIERS.STANDARD,
      icon: "⌚",
      price: 250,
      effects: { attractivenessDelta: 2 },
      unlocks: []
    },
    {
      id: "accessory_watch_premium",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.WATCH,
      tier: TIERS.PREMIUM,
      icon: "⌚",
      price: 1000,
      effects: { attractivenessDelta: 3, socialSkillDelta: 1 },
      unlocks: []
    },
    {
      id: "accessory_watch_luxury",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.WATCH,
      tier: TIERS.LUXURY,
      icon: "⌚",
      price: 5000,
      effects: { attractivenessDelta: 5, socialSkillDelta: 2 },
      unlocks: ["event_watch_collector"]
    },
    {
      id: "accessory_watch_elite",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.WATCH,
      tier: TIERS.ELITE,
      icon: "⌚",
      price: 25000,
      effects: { attractivenessDelta: 8, socialSkillDelta: 3, businessSkillDelta: 1 },
      unlocks: ["event_elite_club", "event_investor_meeting"]
    },
    {
      id: "accessory_jewelry_simple",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.JEWELRY,
      tier: TIERS.BASIC,
      icon: "💍",
      price: 150,
      effects: { attractivenessDelta: 1 },
      unlocks: []
    },
    {
      id: "accessory_jewelry",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.JEWELRY,
      tier: TIERS.STANDARD,
      icon: "💍",
      price: 400,
      effects: { attractivenessDelta: 2 },
      unlocks: []
    },
    {
      id: "accessory_jewelry_gold",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.JEWELRY,
      tier: TIERS.PREMIUM,
      icon: "💎",
      price: 1500,
      effects: { attractivenessDelta: 4 },
      unlocks: []
    },
    {
      id: "accessory_jewelry_diamond",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.JEWELRY,
      tier: TIERS.LUXURY,
      icon: "💎",
      price: 8000,
      effects: { attractivenessDelta: 7, socialSkillDelta: 2 },
      unlocks: ["event_jewelry_compliment"]
    },
    {
      id: "accessory_jewelry_elite",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.JEWELRY,
      tier: TIERS.ELITE,
      icon: "👑",
      price: 50000,
      effects: { attractivenessDelta: 12, socialSkillDelta: 4 },
      unlocks: ["event_high_society"]
    },
    {
      id: "accessory_bag_basic",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.BAG,
      tier: TIERS.BASIC,
      icon: "🎒",
      price: 50,
      effects: { happinessDelta: 1 },
      unlocks: []
    },
    {
      id: "accessory_bag_leather",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.BAG,
      tier: TIERS.STANDARD,
      icon: "💼",
      price: 300,
      effects: { attractivenessDelta: 1, careerSkillDelta: 1 },
      unlocks: []
    },
    {
      id: "accessory_bag_designer",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.BAG,
      tier: TIERS.PREMIUM,
      icon: "👜",
      price: 1200,
      effects: { attractivenessDelta: 3 },
      unlocks: []
    },
    {
      id: "accessory_bag_luxury",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.BAG,
      tier: TIERS.LUXURY,
      icon: "👜",
      price: 4000,
      effects: { attractivenessDelta: 5, socialSkillDelta: 1 },
      unlocks: ["event_fashion_notice"]
    },
    {
      id: "accessory_bag_elite",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.BAG,
      tier: TIERS.ELITE,
      icon: "👜",
      price: 15000,
      effects: { attractivenessDelta: 8, socialSkillDelta: 3 },
      unlocks: []
    },
    {
      id: "accessory_glasses_basic",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.GLASSES,
      tier: TIERS.BASIC,
      icon: "👓",
      price: 80,
      effects: { intelligenceDelta: 1 },
      unlocks: []
    },
    {
      id: "accessory_glasses_fashion",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.GLASSES,
      tier: TIERS.STANDARD,
      icon: "🕶️",
      price: 200,
      effects: { attractivenessDelta: 2 },
      unlocks: []
    },
    {
      id: "accessory_glasses_designer",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.GLASSES,
      tier: TIERS.PREMIUM,
      icon: "🕶️",
      price: 600,
      effects: { attractivenessDelta: 3, socialSkillDelta: 1 },
      unlocks: []
    },
    {
      id: "accessory_glasses_luxury",
      category: CATEGORIES.ACCESSORIES,
      slot: SLOTS.GLASSES,
      tier: TIERS.LUXURY,
      icon: "🕶️",
      price: 1500,
      effects: { attractivenessDelta: 5, socialSkillDelta: 2 },
      unlocks: []
    },

    // =========================================================================
    // LIFESTYLE SUBSCRIPTIONS - Recurring benefits
    // =========================================================================
    {
      id: "sub_gym_basic",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.BASIC,
      icon: "🏋️",
      price: 0,
      subscription: { annualCost: 240 },
      yearlyEffects: { healthDelta: 2, happinessDelta: 1, sportsSkillDelta: 1 },
      unlocks: ["event_gym_buddy"]
    },
    {
      id: "sub_gym_premium",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.PREMIUM,
      icon: "🏋️",
      price: 0,
      subscription: { annualCost: 1200 },
      yearlyEffects: { healthDelta: 4, happinessDelta: 2, sportsSkillDelta: 2, attractivenessDelta: 1 },
      unlocks: ["event_personal_trainer", "event_fitness_competition"]
    },
    {
      id: "sub_gym_elite",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.ELITE,
      icon: "🏋️",
      price: 0,
      subscription: { annualCost: 5000 },
      yearlyEffects: { healthDelta: 6, happinessDelta: 3, sportsSkillDelta: 3, attractivenessDelta: 2, socialSkillDelta: 1 },
      unlocks: ["event_celebrity_gym", "event_fitness_influencer"]
    },
    {
      id: "sub_club_social",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.STANDARD,
      icon: "🎟️",
      price: 0,
      subscription: { annualCost: 600 },
      yearlyEffects: { happinessDelta: 2, socialSkillDelta: 2 },
      unlocks: ["event_club_networking"]
    },
    {
      id: "sub_club_exclusive",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.LUXURY,
      icon: "🎟️",
      price: 0,
      subscription: { annualCost: 3000 },
      yearlyEffects: { happinessDelta: 3, socialSkillDelta: 4, businessSkillDelta: 1 },
      unlocks: ["event_vip_party", "event_business_connection"]
    },
    {
      id: "sub_club_elite",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.ELITE,
      icon: "🎟️",
      price: 0,
      subscription: { annualCost: 15000 },
      yearlyEffects: { happinessDelta: 4, socialSkillDelta: 6, businessSkillDelta: 3 },
      unlocks: ["event_billionaire_party", "event_investor_intro"]
    },
    {
      id: "sub_streaming",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.BASIC,
      icon: "📺",
      price: 0,
      subscription: { annualCost: 180 },
      yearlyEffects: { happinessDelta: 1, stressDelta: -1 },
      unlocks: []
    },
    {
      id: "sub_streaming_premium",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.STANDARD,
      icon: "📺",
      price: 0,
      subscription: { annualCost: 360 },
      yearlyEffects: { happinessDelta: 2, stressDelta: -2, intelligenceDelta: 1 },
      unlocks: ["event_documentary_inspiration"]
    },
    {
      id: "sub_coworking",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.STANDARD,
      icon: "🧑‍💻",
      price: 0,
      subscription: { annualCost: 1200 },
      yearlyEffects: { careerSkillDelta: 2, socialSkillDelta: 2, businessSkillDelta: 1 },
      unlocks: ["event_coworking_collab", "event_startup_meetup"]
    },
    {
      id: "sub_coworking_premium",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.PREMIUM,
      icon: "🧑‍💻",
      price: 0,
      subscription: { annualCost: 3600 },
      yearlyEffects: { careerSkillDelta: 3, socialSkillDelta: 3, businessSkillDelta: 2 },
      unlocks: ["event_investor_pitch", "event_tech_conference"]
    },
    {
      id: "sub_learning",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.STANDARD,
      icon: "📚",
      price: 0,
      subscription: { annualCost: 300 },
      yearlyEffects: { intelligenceDelta: 2, careerSkillDelta: 1 },
      unlocks: ["event_online_certification"]
    },
    {
      id: "sub_learning_premium",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.PREMIUM,
      icon: "📚",
      price: 0,
      subscription: { annualCost: 1000 },
      yearlyEffects: { intelligenceDelta: 4, careerSkillDelta: 2, businessSkillDelta: 1 },
      unlocks: ["event_masterclass", "event_mentorship"]
    },
    {
      id: "sub_meditation",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.BASIC,
      icon: "🧘",
      price: 0,
      subscription: { annualCost: 120 },
      yearlyEffects: { happinessDelta: 2, stressDelta: -3, healthDelta: 1 },
      unlocks: []
    },
    {
      id: "sub_therapy",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.PREMIUM,
      icon: "🧠",
      price: 0,
      subscription: { annualCost: 2400 },
      yearlyEffects: { happinessDelta: 4, stressDelta: -5, healthDelta: 1 },
      unlocks: ["event_breakthrough"]
    },
    {
      id: "sub_personal_chef",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.ELITE,
      icon: "👨‍🍳",
      price: 0,
      subscription: { annualCost: 12000 },
      yearlyEffects: { healthDelta: 4, happinessDelta: 3, attractivenessDelta: 1 },
      unlocks: []
    },
    {
      id: "sub_personal_trainer",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.LUXURY,
      icon: "💪",
      price: 0,
      subscription: { annualCost: 6000 },
      yearlyEffects: { healthDelta: 5, sportsSkillDelta: 4, attractivenessDelta: 2 },
      unlocks: ["event_fitness_transformation"]
    },
    {
      id: "sub_concierge",
      category: CATEGORIES.LIFESTYLE,
      slot: null,
      tier: TIERS.ELITE,
      icon: "🎩",
      price: 0,
      subscription: { annualCost: 20000 },
      yearlyEffects: { happinessDelta: 5, stressDelta: -4, socialSkillDelta: 2 },
      unlocks: ["event_exclusive_access", "event_impossible_reservation"]
    },

    // =========================================================================
    // DECOR - Home improvements tied to housing
    // =========================================================================
    {
      id: "decor_basic",
      category: CATEGORIES.DECOR,
      slot: SLOTS.DECOR,
      tier: TIERS.BASIC,
      icon: "🪑",
      price: 300,
      effects: { happinessDelta: 1 },
      unlocks: []
    },
    {
      id: "decor_simple",
      category: CATEGORIES.DECOR,
      slot: SLOTS.DECOR,
      tier: TIERS.STANDARD,
      icon: "🛋️",
      price: 1000,
      effects: { happinessDelta: 2 },
      unlocks: []
    },
    {
      id: "decor_modern",
      category: CATEGORIES.DECOR,
      slot: SLOTS.DECOR,
      tier: TIERS.PREMIUM,
      icon: "🛋️",
      price: 5000,
      effects: { happinessDelta: 3, attractivenessDelta: 1 },
      unlocks: ["event_home_magazine"]
    },
    {
      id: "decor_luxury",
      category: CATEGORIES.DECOR,
      slot: SLOTS.DECOR,
      tier: TIERS.LUXURY,
      icon: "🛋️",
      price: 20000,
      requiresHousingNotApartment: true,
      effects: { happinessDelta: 5, attractivenessDelta: 2, socialSkillDelta: 1 },
      unlocks: ["event_house_party_success"]
    },
    {
      id: "decor_elite",
      category: CATEGORIES.DECOR,
      slot: SLOTS.DECOR,
      tier: TIERS.ELITE,
      icon: "🏛️",
      price: 100000,
      requiresHousingNotApartment: true,
      effects: { happinessDelta: 8, attractivenessDelta: 4, socialSkillDelta: 3 },
      unlocks: ["event_celebrity_visit", "event_magazine_feature"]
    },
    {
      id: "decor_art_collection",
      category: CATEGORIES.DECOR,
      slot: SLOTS.DECOR,
      tier: TIERS.ELITE,
      icon: "🖼️",
      price: 250000,
      requiresHousingNotApartment: true,
      effects: { happinessDelta: 6, intelligenceDelta: 2, socialSkillDelta: 4 },
      unlocks: ["event_art_world", "event_gallery_opening"]
    }
  ];

  function getItemById(itemId) {
    const id = String(itemId || "");
    if (!id) return null;
    return catalog.find((x) => x.id === id) || null;
  }

  function ensureShopState(player) {
    if (!player) return;

    if (!Array.isArray(player.inventoryOwned)) player.inventoryOwned = [];
    if (!player.equipped || typeof player.equipped !== "object" || Array.isArray(player.equipped)) {
      player.equipped = {};
    }
    if (!player.subscriptions || typeof player.subscriptions !== "object" || Array.isArray(player.subscriptions)) {
      player.subscriptions = {};
    }

    // Ensure basic items are owned
    if (!player.inventoryOwned.includes("outfit_basic")) {
      player.inventoryOwned.push("outfit_basic");
    }
    if (!player.inventoryOwned.includes("shoes_basic")) {
      player.inventoryOwned.push("shoes_basic");
    }

    // Ensure default equipment
    const hasOutfit = typeof player.equipped.outfitId === "string" && player.equipped.outfitId.trim();
    if (!hasOutfit) {
      player.equipped.outfitId = "outfit_basic";
    }

    const hasShoes = typeof player.equipped.shoesId === "string" && player.equipped.shoesId.trim();
    if (!hasShoes) {
      player.equipped.shoesId = "shoes_basic";
    }

    // Initialize all slots
    if (typeof player.equipped.watchId !== "string") player.equipped.watchId = null;
    if (typeof player.equipped.jewelryId !== "string") player.equipped.jewelryId = null;
    if (typeof player.equipped.bagId !== "string") player.equipped.bagId = null;
    if (typeof player.equipped.gadgetId !== "string") player.equipped.gadgetId = null;
    if (typeof player.equipped.decorId !== "string") player.equipped.decorId = null;
    if (typeof player.equipped.glassesId !== "string") player.equipped.glassesId = null;
  }

  function isOwned(player, itemId) {
    ensureShopState(player);
    return player.inventoryOwned.includes(itemId);
  }

  function isItemAvailableForPlayer(player, item) {
    if (!player || !item) return false;
    if (item.requiresHousingNotApartment) {
      const housing = String(player.housing || "apartment");
      if (housing === "apartment") return false;
    }
    return true;
  }

  function getBuyAvailability(player, itemId) {
    const item = getItemById(itemId);
    if (!player || !item) return { canBuy: false, reason: "missing" };
    ensureShopState(player);

    if (item.subscription) {
      return { canBuy: false, reason: "subscription" };
    }

    if (isOwned(player, itemId)) {
      return { canBuy: false, reason: "owned" };
    }

    if (!isItemAvailableForPlayer(player, item)) {
      return { canBuy: false, reason: "locked" };
    }

    const price = Math.max(0, Math.round(item.price || 0));
    if ((player.money || 0) < price) {
      return { canBuy: false, reason: "money" };
    }

    return { canBuy: true, reason: "ok" };
  }

  function canBuy(player, itemId) {
    const a = getBuyAvailability(player, itemId);
    return !!a.canBuy;
  }

  function applyItemEffects(player, item, sign) {
    if (!player || !item || !item.effects) return;
    const s = sign === -1 ? -1 : 1;
    const e = item.effects;

    player.applyEffects({
      healthDelta: e.healthDelta ? e.healthDelta * s : 0,
      happinessDelta: e.happinessDelta ? e.happinessDelta * s : 0,
      intelligenceDelta: e.intelligenceDelta ? e.intelligenceDelta * s : 0,
      attractivenessDelta: e.attractivenessDelta ? e.attractivenessDelta * s : 0,
      stressDelta: e.stressDelta ? e.stressDelta * s : 0,
      moneyDelta: 0,
      sportsSkillDelta: e.sportsSkillDelta !== undefined ? e.sportsSkillDelta * s : undefined,
      businessSkillDelta: e.businessSkillDelta !== undefined ? e.businessSkillDelta * s : undefined,
      investingSkillDelta: e.investingSkillDelta !== undefined ? e.investingSkillDelta * s : undefined,
      careerSkillDelta: e.careerSkillDelta !== undefined ? e.careerSkillDelta * s : undefined,
      socialSkillDelta: e.socialSkillDelta !== undefined ? e.socialSkillDelta * s : undefined
    });
  }

  function buyItem(player, itemId) {
    const item = getItemById(itemId);
    if (!player || !item) return false;
    ensureShopState(player);

    if (item.subscription) return false;

    if (!isItemAvailableForPlayer(player, item)) return false;

    if (isOwned(player, itemId)) return false;

    const price = Math.max(0, Math.round(item.price || 0));
    if ((player.money || 0) < price) return false;

    player.money -= price;
    player.inventoryOwned.push(itemId);

    if (item.slot) {
      equipItem(player, itemId);
    }

    player.recalculateEconomy?.();
    player.updateNetWorth?.();
    return true;
  }

  function getEquippedIdForSlot(player, slot) {
    switch (slot) {
      case SLOTS.OUTFIT: return player.equipped.outfitId;
      case SLOTS.GADGET: return player.equipped.gadgetId;
      case SLOTS.WATCH: return player.equipped.watchId;
      case SLOTS.JEWELRY: return player.equipped.jewelryId;
      case SLOTS.BAG: return player.equipped.bagId;
      case SLOTS.DECOR: return player.equipped.decorId;
      case SLOTS.SHOES: return player.equipped.shoesId;
      case SLOTS.GLASSES: return player.equipped.glassesId;
      default: return null;
    }
  }

  function setEquippedIdForSlot(player, slot, itemId) {
    switch (slot) {
      case SLOTS.OUTFIT: player.equipped.outfitId = itemId; break;
      case SLOTS.GADGET: player.equipped.gadgetId = itemId; break;
      case SLOTS.WATCH: player.equipped.watchId = itemId; break;
      case SLOTS.JEWELRY: player.equipped.jewelryId = itemId; break;
      case SLOTS.BAG: player.equipped.bagId = itemId; break;
      case SLOTS.DECOR: player.equipped.decorId = itemId; break;
      case SLOTS.SHOES: player.equipped.shoesId = itemId; break;
      case SLOTS.GLASSES: player.equipped.glassesId = itemId; break;
    }
  }

  function equipItem(player, itemId) {
    const item = getItemById(itemId);
    if (!player || !item || !item.slot) return false;
    ensureShopState(player);
    if (!isOwned(player, itemId)) return false;

    const slot = item.slot;
    const currentId = getEquippedIdForSlot(player, slot);

    if (currentId === itemId) return false;

    const currentItem = currentId ? getItemById(currentId) : null;
    if (currentItem) {
      applyItemEffects(player, currentItem, -1);
    }

    applyItemEffects(player, item, +1);
    setEquippedIdForSlot(player, slot, itemId);

    player.recalculateEconomy?.();
    player.updateNetWorth?.();
    return true;
  }

  function unequipSlot(player, slot) {
    ensureShopState(player);

    const currentId = getEquippedIdForSlot(player, slot);
    if (!currentId) return false;

    const currentItem = getItemById(currentId);
    if (currentItem) {
      applyItemEffects(player, currentItem, -1);
    }

    // Set to default or null based on slot type
    const defaultItems = {
      [SLOTS.OUTFIT]: "outfit_basic",
      [SLOTS.SHOES]: "shoes_basic"
    };

    const defaultId = defaultItems[slot] || null;
    setEquippedIdForSlot(player, slot, defaultId);

    // Apply default item effects if there is one
    if (defaultId && currentId !== defaultId) {
      const defaultItem = getItemById(defaultId);
      if (defaultItem) {
        applyItemEffects(player, defaultItem, +1);
      }
    }

    player.recalculateEconomy?.();
    player.updateNetWorth?.();
    return true;
  }

  function toggleSubscription(player, subscriptionId, enabled) {
    const item = getItemById(subscriptionId);
    if (!player || !item || !item.subscription) return false;
    ensureShopState(player);

    const next = enabled === undefined ? !player.subscriptions[subscriptionId] : !!enabled;
    player.subscriptions[subscriptionId] = next;
    player.recalculateEconomy?.();
    player.updateNetWorth?.();
    return true;
  }

  function getAnnualSubscriptionCost(player) {
    ensureShopState(player);
    const subIds = Object.keys(player.subscriptions || {}).filter((k) => player.subscriptions[k]);
    return subIds
      .map((id) => getItemById(id))
      .filter((x) => x && x.subscription)
      .reduce((sum, x) => sum + Math.max(0, Math.round(x.subscription.annualCost || 0)), 0);
  }

  function applyYearlySubscriptionEffects(player) {
    ensureShopState(player);
    const subIds = Object.keys(player.subscriptions || {}).filter((k) => player.subscriptions[k]);
    const effects = {
      healthDelta: 0,
      happinessDelta: 0,
      intelligenceDelta: 0,
      attractivenessDelta: 0,
      stressDelta: 0,
      moneyDelta: 0,
      sportsSkillDelta: 0,
      businessSkillDelta: 0,
      investingSkillDelta: 0,
      careerSkillDelta: 0,
      socialSkillDelta: 0
    };

    subIds
      .map((id) => getItemById(id))
      .filter((x) => x && x.yearlyEffects)
      .forEach((x) => {
        effects.healthDelta += Number(x.yearlyEffects.healthDelta) || 0;
        effects.happinessDelta += Number(x.yearlyEffects.happinessDelta) || 0;
        effects.intelligenceDelta += Number(x.yearlyEffects.intelligenceDelta) || 0;
        effects.attractivenessDelta += Number(x.yearlyEffects.attractivenessDelta) || 0;
        effects.stressDelta += Number(x.yearlyEffects.stressDelta) || 0;
        effects.sportsSkillDelta += Number(x.yearlyEffects.sportsSkillDelta) || 0;
        effects.businessSkillDelta += Number(x.yearlyEffects.businessSkillDelta) || 0;
        effects.investingSkillDelta += Number(x.yearlyEffects.investingSkillDelta) || 0;
        effects.careerSkillDelta += Number(x.yearlyEffects.careerSkillDelta) || 0;
        effects.socialSkillDelta += Number(x.yearlyEffects.socialSkillDelta) || 0;
      });

    player.applyEffects(effects);
  }

  function hasEquipped(player, itemId) {
    ensureShopState(player);
    const id = String(itemId || "");
    if (!id) return false;
    return (
      player.equipped?.outfitId === id ||
      player.equipped?.gadgetId === id ||
      player.equipped?.watchId === id ||
      player.equipped?.jewelryId === id ||
      player.equipped?.bagId === id ||
      player.equipped?.decorId === id ||
      player.equipped?.shoesId === id ||
      player.equipped?.glassesId === id
    );
  }

  function getEquippedGadgetId(player) {
    ensureShopState(player);
    return typeof player.equipped?.gadgetId === "string" ? player.equipped.gadgetId : null;
  }

  function getCatalog() {
    return catalog;
  }

  function getItemsByCategory(category) {
    const c = String(category || "");
    return catalog.filter((x) => x.category === c);
  }

  function getItemsBySlot(slot) {
    const s = String(slot || "");
    return catalog.filter((x) => x.slot === s);
  }

  function getItemsByTier(tierId) {
    return catalog.filter((x) => x.tier?.id === tierId);
  }

  function getPlayerStyleScore(player) {
    ensureShopState(player);
    let score = 0;
    const slots = [
      player.equipped.outfitId,
      player.equipped.shoesId,
      player.equipped.watchId,
      player.equipped.jewelryId,
      player.equipped.bagId,
      player.equipped.glassesId
    ];
    
    slots.forEach(itemId => {
      if (itemId) {
        const item = getItemById(itemId);
        if (item?.tier) {
          const tierScores = { basic: 1, standard: 2, premium: 3, luxury: 4, elite: 5 };
          score += tierScores[item.tier.id] || 0;
        }
      }
    });
    
    return score;
  }

  function getPlayerLifestyleScore(player) {
    ensureShopState(player);
    let score = 0;
    const subIds = Object.keys(player.subscriptions || {}).filter(k => player.subscriptions[k]);
    
    subIds.forEach(subId => {
      const item = getItemById(subId);
      if (item?.tier) {
        const tierScores = { basic: 1, standard: 2, premium: 3, luxury: 4, elite: 5 };
        score += tierScores[item.tier.id] || 0;
      }
    });
    
    return score;
  }

  function getEquippedItems(player) {
    ensureShopState(player);
    const items = [];
    const equipped = player.equipped || {};
    
    Object.values(equipped).forEach(itemId => {
      if (itemId) {
        const item = getItemById(itemId);
        if (item) items.push(item);
      }
    });
    
    return items;
  }

  function getActiveSubscriptions(player) {
    ensureShopState(player);
    const subs = [];
    const subIds = Object.keys(player.subscriptions || {}).filter(k => player.subscriptions[k]);
    
    subIds.forEach(subId => {
      const item = getItemById(subId);
      if (item) subs.push(item);
    });
    
    return subs;
  }

  function hasUnlock(player, unlockId) {
    ensureShopState(player);
    
    // Check equipped items
    const equipped = getEquippedItems(player);
    for (const item of equipped) {
      if (item.unlocks?.includes(unlockId)) return true;
    }
    
    // Check active subscriptions
    const subs = getActiveSubscriptions(player);
    for (const sub of subs) {
      if (sub.unlocks?.includes(unlockId)) return true;
    }
    
    return false;
  }

  function getAllUnlocks(player) {
    ensureShopState(player);
    const unlocks = new Set();
    
    const equipped = getEquippedItems(player);
    equipped.forEach(item => {
      (item.unlocks || []).forEach(u => unlocks.add(u));
    });
    
    const subs = getActiveSubscriptions(player);
    subs.forEach(sub => {
      (sub.unlocks || []).forEach(u => unlocks.add(u));
    });
    
    return Array.from(unlocks);
  }

  function getTotalEquippedValue(player) {
    ensureShopState(player);
    let total = 0;
    
    const equipped = getEquippedItems(player);
    equipped.forEach(item => {
      total += item.price || 0;
    });
    
    return total;
  }

  Alive.shop = {
    CATEGORIES,
    SLOTS,
    TIERS,
    getCatalog,
    getItemsByCategory,
    getItemsBySlot,
    getItemsByTier,
    getItemById,
    ensureShopState,
    isOwned,
    getBuyAvailability,
    canBuy,
    buyItem,
    equipItem,
    unequipSlot,
    hasEquipped,
    toggleSubscription,
    getAnnualSubscriptionCost,
    applyYearlySubscriptionEffects,
    getEquippedGadgetId,
    getEquippedIdForSlot,
    getPlayerStyleScore,
    getPlayerLifestyleScore,
    getEquippedItems,
    getActiveSubscriptions,
    hasUnlock,
    getAllUnlocks,
    getTotalEquippedValue
  };
})(window);
