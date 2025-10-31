// Copyright Contributors to the Open Cluster Management project
import { test, expect } from '@playwright/test';

test.describe('application wizard', () => {
  test('displays', async ({ page }) => {
    await page.goto('http://localhost:3000/wizards/?route=application');
    await page.locator('#nav-toggle').click();
    await page.locator('#yaml-switch').click({ force: true });
    await expect(page.locator('h1')).toContainText('Create application');
  });
});

