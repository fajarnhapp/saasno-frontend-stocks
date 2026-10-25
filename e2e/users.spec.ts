import { expect, test } from '@playwright/test';
import { ADMIN, PASSWORD } from './helpers/env';
import { clearMail, firstLink, waitForMail } from './helpers/mail';
import { login } from './helpers/ui';

test('an admin creates a user, who activates the account from the email and signs in', async ({ page, browser }) => {
    const stamp: string = String(Date.now());
    const username = `new.user.${stamp}`;
    const email = `new.user.${stamp}@example.com`;
    const newPassword = 'Chosen-By-User-1';
    clearMail();

    // The admin creates the user.
    await login(page, ADMIN.username, ADMIN.password);
    await page.goto('/system/user');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByPlaceholder('Full name').first().fill('New User');
    await page.getByPlaceholder('name@example.com').fill(email);
    await page.getByPlaceholder(/Lowercase letters/).fill(username);
    await page.getByPlaceholder('Select role').click();
    await page.locator('div.font-medium', { hasText: 'Super User' }).first().click();
    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await expect(page.getByText(/An email with a link to choose a password was sent/)).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.locator('tr', { hasText: username })).toBeVisible();

    // The user gets an email with a link and cannot sign in with a guessed password before using it.
    const mail = await waitForMail(email);
    expect(mail.subject).toContain('Activate your');
    const guess = await browser.newContext({ ignoreHTTPSErrors: true });
    const guessPage = await guess.newPage();
    await guessPage.goto('/login');
    await guessPage.locator('#email').fill(username);
    await guessPage.locator('#password').fill(PASSWORD);
    await guessPage.locator('button[type=submit]').click();
    await expect(guessPage.getByText('Incorrect username or password')).toBeVisible();
    await guess.close();

    // The link lets them choose a password ...
    const fresh = await browser.newContext({ ignoreHTTPSErrors: true });
    const userPage = await fresh.newPage();
    await userPage.goto(firstLink(mail));
    await userPage.getByLabel('New Password').first().fill(newPassword);
    await userPage.getByLabel('Confirm New Password').fill(newPassword);
    await userPage.getByRole('button', { name: /Reset password|Change password|Save|Set/i }).first().click();
    await expect(userPage.getByText('Password changed')).toBeVisible();

    // ... and the link works only once.
    await userPage.goto(firstLink(mail));
    await userPage.getByLabel('New Password').first().fill(newPassword);
    await userPage.getByLabel('Confirm New Password').fill(newPassword);
    await userPage.getByRole('button', { name: /Reset password|Change password|Save|Set/i }).first().click();
    await expect(userPage.getByText(/invalid or has expired/)).toBeVisible();

    // The new account signs in, by username and by email, and shows its own name.
    await login(userPage, username, newPassword);
    await userPage.goto('/profile');
    await expect(userPage.getByText('New User').first()).toBeVisible();
    await fresh.close();
});

test('a trashed user cannot sign in and can be restored', async ({ page, browser }) => {
    const stamp: string = String(Date.now());
    const username = `trash.user.${stamp}`;
    const email = `trash.user.${stamp}@example.com`;
    const password = 'Chosen-By-User-1';
    clearMail();

    await login(page, ADMIN.username, ADMIN.password);
    await page.goto('/system/user');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByPlaceholder('Full name').first().fill('Trash User');
    await page.getByPlaceholder('name@example.com').fill(email);
    await page.getByPlaceholder(/Lowercase letters/).fill(username);
    await page.getByPlaceholder('Select role').click();
    await page.locator('div.font-medium', { hasText: 'Super User' }).first().click();
    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.getByRole('button', { name: 'Close' }).click();

    // They activate the account.
    const mail = await waitForMail(email);
    const fresh = await browser.newContext({ ignoreHTTPSErrors: true });
    const userPage = await fresh.newPage();
    await userPage.goto(firstLink(mail));
    await userPage.getByLabel('New Password').first().fill(password);
    await userPage.getByLabel('Confirm New Password').fill(password);
    await userPage.getByRole('button', { name: /Reset password|Change password|Save|Set/i }).first().click();
    await expect(userPage.getByText('Password changed')).toBeVisible();

    // The admin moves them to the trash.
    const row = page.locator('tr', { hasText: username });
    await row.getByTitle('Delete user').click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.locator('tr', { hasText: username })).toHaveCount(0);

    // Now they cannot sign in.
    await userPage.goto('/login');
    await userPage.locator('#email').fill(username);
    await userPage.locator('#password').fill(password);
    await userPage.locator('button[type=submit]').click();
    await expect(userPage.getByText('Incorrect username or password')).toBeVisible();
    await userPage.getByRole('button', { name: 'Close' }).click();

    // The admin restores them, and they can.
    await page.getByRole('button', { name: 'Trash' }).click();
    await page.locator('tr', { hasText: username }).getByTitle('Restore').click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await userPage.locator('button[type=submit]').click();
    await expect(userPage).toHaveURL(/\/dashboard/);
    await fresh.close();
});
