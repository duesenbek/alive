const fs = require('fs');
const files = ['js/assets/strings/en.json', 'js/assets/strings/ru.json'];
files.forEach(f => {
    try {
        const content = fs.readFileSync(f, 'utf8');
        JSON.parse(content);
        console.log(f + ' OK');
    } catch (e) {
        console.log(f + ' ERROR: ' + e.message);
        // Print context
        const match = e.message.match(/at position (\d+)/);
        if (match) {
            const pos = parseInt(match[1]);
            const content = fs.readFileSync(f, 'utf8');
            const start = Math.max(0, pos - 50);
            const end = Math.min(content.length, pos + 50);
            console.log('Context:', content.substring(start, end));
        }
    }
});
