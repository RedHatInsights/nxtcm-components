import { test, expect } from '../../../../ct-fixture';
import { FieldWrapper, FieldWrapperBlock, FieldWrapperStack } from './FieldWrapper';

test.describe('FieldWrapper', () => {
  test('renders field content inside grid layout', async ({ mount }) => {
    const component = await mount(
      <FieldWrapperStack>
        <FieldWrapper width="medium">
          <span>Cluster name</span>
        </FieldWrapper>
      </FieldWrapperStack>
    );

    await expect(component.getByText('Cluster name')).toBeVisible();
  });

  test('renders additional content below the field', async ({ mount }) => {
    const component = await mount(
      <FieldWrapperStack>
        <FieldWrapper additionalContent={<a href="/help">Learn more</a>}>
          <span>Field label</span>
        </FieldWrapper>
      </FieldWrapperStack>
    );

    await expect(component.getByText('Field label')).toBeVisible();
    await expect(component.getByRole('link', { name: 'Learn more' })).toBeVisible();
  });

  test('renders full-width blocks in the stack', async ({ mount }) => {
    const component = await mount(
      <FieldWrapperStack>
        <FieldWrapperBlock>
          <p>Intro copy</p>
        </FieldWrapperBlock>
        <FieldWrapper>
          <span>Field label</span>
        </FieldWrapper>
      </FieldWrapperStack>
    );

    await expect(component.getByText('Intro copy')).toBeVisible();
    await expect(component.getByText('Field label')).toBeVisible();
  });
});
