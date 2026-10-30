import type { Locator } from '@playwright/test';

import { expect, test } from '@/playwright/ct-fixture';

import type { YamlEditorStepMount } from './RosaHcpYamlEditorStep.story';

// Helper to wait for Monaco editor to be ready

async function waitForMonaco(component: Locator): Promise<void> {
  // Wait for the accessible editor and its initial YAML content.
  await component.getByRole('textbox', { name: /editor content/i }).waitFor({ timeout: 10000 });
  await component.getByText('ROSAControlPlane', { exact: true }).waitFor({ timeout: 10000 });
}

test.describe('RosaHcpYamlEditorStep - Monaco Integration', () => {
  test('renders Monaco editor', async ({ mount }) => {
    const component = await mount<typeof YamlEditorStepMount>(
      'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
    );

    await waitForMonaco(component);

    // Verify Monaco editor is rendered
    await expect(component.getByRole('textbox', { name: /editor content/i })).toBeVisible();
    await expect(component.getByText('ROSAControlPlane', { exact: true })).toBeVisible();
  });

  test('displays CodeEditor component', async ({ mount }) => {
    const component = await mount<typeof YamlEditorStepMount>(
      'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
    );

    await waitForMonaco(component);

    // The code editor exposes its copy action.
    await expect(component.getByRole('button', { name: /Copy/ })).toBeVisible();
  });

  test.describe('Schema Panel Toggle', () => {
    test('toggles the schema panel', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      const toggleButton = component.getByTestId('schema-panel-toggle');
      const schemaHeading = component.getByRole('heading', {
        name: /ROSAControlPlane schema/i,
      });

      await expect(toggleButton).toBeVisible();
      await expect(schemaHeading).toBeVisible();

      await toggleButton.click();
      await expect(schemaHeading).toBeHidden();

      await toggleButton.click();
      await expect(schemaHeading).toBeVisible();
    });
  });

  test.describe('Initial State', () => {
    test('does not show error banner initially', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      // No error banner should be visible initially (valid YAML from form)
      await expect(component.getByRole('alert')).toBeHidden();
    });

    // Note: Monaco interaction tests (clicking, focusing) are flaky in CT due to Monaco's
    // complex DOM structure. These interactions are better tested in E2E or manual testing.
  });

  test.describe('Component Props', () => {
    test('renders without errors when onClose prop is provided', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount',
        {
          onClose: true,
        }
      );

      await waitForMonaco(component);
      await expect(component.getByRole('textbox', { name: /editor content/i })).toBeVisible();
    });

    test('renders without errors when onCancel prop is provided', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount',
        {
          onCancel: true,
        }
      );

      await waitForMonaco(component);
      await expect(component.getByRole('textbox', { name: /editor content/i })).toBeVisible();
    });
  });

  test.describe('Monaco Configuration', () => {
    test('displays the initial YAML content', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      // Verify content is rendered in the editor.
      const yamlContent = component.getByText('ROSAControlPlane', { exact: true });
      await expect(yamlContent).toBeVisible();
    });

    test('enables copy functionality', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      // CodeEditor should have copy button
      const copyButton = component.getByRole('button', { name: /Copy/ });
      await expect(copyButton).toBeVisible();
    });

    test('enables download functionality', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      // CodeEditor should have download button
      const downloadButton = component.getByRole('button', { name: /Download/ });
      await expect(downloadButton).toBeVisible();
    });
  });

  test.describe('Editor Accessibility', () => {
    test('Monaco textarea is accessible', async ({ mount }) => {
      const component = await mount<typeof YamlEditorStepMount>(
        'nxtcm-rosa-hcp-wizard/Steps/YamlEditor/RosaHcpYamlEditorStep/YamlEditorStepMount'
      );

      await waitForMonaco(component);

      // Monaco creates a textarea for accessibility
      const textarea = component.getByRole('textbox', { name: /editor content/i });
      await expect(textarea).toBeVisible();
    });

    // Note: Keyboard navigation tests are flaky in CT due to Monaco's focus management
    // Keyboard accessibility is better verified in E2E or manual testing
  });
});
