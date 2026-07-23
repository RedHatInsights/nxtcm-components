import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../../../test-helpers';
import { RadioGroupContextMount } from './RadioGroupContext.spec-helpers';

test.describe('RadioGroupContext', () => {
  test('should provide context values', async ({ mount }) => {
    const component = await mount(
      <RadioGroupContextMount
        initialValue="test-value"
        readonly={false}
        disabled={false}
        radioGroup="my-radio-group"
      />
    );

    await expect(component.getByTestId('context-value')).toHaveText('test-value');
    await expect(component.getByTestId('context-readonly')).toHaveText('false');
    await expect(component.getByTestId('context-disabled')).toHaveText('false');
    await expect(component.getByTestId('context-radioGroup')).toHaveText('my-radio-group');
  });

  test('should allow setting readonly state', async ({ mount }) => {
    const component = await mount(<RadioGroupContextMount readonly={true} />);
    await expect(component.getByTestId('context-readonly')).toHaveText('true');
  });

  test('should allow setting disabled state', async ({ mount }) => {
    const component = await mount(<RadioGroupContextMount disabled={true} />);
    await expect(component.getByTestId('context-disabled')).toHaveText('true');
  });

  test('should support setValue function', async ({ mount }) => {
    const component = await mount(<RadioGroupContextMount initialValue="initial" />);

    await expect(component.getByTestId('context-value')).toHaveText('initial');

    await component.getByTestId('change-value-button').click();

    await expect(component.getByTestId('context-value')).toHaveText('new-value');
  });

  test('should handle undefined initial value', async ({ mount }) => {
    const component = await mount(<RadioGroupContextMount />);
    await expect(component.getByTestId('context-value')).toHaveText('none');
  });

  test('should support different value types', async ({ mount }) => {
    const component = await mount(<RadioGroupContextMount initialValue={42} />);
    await expect(component.getByTestId('context-value')).toHaveText('42');
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<RadioGroupContextMount initialValue="test" />);
    await checkAccessibility({ component });
  });
});
