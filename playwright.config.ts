import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './tests/e2e', // Directory for end-to-end tests
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/reporting */
    reporter: [['html', { open: 'never' }]],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://127.0.0.1:5173',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        /* Run tests headless on CI, otherwise headed */
        // headless: !!process.env.CI, // Let Playwright decide for now or use its default
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                headless: false, // Explicitly run headed
                channel: 'chromium', // Use the new headless mode's architecture
                launchOptions: {
                    args: [
                        '--no-sandbox',
                        '--enable-unsafe-webgpu', // From Chrome troubleshooting guide
                        // '--ignore-gpu-blocklist', // Covered by enable-unsafe-webgpu according to docs
                        // Flags from the blog post, adapted for WebGPU
                        // '--use-angle=vulkan',
                        // '--enable-features=Vulkan,WebGPU',
                        // '--disable-vulkan-surface',
                    ]
                }
            },
        },
        // You can add other browsers back here if needed, e.g.:
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'pnpm dev',
        url: 'http://127.0.0.1:5173/tests/e2e/filter-test.html', // Point to the specific test page for readiness
        reuseExistingServer: false, // Explicitly set to false
        stdout: 'pipe', // or 'ignore' if too noisy
        stderr: 'pipe',
        timeout: 120 * 1000, // 2 minutes to start up
    },
}); 