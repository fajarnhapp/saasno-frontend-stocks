import { expect, test } from '@playwright/test';
import { ADMIN } from './helpers/env';
import { login } from './helpers/ui';

test.describe('login', () => {
    test('a wrong password shows an error and stays on the login page', async ({ page }) => {
        await page.goto('/login');
        await page.locator('#email').fill(ADMIN.username);
        await page.locator('#password').fill('not-the-password');
        await page.locator('button[type=submit]').click();
        await expect(page.getByText('Incorrect username or password')).toBeVisible();
        await expect(page).toHaveURL(/\/login/);
    });

    test('an unknown user gets the same error as a wrong password', async ({ page }) => {
        await page.goto('/login');
        await page.locator('#email').fill('nobody.at.all');
        await page.locator('#password').fill('whatever-1A');
        await page.locator('button[type=submit]').click();
        await expect(page.getByText('Incorrect username or password')).toBeVisible();
    });

    test('the username signs in', async ({ page }) => {
        await login(page, ADMIN.username, ADMIN.password);
    });

    test('the email address signs in too', async ({ page }) => {
        await login(page, ADMIN.email, ADMIN.password);
    });

    test('a page of the app without a session sends you to the login page', async ({ page }) => {
        await page.goto('/system/user');
        await expect(page).toHaveURL(/\/login/);
    });

    test('the sign-in is written to the history of the account', async ({ page }) => {
        await login(page, ADMIN.username, ADMIN.password);
        await page.goto('/profile');
        await expect(page.getByText('Recent sign-ins')).toBeVisible();
        await expect(page.getByText('Signed in').first()).toBeVisible();
    });
});
