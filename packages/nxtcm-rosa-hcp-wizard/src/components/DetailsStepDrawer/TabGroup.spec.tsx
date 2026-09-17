import { expect, test } from '@/ct-fixture';
import { checkAccessibility } from '../../test-helpers';

test.describe('TabGroup', () => {
  test('should render all tab buttons', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/TabGroup/TabGroupMount'
    );
    await expect(component.getByRole('button', { name: 'Tab 1' })).toBeVisible();
    await expect(component.getByRole('button', { name: 'Tab 2' })).toBeVisible();
    await expect(component.getByRole('button', { name: 'Tab 3' })).toBeVisible();
  });

  test('should show first tab content by default', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/TabGroup/TabGroupMount'
    );
    await expect(component.getByText('Tab 1 Content')).toBeVisible();
    await expect(component.getByText('Tab 2 Content')).not.toBeVisible();
    await expect(component.getByText('Tab 3 Content')).not.toBeVisible();
  });

  test('should have first tab selected by default', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/TabGroup/TabGroupMount'
    );
    const firstTab = component.getByRole('button', { name: 'Tab 1' });
    await expect(firstTab).toHaveAttribute('aria-pressed', 'true');
  });

  test('should switch to second tab when clicked', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/TabGroup/TabGroupMount'
    );

    const secondTab = component.getByRole('button', { name: 'Tab 2' });
    await secondTab.click();

    await expect(component.getByText('Tab 2 Content')).toBeVisible();
    await expect(component.getByText('Tab 1 Content')).not.toBeVisible();
    await expect(secondTab).toHaveAttribute('aria-pressed', 'true');
  });

  test('should switch to third tab when clicked', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/TabGroup/TabGroupMount'
    );

    const thirdTab = component.getByRole('button', { name: 'Tab 3' });
    await thirdTab.click();

    await expect(component.getByText('Tab 3 Content')).toBeVisible();
    await expect(component.getByText('Tab 1 Content')).not.toBeVisible();
    await expect(component.getByText('Tab 2 Content')).not.toBeVisible();
  });

  test('should switch between tabs multiple times', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/TabGroup/TabGroupMount'
    );

    await component.getByRole('button', { name: 'Tab 2' }).click();
    await expect(component.getByText('Tab 2 Content')).toBeVisible();

    await component.getByRole('button', { name: 'Tab 3' }).click();
    await expect(component.getByText('Tab 3 Content')).toBeVisible();

    await component.getByRole('button', { name: 'Tab 1' }).click();
    await expect(component.getByText('Tab 1 Content')).toBeVisible();
  });

  test('should support custom testids on tabs', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/TabGroup/TabGroupMount'
    );
    await expect(component.getByTestId('tab-1')).toBeVisible();
    await expect(component.getByTestId('tab-2')).toBeVisible();
    await expect(component.getByTestId('tab-3')).toBeVisible();
  });

  test('should render complex tab content', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/TabGroup/TabGroupMount',
      { variant: 'complex' }
    );

    await expect(component.getByText('Paragraph')).toBeVisible();
    await expect(component.getByText('Item 1')).toBeVisible();
    await expect(component.getByText('Item 2')).toBeVisible();
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/TabGroup/TabGroupMount'
    );
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests after tab switch', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/TabGroup/TabGroupMount'
    );
    await component.getByRole('button', { name: 'Tab 2' }).click();
    await checkAccessibility({ component });
  });
});
