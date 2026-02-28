const { test, expect } = require('@playwright/test');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Navigate to root and wait for the page to fully stabilize.
 */
async function navigateAndWait(page) {
    await page.goto('/', { waitUntil: 'networkidle' });
    // Wait for the loading overlay to clear
    await page.waitForSelector('#loader', { state: 'hidden', timeout: 8000 }).catch(() => { });
    // Small buffer for CSS transitions / fonts
    await page.waitForTimeout(400);
}

/**
 * Start a new life programmatically via the exposed window.aliveGame.
 * Also patches the UI to show the game screen since Alive.ui is not globally exposed.
 */
async function startTestLife(page) {
    await page.evaluate(() => {
        const game = window.aliveGame;
        if (!game) return;

        // Skip onboarding so the game screen renders immediately
        game.bestResults = game.bestResults || {};
        game.bestResults.tutorialComplete = true;

        game.startNewLife({
            gender: "M",
            name: "TestUser",
            countryId: "kz",
            cityId: "almaty",
            familyWealthTier: "medium"
        });

        // Find the running UI instance via the app element's rendered content.
        // Since game.startNewLife triggers emitUpdate, and UI listens to alive:gameUpdate,
        // the screen is still "menu" because startNewLife doesn't call showGame.
        // We force screen switch by finding the UI instance through the DOM event.
        // The simplest way: directly access the #app element and dispatch.
        // Actually, let's just set the UI screen property and re-render.
        // The UI instance registered listeners on window for "alive:gameUpdate".
        // We can trigger showGame by calling it on the instance.
        // Since `Alive.UI` is the class and main.js stores instance locally,
        // we need to find it. Let's search for it on the DOM.

        // Alternative approach: just manipulate DOM visibility directly
        const mainMenu = document.querySelector('.mainMenuContainer') ||
            document.querySelector('.menuScreen') ||
            document.getElementById('main-menu');
        if (mainMenu) mainMenu.style.display = 'none';

        const hud = document.getElementById('hud');
        if (hud) hud.classList.remove('hidden');
    });

    // Wait for HUD to be visible
    await page.waitForSelector('#hud', { state: 'visible', timeout: 5000 }).catch(() => { });
    await page.waitForTimeout(400);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe('ALIVE Visual Regression', () => {

    // ── 1. Menu / Title Screen ────────────────────────────────────────────
    test('Menu — title screen', async ({ page }) => {
        await navigateAndWait(page);

        // Ensure the start-life hero button is visible
        await page.waitForSelector('.gameBtnHero', { state: 'visible', timeout: 8000 });
        await expect(page.locator('.gameBtnHero')).toBeVisible();

        await expect(page).toHaveScreenshot('01-menu.png', { fullPage: true });
    });

    // ── 2. Character Creation ─────────────────────────────────────────────
    test('Character Create screen', async ({ page }) => {
        await navigateAndWait(page);

        // Click "Start Life" to enter the creation screen
        await page.waitForSelector('.gameBtnHero', { state: 'visible', timeout: 8000 });
        await page.locator('.gameBtnHero').click();

        // Wait for the creation form to render
        await page.waitForTimeout(800);

        await expect(page).toHaveScreenshot('02-create.png', { fullPage: true });
    });

    // ── 3. Game HUD ───────────────────────────────────────────────────────
    test('Game HUD — core layout', async ({ page }) => {
        await navigateAndWait(page);

        // Click "Start Life" to enter character creation
        await page.waitForSelector('.gameBtnHero', { state: 'visible', timeout: 8000 });
        await page.locator('.gameBtnHero').click();
        await page.waitForTimeout(500);

        // Try to find and click the "Create" / "Begin Life" button on the creation screen
        // This will start the game and transition to HUD
        const beginBtn = page.locator('button:has-text("Begin"), button:has-text("Start"), button:has-text("Create"), button:has-text("Начать")');
        const count = await beginBtn.count();
        if (count > 0) {
            await beginBtn.first().click();
            await page.waitForTimeout(800);
        } else {
            // Fallback: start life programmatically
            await startTestLife(page);
        }

        // Wait for game screen
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot('03-game-hud.png', { fullPage: true });
    });

    // ── 4. Shop Overlay ──────────────────────────────────────────────────
    test('Shop overlay', async ({ page }) => {
        await navigateAndWait(page);

        // Start life via button flow
        await page.waitForSelector('.gameBtnHero', { state: 'visible', timeout: 8000 });
        await page.locator('.gameBtnHero').click();
        await page.waitForTimeout(500);

        const beginBtn = page.locator('button:has-text("Begin"), button:has-text("Start"), button:has-text("Create"), button:has-text("Начать")');
        const count = await beginBtn.count();
        if (count > 0) {
            await beginBtn.first().click();
            await page.waitForTimeout(800);
        } else {
            await startTestLife(page);
        }

        // Age up a few years so the player can access the shop
        await page.evaluate(() => {
            const game = window.aliveGame;
            if (game) {
                game.bestResults.tutorialComplete = true;
                game.isOnboarding = false;
                for (let i = 0; i < 18; i++) {
                    if (!game.ended) game.nextYear();
                }
            }
        });
        await page.waitForTimeout(400);

        // Try to find and click a Shop button
        const shopBtn = page.locator('button:has-text("Shop"), button:has-text("Магазин"), button:has-text("🛍"), button:has-text("🛒")');
        const shopCount = await shopBtn.count();
        if (shopCount > 0) {
            await shopBtn.first().click();
        }
        await page.waitForTimeout(600);

        await expect(page).toHaveScreenshot('04-shop.png', { fullPage: true });
    });

    // ── 5. Summary / Death Screen ────────────────────────────────────────
    test('Summary screen', async ({ page }) => {
        await navigateAndWait(page);

        // Start life programmatically (faster for this test)
        await page.evaluate(() => {
            const game = window.aliveGame;
            if (game) {
                game.bestResults.tutorialComplete = true;
                game.startNewLife({
                    gender: "M",
                    name: "TestUser",
                    countryId: "kz",
                    cityId: "almaty",
                    familyWealthTier: "medium"
                });
            }
        });
        await page.waitForTimeout(300);

        // Fast-forward to end of life
        await page.evaluate(() => {
            const game = window.aliveGame;
            if (game) {
                game.isOnboarding = false;
                for (let i = 0; i < 120; i++) {
                    if (game.ended) break;
                    game.nextYear();
                }
            }
        });
        await page.waitForTimeout(800);

        await expect(page).toHaveScreenshot('05-summary.png', { fullPage: true });
    });

});
