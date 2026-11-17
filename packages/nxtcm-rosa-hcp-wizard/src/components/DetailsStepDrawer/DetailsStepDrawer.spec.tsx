import { expect, test } from '@/playwright/ct-fixture';
import { expectFocusVisible } from '@/playwright/e2e/helpers/focus-helpers';

import { defaultRosaHcpWizardStrings } from '../../stringsProvider/rosaHcpWizardStrings.defaults';
import { checkAccessibility } from '../../test-helpers';
import type { DetailsStepDrawerMount } from './DetailsStepDrawer.story';

/** Waits for the drawer's slide animation to finish. */
async function waitForDrawerToSettle(dialog: import('@playwright/test').Locator): Promise<void> {
  await dialog.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(document.getAnimations().map((animation) => animation.finished));
  });
}

/** Presses Tab until `lastName` is focused, asserting focus stays inside the dialog throughout. */
async function tabThroughDialog(
  page: import('@playwright/test').Page,
  lastName: string,
  maxTabs = 60
): Promise<string[]> {
  const visited: string[] = [];
  for (let i = 0; i < maxTabs && visited.at(-1) !== lastName; i += 1) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null;
      return {
        insideDialog: !!element?.closest('[role="dialog"]'),
        name: element?.getAttribute('aria-label') ?? (element?.textContent ?? '').trim(),
      };
    });
    expect(focused.insideDialog, `focus left the drawer after: ${visited.join(' | ')}`).toBe(true);
    visited.push(focused.name);
  }
  return visited;
}

test.describe('DetailsStepDrawer', () => {
  test('focuses the header close button, traps keyboard focus in the named dialog, and restores focus on close', async ({
    mount,
    page,
  }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount'
    );
    const trigger = component.getByRole('button', { name: 'Associate a new AWS account' });
    const title = component.getByText('How to associate a new AWS account', { exact: true });
    const dialog = component.getByRole('dialog', { name: 'How to associate a new AWS account' });
    const closeButton = component.getByRole('button', { name: 'Close drawer panel', exact: true });
    const resizeHandle = dialog.getByRole('separator', { name: 'Resize', exact: true });
    const bottomCloseButton = dialog.getByRole('button', { name: 'Close', exact: true });

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(title).toBeVisible();
    await expect(closeButton).toBeVisible();
    await expect(closeButton).toBeFocused();
    await expect(dialog).toHaveAccessibleName('How to associate a new AWS account');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await page.keyboard.press('Shift+Tab');
    await expect(resizeHandle).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(bottomCloseButton).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(resizeHandle).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(closeButton).toBeFocused();
    await page.keyboard.press('Space');
    await expect(dialog).toBeHidden();
    await expect(title).toBeHidden();
    await expect(closeButton).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('should render main content', async ({ mount }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount'
    );
    await expect(component.getByTestId('drawer-main-content')).toBeVisible();
  });

  test('should not show drawer panel when collapsed', async ({ mount }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount',
      { initiallyExpanded: false }
    );
    // Panel title should not be visible when collapsed
    const panelTitle = component.getByRole('heading', {
      name: /how to associate a new aws account/i,
    });
    await expect(panelTitle).toBeHidden();
  });

  test('should show drawer panel when expanded', async ({ mount }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount',
      { initiallyExpanded: true }
    );
    const panelTitle = component.getByRole('heading', {
      name: /how to associate a new aws account/i,
    });
    await expect(panelTitle).toBeVisible();
  });

  test('should render close button in drawer header', async ({ mount }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount',
      { initiallyExpanded: true }
    );
    const closeButton = component.getByRole('button', { name: /close drawer panel/i });
    await expect(closeButton).toBeVisible();
  });

  test('should close drawer when close button clicked', async ({ mount }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount',
      { initiallyExpanded: true }
    );

    const closeButton = component.getByRole('button', { name: /close drawer panel/i });
    await closeButton.click();

    // Panel should no longer be visible
    const panelTitle = component.getByRole('heading', {
      name: /how to associate a new aws account/i,
    });
    await expect(panelTitle).toBeHidden();
  });

  test('should render all instruction sections when expanded', async ({ mount }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount',
      { initiallyExpanded: true }
    );

    // Check for expandable sections (they use h3 wrapper)
    await expect(component.getByRole('button', { name: /log in/i })).toBeVisible();
    await expect(component.getByRole('button', { name: /ocm role/i })).toBeVisible();
    await expect(component.getByRole('button', { name: /user role/i })).toBeVisible();
    await expect(component.getByRole('button', { name: /account roles/i })).toBeVisible();
  });

  test('should render intro text', async ({ mount }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount',
      { initiallyExpanded: true }
    );
    await expect(component.getByText(/security token service/i)).toBeVisible();
  });

  test('should render close button at bottom', async ({ mount }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount',
      { initiallyExpanded: true }
    );
    // There should be a secondary button to close the drawer
    const buttons = component.getByRole('button', { name: /close/i });
    // At least one close button should exist
    await expect(buttons.first()).toBeVisible();
  });

  test('should close drawer when bottom close button clicked', async ({ mount }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount',
      { initiallyExpanded: true }
    );

    // Click the secondary close button (not the X button)
    const closeButtons = component.getByRole('button', { name: /^close$/i });
    await closeButtons.click();

    // Panel should no longer be visible
    const panelTitle = component.getByRole('heading', {
      name: /how to associate a new aws account/i,
    });
    await expect(panelTitle).toBeHidden();
  });

  test('should pass product prop to LoginStep', async ({ mount }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount',
      { initiallyExpanded: true, product: 'ocm' }
    );
    // The login command is available to copy.
    await expect(
      component.getByRole('textbox', { name: 'Copyable ROSA login command' })
    ).toBeVisible();
  });

  test('should render resizable panel', async ({ mount }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount',
      { initiallyExpanded: true }
    );
    // The panel exposes an accessible resize control.
    const panel = component.getByRole('separator', { name: 'Resize' });
    await expect(panel).toBeVisible();
  });

  test('should pass accessibility tests when collapsed', async ({ mount }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount',
      { initiallyExpanded: false }
    );
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests when expanded', async ({ mount }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount',
      { initiallyExpanded: true }
    );
    await checkAccessibility({ component });
  });
});

