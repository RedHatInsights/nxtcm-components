import { expect, test } from '@/ct-fixture';
import { checkAccessibility } from '../../test-helpers';

test.describe('AssociateAWSAccountInfo', () => {
  test('should render expandable section with title', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount',
      { title: 'Step 1: Login' }
    );
    const toggle = component.getByRole('button', { name: /step 1: login/i });
    await expect(toggle).toBeVisible();
  });

  test('should be collapsed by default', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount',
      { childVariant: 'hidden' }
    );
    // Content should not be visible when collapsed
    await expect(component.getByText('Hidden content')).not.toBeVisible();
  });

  test('should be expanded when initiallyExpanded is true', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount',
      { initiallyExpanded: true, childVariant: 'visible' }
    );
    await expect(component.getByText('Visible content')).toBeVisible();
  });

  test('should expand when toggle is clicked', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount',
      { childVariant: 'expandable' }
    );

    const toggle = component.getByRole('button');
    await toggle.click();

    await expect(component.getByText('Expandable content')).toBeVisible();
  });

  test('should collapse when toggle is clicked again', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount',
      { initiallyExpanded: true, childVariant: 'collapsible' }
    );

    const toggle = component.getByRole('button');
    await toggle.click();

    await expect(component.getByText('Collapsible content')).not.toBeVisible();
  });

  test('should render children content', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount',
      { initiallyExpanded: true, childVariant: 'complex' }
    );

    await expect(component.getByText('Paragraph 1')).toBeVisible();
    await expect(component.getByText('Item 1')).toBeVisible();
  });

  test('should pass accessibility tests when collapsed', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount'
    );
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests when expanded', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/AssociateAWSAccountInfo/AssociateAWSAccountInfoMount',
      { initiallyExpanded: true }
    );
    await checkAccessibility({ component });
  });
});
