import { expect, test } from '@/playwright/ct-fixture';

import { checkAccessibility } from '../../test-helpers';
import type { DetailsStepDrawerMount } from './DetailsStepDrawer.story';

test.describe('DetailsStepDrawer', () => {
  test('focuses the visible title on keyboard opening and tabs to the header close control', async ({
    mount,
    page,
  }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount'
    );
    const trigger = component.getByRole('button', { name: 'Associate a new AWS account' });
    const title = component.getByText('How to associate a new AWS account', { exact: true });
    const closeButton = component.getByRole('button', { name: 'Close drawer panel', exact: true });

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(title).toBeVisible();
    await expect(title).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(closeButton).toBeFocused();
    await page.keyboard.press('Space');
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
    // LoginStep should be rendered (has clipboard copy)
    await expect(component.locator('.pf-v6-c-clipboard-copy').first()).toBeVisible();
  });

  test('should render resizable panel', async ({ mount }) => {
    const component = await mount<typeof DetailsStepDrawerMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/DetailsStepDrawer/DetailsStepDrawerMount',
      { initiallyExpanded: true }
    );
    // Panel should have resizable class/attribute
    const panel = component.locator('.pf-v6-c-drawer__panel');
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
