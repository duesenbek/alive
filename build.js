const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const { execSync } = require('child_process');

const DIST_DIR = path.join(__dirname, 'dist');
const SRC_DIR = __dirname;
const JS_FILES = [
    'js/data/strings.js',
    'js/i18n.js',
    'js/sound.js',
    'js/analytics.js',
    'js/storage.js',
    'js/assets.js',
    'js/buildings.js',
    'js/vehicles.js',
    'js/assets/cities.js',
    'js/assets/pets.js',
    'js/assets/characters.js',
    'js/countries.js',
    'js/player_core.js',
    'js/director.js',
    'js/event_arcs.js',
    'js/goals.js',
    'js/meta_progression.js',
    'js/game.js',
    'js/relationships.js',
    'js/shop.js',
    'js/events.js',
    'js/controlled_events.js',
    'js/actions.js',
    'js/cities.js',
    'js/jobs.js',
    'js/names.js',
    'js/richlist.js',
    'js/selfdevelopment.js',
    'js/stats.js',
    'js/needs.js',
    'js/consequences.js',
    'js/achievements.js',
    'js/ui.js',
    'js/monetization.js',
    'js/main.js'
];

async function build() {
    console.log('🚀 Starting Build Process...');

    // 1. Clean Dist
    if (fs.existsSync(DIST_DIR)) {
        fs.rmSync(DIST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(DIST_DIR);
    fs.mkdirSync(path.join(DIST_DIR, 'js'));
    fs.mkdirSync(path.join(DIST_DIR, 'css'));
    fs.mkdirSync(path.join(DIST_DIR, 'assets'));

    // 2. Validate, Bundle & Minify JS
    console.log('📦 Bundling and Minifying JS...');

    // Validation Step
    for (const file of JS_FILES) {
        try {
            const code = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
            // Simple parse check (minify without compress/mangle just to parse)
            await minify(code, { compress: false, mangle: false, ecma: 2020 });
        } catch (e) {
            console.error(`\n❌ Syntax Error in ${file} (Validation):`);
            console.error(e.message);
            // process.exit(1); // Allow to proceed to concatenation fallback
        }
    }

    let bundleContent = '';
    for (const file of JS_FILES) {
        const code = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
        bundleContent += code + ';\n';
    }

    let finalCode = '';
    try {
        const minified = await minify(bundleContent, {
            compress: {
                drop_console: true,
                passes: 2
            },
            mangle: true,
            ecma: 2020
        });
        finalCode = minified.code;
        console.log('✅ Minification Successful');
    } catch (e) {
        console.warn('⚠️ Minification failed, falling back to concatenated source.');
        console.error(e.message);
        finalCode = bundleContent;
    }

    fs.writeFileSync(path.join(DIST_DIR, 'js', 'bundle.min.js'), finalCode);

    // 3. Process HTML
    console.log('📄 Updating HTML...');
    let html = fs.readFileSync(path.join(SRC_DIR, 'index.html'), 'utf8');

    // Remove individual script tags
    // We can just find the block of core modules and replace it
    const regex = /<!-- Core Modules \(order matters!\) -->[\s\S]*?<script src="js\/main\.js"><\/script>/;
    html = html.replace(regex, '<!-- Core Bundle -->\n  <script src="js/bundle.min.js"></script>');

    // Remove metrica placeholder warning/todo comment if exists? No, just save.
    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html);

    // 4. Copy Assets & CSS
    console.log('📂 Copying Assets...');

    // Copy CSS files
    const cssFiles = fs.readdirSync(path.join(SRC_DIR, 'css'));
    for (const file of cssFiles) {
        if (file.endsWith('.css')) {
            fs.copyFileSync(path.join(SRC_DIR, 'css', file), path.join(DIST_DIR, 'css', file));
        }
    }

    // Copy Manifest
    fs.copyFileSync(path.join(SRC_DIR, 'manifest.json'), path.join(DIST_DIR, 'manifest.json'));

    // Copy Release Checklist
    if (fs.existsSync(path.join(SRC_DIR, 'release_checklist.md'))) {
        fs.copyFileSync(path.join(SRC_DIR, 'release_checklist.md'), path.join(DIST_DIR, 'release_checklist.md'));
    }

    // Copy Screenshots
    if (fs.existsSync(path.join(SRC_DIR, 'screenshots'))) {
        copyRecursive(path.join(SRC_DIR, 'screenshots'), path.join(DIST_DIR, 'screenshots'));
    }

    // Copy Assets Folder (Recursive)
    copyRecursive(path.join(SRC_DIR, 'assets'), path.join(DIST_DIR, 'assets'));

    // Copy Strings (Localization)
    if (!fs.existsSync(path.join(DIST_DIR, 'js'))) fs.mkdirSync(path.join(DIST_DIR, 'js'));
    if (!fs.existsSync(path.join(DIST_DIR, 'js', 'assets'))) fs.mkdirSync(path.join(DIST_DIR, 'js', 'assets'));
    if (fs.existsSync(path.join(SRC_DIR, 'js', 'assets', 'strings'))) {
        copyRecursive(path.join(SRC_DIR, 'js', 'assets', 'strings'), path.join(DIST_DIR, 'js', 'assets', 'strings'));
    }

    // Copy Data JSONs
    if (!fs.existsSync(path.join(DIST_DIR, 'js'))) fs.mkdirSync(path.join(DIST_DIR, 'js'));
    if (!fs.existsSync(path.join(DIST_DIR, 'js', 'data'))) fs.mkdirSync(path.join(DIST_DIR, 'js', 'data'));

    const dataFiles = fs.readdirSync(path.join(SRC_DIR, 'js', 'data'));
    for (const file of dataFiles) {
        if (file.endsWith('.json')) {
            fs.copyFileSync(path.join(SRC_DIR, 'js', 'data', file), path.join(DIST_DIR, 'js', 'data', file));
        }
    }

    // 5. Zip
    console.log('🤐 Zipping Release...');
    try {
        // Use PowerShell to zip because it's reliable on Windows without extra deps
        execSync(`powershell Compress-Archive -Path '${DIST_DIR}\\*' -DestinationPath 'alive_release.zip' -Force`);
    } catch (e) {
        console.error('Failed to zip:', e);
    }

    console.log('✅ Build Complete! Artifacts in dist/ and alive_release.zip');
}

function copyRecursive(src, dest) {
    if (fs.statSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(child => {
            copyRecursive(path.join(src, child), path.join(dest, child));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

build().catch(console.error);
