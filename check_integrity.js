#!/usr/bin/env node
/**
 * check_integrity.js — Pre-commit / CI integrity checker for Alive
 *
 * Checks:
 *   1. Duplicate class method definitions in JS files
 *   2. All local <script src="..."> in index.html point to existing files
 *
 * Usage:
 *   node check_integrity.js          # check everything
 *   node check_integrity.js --fix    # (future) auto-fix mode
 *
 * Exit codes:
 *   0 = all checks passed
 *   1 = one or more checks failed
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
let exitCode = 0;

// =============================================================================
// UTILITY
// =============================================================================

function fail(msg) {
    console.error("  ❌ " + msg);
    exitCode = 1;
}
function pass(msg) {
    console.log("  ✅ " + msg);
}
function heading(title) {
    console.log("\n=== " + title + " ===");
}

// =============================================================================
// CHECK 1: Duplicate class methods in JS files
// =============================================================================

function checkDuplicateMethods() {
    heading("Duplicate class method check");

    const jsDir = path.join(ROOT, "js");
    if (!fs.existsSync(jsDir)) {
        fail("js/ directory not found");
        return;
    }

    const jsFiles = getAllJsFiles(jsDir);
    let totalDuplicates = 0;

    for (const filePath of jsFiles) {
        const content = fs.readFileSync(filePath, "utf-8");
        const duplicates = findDuplicateClassMethods(content);

        if (duplicates.length > 0) {
            totalDuplicates += duplicates.length;
            for (const dup of duplicates) {
                fail(
                    `${path.relative(ROOT, filePath)}: method "${dup.name}" defined ${dup.count} times ` +
                    `(lines ${dup.lines.join(", ")})`
                );
            }
        }
    }

    if (totalDuplicates === 0) {
        pass(`No duplicate class methods found across ${jsFiles.length} JS files`);
    }
}

function getAllJsFiles(dir) {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...getAllJsFiles(full));
        } else if (entry.name.endsWith(".js")) {
            results.push(full);
        }
    }
    return results;
}

/**
 * Find duplicate method names inside ES6 class bodies.
 * Handles:
 *   methodName(...) {            — regular methods
 *   async methodName(...) {      — async methods
 *   get propertyName() {         — getters
 *   set propertyName(val) {      — setters
 *   static methodName(...) {     — static methods
 *   #privateMethod(...) {        — private methods
 *
 * Does NOT (intentionally) flag get/set pairs as duplicates.
 */
function findDuplicateClassMethods(source) {
    const lines = source.split(/\r?\n/);
    // Map: methodName -> [{ line, kind }]
    const methodMap = new Map();

    // Very lightweight class-scope tracker
    let inClass = false;
    let braceDepth = 0;
    let classStartDepth = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Detect class start
        if (!inClass && /^\s*class\s+\w+/.test(line)) {
            inClass = true;
            classStartDepth = braceDepth;
        }

        // Track brace depth
        for (const ch of line) {
            if (ch === "{") braceDepth++;
            if (ch === "}") braceDepth--;
        }

        // Detect class end
        if (inClass && braceDepth <= classStartDepth) {
            inClass = false;
        }

        if (!inClass) continue;

        // Only match at class-body depth (classStartDepth + 1)
        // Skip lines that are deeper (inside method bodies)
        // Heuristic: method definitions usually have leading whitespace of 4 spaces
        // and the opening brace on the same or next line.
        const methodPattern =
            /^\s+(?:static\s+)?(?:async\s+)?(?:(get|set)\s+)?(#?\w+)\s*\(.*?\)\s*\{?\s*$/;
        const match = trimmed.match(methodPattern);

        if (match) {
            const kind = match[1] || "method"; // 'get', 'set', or 'method'
            const name = match[2];

            // Skip constructor — only one is allowed by spec
            if (name === "constructor") continue;
            // Skip things that look like function calls, not definitions
            if (trimmed.startsWith("if") || trimmed.startsWith("for") ||
                trimmed.startsWith("while") || trimmed.startsWith("switch") ||
                trimmed.startsWith("return") || trimmed.startsWith("const") ||
                trimmed.startsWith("let") || trimmed.startsWith("var") ||
                trimmed.startsWith("//") || trimmed.startsWith("*")) continue;

            const key = kind + ":" + name;
            if (!methodMap.has(key)) {
                methodMap.set(key, []);
            }
            methodMap.get(key).push(i + 1); // 1-indexed
        }
    }

    const duplicates = [];
    for (const [key, positions] of methodMap) {
        if (positions.length > 1) {
            const name = key.split(":")[1];
            duplicates.push({ name, count: positions.length, lines: positions });
        }
    }
    return duplicates;
}

// =============================================================================
// CHECK 2: All <script src> in index.html exist on disk
// =============================================================================

function checkScriptSources() {
    heading("Script source file check");

    const htmlPath = path.join(ROOT, "index.html");
    if (!fs.existsSync(htmlPath)) {
        fail("index.html not found");
        return;
    }

    const html = fs.readFileSync(htmlPath, "utf-8");
    // Match both single and double quoted src attributes
    const srcRegex = /<script\s+[^>]*src\s*=\s*["']([^"']+)["']/gi;
    let match;
    let localCount = 0;
    let missingCount = 0;

    while ((match = srcRegex.exec(html)) !== null) {
        const src = match[1];

        // Skip external URLs
        if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//")) {
            continue;
        }

        localCount++;
        const fullPath = path.join(ROOT, src);

        if (!fs.existsSync(fullPath)) {
            fail(`Missing file: ${src} (referenced in index.html)`);
            missingCount++;
        }
    }

    if (missingCount === 0) {
        pass(`All ${localCount} local script sources exist`);
    }
}

// =============================================================================
// RUN ALL CHECKS
// =============================================================================

console.log("🔍 Alive Project Integrity Check");
console.log("   " + new Date().toISOString());

checkDuplicateMethods();
checkScriptSources();

console.log(
    "\n" + (exitCode === 0
        ? "✅ All checks passed!"
        : "❌ Some checks FAILED — see above")
);

process.exit(exitCode);
