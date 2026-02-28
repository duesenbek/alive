const fs = require('fs');
const path = require('path');

const filesToFix = [
    'js/achievements.js',
    'js/actions.js',
    'js/selfdevelopment.js'
].map(f => path.join(__dirname, '..', f));

// simple generic icon map to provide variety instead of same emoji everywhere
const iconMap = [
    '⭐', '🏆', '🎯', '🚀', '🌟', '🏅', '🎉', '🔥', '✨', '💡',
    '💪', '💼', '📈', '🎭', '🤝', '🎓', '🏥', '🛠️', '🚗', '🏠'
];

let replacedCount = 0;

filesToFix.forEach(file => {
    if (!fs.existsSync(file)) {
        console.log(`File not found: ${file}`);
        return;
    }

    let content = fs.readFileSync(file, 'utf8');

    // Replace occurrences of icon: "??" or "???" or "?????" with a random neat emoji
    // We'll use a regex that looks for icon: "..." where ... is mostly ?s

    content = content.replace(/icon:\s*"\?+"/g, (match) => {
        replacedCount++;
        const randomIcon = iconMap[Math.floor(Math.random() * iconMap.length)];
        return `icon: "${randomIcon}"`;
    });

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Processed ${path.basename(file)}`);
});

console.log(`Done! Replaced ${replacedCount} placeholder icons.`);
