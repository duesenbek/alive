const fs = require('fs');
const path = require('path');

const actionsFile = path.join(__dirname, 'actions.js');
let content = fs.readFileSync(actionsFile, 'utf8');

if (!content.includes('id: "change_diet_organic"')) {
    const dietActions = `
    },
    // =========================================================================
    // LIFESTYLE & DIET 
    // =========================================================================
    {
      id: "change_diet_organic",
      title: { en: "Switch to Organic Diet", ru: "Перейти на органическую диету" },
      description: { en: "Eat exclusively healthy, organic foods.", ru: "Питаться исключительно здоровой пищей. Очень дорого." },
      type: "lifestyle",
      cost: 0,
      energyCost: 0,
      availableWhen: (player) => player.age >= 18 && player.diet !== "organic",
      effect: (player) => {
        player.diet = "organic";
      }
    },
    {
      id: "change_diet_balanced",
      title: { en: "Switch to Balanced Diet", ru: "Сбалансированная диета" },
      description: { en: "Eat a normal, balanced diet.", ru: "Питаться нормально. Средняя цена." },
      type: "lifestyle",
      cost: 0,
      energyCost: 0,
      availableWhen: (player) => player.age >= 18 && player.diet !== "balanced",
      effect: (player) => {
        player.diet = "balanced";
      }
    },
    {
      id: "change_diet_junk",
      title: { en: "Switch to Junk Food", ru: "Питаться фастфудом" },
      description: { en: "Eat cheap junk food to save money.", ru: "Питаться дешевой едой для экономии. Вредит здоровью." },
      type: "lifestyle",
      cost: 0,
      energyCost: 0,
      availableWhen: (player) => player.age >= 18 && player.diet !== "junk_food",
      effect: (player) => {
        player.diet = "junk_food";
      }
    }
  ];`;

    // Replace the end of the array to inject the new actions
    content = content.replace(/\s*}\n\s*\];\n+\s*function getAction\(id\)/, dietActions + '\n\n  function getAction(id)');

    fs.writeFileSync(actionsFile, content, 'utf8');
    console.log("Successfully injected diet actions into actions.js");
} else {
    console.log("Diet actions already injected!");
}
