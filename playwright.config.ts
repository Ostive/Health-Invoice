import { defineConfig, devices } from '@playwright/test';

// E2E_EMAIL / E2E_PASSWORD of the dedicated test account live in .env.test.local (gitignored),
// so the tests never touch the account used for demos
try {
    process.loadEnvFile('.env.test.local');
} catch {
    // No local file: credentials can still come from the environment (CI)
}

// Written by e2e/auth.setup.ts, reused by the dashboard tests (gitignored)
const STORAGE_STATE = 'e2e/.auth/user.json';

// The visual review (screenshots, PDFs, accessibility audit) only runs when asked for:
// `npm run test:review` (= playwright test --project=review)
// Workers re-read this file without the CLI flags, so the main process hands the choice down via the env
if (process.argv.some(arg => arg === '--project=review' || arg === 'review')) {
    process.env.PW_REVIEW = '1';
}
const REVIEW_REQUESTED = process.env.PW_REVIEW === '1';

export default defineConfig({
    testDir: './e2e',
    timeout: 60_000,
    expect: { timeout: 15_000 },
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : 2,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: 'http://localhost:3000',
        locale: 'fr-FR',
        trace: 'retain-on-failure',
    },
    projects: [
        {
            name: 'setup',
            testMatch: /auth\.setup\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'public',
            testMatch: /public\.spec\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'dashboard',
            testMatch: /(dashboard|ai)\.spec\.ts/,
            dependencies: ['setup'],
            use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
        },
        ...(REVIEW_REQUESTED ? [{
            name: 'review',
            testMatch: /review\.spec\.ts/,
            dependencies: ['setup'],
            timeout: 180_000,
            use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
        }] : []),
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
