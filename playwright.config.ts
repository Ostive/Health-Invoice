import { defineConfig, devices } from '@playwright/test';

// Written by e2e/auth.setup.ts, reused by the dashboard tests (gitignored)
const STORAGE_STATE = 'e2e/.auth/user.json';

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
            testMatch: /dashboard\.spec\.ts/,
            dependencies: ['setup'],
            use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
