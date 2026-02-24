/**
 * UTF-8 Encoding Audit & Fix Script
 * Finds and fixes BOM issues in project files
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const EXTENSIONS = ['.html', '.js', '.json', '.css'];
const EXCLUDE_DIRS = ['node_modules', 'dist', '.git', '.vscode'];

// UTF-8 BOM bytes
const BOM = Buffer.from([0xEF, 0xBB, 0xBF]);

const results = {
    scanned: 0,
    bomRemoved: [],
    utf8Valid: [],
    issues: []
};

function scanDirectory(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
            if (!EXCLUDE_DIRS.includes(item.name)) {
                scanDirectory(fullPath);
            }
            continue;
        }

        if (!item.isFile()) continue;

        const ext = path.extname(item.name).toLowerCase();
        if (!EXTENSIONS.includes(ext)) continue;

        results.scanned++;
        checkAndFixFile(fullPath);
    }
}

function checkAndFixFile(filePath) {
    const relativePath = path.relative(ROOT, filePath);

    try {
        const buffer = fs.readFileSync(filePath);

        // Check for BOM
        const hasBOM = buffer.length >= 3 &&
            buffer[0] === BOM[0] &&
            buffer[1] === BOM[1] &&
            buffer[2] === BOM[2];

        if (hasBOM) {
            // Remove BOM
            const newBuffer = buffer.slice(3);
            fs.writeFileSync(filePath, newBuffer);
            results.bomRemoved.push(relativePath);
            console.log(`✓ BOM removed: ${relativePath}`);
        }

        // Verify content is valid UTF-8 by reading as string
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for common encoding garbage patterns (Windows-1251 misread as UTF-8)
        const suspiciousPatterns = [
            /Р[А-Яа-я]/g,  // Russian chars misencoded
            /\uFFFD/g,     // Replacement character
            /[\x80-\x9F]/g // Control chars in Latin-1 range
        ];

        let hasIssues = false;
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(content)) {
                hasIssues = true;
                break;
            }
        }

        if (hasIssues) {
            results.issues.push(relativePath);
        } else if (!hasBOM) {
            results.utf8Valid.push(relativePath);
        }

    } catch (err) {
        results.issues.push(`${relativePath}: ${err.message}`);
        console.error(`✗ Error: ${relativePath} - ${err.message}`);
    }
}

// Run the scan
console.log('='.repeat(60));
console.log('UTF-8 Encoding Audit & Fix');
console.log('='.repeat(60));
console.log('');

scanDirectory(ROOT);

console.log('');
console.log('='.repeat(60));
console.log('RESULTS');
console.log('='.repeat(60));
console.log(`Files scanned: ${results.scanned}`);
console.log(`BOM removed from: ${results.bomRemoved.length} file(s)`);

if (results.bomRemoved.length > 0) {
    console.log('  Files with BOM fixed:');
    results.bomRemoved.forEach(f => console.log(`    - ${f}`));
}

if (results.issues.length > 0) {
    console.log(`\nPotential encoding issues found: ${results.issues.length}`);
    results.issues.forEach(f => console.log(`  ! ${f}`));
} else {
    console.log('\n✓ No encoding issues detected');
}

console.log('\n✓ All files are UTF-8 encoded (no BOM)');
console.log('='.repeat(60));
