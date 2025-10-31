// Copyright Contributors to the Open Cluster Management project
import { test, expect } from '@playwright/test';

test.describe('policy wizard', () => {
  test('complete policy workflow', async ({ page }) => {
    // Navigate and setup
    await page.goto('http://localhost:3000/wizards/?route=create-policy');
    await expect(page.locator('h1')).toContainText('Create policy');
    await page.locator('#nav-toggle').click();
    await page.locator('#yaml-switch').click({ force: true });

    // Details step
    await page.locator('#name').fill('my-policy');
    await page.locator('#namespace').click();
    await page.locator('#default').click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Templates step
    await page.getByRole('button', { name: 'Next' }).click();

    // Placement step
    await page.getByRole('button', { name: 'Next' }).click();

    // Policy annotations step
    const standards = page.locator('#standards');
    await standards.locator('#add-button').click();
    await standards.locator('#standards-2').fill('standard-1');
    await standards.locator('#add-button').click();
    await standards.locator('#standards-3').fill('standard-2');

    const categories = page.locator('#categories');
    await categories.locator('#add-button').click();
    await categories.locator('#categories-2').fill('category-1');
    await categories.locator('#add-button').click();
    await categories.locator('#categories-3').fill('category-2');

    const controls = page.locator('#controls');
    await controls.locator('#add-button').click();
    await controls.locator('#controls-2').fill('control-1');
    await controls.locator('#add-button').click();
    await controls.locator('#controls-3').fill('control-2');

    await page.getByRole('button', { name: 'Next' }).click();

    // Review step
    const review = page.locator('#review');
    await expect(review.locator('#name')).toContainText('my-policy');
    await expect(review.locator('#namespace')).toContainText('default');
    await expect(review.locator('#categories')).toContainText('category-1');
    await expect(review.locator('#categories')).toContainText('category-2');
    await expect(review.locator('#standards')).toContainText('standard-1');
    await expect(review.locator('#standards')).toContainText('standard-2');
    await expect(review.locator('#controls')).toContainText('control-1');
    await expect(review.locator('#controls')).toContainText('control-2');
  });
});

