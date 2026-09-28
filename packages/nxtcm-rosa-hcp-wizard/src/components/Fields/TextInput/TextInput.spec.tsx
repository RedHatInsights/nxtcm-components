import { expect, test } from '@playwright/experimental-ct-react';

// CT transform only turns an import into importRefs if every specifier is JSX; keep harness imports separate from consts.
import { SecretHarness, TextInputHarness } from './TextInput.spec-helpers';
import {
  API_TOKEN_FIELD_LABEL,
  CLUSTER_NAME_FIELD_LABEL,
  CLUSTER_NAME_HELPER_TEXT,
  CLUSTER_NAME_PLACEHOLDER_TEXT,
  HIDE_PASSWORD_BUTTON_NAME,
  SAMPLE_CLUSTER_NAME_VALUE,
  SAMPLE_SECRET_VALUE,
  SECRET_PLACEHOLDER_TEXT,
  SHOW_PASSWORD_BUTTON_NAME,
} from './TextInput.spec-helpers';

test.describe('TextInput', () => {
  test('renders label, placeholder, and helper text', async ({ mount }) => {
    const mounted = await mount(<TextInputHarness />);
    const clusterNameInput = mounted.getByRole('textbox', { name: CLUSTER_NAME_FIELD_LABEL });
    await expect(clusterNameInput).toBeVisible();
    await expect(clusterNameInput).toHaveAttribute('placeholder', CLUSTER_NAME_PLACEHOLDER_TEXT);
    await expect(mounted.getByText(CLUSTER_NAME_HELPER_TEXT)).toBeVisible();
  });

  test('updates value when the user types', async ({ mount }) => {
    const mounted = await mount(<TextInputHarness />);
    const input = mounted.getByRole('textbox', { name: CLUSTER_NAME_FIELD_LABEL });
    await input.fill(SAMPLE_CLUSTER_NAME_VALUE);
    await expect(input).toHaveValue(SAMPLE_CLUSTER_NAME_VALUE);
  });

  test('reveals and hides secret value when the control button is used', async ({ mount }) => {
    const mounted = await mount(<SecretHarness />);
    const input = mounted.getByRole('textbox', { name: API_TOKEN_FIELD_LABEL });
    await expect(input).toHaveAttribute('type', 'password');
    await mounted.getByRole('button', { name: SHOW_PASSWORD_BUTTON_NAME }).click();
    await expect(input).toHaveAttribute('type', 'text');
    await mounted.getByRole('button', { name: HIDE_PASSWORD_BUTTON_NAME }).click();
    await expect(input).toHaveAttribute('type', 'password');
  });

  test('tooltip shows placeholder while secret is masked and value after reveal', async ({
    mount,
    page,
  }) => {
    const mounted = await mount(<SecretHarness />);
    const input = mounted.getByRole('textbox', { name: API_TOKEN_FIELD_LABEL });

    // While masked, tooltip must show placeholder — never the real secret
    await input.hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText(SECRET_PLACEHOLDER_TEXT);

    // Move away to dismiss tooltip
    await page.mouse.move(0, 0);
    await expect(tooltip).not.toBeVisible();

    // Reveal secret, hover again — tooltip should now show the actual value
    await mounted.getByRole('button', { name: SHOW_PASSWORD_BUTTON_NAME }).click();
    await input.hover();
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText(SAMPLE_SECRET_VALUE);
  });
});
