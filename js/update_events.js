const fs = require('fs');
let events = JSON.parse(fs.readFileSync('c:/Users/Bekzat/Desktop/alive/js/data/events.json', 'utf8'));

const careerEvents = [
    {
        "id": "career_fastfood_manager",
        "tag": "career",
        "description": "event.career.promotion.desc",
        "titleKey": "event.career.promotion.title",
        "rarity": "special",
        "minAge": 18,
        "maxAge": 100,
        "choices": [
            {
                "text": "Accept the Promotion (Stress +20, Money +1000, New Title)",
                "statChanges": { "stress": 20, "money": 1000 },
                "effects": { "jobChange": "fastFoodManager" }
            },
            {
                "text": "Decline the role.",
                "statChanges": {}
            }
        ]
    },
    {
        "id": "career_retail_manager",
        "tag": "career",
        "description": "event.career.promotion.desc",
        "titleKey": "event.career.promotion.title",
        "rarity": "special",
        "minAge": 18,
        "maxAge": 100,
        "choices": [
            {
                "text": "Accept the Promotion (Stress +20, Money +1500, New Title)",
                "statChanges": { "stress": 20, "money": 1500 },
                "effects": { "jobChange": "retailManager" }
            },
            {
                "text": "Decline the role.",
                "statChanges": {}
            }
        ]
    },
    {
        "id": "career_middle_management",
        "tag": "career",
        "description": "event.career.promotion.desc",
        "titleKey": "event.career.promotion.title",
        "rarity": "special",
        "minAge": 18,
        "maxAge": 100,
        "choices": [
            {
                "text": "Accept the Promotion (Stress +30, Money +4000, New Title)",
                "statChanges": { "stress": 30, "money": 4000 },
                "effects": { "jobChange": "middleManager" }
            },
            {
                "text": "Decline the role.",
                "statChanges": {}
            }
        ]
    },
    {
        "id": "career_principal",
        "tag": "career",
        "description": "event.career.promotion.desc",
        "titleKey": "event.career.promotion.title",
        "rarity": "special",
        "minAge": 18,
        "maxAge": 100,
        "choices": [
            {
                "text": "Accept the Promotion (Stress +20, Money +5000, New Title)",
                "statChanges": { "stress": 20, "money": 5000 },
                "effects": { "jobChange": "principal" }
            },
            {
                "text": "Decline the role.",
                "statChanges": {}
            }
        ]
    },
    {
        "id": "career_shop_owner",
        "tag": "career",
        "description": "event.career.promotion.desc",
        "titleKey": "event.career.promotion.title",
        "rarity": "special",
        "minAge": 18,
        "maxAge": 100,
        "choices": [
            {
                "text": "Take over the shop (Stress +35, Money +5000, New Title)",
                "statChanges": { "stress": 35, "money": 5000 },
                "effects": { "jobChange": "shopOwner" }
            },
            {
                "text": "Decline the risk.",
                "statChanges": {}
            }
        ]
    },
    {
        "id": "career_senior_dev",
        "tag": "career",
        "description": "event.career.promotion.desc",
        "titleKey": "event.career.promotion.title",
        "rarity": "special",
        "minAge": 18,
        "maxAge": 100,
        "choices": [
            {
                "text": "Accept the Promotion (Stress +25, Money +10000, New Title)",
                "statChanges": { "stress": 25, "money": 10000 },
                "effects": { "jobChange": "seniorDev" }
            },
            {
                "text": "Decline the role.",
                "statChanges": {}
            }
        ]
    },
    {
        "id": "career_partner",
        "tag": "career",
        "description": "event.career.promotion.desc",
        "titleKey": "event.career.promotion.title",
        "rarity": "special",
        "minAge": 18,
        "maxAge": 100,
        "choices": [
            {
                "text": "Accept the Partnership (Stress +10, Money +25000, New Title)",
                "statChanges": { "stress": 10, "money": 25000 },
                "effects": { "jobChange": "partnerLawyer" }
            },
            {
                "text": "Decline the role.",
                "statChanges": {}
            }
        ]
    },
    {
        "id": "career_burnout",
        "tag": "career",
        "description": "event.career.burnout.desc",
        "titleKey": "event.career.burnout.title",
        "rarity": "special",
        "minAge": 18,
        "maxAge": 100,
        "choices": [
            {
                "text": "Take unpaid leave (Money -10000, Health +20, Stress -50)",
                "statChanges": { "health": 20, "stress": -50, "money": -10000 }
            },
            {
                "text": "Push through (Health -30, Stress +20)",
                "statChanges": { "health": -30, "stress": 20 }
            }
        ]
    },
    {
        "id": "career_fired",
        "tag": "career",
        "description": "event.career.fired.desc",
        "titleKey": "event.career.fired.title",
        "rarity": "special",
        "minAge": 18,
        "maxAge": 100,
        "choices": [
            {
                "text": "Pack your things. (Happiness -20, Stress +40)",
                "statChanges": { "happiness": -20, "stress": 40 },
                "effects": { "jobChange": "unemployed" }
            }
        ]
    }
];

// Append missing events
for (const ev of careerEvents) {
    if (!events.find(e => e.id === ev.id)) {
        events.push(ev);
    }
}

fs.writeFileSync('c:/Users/Bekzat/Desktop/alive/js/data/events.json', JSON.stringify(events, null, 4), 'utf8');
console.log('Successfully updated events.json');
