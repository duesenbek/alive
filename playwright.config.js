const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './test',
    testMatch: /.*\.spec\.js/,
    timeout: 30000,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { open: 'never' }],
        ['list']
    ],

    // Output directory for diff screenshots / traces on failure
    outputDir: './test-results',

    // Snapshot naming: remove platform from name so CI (linux) matches local (win32)
    snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',

    expect: {
        toHaveScreenshot: {
            // Allow 8% pixel diff for cross-env tolerance (font rendering, antialiasing)
            maxDiffPixelRatio: 0.08,
        },
    },

    use: {
        baseURL: 'http://localhost:8080',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    projects: [
        {
            name: 'Desktop-Chrome',
            use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
        },
        {
            name: 'Mobile-Safari',
            use: { ...devices['iPhone 13'], viewport: { width: 375, height: 812 } },
        },
    ],

    webServer: {
        command: 'npx http-server ./ -p 8080 -s',
        port: 8080,
        reuseExistingServer: !process.env.CI,
        timeout: 10000,
    },
});
