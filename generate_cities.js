const fs = require('fs');

// Configuration
const TOTAL_CITIES = 72;

// Tiers Progression (0-72 distribution)
// 1-12: Small Towns (Low cost, low jobs)
// 13-24: Medium Towns
// 25-48: Cities (High cost, good jobs)
// 49-60: Metropolises (Very high cost, high crime)
// 61-72: Mega Cities / Global Capitals (Elite)

const TIERS = [
    { range: [1, 12], type: "Small Town", scale: "small", costMult: 0.8, jobs: "low", crime: "low", unlock: 0 },
    { range: [13, 24], type: "Regional Hub", scale: "medium", costMult: 1.0, jobs: "medium", crime: "medium", unlock: 5000 },
    { range: [25, 48], type: "Major City", scale: "large", costMult: 1.2, jobs: "high", crime: "medium", unlock: 20000 },
    { range: [49, 60], type: "Metropolis", scale: "huge", costMult: 1.5, jobs: "very_high", crime: "high", unlock: 100000 },
    { range: [61, 72], type: "Global Capital", scale: "mega", costMult: 2.5, jobs: "elite", crime: "high", unlock: 1000000 }
];

const PREFIXES = ["New", "Saint", "Fort", "Port", "Mount", "Lake", "Grand", "Little", "North", "South"];
const ROOTS = ["River", "Oak", "Spring", "Stone", "Iron", "Gold", "Silver", "Pine", "Maple", "Cedar", "Ocean", "Sky", "Star", "Sun", "Moon"];
const SUFFIXES = ["ton", "ville", "burg", "ford", "mouth", "haven", "city", "dale", "wood", "side", "view", "port"];

function generateName(id) {
    const p = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const r = ROOTS[Math.floor(Math.random() * ROOTS.length)];
    const s = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    return Math.random() > 0.5 ? `${p} ${r}${s}` : `${r}${s}`;
}

const cities = [];

for (let i = 1; i <= TOTAL_CITIES; i++) {
    // Find Tier
    const tier = TIERS.find(t => i >= t.range[0] && i <= t.range[1]);

    cities.push({
        id: `city_${i}`,
        name: generateName(i),
        type: tier.type,
        scale: tier.scale,
        populationEstimate: Math.floor(10000 * Math.pow(1.5, i / 3)), // Exponential growth
        costOfLivingMultiplier: tier.costMult + (Math.random() * 0.2 - 0.1),
        jobAvailability: tier.jobs,
        crimeRisk: tier.crime,
        unlockRequirements: {
            money: tier.unlock,
            // Late game cities might require education/intelligence?
            intelligence: tier.unlock > 50000 ? 50 : 0
        }
    });
}

fs.writeFileSync('js/data/cities.json', JSON.stringify(cities, null, 2));
console.log(`Generated ${cities.length} cities.`);
