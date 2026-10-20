import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../test-helpers';
import { LoginStepMount } from './LoginStep.spec-helpers';

test.describe('LoginStep', () => {
  test('should render for ACM product by default', async ({ mount }) => {
    const component = await mount(<LoginStepMount />);
    const textbox = component.getByRole('textbox');
    await expect(textbox).toBeVisible();
    await expect(textbox).toHaveValue(/rosa login --client-id.*--client-secret/);
  });

  test('should render for OCM product', async ({ mount }) => {
    const component = await mount(<LoginStepMount product="ocm" />);
    const textbox = component.getByRole('textbox');
    await expect(textbox).toBeVisible();
    await expect(textbox).toHaveValue(
      /rosa login --use-auth-code --url https:\/\/api\.openshift\.com/
    );
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<LoginStepMount />);
    await checkAccessibility({ component });
  });
});
