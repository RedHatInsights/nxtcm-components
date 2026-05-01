import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';

import { LabelHelp } from './LabelHelp';

test.describe('LabelHelp', () => {
  test('renders nothing when labelHelp is omitted', async ({ mount }) => {
    const mounted = await mount(
      <div>
        <span data-testid="marker">form field</span>
        <LabelHelp id="lh-empty" />
      </div>
    );
    await expect(mounted.getByTestId('marker')).toBeVisible();
    await expect(mounted.getByRole('button', { name: 'More info' })).toHaveCount(0);
  });

  test('opens popover from plain label help control', async ({ mount, page }) => {
    await mount(
      <LabelHelp
        id="lh-plain"
        labelHelp="Use this setting only for test clusters."
        labelHelpTitle="About this field"
      />
    );
    await page.getByRole('button', { name: 'More info' }).click();
    await expect(page.getByText('About this field')).toBeVisible();
    await expect(page.getByText('Use this setting only for test clusters.')).toBeVisible();
  });

  test('opens popover from inline help button when useButton is true', async ({ mount, page }) => {
    await mount(
      <LabelHelp id="lh-btn" labelHelp="Details go here." labelHelpTitle="Help" useButton />
    );
    await page.locator('#lh-btn-label-help-button').click();
    await expect(page.getByText('Details go here.')).toBeVisible();
  });
});
