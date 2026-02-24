const fs = require('fs');
// Create js/data if not exists
if (!fs.existsSync('js/data')) {
    fs.mkdirSync('js/data', { recursive: true });
}

let en = fs.readFileSync('js/assets/strings/en.json', 'utf8');
let ru = fs.readFileSync('js/assets/strings/ru.json', 'utf8');

// Simple validation
JSON.parse(en);
JSON.parse(ru);

const jsContent = `(function(global) {
  global.Alive = global.Alive || {};
  global.Alive.strings = {
    en: ${en},
    ru: ${ru}
  };
})(window);`;

fs.writeFileSync('js/data/strings.js', jsContent);
console.log('Created js/data/strings.js');
