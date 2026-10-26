import { expect, test } from './fixtures';
import {
  appendYamlComment,
  getMonacoYaml,
  navigateToYamlEditor,
} from './helpers/yaml-editor-helpers';

test.describe('ROSA Wizard - YAML Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens YAML editor from Review with cluster creation actions', async ({ page }) => {
    await navigateToYamlEditor(page);

    await expect(page.getByRole('textbox', { name: /Editor content/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create cluster', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel cluster creation' })).toBeVisible();
  });

  test('discards edited YAML after confirmation and returns to Review', async ({ page }) => {
    await navigateToYamlEditor(page);
    await appendYamlComment(page, 'discard this change');
    await page.getByRole('button', { name: 'Discard changes and go back to Review step' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText('Any changes you made to the YAML configuration will be lost.')
    ).toBeVisible();
    await dialog.getByRole('button', { name: 'Yes', exact: true }).click();

    await expect(page.getByRole('button', { name: 'Edit in YAML' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Editor content/ })).toHaveCount(0);
    await page.getByRole('button', { name: 'Edit in YAML' }).click();
    await expect(page.getByRole('textbox', { name: /Editor content/ })).toBeVisible();
    await expect.poll(() => getMonacoYaml(page)).toContain('kind: ROSAControlPlane');
    await expect.poll(() => getMonacoYaml(page)).not.toContain('# discard this change');
  });

  test('keeps edited YAML when discard confirmation is canceled', async ({ page }) => {
    await navigateToYamlEditor(page);
    await appendYamlComment(page, 'keep this change');
    await page.getByRole('button', { name: 'Discard changes and go back to Review step' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByRole('textbox', { name: /Editor content/ })).toBeVisible();
    await expect.poll(() => getMonacoYaml(page)).toContain('# keep this change');
  });

  test('displays initial YAML generated from form data', async ({ page }) => {
    await navigateToYamlEditor(page);
    const yaml = await getMonacoYaml(page);

    expect(yaml).toContain('kind: ROSAControlPlane');
    expect(yaml).toContain('apiVersion: controlplane.cluster.x-k8s.io/v1beta2');
    expect(yaml).toContain("rosaClusterName: 'test-cluster'");
    expect(yaml).toContain("version: '4.12.0'");
    expect(yaml).toContain("region: 'us-east-1'");
  });

  test('updates the YAML document through keyboard editing', async ({ page }) => {
    await navigateToYamlEditor(page);
    const initialYaml = await getMonacoYaml(page);
    await appendYamlComment(page, 'keyboard edit');

    const editedYaml = await getMonacoYaml(page);
    expect(editedYaml).not.toBe(initialYaml);
    expect(editedYaml).toContain("rosaClusterName: 'test-cluster'");
  });

  test('hides and reopens the schema panel', async ({ page }) => {
    await navigateToYamlEditor(page);
    const schema = page.getByRole('heading', { name: 'ROSAControlPlane schema' });
    await expect(schema).toBeVisible();
    await page.getByRole('button', { name: 'Toggle schema panel' }).first().click();
    await expect(schema).toBeHidden();
    await page.getByRole('button', { name: 'Toggle schema panel' }).click();
    await expect(schema).toBeVisible();
  });
});
