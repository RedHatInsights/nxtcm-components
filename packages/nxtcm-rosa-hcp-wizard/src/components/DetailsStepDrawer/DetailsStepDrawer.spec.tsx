import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../test-helpers';
import { DetailsStepDrawerMount } from './DetailsStepDrawer.spec-helpers';

test.describe('DetailsStepDrawer', () => {
  test('should render main content', async ({ mount }) => {
    const component = await mount(<DetailsStepDrawerMount />);
    await expect(component.getByTestId('drawer-main-content')).toBeVisible();
  });

  test('should not show drawer panel when collapsed', async ({ mount }) => {
    const component = await mount(<DetailsStepDrawerMount initiallyExpanded={false} />);
    // Panel title should not be visible when collapsed
    const panelTitle = component.getByRole('heading', { name: /associate aws account/i });
    await expect(panelTitle).not.toBeVisible();
  });

  test('should show drawer panel when expanded', async ({ mount }) => {
    const component = await mount(<DetailsStepDrawerMount initiallyExpanded={true} />);
    const panelTitle = component.getByRole('heading', { name: /associate aws account/i });
    await expect(panelTitle).toBeVisible();
  });

  test('should render close button in drawer header', async ({ mount }) => {
    const component = await mount(<DetailsStepDrawerMount initiallyExpanded={true} />);
    const closeButton = component.getByRole('button', { name: /close drawer panel/i });
    await expect(closeButton).toBeVisible();
  });

  test('should close drawer when close button clicked', async ({ mount }) => {
    const component = await mount(<DetailsStepDrawerMount initiallyExpanded={true} />);

    const closeButton = component.getByRole('button', { name: /close drawer panel/i });
    await closeButton.click();

    // Panel should no longer be visible
    const panelTitle = component.getByRole('heading', { name: /associate aws account/i });
    await expect(panelTitle).not.toBeVisible();
  });

  test('should render all instruction sections when expanded', async ({ mount }) => {
    const component = await mount(<DetailsStepDrawerMount initiallyExpanded={true} />);

    // Check for expandable sections (they use h3 wrapper)
    await expect(component.getByRole('button', { name: /log in/i })).toBeVisible();
    await expect(component.getByRole('button', { name: /create.*ocm role/i })).toBeVisible();
    await expect(component.getByRole('button', { name: /create.*user role/i })).toBeVisible();
    await expect(component.getByRole('button', { name: /create.*account roles/i })).toBeVisible();
  });

  test('should render intro text', async ({ mount }) => {
    const component = await mount(<DetailsStepDrawerMount initiallyExpanded={true} />);
    // Intro text about STS mode should be visible
    await expect(component.getByText(/sts/i)).toBeVisible();
  });

  test('should render close button at bottom', async ({ mount }) => {
    const component = await mount(<DetailsStepDrawerMount initiallyExpanded={true} />);
    // There should be a secondary button to close the drawer
    const buttons = component.getByRole('button', { name: /close/i });
    // At least one close button should exist
    await expect(buttons.first()).toBeVisible();
  });

  test('should close drawer when bottom close button clicked', async ({ mount }) => {
    const component = await mount(<DetailsStepDrawerMount initiallyExpanded={true} />);

    // Click the secondary close button (not the X button)
    const closeButtons = component.getByRole('button', { name: /^close$/i });
    await closeButtons.click();

    // Panel should no longer be visible
    const panelTitle = component.getByRole('heading', { name: /associate aws account/i });
    await expect(panelTitle).not.toBeVisible();
  });

  test('should pass product prop to LoginStep', async ({ mount }) => {
    const component = await mount(
      <DetailsStepDrawerMount initiallyExpanded={true} product="ocm" />
    );
    // LoginStep should be rendered (has clipboard copy)
    await expect(component.locator('.pf-v6-c-clipboard-copy').first()).toBeVisible();
  });

  test('should render resizable panel', async ({ mount }) => {
    const component = await mount(<DetailsStepDrawerMount initiallyExpanded={true} />);
    // Panel should have resizable class/attribute
    const panel = component.locator('.pf-v6-c-drawer__panel');
    await expect(panel).toBeVisible();
  });

  test('should pass accessibility tests when collapsed', async ({ mount }) => {
    const component = await mount(<DetailsStepDrawerMount initiallyExpanded={false} />);
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests when expanded', async ({ mount }) => {
    const component = await mount(<DetailsStepDrawerMount initiallyExpanded={true} />);
    await checkAccessibility({ component });
  });
});
