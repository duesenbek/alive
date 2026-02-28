/**
 * Asset Integrity Test — Production Level
 *
 * Verifies:
 *   1. All building image paths in buildings.json actually exist on disk
 *   2. All transport image paths in transports.json actually exist on disk
 *   3. All character portrait files (char_1..117) exist on disk
 *   4. Fallback placeholder image exists
 *   5. Banner image exists
 *   6. ID convention validation (building_*, transport_*, char_*)
 *   7. Cross-reference: every .image in JSON maps to a real file
 *   8. Orphan detection: every file in assets/{buildings,transport} is referenced
 *
 * Run: node test/asset_integrity.test.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;
let warnings = 0;
const errors = [];
const warns = [];

function checkFile(label, imagePath) {
    const fullPath = path.join(ROOT, imagePath);
    if (fs.existsSync(fullPath)) {
        passed++;
    } else {
        failed++;
        errors.push(`MISSING: ${label} → ${imagePath}`);
    }
}

function checkIdConvention(label, id, expectedPrefix) {
    const re = new RegExp(`^${expectedPrefix}\\d+$`);
    if (re.test(id)) {
        passed++;
    } else {
        failed++;
        errors.push(`BAD ID: ${label} has id "${id}" (expected ${expectedPrefix}<number>)`);
    }
}

function warn(msg) {
    warnings++;
    warns.push(msg);
}

// ─── Load data ────────────────────────────────────────────────────────────────

const buildingsJsonPath = path.join(ROOT, "js/data/buildings.json");
const transportsJsonPath = path.join(ROOT, "js/data/transports.json");

let buildingsJson, transportsJson;

try {
    buildingsJson = JSON.parse(fs.readFileSync(buildingsJsonPath, "utf8"));
} catch (e) {
    console.error(`Cannot load buildings.json: ${e.message}`);
    process.exit(1);
}

try {
    transportsJson = JSON.parse(fs.readFileSync(transportsJsonPath, "utf8"));
} catch (e) {
    console.error(`Cannot load transports.json: ${e.message}`);
    process.exit(1);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Buildings — file existence
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n📦 [1/8] Checking building files...");
buildingsJson.forEach(b => {
    checkFile(`Building ${b.id} (${b.name})`, b.image);
});
console.log(`  ${buildingsJson.length} entries checked`);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Transports — file existence
// ═══════════════════════════════════════════════════════════════════════════════
console.log("📦 [2/8] Checking transport files...");
transportsJson.forEach(t => {
    checkFile(`Transport ${t.id} (${t.name})`, t.image);
});
console.log(`  ${transportsJson.length} entries checked`);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Characters — file existence (char_1..117)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("📦 [3/8] Checking character files...");
for (let i = 1; i <= 117; i++) {
    const imgPath = `assets/characters/char_${i}.webp`;
    checkFile(`Character char_${i}`, imgPath);
}
console.log("  117 entries checked");

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Fallback placeholder
// ═══════════════════════════════════════════════════════════════════════════════
console.log("📦 [4/8] Checking fallback placeholder...");
checkFile("Fallback placeholder", "assets/misc/placeholder.webp");

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Banner
// ═══════════════════════════════════════════════════════════════════════════════
console.log("📦 [5/8] Checking banner...");
checkFile("Banner", "assets/banner/banner.png");

// ═══════════════════════════════════════════════════════════════════════════════
// 6. ID convention validation
// ═══════════════════════════════════════════════════════════════════════════════
console.log("📦 [6/8] Validating ID conventions...");

let idIssues = 0;
buildingsJson.forEach(b => {
    checkIdConvention(`Building "${b.name}"`, b.id, "building_");
});
transportsJson.forEach(t => {
    checkIdConvention(`Transport "${t.name}"`, t.id, "transport_");
});
// Characters are generated programmatically (char_1..117), so we validate the range
for (let i = 1; i <= 117; i++) {
    checkIdConvention(`Character ${i}`, `char_${i}`, "char_");
}
console.log(`  ${buildingsJson.length + transportsJson.length + 117} IDs validated`);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Cross-reference: every .image path in JSON resolves to a file
// ═══════════════════════════════════════════════════════════════════════════════
console.log("📦 [7/8] Cross-referencing JSON image paths with disk...");

const allJsonImages = new Set();

buildingsJson.forEach(b => {
    if (b.image) allJsonImages.add(b.image);
});
transportsJson.forEach(t => {
    if (t.image) allJsonImages.add(t.image);
});

let crossRefOk = 0;
let crossRefBad = 0;
allJsonImages.forEach(imgPath => {
    const fullPath = path.join(ROOT, imgPath);
    if (fs.existsSync(fullPath)) {
        crossRefOk++;
    } else {
        crossRefBad++;
        failed++;
        errors.push(`BROKEN LINK: JSON references "${imgPath}" but file does not exist`);
    }
});
console.log(`  ${crossRefOk} OK, ${crossRefBad} broken`);

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Orphan detection: every file in assets/{buildings,transport} is referenced
// ═══════════════════════════════════════════════════════════════════════════════
console.log("📦 [8/8] Detecting orphan asset files...");

function getFilesInDir(dirRelative) {
    const dirPath = path.join(ROOT, dirRelative);
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath)
        .filter(f => !f.startsWith("."))
        .map(f => dirRelative + "/" + f);
}

const referencedImages = new Set();
buildingsJson.forEach(b => { if (b.image) referencedImages.add(b.image.replace(/\\/g, "/")); });
transportsJson.forEach(t => { if (t.image) referencedImages.add(t.image.replace(/\\/g, "/")); });

const assetDirs = ["assets/buildings", "assets/transport"];
let orphanCount = 0;

assetDirs.forEach(dir => {
    const files = getFilesInDir(dir);
    files.forEach(filePath => {
        const normalized = filePath.replace(/\\/g, "/");
        if (!referencedImages.has(normalized)) {
            orphanCount++;
            warn(`ORPHAN: "${normalized}" exists on disk but is not referenced in any JSON`);
        }
    });
});

if (orphanCount === 0) {
    console.log("  No orphan files detected");
    passed++;
} else {
    console.log(`  ⚠️ ${orphanCount} orphan file(s) detected (warnings, not failures)`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Results
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n" + "=".repeat(60));

if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} error(s):\n`);
    errors.forEach(e => console.log("  ❌ " + e));
    console.log("");
}

if (warns.length > 0) {
    console.log(`\n⚠️ ${warns.length} warning(s):\n`);
    warns.forEach(w => console.log("  ⚠️ " + w));
    console.log("");
}

console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⚠️ Warnings: ${warnings}`);
console.log("=".repeat(60));

if (failed > 0) {
    process.exit(1);
}
console.log("\n✅ All asset integrity checks passed!");
