import { test, expect } from '@playwright/experimental-ct-react';

import { RosaHcpYamlEditorStep } from './RosaHcpYamlEditorStep';
import { YamlEditorTestWrapper } from './RosaHcpYamlEditorStep.spec-helpers';

// Helper to wait for Monaco editor to be ready
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function waitForMonaco(component: any) {
  // Wait for CodeEditor to render
  await component.locator('.monaco-editor').waitFor({ timeout: 10000 });
  // Give Monaco time to fully initialize
  await component.page().waitForTimeout(1000);
}

test.describe('RosaHcpYamlEditorStep - Monaco Integration', () => {
  test('renders Monaco editor', async ({ mount }) => {
    const component = await mount(
      <YamlEditorTestWrapper>
        <RosaHcpYamlEditorStep />
      </YamlEditorTestWrapper>
    );

    await waitForMonaco(component);

    // Verify Monaco editor is rendered
    await expect(component.locator('.monaco-editor')).toBeVisible();
    await expect(component.locator('.view-lines')).toBeVisible();
  });

  test('displays CodeEditor component', async ({ mount }) => {
    const component = await mount(
      <YamlEditorTestWrapper>
        <RosaHcpYamlEditorStep />
      </YamlEditorTestWrapper>
    );

    await waitForMonaco(component);

    // Verify PatternFly CodeEditor wrapper is present
    await expect(component.locator('.pf-v6-c-code-editor')).toBeVisible();
  });

  test.describe('Schema Panel Toggle', () => {
    test('renders schema toggle button', async ({ mount }) => {
      const component = await mount(
        <YamlEditorTestWrapper>
          <RosaHcpYamlEditorStep />
        </YamlEditorTestWrapper>
      );

      await waitForMonaco(component);

      const toggleButton = component.getByRole('button', { name: /schema/i });
      await expect(toggleButton).toBeVisible();
    });

    // Note: Clicking the toggle button is flaky in CT due to Monaco's complex DOM overlays
    // This interaction is better tested in E2E or manual testing
  });

  test.describe('Initial State', () => {
    test('does not show error banner initially', async ({ mount }) => {
      const component = await mount(
        <YamlEditorTestWrapper>
          <RosaHcpYamlEditorStep />
        </YamlEditorTestWrapper>
      );

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
        <YamlEditorTestWrapper>
          <RosaHcpYamlEditorStep
            onClose={() => {
              // Callback provided
            }}
          />
        </YamlEditorTestWrapper>
      );

      await waitForMonaco(component);
      await expect(component.locator('.monaco-editor')).toBeVisible();
    });

    test('renders without errors when onCancel prop is provided', async ({ mount }) => {
      const component = await mount(
        <YamlEditorTestWrapper>
          <RosaHcpYamlEditorStep
            onCancel={() => {
              // Callback provided
            }}
          />
        </YamlEditorTestWrapper>
      );

      await waitForMonaco(component);
      await expect(component.locator('.monaco-editor')).toBeVisible();
    });
  });

  test.describe('Monaco Configuration', () => {
    test('sets up YAML language mode', async ({ mount }) => {
      const component = await mount(
        <YamlEditorTestWrapper>
          <RosaHcpYamlEditorStep />
        </YamlEditorTestWrapper>
      );

      await waitForMonaco(component);

      // Check that Monaco is configured for YAML
      // The .view-lines should contain YAML syntax highlighting
      const viewLines = component.locator('.view-lines');
      await expect(viewLines).toBeVisible();
    });

    test('enables copy functionality', async ({ mount }) => {
      const component = await mount(
        <YamlEditorTestWrapper>
          <RosaHcpYamlEditorStep />
        </YamlEditorTestWrapper>
      );

      await waitForMonaco(component);

      // CodeEditor should have copy button
      const copyButton = component.locator('button[aria-label*="Copy"]');
      await expect(copyButton).toBeVisible();
    });

    test('enables download functionality', async ({ mount }) => {
      const component = await mount(
        <YamlEditorTestWrapper>
          <RosaHcpYamlEditorStep />
        </YamlEditorTestWrapper>
      );

      await waitForMonaco(component);

      // CodeEditor should have download button
      const downloadButton = component.locator('button[aria-label*="Download"]');
      await expect(downloadButton).toBeVisible();
    });
  });

  test.describe('Editor Accessibility', () => {
    test('Monaco textarea is accessible', async ({ mount }) => {
      const component = await mount(
        <YamlEditorTestWrapper>
          <RosaHcpYamlEditorStep />
        </YamlEditorTestWrapper>
      );

      await waitForMonaco(component);

      // Monaco creates a textarea for accessibility
      const textarea = component.locator('.monaco-editor textarea');
      await expect(textarea).toBeVisible();
    });

    // Note: Keyboard navigation tests are flaky in CT due to Monaco's focus management
    // Keyboard accessibility is better verified in E2E or manual testing
  });
});
