/**
 * Asset Integrity Test
 * Verifies all image paths in buildings, vehicles, and characters data actually exist on disk.
 * Run: node test/asset_integrity.test.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;
const errors = [];

function checkFile(label, imagePath) {
    const fullPath = path.join(ROOT, imagePath);
    if (fs.existsSync(fullPath)) {
        passed++;
    } else {
        failed++;
        errors.push(`❌ MISSING: ${label} → ${imagePath}`);
    }
}

// --- 1. Buildings (from buildings.js hardcoded list) ---
console.log("\\n📦 Checking buildings...");
const buildingsJson = JSON.parse(fs.readFileSync(path.join(ROOT, "js/data/buildings.json"), "utf8"));
buildingsJson.forEach(b => {
    checkFile(`Building ${b.id} (${b.name})`, b.image);
    // Verify ID convention
    if (!b.id.startsWith("building_")) {
        failed++;
        errors.push(`❌ BAD ID: Building "${b.name}" has id "${b.id}" (should start with building_)`);
    }
});
console.log(`  Buildings: ${buildingsJson.length} entries checked`);

// --- 2. Transports (from transports.json) ---
console.log("📦 Checking transports...");
const transportsJson = JSON.parse(fs.readFileSync(path.join(ROOT, "js/data/transports.json"), "utf8"));
transportsJson.forEach(t => {
    checkFile(`Transport ${t.id} (${t.name})`, t.image);
    // Verify ID convention
    if (!t.id.startsWith("transport_")) {
        failed++;
        errors.push(`❌ BAD ID: Transport "${t.name}" has id "${t.id}" (should start with transport_)`);
    }
});
console.log(`  Transports: ${transportsJson.length} entries checked`);

// --- 3. Characters ---
console.log("📦 Checking characters...");
const charDir = path.join(ROOT, "assets/characters");
for (let i = 1; i <= 117; i++) {
    const imgPath = `assets/characters/char_${i}.webp`;
    checkFile(`Character char_${i}`, imgPath);
}
console.log("  Characters: 117 entries checked");

// --- 4. Fallback placeholder ---
console.log("📦 Checking fallback placeholder...");
checkFile("Fallback placeholder", "assets/misc/placeholder.webp");

// --- 5. Banner ---
console.log("📦 Checking banner...");
checkFile("Banner", "assets/banner/banner.png");

// --- Results ---
console.log("\\n" + "=".repeat(50));
if (errors.length > 0) {
    console.log(`\\n⚠️ ${errors.length} issues found:\\n`);
    errors.forEach(e => console.log("  " + e));
    console.log("");
}
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log("=".repeat(50));

if (failed > 0) {
    process.exit(1);
}
console.log("\\n✅ All asset integrity checks passed!");
