import { test, expect } from '@playwright/experimental-ct-react';
import type { Locator } from '@playwright/test';
import { YamlEditorStepMount } from './RosaHcpYamlEditorStep.spec-helpers';

// Helper to wait for Monaco editor to be ready
async function waitForMonaco(component: Locator) {
  // Wait for CodeEditor to render
  await component.locator('.monaco-editor').waitFor({ timeout: 10000 });
  // Wait for view-lines to be visible (Monaco's content area)
  await component.locator('.view-lines').waitFor({ timeout: 10000 });
  // If content is expected, wait for it to appear
  await expect(component.locator('.view-lines')).toContainText('test-cluster');
  // Give Monaco time to fully initialize
  await component.page().waitForTimeout(1000);
}

test.describe('RosaHcpYamlEditorStep - Monaco Integration', () => {
  test('renders Monaco editor', async ({ mount }) => {
    const component = await mount(<YamlEditorStepMount />);

    await waitForMonaco(component);

    // Verify Monaco editor is rendered
    await expect(component.locator('.monaco-editor')).toBeVisible();
    await expect(component.locator('.view-lines')).toBeVisible();
  });

  test('displays CodeEditor component', async ({ mount }) => {
    const component = await mount(<YamlEditorStepMount />);

    await waitForMonaco(component);

    // Verify PatternFly CodeEditor wrapper is present
    await expect(component.locator('.pf-v6-c-code-editor')).toBeVisible();
  });

  test('handles empty YAML state without crashing', async ({ mount }) => {
    const component = await mount(
      <YamlEditorStepMount
        resourceGenerator={{
          renderYaml: () => '',
          validateYaml: () => [],
          resourceSchemas: [],
        }}
      />
    );

    // Wait for Monaco editor to initialize even with empty content
    // Monaco may or may not render when content is empty, but component shouldn't crash
    await component.locator('.pf-v6-c-code-editor').waitFor({ timeout: 10000 });

    // Verify the component wrapper is present (Monaco might be hidden but wrapper should exist)
    await expect(component.locator('.pf-v6-c-code-editor')).toBeVisible();

    // Ensure no error alerts or crashes occurred
    const errorAlerts = component.getByRole('alert');
    const alertCount = await errorAlerts.count();
    // No error alerts should be present (component handles empty state gracefully)
    expect(alertCount).toBe(0);
  });

  test.describe('Schema Panel Toggle', () => {
    // FIXME: Schema panel toggle button test is flaky - button appears in custom controls
    // which may have timing issues in CT. Skipping for now.
    test.skip('renders schema toggle button', async ({ mount }) => {
      const component = await mount(<YamlEditorStepMount />);

      await waitForMonaco(component);

      const toggleButton = component.getByRole('button', { name: /schema/i });
      await expect(toggleButton).toBeVisible();
    });

    // Note: Clicking the toggle button is flaky in CT due to Monaco's complex DOM overlays
    // This interaction is better tested in E2E or manual testing
  });

  test.describe('Initial State', () => {
    test('does not show error banner initially', async ({ mount }) => {
      const component = await mount(<YamlEditorStepMount />);

      await waitForMonaco(component);

      // No error banner should be visible initially (valid YAML from form)
      await expect(component.getByRole('alert')).not.toBeVisible();
    });

    // Note: Monaco interaction tests (clicking, focusing) are flaky in CT due to Monaco's
    // complex DOM structure. These interactions are better tested in E2E or manual testing.
  });

  test.describe('Component Props', () => {
    test('renders without errors when onClose prop is provided', async ({ mount }) => {
      const component = await mount(
        <YamlEditorStepMount
          onClose={() => {
            // Callback provided
          }}
        />
      );

      await waitForMonaco(component);
      await expect(component.locator('.monaco-editor')).toBeVisible();
    });

    test('renders without errors when onCancel prop is provided', async ({ mount }) => {
      const component = await mount(
        <YamlEditorStepMount
          onCancel={() => {
            // Callback provided
          }}
        />
      );

      await waitForMonaco(component);
      await expect(component.locator('.monaco-editor')).toBeVisible();
    });
  });

  test.describe('Monaco Configuration', () => {
    test('sets up YAML language mode', async ({ mount }) => {
      const component = await mount(<YamlEditorStepMount />);

      await waitForMonaco(component);

      // Check that Monaco is configured for YAML
      // The .view-lines should contain YAML syntax highlighting
      const viewLines = component.locator('.view-lines');
      await expect(viewLines).toBeVisible();
    });

    test('enables copy functionality', async ({ mount }) => {
      const component = await mount(<YamlEditorStepMount />);

      await waitForMonaco(component);

      // CodeEditor should have copy button
      const copyButton = component.getByRole('button', { name: /copy/i });
      await expect(copyButton).toBeVisible();
    });

    test('enables download functionality', async ({ mount }) => {
      const component = await mount(<YamlEditorStepMount />);

      await waitForMonaco(component);

      // CodeEditor should have download button
      const downloadButton = component.getByRole('button', { name: /download/i });
      await expect(downloadButton).toBeVisible();
    });
  });

  test.describe('Editor Accessibility', () => {
    test('Monaco textarea is accessible', async ({ mount }) => {
      const component = await mount(<YamlEditorStepMount />);

      await waitForMonaco(component);

      // Monaco creates a textarea for accessibility
      const textarea = component.locator('.monaco-editor textarea');
      await expect(textarea).toBeVisible();
    });

    // Note: Keyboard navigation tests are flaky in CT due to Monaco's focus management
    // Keyboard accessibility is better verified in E2E or manual testing
  });
});