test.describe('DetailsStepDrawer — keyboard', () => {
  const path =
    'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount';
  const strings = defaultRosaHcpWizardStrings.associateAwsDrawer;

  test('shows a visible focus indicator on the close button after keyboard opening', async ({
    mount,
    page,
  }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(path);

    await component.getByRole('button', { name: 'Associate a new AWS account' }).focus();
    await page.keyboard.press('Enter');
    await expect(component.getByRole('dialog', { name: strings.panelTitle })).toBeVisible();

    await expectFocusVisible(
      component.getByRole('button', { name: strings.closeDrawerButtonLabel, exact: true })
    );
  });

  test('Tab visits every control inside the drawer in order from the header to the bottom Close', async ({
    mount,
    page,
  }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(path);
    const dialog = component.getByRole('dialog', { name: strings.panelTitle });
    await component.getByRole('button', { name: 'Associate a new AWS account' }).focus();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();

    // Expand every section by keyboard so the whole panel is in the tab sequence.
    for (const title of [strings.step1Title, strings.step2Title, strings.step3Title]) {
      const toggle = dialog.getByRole('button', { name: title, exact: true });
      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    }
    await waitForDrawerToSettle(dialog);
    await dialog.getByRole('button', { name: strings.closeDrawerButtonLabel, exact: true }).focus();

    const visited = await tabThroughDialog(page, strings.closeButton);

    const order = [
      strings.stepLoginTitle,
      strings.step1Title,
      strings.step2Title,
      strings.step3Title,
      strings.closeButton,
    ].map((title) => visited.indexOf(title));
    expect(order, `Missing from tab order: ${visited.join(' | ')}`).not.toContain(-1);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(visited.at(-1)).toBe(strings.closeButton);
  });

  test('Escape closes the drawer and returns focus to the trigger', async ({ mount, page }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(path);
    const trigger = component.getByRole('button', { name: 'Associate a new AWS account' });
    const dialog = component.getByRole('dialog', { name: strings.panelTitle });

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await waitForDrawerToSettle(dialog);
    await expect(
      dialog.getByRole('button', { name: strings.closeDrawerButtonLabel, exact: true })
    ).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
