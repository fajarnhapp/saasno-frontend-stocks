import { expect, Page } from '@playwright/test';

// Signs in through the login form (username or email) and waits for the dashboard.
export async function login(page: Page, who: string, password: string): Promise<void> {
    await page.goto('/login');
    await page.locator('#email').fill(who);
    await page.locator('#password').fill(password);
    await page.locator('button[type=submit]').click();
    await expect(page).toHaveURL(/\/dashboard/);
}

export async function logout(page: Page): Promise<void> {
    await page.context().clearCookies();
    await page.goto('/login');
}
