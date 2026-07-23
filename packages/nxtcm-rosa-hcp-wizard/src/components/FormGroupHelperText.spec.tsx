import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../test-helpers';
import { FormGroupHelperTextMount } from './FormGroupHelperText.spec-helpers';

test.describe('FormGroupHelperText', () => {
  test('should not render when no children and no error', async ({ mount }) => {
    const component = await mount(<FormGroupHelperTextMount />);
    await expect(component.locator('.pf-v6-c-form__helper-text')).not.toBeVisible();
  });

  test('should render helper text from children', async ({ mount }) => {
    const component = await mount(
      <FormGroupHelperTextMount>This is helpful text</FormGroupHelperTextMount>
    );
    await expect(component.getByText('This is helpful text')).toBeVisible();
  });

  test('should not show error when touched is false', async ({ mount }) => {
    const component = await mount(
      <FormGroupHelperTextMount error="This field is required" touched={false} />
    );
    await expect(component.getByText('This field is required')).not.toBeVisible();
  });

  test('should show error when touched is true', async ({ mount }) => {
    const component = await mount(
      <FormGroupHelperTextMount error="This field is required" touched={true} />
    );
    await expect(component.getByText('This field is required')).toBeVisible();
  });

  test('should show error icon when error is displayed', async ({ mount }) => {
    const component = await mount(
      <FormGroupHelperTextMount error="Invalid value" touched={true} />
    );
    const errorIcon = component.locator('.pf-v6-c-helper-text__item-icon svg');
    await expect(errorIcon).toBeVisible();
  });

  test('should show error on submit validation mode', async ({ mount }) => {
    const component = await mount(
      <FormGroupHelperTextMount error="Required field" touched={false} validateOnSubmit={true} />
    );
    await expect(component.getByText('Required field')).toBeVisible();
  });

  test('should prioritize error over helper text when both present', async ({ mount }) => {
    const component = await mount(
      <FormGroupHelperTextMount error="Error message" touched={true}>
        Helper message
      </FormGroupHelperTextMount>
    );
    await expect(component.getByText('Error message')).toBeVisible();
    await expect(component.getByText('Helper message')).not.toBeVisible();
  });

  test('should show helper text when error exists but not touched', async ({ mount }) => {
    const component = await mount(
      <FormGroupHelperTextMount error="Error message" touched={false}>
        Helper message
      </FormGroupHelperTextMount>
    );
    await expect(component.getByText('Helper message')).toBeVisible();
    await expect(component.getByText('Error message')).not.toBeVisible();
  });

  test('should use provided id attribute', async ({ mount }) => {
    const component = await mount(
      <FormGroupHelperTextMount id="custom-helper-id">Helper text</FormGroupHelperTextMount>
    );
    await expect(component.locator('#custom-helper-id')).toBeVisible();
  });

  test('should pass accessibility tests with helper text', async ({ mount }) => {
    const component = await mount(<FormGroupHelperTextMount>Helper text</FormGroupHelperTextMount>);
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests with error', async ({ mount }) => {
    const component = await mount(
      <FormGroupHelperTextMount error="Error message" touched={true} />
    );
    await checkAccessibility({ component });
  });
});
