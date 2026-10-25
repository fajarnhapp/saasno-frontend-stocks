import fs from 'node:fs';
import { expect, test } from '@playwright/test';
import { ADMIN, GONE_USER, OTP_USER } from './helpers/env';
import { login } from './helpers/ui';

test.describe.configure({ mode: 'serial' });

test.describe('privacy', () => {
    test('anyone can read the policy, and the login page links to it', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('link', { name: 'Privacy Policy' }).click();
        await expect(page).toHaveURL(/\/privacy/);
        await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
        await expect(page.getByText('What data we keep')).toBeVisible();
    });

    test('nobody is asked to read the built-in text', async ({ page }) => {
        await login(page, OTP_USER.username, OTP_USER.password);
        await expect(page.getByText('The privacy policy has changed')).toHaveCount(0);
    });

    test('an admin publishes a version, and a user is asked to read it once', async ({ page, browser }) => {
        const marker = `Policy text of the e2e run ${Date.now()}`;
        await login(page, ADMIN.username, ADMIN.password);
        await page.goto('/system/privacy');
        await page.getByLabel('Privacy policy').fill(`# Our Privacy Policy\n\n${marker}\n\n## Data\n\n- name\n- email`);
        await page.getByRole('tab', { name: /Bahasa Indonesia/ }).click();
        await page.getByLabel('Privacy policy').fill(`# Kebijakan Privasi Kami\n\nTeks ${marker}`);
        await page.getByRole('button', { name: /Publish as version/ }).click();
        await page.getByRole('button', { name: 'Yes' }).click();
        await expect(page.getByText('The policy is published.')).toBeVisible();
        await page.getByRole('button', { name: 'Close' }).click();

        // The public page shows it, as text.
        await page.goto('/privacy');
        await expect(page.getByText(marker)).toBeVisible();
        await expect(page.getByText(/Version \d+, published/)).toBeVisible();
        // The policy exists in both languages, so the page offers a choice, and the other language shows the other text.
        await page.getByLabel('Language').selectOption('id');
        await expect(page.getByText(`Teks ${marker}`)).toBeVisible();
        await page.getByLabel('Bahasa').selectOption('en');

        // A user is asked to read it, and only once.
        const fresh = await browser.newContext({ ignoreHTTPSErrors: true });
        const userPage = await fresh.newPage();
        await login(userPage, OTP_USER.username, OTP_USER.password);
        await expect(userPage.getByText('The privacy policy has changed')).toBeVisible();
        await userPage.getByRole('button', { name: 'I have read it' }).click();
        await expect(userPage.getByText('The privacy policy has changed')).toHaveCount(0);
        await userPage.reload();
        await expect(userPage.getByText('The privacy policy has changed')).toHaveCount(0);
        await userPage.goto('/profile');
        await expect(userPage.getByText(/you read version \d+ on/)).toBeVisible();
        await fresh.close();
    });

    test('a policy in one language only has no choice of language', async ({ page }) => {
        await login(page, ADMIN.username, ADMIN.password);
        await page.goto('/system/privacy');
        await page.getByRole('tab', { name: /Bahasa Indonesia/ }).click();
        await page.getByLabel('Privacy policy').fill('');
        await expect(page.getByText(/Only one language is filled in/)).toBeVisible();
        await page.getByRole('button', { name: /Publish as version/ }).click();
        await page.getByRole('button', { name: 'Yes' }).click();
        await expect(page.getByText('The policy is published.')).toBeVisible();

        await page.goto('/privacy');
        await expect(page.getByText(/Policy text of the e2e run/)).toBeVisible();
        await expect(page.getByLabel('Language')).toHaveCount(0);
    });

    test('a user downloads a copy of their own data, without secrets', async ({ page }) => {
        await login(page, OTP_USER.username, OTP_USER.password);
        await page.goto('/profile');
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', { name: 'Download my data' }).click(),
        ]);
        const text: string = fs.readFileSync(await download.path(), 'utf8');
        const data = JSON.parse(text);
        expect(data.account.username).toBe(OTP_USER.username);
        expect(data.person.fullName).toBe('E2E Otp');
        expect(data.contacts[0].value).toBe(OTP_USER.email);
        expect(data.signInHistory.length).toBeGreaterThan(0);
        // The sign-in history names the reason "PASSWORD", so look for what a leak would look like: a hash or a secret.
        expect(text).not.toContain('$argon2');
        expect(text.toLowerCase()).not.toContain('secret');
        expect(Object.keys(data.account)).not.toContain('password');
    });

    test('a deletion request is approved by an admin and the account is gone', async ({ page, browser }) => {
        const fresh = await browser.newContext({ ignoreHTTPSErrors: true });
        const userPage = await fresh.newPage();
        await login(userPage, GONE_USER.username, GONE_USER.password);
        await userPage.goto('/profile');
        await userPage.getByRole('button', { name: 'Delete my account' }).click();
        await userPage.getByRole('button', { name: 'Yes' }).click();
        await expect(userPage.getByText('Your request was sent to the administrators.')).toBeVisible();
        await userPage.getByRole('button', { name: 'Close' }).click();
        await expect(userPage.getByRole('button', { name: 'Deletion requested' })).toBeDisabled();

        await login(page, ADMIN.username, ADMIN.password);
        await page.goto('/system/privacy');
        const row = page.locator('tr', { hasText: GONE_USER.username });
        await row.getByRole('button', { name: 'Approve' }).click();
        await page.getByRole('button', { name: 'Yes' }).click();
        await expect(row.getByText('DONE')).toBeVisible();

        // They cannot sign in any more.
        await userPage.context().clearCookies();
        await userPage.goto('/login');
        await userPage.locator('#email').fill(GONE_USER.username);
        await userPage.locator('#password').fill(GONE_USER.password);
        await userPage.locator('button[type=submit]').click();
        await expect(userPage.getByText('Incorrect username or password')).toBeVisible();
        await fresh.close();
    });
});
