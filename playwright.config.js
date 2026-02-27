const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './test',
    testMatch: /.*\.spec\.js/,
    timeout: 30000,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',

    use: {
        baseURL: 'http://localhost:8080',
        trace: 'on-first-retry',
    },

    projects: [
        {
            name: 'Desktop Chrome',
            use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
        },
        {
            name: 'Tablet iPad',
            use: { ...devices['iPad Mini'], viewport: { width: 768, height: 1024 } },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 13'], viewport: { width: 375, height: 812 } },
        },
    ],

    webServer: {
        command: 'npx http-server ./ -p 8080 -s',
        port: 8080,
        reuseExistingServer: !process.env.CI,
    },
});
