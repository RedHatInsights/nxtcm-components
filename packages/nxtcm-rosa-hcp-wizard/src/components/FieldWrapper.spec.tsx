import { test, expect } from '../../../../ct-fixture';
import { FieldWrapper, NestedFields } from './FieldWrapper';

test.describe('FieldWrapper', () => {
  test('renders field content', async ({ mount }) => {
    const component = await mount(
      <NestedFields>
        <FieldWrapper size="md">
          <span>Cluster name</span>
        </FieldWrapper>
      </NestedFields>
    );

    await expect(component.getByText('Cluster name')).toBeVisible();
  });

  test('renders additional content below the field', async ({ mount }) => {
    const component = await mount(
      <NestedFields>
        <FieldWrapper additionalContent={<a href="/help">Learn more</a>}>
          <span>Field label</span>
        </FieldWrapper>
      </NestedFields>
    );

    await expect(component.getByText('Field label')).toBeVisible();
    await expect(component.getByRole('link', { name: 'Learn more' })).toBeVisible();
  });

  test('applies size class for constrained field width', async ({ mount }) => {
    const component = await mount(
      <FieldWrapper size="lg">
        <span>Sized field</span>
      </FieldWrapper>
    );

    const field = component.getByText('Sized field');
    await expect(field).toBeVisible();
    await expect(field.locator('..')).toHaveClass(/rosa-hcp-field-wrapper--lg/);
  });

  test('renders full-width blocks alongside fields', async ({ mount }) => {
    const component = await mount(
      <NestedFields>
        <p>Intro copy</p>
        <FieldWrapper>
          <span>Field label</span>
        </FieldWrapper>
      </NestedFields>
    );

    await expect(component.getByText('Intro copy')).toBeVisible();
    await expect(component.getByText('Field label')).toBeVisible();
  });
});
