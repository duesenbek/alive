/**
 * Vehicles Assets Config
 * Defines all vehicle assets, their types, classes, and visual paths.
 * UPDATED: Uses transport_X.webp assets
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});
    Alive.Assets = Alive.Assets || {};

    // Define the base path for assets
    const ASSETS_PATH = "assets/transport/";

    // Master list of all vehicle assets (99 total)
    // Organized by class tiers based on price
    const VEHICLES = [
        // --------------------------------------------------------------------------
        // TIER 1: CHEAP (transport_1 - transport_20) - Budget cars
        // --------------------------------------------------------------------------
        { id: "transport_1", category: "vehicle", type: "hatchback", class: "cheap", price: 3000, image: ASSETS_PATH + "transport_1.webp", name: "Old Beater" },
        { id: "transport_2", category: "vehicle", type: "hatchback", class: "cheap", price: 4000, image: ASSETS_PATH + "transport_2.webp", name: "Rusty Compact" },
        { id: "transport_3", category: "vehicle", type: "hatchback", class: "cheap", price: 5000, image: ASSETS_PATH + "transport_3.webp", name: "City Hatch" },
        { id: "transport_4", category: "vehicle", type: "hatchback", class: "cheap", price: 6000, image: ASSETS_PATH + "transport_4.webp", name: "Economy Car" },
        { id: "transport_5", category: "vehicle", type: "hatchback", class: "cheap", price: 7000, image: ASSETS_PATH + "transport_5.webp", name: "Basic Commuter" },
        { id: "transport_6", category: "vehicle", type: "sedan", class: "cheap", price: 8000, image: ASSETS_PATH + "transport_6.webp", name: "Used Sedan" },
        { id: "transport_7", category: "vehicle", type: "sedan", class: "cheap", price: 9000, image: ASSETS_PATH + "transport_7.webp", name: "Reliable Runner" },
        { id: "transport_8", category: "vehicle", type: "sedan", class: "cheap", price: 10000, image: ASSETS_PATH + "transport_8.webp", name: "Family Sedan" },
        { id: "transport_9", category: "vehicle", type: "sedan", class: "cheap", price: 11000, image: ASSETS_PATH + "transport_9.webp", name: "Standard Sedan" },
        { id: "transport_10", category: "vehicle", type: "sedan", class: "cheap", price: 12000, image: ASSETS_PATH + "transport_10.webp", name: "Compact Sedan" },
        { id: "transport_11", category: "vehicle", type: "van", class: "cheap", price: 8000, image: ASSETS_PATH + "transport_11.webp", name: "Old Van" },
        { id: "transport_12", category: "vehicle", type: "van", class: "cheap", price: 10000, image: ASSETS_PATH + "transport_12.webp", name: "Work Van" },
        { id: "transport_13", category: "vehicle", type: "pickup", class: "cheap", price: 9000, image: ASSETS_PATH + "transport_13.webp", name: "Used Truck" },
        { id: "transport_14", category: "vehicle", type: "pickup", class: "cheap", price: 11000, image: ASSETS_PATH + "transport_14.webp", name: "Farm Truck" },
        { id: "transport_15", category: "vehicle", type: "motorcycle", class: "cheap", price: 3000, image: ASSETS_PATH + "transport_15.webp", name: "Old Bike" },
        { id: "transport_16", category: "vehicle", type: "motorcycle", class: "cheap", price: 4000, image: ASSETS_PATH + "transport_16.webp", name: "Scooter" },
        { id: "transport_17", category: "vehicle", type: "motorcycle", class: "cheap", price: 5000, image: ASSETS_PATH + "transport_17.webp", name: "Street Bike" },
        { id: "transport_18", category: "vehicle", type: "bicycle", class: "cheap", price: 500, image: ASSETS_PATH + "transport_18.webp", name: "Basic Bicycle" },
        { id: "transport_19", category: "vehicle", type: "bicycle", class: "cheap", price: 800, image: ASSETS_PATH + "transport_19.webp", name: "City Bike" },
        { id: "transport_20", category: "vehicle", type: "bicycle", class: "cheap", price: 1200, image: ASSETS_PATH + "transport_20.webp", name: "Mountain Bike" },

        // --------------------------------------------------------------------------
        // TIER 2: MIDDLE (transport_21 - transport_45) - Standard cars
        // --------------------------------------------------------------------------
        { id: "transport_21", category: "vehicle", type: "sedan", class: "middle", price: 18000, image: ASSETS_PATH + "transport_21.webp", name: "Modern Sedan" },
        { id: "transport_22", category: "vehicle", type: "sedan", class: "middle", price: 22000, image: ASSETS_PATH + "transport_22.webp", name: "Executive Sedan" },
        { id: "transport_23", category: "vehicle", type: "sedan", class: "middle", price: 26000, image: ASSETS_PATH + "transport_23.webp", name: "Sport Sedan" },
        { id: "transport_24", category: "vehicle", type: "sedan", class: "middle", price: 30000, image: ASSETS_PATH + "transport_24.webp", name: "Hybrid Sedan" },
        { id: "transport_25", category: "vehicle", type: "sedan", class: "middle", price: 35000, image: ASSETS_PATH + "transport_25.webp", name: "Premium Sedan" },
        { id: "transport_26", category: "vehicle", type: "suv", class: "middle", price: 28000, image: ASSETS_PATH + "transport_26.webp", name: "Compact SUV" },
        { id: "transport_27", category: "vehicle", type: "suv", class: "middle", price: 32000, image: ASSETS_PATH + "transport_27.webp", name: "Family SUV" },
        { id: "transport_28", category: "vehicle", type: "suv", class: "middle", price: 38000, image: ASSETS_PATH + "transport_28.webp", name: "Crossover SUV" },
        { id: "transport_29", category: "vehicle", type: "suv", class: "middle", price: 42000, image: ASSETS_PATH + "transport_29.webp", name: "Mid-Size SUV" },
        { id: "transport_30", category: "vehicle", type: "suv", class: "middle", price: 48000, image: ASSETS_PATH + "transport_30.webp", name: "Off-Road SUV" },
        { id: "transport_31", category: "vehicle", type: "wagon", class: "middle", price: 25000, image: ASSETS_PATH + "transport_31.webp", name: "Station Wagon" },
        { id: "transport_32", category: "vehicle", type: "wagon", class: "middle", price: 30000, image: ASSETS_PATH + "transport_32.webp", name: "Sport Wagon" },
        { id: "transport_33", category: "vehicle", type: "pickup", class: "middle", price: 35000, image: ASSETS_PATH + "transport_33.webp", name: "Modern Pickup" },
        { id: "transport_34", category: "vehicle", type: "pickup", class: "middle", price: 42000, image: ASSETS_PATH + "transport_34.webp", name: "Crew Cab Pickup" },
        { id: "transport_35", category: "vehicle", type: "van", class: "middle", price: 35000, image: ASSETS_PATH + "transport_35.webp", name: "Passenger Van" },
        { id: "transport_36", category: "vehicle", type: "van", class: "middle", price: 40000, image: ASSETS_PATH + "transport_36.webp", name: "Luxury Minivan" },
        { id: "transport_37", category: "vehicle", type: "ev", class: "middle", price: 35000, image: ASSETS_PATH + "transport_37.webp", name: "City EV" },
        { id: "transport_38", category: "vehicle", type: "ev", class: "middle", price: 42000, image: ASSETS_PATH + "transport_38.webp", name: "Compact EV" },
        { id: "transport_39", category: "vehicle", type: "ev", class: "middle", price: 48000, image: ASSETS_PATH + "transport_39.webp", name: "Standard EV" },
        { id: "transport_40", category: "vehicle", type: "motorcycle", class: "middle", price: 12000, image: ASSETS_PATH + "transport_40.webp", name: "Sport Motorcycle" },
        { id: "transport_41", category: "vehicle", type: "motorcycle", class: "middle", price: 15000, image: ASSETS_PATH + "transport_41.webp", name: "Touring Bike" },
        { id: "transport_42", category: "vehicle", type: "motorcycle", class: "middle", price: 18000, image: ASSETS_PATH + "transport_42.webp", name: "Adventure Bike" },
        { id: "transport_43", category: "vehicle", type: "coupe", class: "middle", price: 32000, image: ASSETS_PATH + "transport_43.webp", name: "Sport Coupe" },
        { id: "transport_44", category: "vehicle", type: "coupe", class: "middle", price: 38000, image: ASSETS_PATH + "transport_44.webp", name: "Muscle Coupe" },
        { id: "transport_45", category: "vehicle", type: "coupe", class: "middle", price: 45000, image: ASSETS_PATH + "transport_45.webp", name: "GT Coupe" },

        // --------------------------------------------------------------------------
        // TIER 3: PREMIUM (transport_46 - transport_70) - Luxury cars
        // --------------------------------------------------------------------------
        { id: "transport_46", category: "vehicle", type: "sedan", class: "premium", price: 55000, image: ASSETS_PATH + "transport_46.webp", name: "Luxury Sedan" },
        { id: "transport_47", category: "vehicle", type: "sedan", class: "premium", price: 65000, image: ASSETS_PATH + "transport_47.webp", name: "Executive Luxury" },
        { id: "transport_48", category: "vehicle", type: "sedan", class: "premium", price: 75000, image: ASSETS_PATH + "transport_48.webp", name: "Premium Executive" },
        { id: "transport_49", category: "vehicle", type: "sedan", class: "premium", price: 85000, image: ASSETS_PATH + "transport_49.webp", name: "S-Class Sedan" },
        { id: "transport_50", category: "vehicle", type: "sedan", class: "premium", price: 95000, image: ASSETS_PATH + "transport_50.webp", name: "Flagship Sedan" },
        { id: "transport_51", category: "vehicle", type: "suv", class: "premium", price: 60000, image: ASSETS_PATH + "transport_51.webp", name: "Luxury SUV" },
        { id: "transport_52", category: "vehicle", type: "suv", class: "premium", price: 75000, image: ASSETS_PATH + "transport_52.webp", name: "Premium SUV" },
        { id: "transport_53", category: "vehicle", type: "suv", class: "premium", price: 90000, image: ASSETS_PATH + "transport_53.webp", name: "Executive SUV" },
        { id: "transport_54", category: "vehicle", type: "suv", class: "premium", price: 105000, image: ASSETS_PATH + "transport_54.webp", name: "Full-Size Luxury SUV" },
        { id: "transport_55", category: "vehicle", type: "suv", class: "premium", price: 120000, image: ASSETS_PATH + "transport_55.webp", name: "Ultra Luxury SUV" },
        { id: "transport_56", category: "vehicle", type: "coupe", class: "premium", price: 70000, image: ASSETS_PATH + "transport_56.webp", name: "Luxury Coupe" },
        { id: "transport_57", category: "vehicle", type: "coupe", class: "premium", price: 85000, image: ASSETS_PATH + "transport_57.webp", name: "Grand Tourer" },
        { id: "transport_58", category: "vehicle", type: "coupe", class: "premium", price: 100000, image: ASSETS_PATH + "transport_58.webp", name: "Sports GT" },
        { id: "transport_59", category: "vehicle", type: "ev", class: "premium", price: 65000, image: ASSETS_PATH + "transport_59.webp", name: "Long-Range EV" },
        { id: "transport_60", category: "vehicle", type: "ev", class: "premium", price: 80000, image: ASSETS_PATH + "transport_60.webp", name: "Performance EV" },
        { id: "transport_61", category: "vehicle", type: "ev", class: "premium", price: 95000, image: ASSETS_PATH + "transport_61.webp", name: "Luxury EV Sedan" },
        { id: "transport_62", category: "vehicle", type: "ev", class: "premium", price: 110000, image: ASSETS_PATH + "transport_62.webp", name: "Premium EV SUV" },
        { id: "transport_63", category: "vehicle", type: "convertible", class: "premium", price: 75000, image: ASSETS_PATH + "transport_63.webp", name: "Luxury Convertible" },
        { id: "transport_64", category: "vehicle", type: "convertible", class: "premium", price: 90000, image: ASSETS_PATH + "transport_64.webp", name: "Sports Roadster" },
        { id: "transport_65", category: "vehicle", type: "motorcycle", class: "premium", price: 25000, image: ASSETS_PATH + "transport_65.webp", name: "Premium Cruiser" },
        { id: "transport_66", category: "vehicle", type: "motorcycle", class: "premium", price: 35000, image: ASSETS_PATH + "transport_66.webp", name: "Superbike" },
        { id: "transport_67", category: "vehicle", type: "pickup", class: "premium", price: 65000, image: ASSETS_PATH + "transport_67.webp", name: "Luxury Pickup" },
        { id: "transport_68", category: "vehicle", type: "pickup", class: "premium", price: 80000, image: ASSETS_PATH + "transport_68.webp", name: "Premium Truck" },
        { id: "transport_69", category: "vehicle", type: "van", class: "premium", price: 70000, image: ASSETS_PATH + "transport_69.webp", name: "Executive Van" },
        { id: "transport_70", category: "vehicle", type: "van", class: "premium", price: 85000, image: ASSETS_PATH + "transport_70.webp", name: "VIP Shuttle" },

        // --------------------------------------------------------------------------
        // TIER 4: RICH (transport_71 - transport_99) - Exotic & Supercars
        // --------------------------------------------------------------------------
        { id: "transport_71", category: "vehicle", type: "sport", class: "rich", price: 150000, image: ASSETS_PATH + "transport_71.webp", name: "Entry Supercar" },
        { id: "transport_72", category: "vehicle", type: "sport", class: "rich", price: 200000, image: ASSETS_PATH + "transport_72.webp", name: "Italian Sports Car" },
        { id: "transport_73", category: "vehicle", type: "sport", class: "rich", price: 250000, image: ASSETS_PATH + "transport_73.webp", name: "German Super GT" },
        { id: "transport_74", category: "vehicle", type: "sport", class: "rich", price: 300000, image: ASSETS_PATH + "transport_74.webp", name: "British Supercar" },
        { id: "transport_75", category: "vehicle", type: "sport", class: "rich", price: 350000, image: ASSETS_PATH + "transport_75.webp", name: "Hypercar Entry" },
        { id: "transport_76", category: "vehicle", type: "sport", class: "rich", price: 450000, image: ASSETS_PATH + "transport_76.webp", name: "Track-Ready Supercar" },
        { id: "transport_77", category: "vehicle", type: "sport", class: "rich", price: 550000, image: ASSETS_PATH + "transport_77.webp", name: "Limited Edition" },
        { id: "transport_78", category: "vehicle", type: "sport", class: "rich", price: 700000, image: ASSETS_PATH + "transport_78.webp", name: "Hypercar" },
        { id: "transport_79", category: "vehicle", type: "sport", class: "rich", price: 900000, image: ASSETS_PATH + "transport_79.webp", name: "Ultra Hypercar" },
        { id: "transport_80", category: "vehicle", type: "sport", class: "rich", price: 1200000, image: ASSETS_PATH + "transport_80.webp", name: "One-of-One Hypercar" },
        { id: "transport_81", category: "vehicle", type: "sport", class: "rich", price: 1500000, image: ASSETS_PATH + "transport_81.webp", name: "Bespoke Supercar" },
        { id: "transport_82", category: "vehicle", type: "sport", class: "rich", price: 2000000, image: ASSETS_PATH + "transport_82.webp", name: "Collector's Hypercar" },
        { id: "transport_83", category: "vehicle", type: "convertible", class: "rich", price: 200000, image: ASSETS_PATH + "transport_83.webp", name: "Exotic Roadster" },
        { id: "transport_84", category: "vehicle", type: "convertible", class: "rich", price: 350000, image: ASSETS_PATH + "transport_84.webp", name: "Super Convertible" },
        { id: "transport_85", category: "vehicle", type: "sedan", class: "rich", price: 180000, image: ASSETS_PATH + "transport_85.webp", name: "Ultra Luxury Sedan" },
        { id: "transport_86", category: "vehicle", type: "sedan", class: "rich", price: 250000, image: ASSETS_PATH + "transport_86.webp", name: "Armored Limousine" },
        { id: "transport_87", category: "vehicle", type: "sedan", class: "rich", price: 350000, image: ASSETS_PATH + "transport_87.webp", name: "Royal Limousine" },
        { id: "transport_88", category: "vehicle", type: "suv", class: "rich", price: 180000, image: ASSETS_PATH + "transport_88.webp", name: "Super SUV" },
        { id: "transport_89", category: "vehicle", type: "suv", class: "rich", price: 250000, image: ASSETS_PATH + "transport_89.webp", name: "Armored SUV" },
        { id: "transport_90", category: "vehicle", type: "suv", class: "rich", price: 400000, image: ASSETS_PATH + "transport_90.webp", name: "Luxury Tank" },
        { id: "transport_91", category: "vehicle", type: "ev", class: "rich", price: 150000, image: ASSETS_PATH + "transport_91.webp", name: "Electric Supercar" },
        { id: "transport_92", category: "vehicle", type: "ev", class: "rich", price: 250000, image: ASSETS_PATH + "transport_92.webp", name: "Electric Hypercar" },
        { id: "transport_93", category: "vehicle", type: "ev", class: "rich", price: 400000, image: ASSETS_PATH + "transport_93.webp", name: "Future Concept EV" },
        { id: "transport_94", category: "vehicle", type: "motorcycle", class: "rich", price: 50000, image: ASSETS_PATH + "transport_94.webp", name: "Exotic Superbike" },
        { id: "transport_95", category: "vehicle", type: "motorcycle", class: "rich", price: 80000, image: ASSETS_PATH + "transport_95.webp", name: "Limited Edition Bike" },
        { id: "transport_96", category: "vehicle", type: "boat", class: "rich", price: 200000, image: ASSETS_PATH + "transport_96.webp", name: "Speed Boat" },
        { id: "transport_97", category: "vehicle", type: "boat", class: "rich", price: 500000, image: ASSETS_PATH + "transport_97.webp", name: "Luxury Yacht" },
        { id: "transport_98", category: "vehicle", type: "aircraft", class: "rich", price: 1000000, image: ASSETS_PATH + "transport_98.webp", name: "Private Helicopter" },
        { id: "transport_99", category: "vehicle", type: "aircraft", class: "rich", price: 5000000, image: ASSETS_PATH + "transport_99.webp", name: "Private Jet" }
    ];

    // Helper function to get vehicle by ID
    function getVehicleById(id) {
        if (!id) return null;
        return VEHICLES.find(v => v.id === id) || null;
    }

    // Helper to get random vehicle by filter
    function getRandomVehicle(filterFn) {
        const candidates = filterFn ? VEHICLES.filter(filterFn) : VEHICLES;
        if (candidates.length === 0) return null;
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    // Get vehicles by class
    function getVehiclesByClass(vehicleClass) {
        return VEHICLES.filter(v => v.class === vehicleClass);
    }

    // Get vehicles by type
    function getVehiclesByType(type) {
        return VEHICLES.filter(v => v.type === type);
    }

    // Export
    Alive.Assets.VEHICLES = VEHICLES;
    Alive.Assets.getVehicleById = getVehicleById;
    Alive.Assets.getRandomVehicle = getRandomVehicle;
    Alive.Assets.getVehiclesByClass = getVehiclesByClass;
    Alive.Assets.getVehiclesByType = getVehiclesByType;

})(window);
