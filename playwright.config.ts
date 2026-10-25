import { defineConfig } from '@playwright/test';

// End-to-end tests: a real browser against the running frontend and backend (see e2e/README.md for how the stack is started).
export default defineConfig({
    testDir: './e2e',
    testMatch: '**/*.spec.ts',
    timeout: 60_000,
    expect: { timeout: 10_000 },
    // The tests share one database and one mail box, so they run one after the other.
    workers: 1,
    fullyParallel: false,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
    use: {
        baseURL: process.env.E2E_BASE_URL ?? 'https://localhost:3443',
        // The test stack uses a self-signed certificate (the CSRF cookie only works over HTTPS).
        ignoreHTTPSErrors: true,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
});
