import { expect, test } from '@/playwright/ct-fixture';

import { checkAccessibility } from '../../test-helpers';
import type { LoginStepMount } from './LoginStep.story';

test.describe('LoginStep', () => {
  test('should render for ACM product by default', async ({ mount }) => {
    const component = await mount<typeof LoginStepMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/LoginStep/LoginStepMount',
      { product: 'acm' }
    );
    const textbox = component.getByRole('textbox');
    await expect(textbox).toBeVisible();
    await expect(textbox).toHaveValue(/rosa login --client-id.*--client-secret/);
  });

  test('should render for OCM product', async ({ mount }) => {
    const component = await mount<typeof LoginStepMount>(
      'nxtcm-rosa-hcp-wizard/components/DetailsStepDrawer/LoginStep/LoginStepMount',
      { product: 'ocm' }
    );
    const textbox = component.getByRole('textbox');
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
