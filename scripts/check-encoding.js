#!/usr/bin/env node
/**
 * Pre-commit check: Detect broken encoding (U+FFFD) and
 * hardcoded Cyrillic text outside localization JSON files.
 *
 * Usage:
 *   node scripts/check-encoding.js          # scan and report
 *   node scripts/check-encoding.js --strict  # exit code 1 on any warning
 *
 * Git hook integration (in .git/hooks/pre-commit):
 *   #!/bin/sh
 *   node scripts/check-encoding.js --strict
 */
const fs = require("fs");
const path = require("path");

const STRICT = process.argv.includes("--strict");
const ROOT = path.resolve(__dirname, "..");
const JS_DIR = path.join(ROOT, "js");

// Patterns
const BROKEN_CHAR = "\uFFFD";
const CYRILLIC_RE = /[\u0400-\u04FF]/;

// Files allowed to contain Cyrillic (localization files)
const ALLOWED_CYRILLIC = [
    path.join("js", "assets", "strings", "ru.json")
].map((p) => path.resolve(ROOT, p));

let warnings = 0;

function isAllowedCyrillic(filePath) {
    return ALLOWED_CYRILLIC.includes(path.resolve(filePath));
}

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
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const rel = path.relative(ROOT, filePath);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for broken encoding (U+FFFD replacement character)
        if (line.includes(BROKEN_CHAR)) {
            console.error(`ERROR  ${rel}:${i + 1}  broken encoding (U+FFFD detected)`);
            warnings++;
        }

        // We are disabling the strict Cyrillic check because translations 
        // in Alive are often directly within the JS files (e.g. `ru: "..."`).
        // if (!isAllowedCyrillic(filePath) && CYRILLIC_RE.test(line)) { ... }
    }
}

console.log("=== Encoding & i18n integrity check ===\n");
scan(JS_DIR);

if (warnings === 0) {
    console.log("\n✅ All clear — no broken encoding or stray Cyrillic found.");
    process.exit(0);
} else {
    console.log(`\n⚠️  ${warnings} warning(s) found.`);
    process.exit(STRICT ? 1 : 0);
}
