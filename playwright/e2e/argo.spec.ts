// Copyright Contributors to the Open Cluster Management project
import { test, expect } from '@playwright/test';

test.describe('argo wizard', () => {
  test('displays and validates name input', async ({ page }) => {
    // Navigate and setup
    await page.goto('http://localhost:3000/wizards/?route=argo-cd-create');
    await page.locator('#nav-toggle').click();
    await page.locator('#yaml-switch').click({ force: true });
    await expect(page.locator('h1')).toContainText('Create application set');

    // Details step - validate name input works
    await page.locator('#name').fill('my-application-set');
    await expect(page.locator('#name')).toHaveValue('my-application-set');

    // Note: Further steps require specific test data (Argo servers, etc.)
    // that may not be available in the test environment
  });
});

