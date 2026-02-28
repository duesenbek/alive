#!/usr/bin/env node
/**
 * Release Quality Gate
 * Orchestrates must-pass checks before merge/release.
 * Fast checks run first, longer tests run last.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const JS_DIR = path.join(ROOT, 'js');
const INDEX_HTML = path.join(ROOT, 'index.html');

console.log("==========================================");
console.log("🚀 STARTING RELEASE QUALITY GATE");
console.log("==========================================\n");

const tests = [];
let hasCriticalFailures = false;

function addResult(name, success, executionTimeMs, errorDetails = "") {
    tests.push({ name, success, time: executionTimeMs, errorDetails });
    if (!success) hasCriticalFailures = true;
}

function runShellCommand(name, command) {
    process.stdout.write(`⏳ Running: ${name}... `);
    const start = Date.now();
    try {
        execSync(command, { stdio: 'pipe', cwd: ROOT }); // Hide output unless failure
        const elapsed = Date.now() - start;
        console.log(`✅ (${elapsed}ms)`);
        addResult(name, true, elapsed);
    } catch (e) {
        const elapsed = Date.now() - start;
        console.log(`❌ FAILED (${elapsed}ms)`);
        addResult(name, false, elapsed, e.stdout ? e.stdout.toString() : e.message);
    }
}

// -----------------------------------------------------------------------------
// 1. Missing local script src in index.html
// -----------------------------------------------------------------------------
function checkIndexHtmlScripts() {
    process.stdout.write(`⏳ Running: Local Script Src Verification... `);
    const start = Date.now();
    try {
        const html = fs.readFileSync(INDEX_HTML, 'utf8');
        const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
        let match;
        let missing = [];

        while ((match = scriptRegex.exec(html)) !== null) {
            const src = match[1];
            // Ignore external URLs (http://, https://, //)
            if (!src.startsWith('http') && !src.startsWith('//')) {
                const scriptPath = path.join(ROOT, src);
                if (!fs.existsSync(scriptPath)) {
                    missing.push(src);
                }
            }
        }

        const elapsed = Date.now() - start;
        if (missing.length === 0) {
            console.log(`✅ (${elapsed}ms)`);
            addResult('Local Script Src Verification', true, elapsed);
        } else {
            console.log(`❌ FAILED (${elapsed}ms)`);
            addResult('Local Script Src Verification', false, elapsed, `Missing files:\n- ${missing.join('\n- ')}`);
        }
    } catch (e) {
        const elapsed = Date.now() - start;
        console.log(`❌ FAILED (${elapsed}ms)`);
        addResult('Local Script Src Verification', false, elapsed, e.message);
    }
}

// -----------------------------------------------------------------------------
// 2. Duplicate Methods in Classes
// -----------------------------------------------------------------------------
function checkDuplicateMethods() {
    process.stdout.write(`⏳ Running: Duplicate Methods Check... `);
    const start = Date.now();
    try {
        const duplicates = [];

        function scanDir(dir) {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            for (const file of files) {
                const fullPath = path.join(dir, file.name);
                if (file.isDirectory()) {
                    if (!['node_modules', '.git'].includes(file.name)) {
                        scanDir(fullPath);
                    }
                } else if (file.name.endsWith('.js')) {
                    checkFileForDuplicates(fullPath);
                }
            }
        }

        function checkFileForDuplicates(filePath) {
            const content = fs.readFileSync(filePath, 'utf8');
            // Simplified regex to find `class X {`
            const classBlocks = content.split(/\bclass\s+\w+(?:\s+extends\s+\w+)?\s*\{/g);
            // Skip index 0 (before first class)
            for (let i = 1; i < classBlocks.length; i++) {
                const classBody = classBlocks[i];
                // Find method signatures: `methodName(args) {`
                // Excludes if/for/while, etc.
                const methodRegex = /^\s*([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\([^)]*\)\s*\{/gm;
                let methodMatch;
                const methodNames = new Set();

                while ((methodMatch = methodRegex.exec(classBody)) !== null) {
                    const name = methodMatch[1];
                    const ignoreList = ['if', 'for', 'while', 'switch', 'catch', 'function'];
                    if (!ignoreList.includes(name)) {
                        if (methodNames.has(name)) {
                            duplicates.push(`${path.relative(ROOT, filePath)}: Duplicate method \`${name}()\``);
                        } else {
                            methodNames.add(name);
                        }
                    }
                }
            }
        }

        scanDir(JS_DIR);
        const elapsed = Date.now() - start;

        if (duplicates.length === 0) {
            console.log(`✅ (${elapsed}ms)`);
            addResult('Duplicate Methods Check', true, elapsed);
        } else {
            console.log(`❌ FAILED (${elapsed}ms)`);
            addResult('Duplicate Methods Check', false, elapsed, `Found duplicates:\n- ${duplicates.join('\n- ')}`);
        }
    } catch (e) {
        const elapsed = Date.now() - start;
        console.log(`❌ FAILED (${elapsed}ms)`);
        addResult('Duplicate Methods Check', false, elapsed, e.message);
    }
}

// -----------------------------------------------------------------------------
// 3. Placeholder Icons Search ("??", "???")
// -----------------------------------------------------------------------------
function checkPlaceholderIcons() {
    process.stdout.write(`⏳ Running: Placeholder Icons Check... `);
    const start = Date.now();
    try {
        const placeholders = [];
        const regexes = [/"\?\?"/, /"\?\?\?"/, /'\?\?'/, /'\?\?\?'/, />\?\?</, />\?\?\?</];

        function scanDir(dir) {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            for (const file of files) {
                const fullPath = path.join(dir, file.name);
                if (file.isDirectory()) {
                    if (!['node_modules', '.git'].includes(file.name)) {
                        scanDir(fullPath);
                    }
                } else if (file.name.endsWith('.js') || file.name.endsWith('.json') || file.name.endsWith('.html')) {
                    checkFileForPlaceholders(fullPath);
                }
            }
        }

        function checkFileForPlaceholders(filePath) {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                for (const reg of regexes) {
                    if (reg.test(line)) {
                        placeholders.push(`${path.relative(ROOT, filePath)}:${i + 1} -> found placeholder`);
                        break;
                    }
                }
            }
        }

        scanDir(JS_DIR);
        checkFileForPlaceholders(INDEX_HTML);

        const elapsed = Date.now() - start;
        if (placeholders.length === 0) {
            console.log(`✅ (${elapsed}ms)`);
            addResult('Placeholder Icons Check', true, elapsed);
        } else {
            console.log(`❌ FAILED (${elapsed}ms)`);
            addResult('Placeholder Icons Check', false, elapsed, `Found placeholders:\n- ${placeholders.join('\n- ')}`);
        }
    } catch (e) {
        const elapsed = Date.now() - start;
        console.log(`❌ FAILED (${elapsed}ms)`);
        addResult('Placeholder Icons Check', false, elapsed, e.message);
    }
}

// -----------------------------------------------------------------------------
// 4. I18n Key Completeness Check
// -----------------------------------------------------------------------------
function checkI18nCompleteness() {
    process.stdout.write(`⏳ Running: I18n Key Verification... `);
    const start = Date.now();
    try {
        const stringsFile = path.join(JS_DIR, 'data', 'strings.js');
        const stringsContent = fs.readFileSync(stringsFile, 'utf8');

        // Extract keys from strings.js (very basic regex approach)
        const definedKeys = new Set();
        const keyMatchRegex = /"([^"]+)":/g;
        let k;
        while ((k = keyMatchRegex.exec(stringsContent)) !== null) {
            definedKeys.add(k[1]);
        }

        const missing = [];
        function scanDir(dir) {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            for (const file of files) {
                const fullPath = path.join(dir, file.name);
                if (file.isDirectory()) {
                    if (!['node_modules', '.git', 'data'].includes(file.name)) {
                        scanDir(fullPath);
                    }
                } else if (file.name.endsWith('.js')) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    // Find t("key") or t('key')
                    const tRegex = /\bt\s*\(\s*["']([^"']+)["']\s*\)/g;
                    let m;
                    while ((m = tRegex.exec(content)) !== null) {
                        const key = m[1];
                        if (!definedKeys.has(key) && !key.includes("{")) { // ignore dynamic keys with braces
                            missing.push(`${path.relative(ROOT, fullPath)}: Missing key \`${key}\``);
                        }
                    }
                }
            }
        }

        scanDir(JS_DIR);
        const elapsed = Date.now() - start;
        if (missing.length === 0) {
            console.log(`✅ (${elapsed}ms)`);
            addResult('I18n Key Verification', true, elapsed);
        } else {
            console.log(`❌ FAILED (${elapsed}ms)`);
            // Deduplicate missing messages
            const uniqueMissing = [...new Set(missing)];
            addResult('I18n Key Verification', false, elapsed, `Found missing translation keys:\n- ${uniqueMissing.join('\n- ')}`);
        }
    } catch (e) {
        const elapsed = Date.now() - start;
        console.log(`❌ FAILED (${elapsed}ms)`);
        addResult('I18n Key Verification', false, elapsed, e.message);
    }
}

// -----------------------------------------------------------------------------
// EXECUTE Pipeline
// -----------------------------------------------------------------------------

// Fast static checks
checkDuplicateMethods();
checkIndexHtmlScripts();
checkPlaceholderIcons();
checkI18nCompleteness();

// Existing Node verification scripts
runShellCommand('Mojibake Encoding Check', 'node scripts/check-encoding.js --strict');
runShellCommand('Asset Integrity Validation', 'node test/asset_integrity.test.js');

// Fast Gameplay logic tests
runShellCommand('Director Sanity Tests', 'node test/director_test.js');
runShellCommand('Balance Simulation Tests', 'node test/balance_simulation.test.js');
runShellCommand('General Smoke Tests', 'npm run test:smoke');

// Slow UI tests
runShellCommand('Visual Regression Playwright Tests', 'npm run test:visual');

// -----------------------------------------------------------------------------
// REPORT
// -----------------------------------------------------------------------------

console.log("\n==========================================");
console.log("📊 RELEASE PIPELINE REPORT");
console.log("==========================================");

tests.forEach((t) => {
    const icon = t.success ? '✅' : '❌';
    console.log(`${icon} ${t.name.padEnd(35)} [${t.time}ms]`);
});
console.log("==========================================");

if (hasCriticalFailures) {
    console.error("\n🚨 MERGE BLOCKED: Critical defects found in the pipeline.");
    console.error("Please fix the failing checks above before releasing.");

    // Print details of failures
    console.error("\n--- FAILURE DETAILS ---");
    tests.filter(t => !t.success).forEach(t => {
        console.error(`\n[${t.name}]:`);
        console.error(t.errorDetails);
    });

    process.exit(1);
} else {
    console.log("\n🎉 ALL CHECKS PASSED. Ready for release.");
    process.exit(0);
}
