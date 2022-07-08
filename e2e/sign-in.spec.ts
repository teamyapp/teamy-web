import { test, expect } from '@playwright/test';

test('force sign in', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const body = await page.innerText('body');
    expect(body).toContain('Sign In');
    expect(body).toContain('Google');
    expect(body).toContain('Github');
});