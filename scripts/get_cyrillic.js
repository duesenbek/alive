const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, "..");
const JS_DIR = path.join(ROOT, "js");
const CYRILLIC_RE = /[\u0400-\u04FF]/;
const ALLOWED_CYRILLIC = [path.join("js", "assets", "strings", "ru.json")].map((p) => path.resolve(ROOT, p));

const results = [];

function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
            scan(fullPath);
        } else if (entry.name.endsWith(".js") || entry.name.endsWith(".json")) {
            checkFile(fullPath);
        }
    }
}

function checkFile(filePath) {
    if (ALLOWED_CYRILLIC.includes(path.resolve(filePath))) return;

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const rel = path.relative(ROOT, filePath);

    let fileResults = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('\uFFFD')) {
            fileResults.push({ line: i + 1, text: 'BROKEN_ENCODING' });
        } else if (CYRILLIC_RE.test(line)) {
            const trimmed = line.trim();
            if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) continue;
            fileResults.push({ line: i + 1, text: trimmed });
        }
    }
    if (fileResults.length > 0) {
        results.push({ file: rel, issues: fileResults });
    }
}

scan(JS_DIR);
fs.writeFileSync('cyrillic_issues.json', JSON.stringify(results, null, 2));
console.log('Done mapping issues to cyrillic_issues.json');
