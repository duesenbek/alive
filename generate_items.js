const fs = require('fs');
const OUTPUT_PATH = 'js/data/items.json';

const items = [
    // ----------------------------------------------------------------------
    // CONSUMABLES (Health, Energy, Stress Relief)
    // ----------------------------------------------------------------------
    {
        id: "coffee",
        name: { en: "Espresso Shot", ru: "Эспрессо" },
        type: "consumable",
        price: 5,
        icon: "☕",
        effects: { energy: 10, stress: -5 }
    },
    {
        id: "burger",
        name: { en: "Cheeseburger", ru: "Чизбургер" },
        type: "consumable",
        price: 15,
        icon: "🍔",
        effects: { health: -1, happiness: 5, energy: 20 }
    },
    {
        id: "salad",
        name: { en: "Green Salad", ru: "Зеленый салат" },
        type: "consumable",
        price: 25,
        icon: "🥗",
        effects: { health: 2, energy: 10 }
    },
    {
        id: "medicine",
        name: { en: "Cold Medicine", ru: "Лекарство" },
        type: "consumable",
        price: 50,
        icon: "💊",
        effects: { health: 15 }
    },
    {
        id: "vacation_ticket",
        name: { en: "Weekend Trip", ru: "Поездка на выходные" },
        type: "consumable",
        price: 500,
        icon: "✈️",
        effects: { stress: -30, happiness: 20 }
    },

    // ----------------------------------------------------------------------
    // GADGETS (Skill Boosts / Efficiency)
    // ----------------------------------------------------------------------
    {
        id: "smartphone",
        name: { en: "Pro Smartphone", ru: "Смартфон Pro" },
        type: "gadget",
        price: 1200,
        icon: "📱",
        effects: { social: 5, happiness: 10 },
        description: "Stay connected."
    },
    {
        id: "laptop",
        name: { en: "Ultrabook", ru: "Ультрабук" },
        type: "gadget",
        price: 2000,
        icon: "💻",
        effects: { intelligence: 5, business: 5 },
        description: "Essential for work."
    },
    {
        id: "fitness_watch",
        name: { en: "Fitness Tracker", ru: "Фитнес-браслет" },
        type: "gadget",
        price: 300,
        icon: "⌚",
        effects: { health: 2 }, // Passive per year if equipped? Simplified for now as one-time stats
        description: "Counts your steps."
    },

    // ----------------------------------------------------------------------
    // LUXURY (Prestige / Happiness / Money Sink)
    // ----------------------------------------------------------------------
    {
        id: "watch_gold",
        name: { en: "Gold Watch", ru: "Золотые часы" },
        type: "luxury",
        price: 15000,
        icon: "🕰️",
        effects: { prestige: 10, happiness: 5 },
        description: "A symbol of success."
    },
    {
        id: "handbag",
        name: { en: "Designer Bag", ru: "Дизайнерская сумка" },
        type: "luxury",
        price: 5000,
        icon: "👜",
        effects: { prestige: 5, happiness: 10 },
        description: "Very chic."
    },
    {
        id: "jewelry",
        name: { en: "Diamond Ring", ru: "Бриллиантовое кольцо" },
        type: "luxury",
        price: 50000,
        icon: "💍",
        effects: { prestige: 25, happiness: 20 },
        description: "Forever."
    },

    // ----------------------------------------------------------------------
    // BOOKS / EDUCATION (Skill Grinding)
    // ----------------------------------------------------------------------
    {
        id: "book_biz",
        name: { en: "Business 101", ru: "Бизнес 101" },
        type: "education",
        price: 30,
        icon: "📘",
        effects: { business: 2 }
    },
    {
        id: "book_code",
        name: { en: "Coding for Dummies", ru: "Кодинг для чайников" },
        type: "education",
        price: 40,
        icon: "💻",
        effects: { intelligence: 3 }
    }
];

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(items, null, 2));
console.log(`Generated ${items.length} items in ${OUTPUT_PATH}`);
