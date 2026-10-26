import { expect, test } from '@/playwright/ct-fixture';

import { checkAccessibility } from '../../test-helpers';
import type { ReviewFieldRowMount } from './ReviewFieldRow.story';

test.describe('ReviewFieldRow', () => {
  test('should render label and value', async ({ mount }) => {
    const component = await mount<typeof ReviewFieldRowMount>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRow/ReviewFieldRowMount',
      { labelText: 'Cluster Name', value: 'my-cluster' }
    );
    await expect(component.getByText('Cluster Name')).toBeVisible();
    await expect(component.getByText('my-cluster')).toBeVisible();
  });

  test('should not render when hideInReview is true', async ({ mount }) => {
    const component = await mount<typeof ReviewFieldRowMount>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRow/ReviewFieldRowMount',
      { labelText: 'Hidden Field', hideInReview: true }
    );
    await expect(component.getByText('Hidden Field')).toBeHidden();
  });

  test('should display editable values without a locked-setting explanation', async ({ mount }) => {
    const component = await mount<typeof ReviewFieldRowMount>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRow/ReviewFieldRowMount',
      { labelText: 'Test', noEditAfterStep: false }
    );
    await expect(component.getByText('Test')).toBeVisible();
    await expect(
      component.getByText('This setting cannot be changed after cluster creation')
    ).toHaveCount(0);
  });

  test('should show screen reader text for locked settings', async ({ mount }) => {
    const srText = 'Cannot change after creation';
    const component = await mount<typeof ReviewFieldRowMount>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRow/ReviewFieldRowMount',
      { noEditAfterStep: true, lockedSettingsScreenReaderText: srText }
    );
    await expect(component.getByText(srText)).toBeVisible();
  });

  test('should show expandable toggle when collapseOnRequired is true', async ({ mount }) => {
    const component = await mount<typeof ReviewFieldRowMount>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRow/ReviewFieldRowMount',
      { labelText: 'Long Field', value: 'Very long content here', collapseOnRequired: true }
    );
    const toggle = component.getByRole('button', { name: /show more/i });
    await expect(toggle).toBeVisible();
  });

  test('should not show value directly when collapseOnRequired is true and not expanded', async ({
    mount,
  }) => {
    const component = await mount<typeof ReviewFieldRowMount>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRow/ReviewFieldRowMount',
      { labelText: 'Collapsed Field', value: 'Hidden content', collapseOnRequired: true }
    );
    // Value should not be visible until expanded
    const value = component.getByText('Hidden content', { exact: true });
    await expect(value).toBeHidden();
  });

  test('should expand to show value when toggle clicked', async ({ mount }) => {
    const component = await mount<typeof ReviewFieldRowMount>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRow/ReviewFieldRowMount',
      { labelText: 'Expandable Field', value: 'Expandable content', collapseOnRequired: true }
    );
    const toggle = component.getByRole('button', { name: /show more/i });
    await toggle.click();

    await expect(component.getByText('Expandable content')).toBeVisible();
  });

  test('should change toggle text when expanded', async ({ mount }) => {
    const component = await mount<typeof ReviewFieldRowMount>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRow/ReviewFieldRowMount',
      { collapseOnRequired: true }
    );
    const toggle = component.getByRole('button', { name: /show more/i });
    await toggle.click();

    // Toggle text should change to "Show less"
    await expect(component.getByRole('button', { name: /show less/i })).toBeVisible();
  });

  test('should collapse when toggle clicked again', async ({ mount }) => {
    const component = await mount<typeof ReviewFieldRowMount>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRow/ReviewFieldRowMount',
      { value: 'Collapsible content', collapseOnRequired: true }
    );
    const showMoreToggle = component.getByRole('button', { name: /show more/i });
    await showMoreToggle.click();

    // Now click to collapse
    const showLessToggle = component.getByRole('button', { name: /show less/i });
    await showLessToggle.click();

    await expect(component.getByText('Collapsible content', { exact: true })).toBeHidden();
  });

  test('should show value directly when collapseOnRequired is false', async ({ mount }) => {
    const component = await mount<typeof ReviewFieldRowMount>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRow/ReviewFieldRowMount',
      { labelText: 'Normal Field', value: 'Direct value', collapseOnRequired: false }
    );
    await expect(component.getByText('Direct value')).toBeVisible();
    // No toggle button should exist
    await expect(component.getByRole('button', { name: /show/i })).toBeHidden();
  });

  test('should pass accessibility tests in collapsed state', async ({ mount }) => {
    const component = await mount<typeof ReviewFieldRowMount>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRow/ReviewFieldRowMount',
      { collapseOnRequired: true }
    );
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests in expanded state', async ({ mount }) => {
    const component = await mount<typeof ReviewFieldRowMount>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRow/ReviewFieldRowMount',
      { collapseOnRequired: true }
    );
    const toggle = component.getByRole('button', { name: /show more/i });
    await toggle.click();
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests with locked field', async ({ mount }) => {
    const component = await mount<typeof ReviewFieldRowMount>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRow/ReviewFieldRowMount',
      { noEditAfterStep: true }
    );
    await checkAccessibility({ component });
  });
});
