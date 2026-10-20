import { test, expect } from '@playwright/experimental-ct-react';

import { YamlEditorStepMount } from './RosaHcpYamlEditorStep.spec-helpers';

test.describe('RosaHcpYamlEditorStep', () => {
  test('initializes the editor with schema and export controls and no error', async ({ mount }) => {
    const component = await mount(<YamlEditorStepMount />);

    await expect(component.getByRole('textbox', { name: /Editor content/ })).toBeVisible();
    await expect(component.getByRole('heading', { name: 'ROSAControlPlane schema' })).toBeVisible();
    await expect(
      component.getByRole('button', { name: 'Toggle schema panel' }).first()
    ).toBeVisible();
    await expect(component.getByRole('button', { name: 'Copy code to clipboard' })).toBeVisible();
    await expect(component.getByRole('button', { name: 'Download code' })).toBeVisible();
    await expect(component.getByRole('alert')).toHaveCount(0);
  });
});
