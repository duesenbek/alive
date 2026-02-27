const { test, expect } = require('@playwright/test');

test.describe('ALIVE Visual Regression Suite', () => {

    test('Title Screen Render', async ({ page }) => {
        // Navigate to the index page locally
        await page.goto('/');

        // Ensure the loading screen clears and the start life button is active
        await page.waitForSelector('.gameBtnHero', { state: 'visible', timeout: 8000 });

        // Ensure the game logic injected bounds
        await expect(page.locator('.gameBtnHero')).toBeVisible();

        // Take snapshot of the main menu
        await expect(page).toHaveScreenshot('title-screen.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.05 // Allow 5% variance due to font-loading shifts
        });
    });

    test('HUD and Core Game Layout Render', async ({ page }) => {
        await page.goto('/');

        // Setup player
        await page.waitForSelector('.gameBtnHero', { state: 'visible', timeout: 8000 });

        // Emulate starting a life
        await page.evaluate(() => {
            if (window.game && window.Alive && window.Alive.ui) {
                window.game.startNewLife({
                    gender: "M",
                    name: "TestUser",
                    countryId: "us",
                    cityId: "newyork",
                    familyWealthTier: "medium"
                });
                window.Alive.ui.showGame(); // Enforce overlay flip
            }
        });

        // Wait for the main UI sections to load
        await page.waitForSelector('#hud', { state: 'visible' });

        // Explicitly wait for dynamic HUD elements to mount fully
        await page.waitForTimeout(500);

        // Take snapshot of the current main window layout
        await expect(page).toHaveScreenshot('main-game-hud.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.05
        });
    });

});
