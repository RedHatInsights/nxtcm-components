import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../test-helpers';
import { CopyInstructionMount } from './CopyInstruction.spec-helpers';

test.describe('CopyInstruction', () => {
  test('should render clipboard copy component', async ({ mount }) => {
    const component = await mount(<CopyInstructionMount />);
    await expect(component.locator('.pf-v6-c-clipboard-copy')).toBeVisible();
  });

  test('should display text content', async ({ mount }) => {
    const component = await mount(
      <CopyInstructionMount>rosa create cluster --name my-cluster</CopyInstructionMount>
    );
    await expect(component.getByText('rosa create cluster --name my-cluster')).toBeVisible();
  });

  test('should render copy button', async ({ mount }) => {
    const component = await mount(<CopyInstructionMount />);
    const copyButton = component.getByRole('button', { name: /copy to clipboard/i });
    await expect(copyButton).toBeVisible();
  });

  test('should be read-only', async ({ mount }) => {
    const component = await mount(<CopyInstructionMount />);
    const input = component.locator('input, textarea');
    if ((await input.count()) > 0) {
      await expect(input).toHaveAttribute('readonly', '');
    }
  });

  test('should support inline variant', async ({ mount }) => {
    const component = await mount(<CopyInstructionMount variant="inline" />);
    await expect(component.locator('.pf-v6-c-clipboard-copy.pf-m-inline')).toBeVisible();
  });

  test('should support expansion variant', async ({ mount }) => {
    const component = await mount(<CopyInstructionMount variant="expansion" />);
    await expect(component.locator('.pf-v6-c-clipboard-copy:not(.pf-m-inline)')).toBeVisible();
  });

  test('should support inline-compact variant', async ({ mount }) => {
    const component = await mount(<CopyInstructionMount variant="inline-compact" />);
    await expect(component.locator('.pf-v6-c-clipboard-copy')).toBeVisible();
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<CopyInstructionMount />);
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests with inline variant', async ({ mount }) => {
    const component = await mount(<CopyInstructionMount variant="inline" />);
    await checkAccessibility({ component });
  });
});
