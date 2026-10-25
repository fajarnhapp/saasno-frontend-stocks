import { expect, Page, test } from '@playwright/test';
import { OTP_USER } from './helpers/env';
import { msUntilNextCode, secretFromUri, totp } from './helpers/totp';
import { login } from './helpers/ui';

// A code that is about to change could expire between typing it and the server checking it.
async function freshCode(secret: string): Promise<string> {
    if (msUntilNextCode() < 4000) await new Promise(resolve => setTimeout(resolve, msUntilNextCode() + 200));
    return totp(secret);
}

async function typeCode(page: Page, code: string): Promise<void> {
    await page.locator('input[inputmode="numeric"], input[maxlength="1"]').first().focus();
    await page.keyboard.type(code, { delay: 30 });
}

test('two-factor authentication: set it up, then sign in with a code', async ({ page }) => {
    await login(page, OTP_USER.username, OTP_USER.password);

    // Set up: the manual address carries the secret that an authenticator app would get from the QR code.
    await page.goto('/security');
    // The Security page asks for the password again before it shows anything.
    await page.locator('input[type=password]').fill(OTP_USER.password);
    await page.getByRole('button', { name: 'Verify' }).click();
    await page.getByRole('button', { name: /Enable Two-Factor Authentication/ }).click();
    await page.getByRole('button', { name: /Start Setup/ }).click();
    await page.getByRole('button', { name: /Show manual URI/ }).click();
    const uri: string = (await page.locator('code.select-all').innerText()).trim();
    const secret: string = secretFromUri(uri);

    await typeCode(page, await freshCode(secret));
    await expect(page.getByText('Two-Factor Authentication Active')).toBeVisible();

    // Signing in now asks for the code.
    await page.context().clearCookies();
    await page.goto('/login');
    await page.locator('#email').fill(OTP_USER.username);
    await page.locator('#password').fill(OTP_USER.password);
    await page.locator('button[type=submit]').click();
    await expect(page.getByText('Two-Step Verification')).toBeVisible();

    // A wrong code is refused ...
    await typeCode(page, '000000');
    await expect(page.getByText('Invalid OTP code')).toBeVisible();

    // ... the right one opens the dashboard.
    await typeCode(page, await freshCode(secret));
    await expect(page).toHaveURL(/\/dashboard/);
});
