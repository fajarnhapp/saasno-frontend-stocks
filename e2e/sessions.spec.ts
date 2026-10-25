import { expect, test } from '@playwright/test';
import { ADMIN, OTP_USER } from './helpers/env';
import { login } from './helpers/ui';

test('an admin signs out every session at once, and keeps their own', async ({ page, browser }) => {
    // Another user is signed in on another device.
    const other = await browser.newContext({ ignoreHTTPSErrors: true });
    const otherPage = await other.newPage();
    await login(otherPage, OTP_USER.username, OTP_USER.password);

    await login(page, ADMIN.username, ADMIN.password);
    await page.goto('/system/session');
    await expect(page.getByText(OTP_USER.username).first()).toBeVisible();

    await page.getByRole('button', { name: 'Sign out all sessions' }).click();
    await page.getByRole('button', { name: 'Sign out all', exact: true }).click();
    await expect(page.getByText('All sessions signed out.')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();

    // The other user has to sign in again ...
    await otherPage.goto('/profile');
    await expect(otherPage).toHaveURL(/\/login/);
    await other.close();

    // ... the admin has not, and the list no longer shows the other user.
    await page.reload();
    await expect(page).toHaveURL(/\/system\/session/);
    await expect(page.getByText(OTP_USER.username)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Sign out all sessions' })).toHaveCount(0);
});
