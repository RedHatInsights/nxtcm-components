import { test, expect } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../test-helpers';
import { CopyInstruction } from './CopyInstruction';

test.describe('CopyInstruction', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<CopyInstruction>rosa login --use-auth-code</CopyInstruction>);
    await checkAccessibility({ component });
  });

  test('should render the command text in a copyable input', async ({ mount }) => {
    const component = await mount(<CopyInstruction>rosa create oidc-config</CopyInstruction>);

    const input = component.getByRole('textbox', { name: 'Copyable input' });
    await expect(input).toBeVisible();
    await expect(input).toHaveValue('rosa create oidc-config');
  });

  test('should render a copy button', async ({ mount }) => {
    const component = await mount(<CopyInstruction>rosa login</CopyInstruction>);

    await expect(component.getByRole('button', { name: 'Copy to clipboard' })).toBeVisible();
  });

  test('should apply copy-instruction class to wrapper', async ({ mount, page }) => {
    await mount(<CopyInstruction>rosa login</CopyInstruction>);

    const wrapper = page.locator('pre.copy-instruction');
    await expect(wrapper).toBeAttached();
  });

  test('should merge custom className with copy-instruction class', async ({ mount, page }) => {
    await mount(<CopyInstruction className="custom-class">rosa login</CopyInstruction>);

    const wrapper = page.locator('pre.copy-instruction.custom-class');
    await expect(wrapper).toBeAttached();
  });

  test('should have text wrapping styles for long commands', async ({ mount, page }) => {
    const longCommand = 'rosa login --use-auth-code --url https://api.stage.openshift.com';
    const component = await mount(<CopyInstruction>{longCommand}</CopyInstruction>);

    const input = component.getByRole('textbox', { name: 'Copyable input' });
    await expect(input).toHaveValue(longCommand);

    // Verify the pre wrapper has wrapping styles
    const preWrapper = page.locator('pre.copy-instruction');
    await expect(preWrapper).toHaveCSS('white-space', 'pre-wrap');
    await expect(preWrapper).toHaveCSS('overflow-wrap', 'break-word');
  });
});
