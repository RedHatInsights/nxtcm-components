import { expect, test } from '@/playwright/ct-fixture';

import { checkAccessibility } from '../../test-helpers';
import type { AssociateAWSAccountInfoMount } from './AssociateAWSAccountInfo.story';

test.describe('AssociateAWSAccountInfo', () => {
  test('should render expandable section with title', async ({ mount }) => {
    const component = await mount<typeof AssociateAWSAccountInfoMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount',
      { title: 'Step 1: Login' }
    );
    const toggle = component.getByRole('button', { name: /step 1: login/i });
    await expect(toggle).toBeVisible();
  });

  test('should be collapsed by default', async ({ mount }) => {
    const component = await mount<typeof AssociateAWSAccountInfoMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount',
      { childVariant: 'hidden' }
    );
    // Content should not be visible when collapsed
    await expect(component.getByText('Hidden content')).toBeHidden();
  });

  test('should be expanded when initiallyExpanded is true', async ({ mount }) => {
    const component = await mount<typeof AssociateAWSAccountInfoMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount',
      { initiallyExpanded: true, childVariant: 'visible' }
    );
    await expect(component.getByText('Visible content')).toBeVisible();
  });

  test('should expand when toggle is clicked', async ({ mount }) => {
    const component = await mount<typeof AssociateAWSAccountInfoMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount',
      { childVariant: 'expandable' }
    );

    const toggle = component.getByRole('button');
    await toggle.click();

    await expect(component.getByText('Expandable content')).toBeVisible();
  });

  test('should collapse when toggle is clicked again', async ({ mount }) => {
    const component = await mount<typeof AssociateAWSAccountInfoMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount',
      { initiallyExpanded: true, childVariant: 'collapsible' }
    );

    const toggle = component.getByRole('button');
    await toggle.click();

    await expect(component.getByText('Collapsible content')).toBeHidden();
  });

  test('should render children content', async ({ mount }) => {
    const component = await mount<typeof AssociateAWSAccountInfoMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount',
      { initiallyExpanded: true, childVariant: 'complex' }
    );

    await expect(component.getByText('Paragraph 1')).toBeVisible();
    await expect(component.getByText('Item 1')).toBeVisible();
  });

  test('should pass accessibility tests when collapsed', async ({ mount }) => {
    const component = await mount<typeof AssociateAWSAccountInfoMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount'
    );
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests when expanded', async ({ mount }) => {
    const component = await mount<typeof AssociateAWSAccountInfoMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount',
      { initiallyExpanded: true }
    );
    await checkAccessibility({ component });
  });

  for (const key of ['Enter', 'Space'] as const) {
    test(`${key} expands and collapses the section and keeps focus on the toggle`, async ({
      mount,
      page,
    }) => {
      const component = await mount<typeof AssociateAWSAccountInfoMount>(
        'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount',
        { title: 'Step 1: Login', childVariant: 'expandable' }
      );
      const toggle = component.getByRole('button', { name: /step 1: login/i });
      const content = component.getByText('Expandable content');

      await toggle.focus();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(content).toBeHidden();

      await page.keyboard.press(key);
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(content).toBeVisible();
      await expect(toggle).toBeFocused();

      await page.keyboard.press(key);
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(content).toBeHidden();
      await expect(toggle).toBeFocused();
    });
  }
});
