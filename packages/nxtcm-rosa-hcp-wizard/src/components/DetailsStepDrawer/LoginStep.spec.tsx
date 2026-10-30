import { expect, test } from '@/playwright/ct-fixture';

import { checkAccessibility } from '../../test-helpers';
import type { LoginStepMount } from './LoginStep.story';

test.describe('LoginStep', () => {
  test('should render ROSA login instruction', async ({ mount }) => {
    const component = await mount<typeof LoginStepMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/LoginStep/LoginStepMount'
    );
    // RosaLoginInstruction should render copy instructions
    await expect(
      component.getByRole('textbox', { name: 'Copyable ROSA login command' })
    ).toBeVisible();
  });

  test('should render for ACM product by default', async ({ mount }) => {
    const component = await mount<typeof LoginStepMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/LoginStep/LoginStepMount',
      { product: 'acm' }
    );
    const copyInstruction = component.getByRole('textbox', { name: 'Copyable ROSA login command' });
    await expect(copyInstruction).toBeVisible();
    const textbox = copyInstruction;
    await expect(textbox).toBeVisible();
    await expect(textbox).toHaveValue(/rosa login --client-id.*--client-secret/);
  });

  test('should render for OCM product', async ({ mount }) => {
    const component = await mount<typeof LoginStepMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/LoginStep/LoginStepMount',
      { product: 'ocm' }
    );
    const copyInstruction = component.getByRole('textbox', { name: 'Copyable ROSA login command' });
    await expect(copyInstruction).toBeVisible();
    const textbox = copyInstruction;
    await expect(textbox).toBeVisible();
    await expect(textbox).toHaveValue(
      /rosa login --use-auth-code --url https:\/\/api\.openshift\.com/
    );
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount<typeof LoginStepMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/LoginStep/LoginStepMount'
    );
    await checkAccessibility({ component });
  });
});
