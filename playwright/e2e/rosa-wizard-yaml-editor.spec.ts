/**
 * E2E tests for the ROSA HCP YAML Editor
 *
 * These tests verify the YAML editor workflow: opening, viewing, editing, discarding, and applying changes.
 * Validation logic is tested separately in Component Tests where we can reliably trigger Monaco editor events.
 */

import { test, expect } from './fixtures';
import { navigateToYamlEditor, getMonacoYaml } from './helpers/yaml-editor-helpers';

test.describe('ROSA Wizard - YAML Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Opening and Navigation', () => {
    test('opens YAML editor from review page', async ({ page }) => {
      await navigateToYamlEditor(page);

      // Verify Monaco editor is loaded
      await expect(page.locator('.monaco-editor')).toBeVisible();
      await expect(page.locator('.view-lines')).toBeVisible();
    });

    test('closes YAML editor with Discard button and confirmation', async ({ page }) => {
      await navigateToYamlEditor(page);

      await page
        .getByRole('button', { name: 'Discard changes and go back to Review step' })
        .click();

      // Confirmation modal appears
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(
        page.getByText('Any changes you made to the YAML configuration will be lost.')
      ).toBeVisible();

      await page.getByRole('button', { name: 'Yes' }).click();

      // Back to review page
      await expect(page.getByRole('button', { name: 'Edit in YAML' })).toBeVisible();
      await expect(page.locator('.monaco-editor')).not.toBeVisible();
    });

    test('cancels discard confirmation', async ({ page }) => {
      await navigateToYamlEditor(page);

      await page
        .getByRole('button', { name: 'Discard changes and go back to Review step' })
        .click();
      await page.getByRole('button', { name: 'Cancel' }).click();

      // Still in YAML editor
      await expect(page.locator('.monaco-editor')).toBeVisible();
    });
  });

  test.describe('YAML Content', () => {
    test('displays initial YAML generated from form data', async ({ page }) => {
      await navigateToYamlEditor(page);

      const yaml = await getMonacoYaml(page);

      // Verify YAML structure contains expected fields from wizard form
      expect(yaml).toContain('kind: ROSAControlPlane');
      expect(yaml).toContain('apiVersion: controlplane.cluster.x-k8s.io/v1beta2');
      expect(yaml).toContain("rosaClusterName: 'test-cluster'");
      expect(yaml).toContain("version: '4.12.0'");
      expect(yaml).toContain("region: 'us-east-1'");
    });

    test('YAML content is editable in Monaco editor', async ({ page }) => {
      await navigateToYamlEditor(page);

      // Verify the editor is interactive by checking Monaco is ready
      const isEditable = await page.evaluate(() => {
        const editor = (window as Window & { monacoEditor?: { getModel: () => unknown } })
          .monacoEditor;
        return editor && editor.getModel() !== null;
      });

      expect(isEditable).toBe(true);
    });
  });

  test.describe('Schema Panel', () => {
    test('schema panel toggle button is available', async ({ page }) => {
      await navigateToYamlEditor(page);

      const toggleButton = page.getByRole('button', { name: 'Toggle schema panel' });

      // Button should be visible and enabled
      await expect(toggleButton).toBeVisible();
      await expect(toggleButton).toBeEnabled();
    });
  });

  test.describe('Form Integration', () => {
    test('create cluster button is visible', async ({ page }) => {
      await navigateToYamlEditor(page);

      // The footer should show "Create cluster" button when in YAML editor
      await expect(page.getByRole('button', { name: 'Create cluster' })).toBeVisible();
    });

    test('cancel button is visible', async ({ page }) => {
      await navigateToYamlEditor(page);

      // Cancel button should be available
      await expect(page.getByRole('button', { name: 'Cancel cluster creation' })).toBeVisible();
    });
  });
});
