/**
 * Buildings Assets Config
 * Defines all building assets, their types, classes, and visual paths.
 * UPDATED: Uses building_X.webp assets from assets/buildings/
 */
(function (global) {
    const Alive = (global.Alive = global.Alive || {});
    Alive.Assets = Alive.Assets || {};

    // Define the base path for assets
    const ASSETS_PATH = "assets/buildings/";

    // Master list of all building assets (63 total)
    // Organized by class tiers based on price
    const BUILDINGS = [
        // --------------------------------------------------------------------------
        // TIER 1: POOR (building_1 - building_12) - Basic housing
        // --------------------------------------------------------------------------
        { id: "building_1", category: "residential", class: "poor", price: 15000, image: ASSETS_PATH + "building_1.webp", description: "Old Shack" },
        { id: "building_2", category: "residential", class: "poor", price: 20000, image: ASSETS_PATH + "building_2.webp", description: "Rundown Apartment" },
        { id: "building_3", category: "residential", class: "poor", price: 25000, image: ASSETS_PATH + "building_3.webp", description: "Small Flat" },
        { id: "building_4", category: "residential", class: "poor", price: 30000, image: ASSETS_PATH + "building_4.webp", description: "Basic Studio" },
        { id: "building_5", category: "residential", class: "poor", price: 35000, image: ASSETS_PATH + "building_5.webp", description: "Cramped Unit" },
        { id: "building_6", category: "residential", class: "poor", price: 40000, image: ASSETS_PATH + "building_6.webp", description: "Social Housing" },
        { id: "building_7", category: "residential", class: "poor", price: 45000, image: ASSETS_PATH + "building_7.webp", description: "Worker's Flat" },
        { id: "building_8", category: "residential", class: "poor", price: 50000, image: ASSETS_PATH + "building_8.webp", description: "Budget Apartment" },
        { id: "building_9", category: "residential", class: "poor", price: 55000, image: ASSETS_PATH + "building_9.webp", description: "Low-Cost Housing" },
        { id: "building_10", category: "residential", class: "poor", price: 60000, image: ASSETS_PATH + "building_10.webp", description: "Starter Home" },
        { id: "building_11", category: "residential", class: "poor", price: 65000, image: ASSETS_PATH + "building_11.webp", description: "Economy House" },
        { id: "building_12", category: "residential", class: "poor", price: 70000, image: ASSETS_PATH + "building_12.webp", description: "Basic Cottage" },

        // --------------------------------------------------------------------------
        // TIER 2: MIDDLE (building_13 - building_30) - Standard housing
        // --------------------------------------------------------------------------
        { id: "building_13", category: "residential", class: "middle", price: 90000, image: ASSETS_PATH + "building_13.webp", description: "Cozy Apartment" },
        { id: "building_14", category: "residential", class: "middle", price: 110000, image: ASSETS_PATH + "building_14.webp", description: "Family Condo" },
        { id: "building_15", category: "residential", class: "middle", price: 130000, image: ASSETS_PATH + "building_15.webp", description: "Modern Flat" },
        { id: "building_16", category: "residential", class: "middle", price: 150000, image: ASSETS_PATH + "building_16.webp", description: "Suburban Home" },
        { id: "building_17", category: "residential", class: "middle", price: 170000, image: ASSETS_PATH + "building_17.webp", description: "Townhouse" },
        { id: "building_18", category: "residential", class: "middle", price: 190000, image: ASSETS_PATH + "building_18.webp", description: "City Apartment" },
        { id: "building_19", category: "residential", class: "middle", price: 210000, image: ASSETS_PATH + "building_19.webp", description: "Nice Condo" },
        { id: "building_20", category: "residential", class: "middle", price: 230000, image: ASSETS_PATH + "building_20.webp", description: "Garden House" },
        { id: "building_21", category: "residential", class: "middle", price: 250000, image: ASSETS_PATH + "building_21.webp", description: "Family Home" },
        { id: "building_22", category: "residential", class: "middle", price: 280000, image: ASSETS_PATH + "building_22.webp", description: "Spacious Flat" },
        { id: "building_23", category: "residential", class: "middle", price: 310000, image: ASSETS_PATH + "building_23.webp", description: "Modern House" },
        { id: "building_24", category: "residential", class: "middle", price: 340000, image: ASSETS_PATH + "building_24.webp", description: "Premium Condo" },
        { id: "building_25", category: "residential", class: "middle", price: 370000, image: ASSETS_PATH + "building_25.webp", description: "Executive Apartment" },
        { id: "building_26", category: "residential", class: "middle", price: 400000, image: ASSETS_PATH + "building_26.webp", description: "Large Family Home" },
        { id: "building_27", category: "residential", class: "middle", price: 430000, image: ASSETS_PATH + "building_27.webp", description: "Upscale Townhouse" },
        { id: "building_28", category: "residential", class: "middle", price: 460000, image: ASSETS_PATH + "building_28.webp", description: "Designer Loft" },
        { id: "building_29", category: "residential", class: "middle", price: 490000, image: ASSETS_PATH + "building_29.webp", description: "Luxury Condo" },
        { id: "building_30", category: "residential", class: "middle", price: 520000, image: ASSETS_PATH + "building_30.webp", description: "Penthouse Starter" },

        // --------------------------------------------------------------------------
        // TIER 3: RICH (building_31 - building_50) - Luxury housing
        // --------------------------------------------------------------------------
        { id: "building_31", category: "residential", class: "rich", price: 600000, image: ASSETS_PATH + "building_31.webp", description: "Luxury Apartment" },
        { id: "building_32", category: "residential", class: "rich", price: 750000, image: ASSETS_PATH + "building_32.webp", description: "Executive Suite" },
        { id: "building_33", category: "residential", class: "rich", price: 900000, image: ASSETS_PATH + "building_33.webp", description: "Designer Penthouse" },
        { id: "building_34", category: "residential", class: "rich", price: 1100000, image: ASSETS_PATH + "building_34.webp", description: "Modern Villa" },
        { id: "building_35", category: "residential", class: "rich", price: 1300000, image: ASSETS_PATH + "building_35.webp", description: "Riverside Mansion" },
        { id: "building_36", category: "residential", class: "rich", price: 1600000, image: ASSETS_PATH + "building_36.webp", description: "Hilltop Estate" },
        { id: "building_37", category: "residential", class: "rich", price: 2000000, image: ASSETS_PATH + "building_37.webp", description: "Luxury Estate" },
        { id: "building_38", category: "residential", class: "rich", price: 2500000, image: ASSETS_PATH + "building_38.webp", description: "Mansion" },
        { id: "building_39", category: "residential", class: "rich", price: 3000000, image: ASSETS_PATH + "building_39.webp", description: "Grand Manor" },
        { id: "building_40", category: "residential", class: "rich", price: 4000000, image: ASSETS_PATH + "building_40.webp", description: "Oceanfront Villa" },
        { id: "building_41", category: "residential", class: "rich", price: 5000000, image: ASSETS_PATH + "building_41.webp", description: "Celebrity Mansion" },
        { id: "building_42", category: "residential", class: "rich", price: 6500000, image: ASSETS_PATH + "building_42.webp", description: "Mega Mansion" },
        { id: "building_43", category: "residential", class: "rich", price: 8000000, image: ASSETS_PATH + "building_43.webp", description: "Sky Penthouse" },
        { id: "building_44", category: "residential", class: "rich", price: 10000000, image: ASSETS_PATH + "building_44.webp", description: "Private Island House" },
        { id: "building_45", category: "residential", class: "rich", price: 15000000, image: ASSETS_PATH + "building_45.webp", description: "Royal Estate" },
        { id: "building_46", category: "residential", class: "rich", price: 20000000, image: ASSETS_PATH + "building_46.webp", description: "Billionaire Compound" },
        { id: "building_47", category: "residential", class: "rich", price: 30000000, image: ASSETS_PATH + "building_47.webp", description: "Historic Castle" },
        { id: "building_48", category: "residential", class: "rich", price: 50000000, image: ASSETS_PATH + "building_48.webp", description: "Palace" },
        { id: "building_49", category: "residential", class: "rich", price: 75000000, image: ASSETS_PATH + "building_49.webp", description: "Ultra Mansion" },
        { id: "building_50", category: "residential", class: "rich", price: 100000000, image: ASSETS_PATH + "building_50.webp", description: "World's Most Expensive Home" },

        // --------------------------------------------------------------------------
        // COMMERCIAL & SPECIAL (building_51 - building_63)
        // --------------------------------------------------------------------------
        { id: "building_51", category: "commercial", class: "standard", price: 200000, image: ASSETS_PATH + "building_51.webp", description: "Small Shop" },
        { id: "building_52", category: "commercial", class: "standard", price: 350000, image: ASSETS_PATH + "building_52.webp", description: "Restaurant" },
        { id: "building_53", category: "commercial", class: "standard", price: 500000, image: ASSETS_PATH + "building_53.webp", description: "Office Building" },
        { id: "building_54", category: "commercial", class: "premium", price: 1000000, image: ASSETS_PATH + "building_54.webp", description: "Shopping Center" },
        { id: "building_55", category: "commercial", class: "premium", price: 2500000, image: ASSETS_PATH + "building_55.webp", description: "Hotel" },
        { id: "building_56", category: "commercial", class: "luxury", price: 8000000, image: ASSETS_PATH + "building_56.webp", description: "Skyscraper" },
        { id: "building_57", category: "special", class: "landmark", price: 500000, image: ASSETS_PATH + "building_57.webp", description: "Art Gallery" },
        { id: "building_58", category: "special", class: "landmark", price: 1000000, image: ASSETS_PATH + "building_58.webp", description: "Museum" },
        { id: "building_59", category: "special", class: "landmark", price: 2000000, image: ASSETS_PATH + "building_59.webp", description: "Sports Stadium" },
        { id: "building_60", category: "special", class: "landmark", price: 5000000, image: ASSETS_PATH + "building_60.webp", description: "Concert Hall" },
        { id: "building_61", category: "special", class: "landmark", price: 10000000, image: ASSETS_PATH + "building_61.webp", description: "Casino" },
        { id: "building_62", category: "special", class: "landmark", price: 25000000, image: ASSETS_PATH + "building_62.webp", description: "Theme Park" },
        { id: "building_63", category: "special", class: "landmark", price: 50000000, image: ASSETS_PATH + "building_63.webp", description: "Private Airport" }
    ];

    // Helper function to get building by ID
    function getBuildingById(id) {
        if (!id) return null;
        return BUILDINGS.find(b => b.id === id) || null;
    }

    // Helper to get random building by filter
    function getRandomBuilding(filterFn) {
        const candidates = filterFn ? BUILDINGS.filter(filterFn) : BUILDINGS;
        if (candidates.length === 0) return null;
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    // Get buildings by class
    function getBuildingsByClass(buildingClass) {
        return BUILDINGS.filter(b => b.class === buildingClass);
    }

    // Get buildings by category
    function getBuildingsByCategory(category) {
        return BUILDINGS.filter(b => b.category === category);
    }

    // Export
    Alive.Assets.BUILDINGS = BUILDINGS;
    Alive.Assets.getBuildingById = getBuildingById;
    Alive.Assets.getRandomBuilding = getRandomBuilding;
    Alive.Assets.getBuildingsByClass = getBuildingsByClass;
    Alive.Assets.getBuildingsByCategory = getBuildingsByCategory;

})(window);


