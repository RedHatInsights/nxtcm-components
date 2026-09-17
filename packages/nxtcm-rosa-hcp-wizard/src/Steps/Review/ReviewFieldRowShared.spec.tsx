import { expect, test } from '@/ct-fixture';
import { checkAccessibility } from '../../test-helpers';

test.describe('ReviewFieldValueWithLock', () => {
  test('should render children content', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRowShared/ReviewFieldValueWithLockMount',
      { children: 'Custom Value' }
    );
    await expect(component.getByText('Custom Value')).toBeVisible();
  });

  test('should not show screen reader text when not locked', async ({ mount }) => {
    const srText = 'Cannot be changed';
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRowShared/ReviewFieldValueWithLockMount',
      { noEditAfterStep: false, lockedSettingsScreenReaderText: srText, children: 'Value' }
    );
    await expect(component.getByText(srText)).not.toBeVisible();
    await expect(component.getByText('Value')).toBeVisible();
  });

  test('should show lock icon when noEditAfterStep is true', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRowShared/ReviewFieldValueWithLockMount',
      { noEditAfterStep: true, children: 'Value' }
    );
    // Lock icon is rendered as SVG
    const icons = component.locator('svg');
    await expect(icons.first()).toBeVisible();
  });

  test('should show screen reader text when locked', async ({ mount }) => {
    const srText = 'Cannot be changed';
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRowShared/ReviewFieldValueWithLockMount',
      { noEditAfterStep: true, lockedSettingsScreenReaderText: srText, children: 'Value' }
    );
    await expect(component.getByText(srText)).toBeVisible();
  });

  test('should support ReactNode as children', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRowShared/ReviewFieldValueWithComplexChildren'
    );
    await expect(component.getByText('Part 1')).toBeVisible();
    await expect(component.getByText('Part 2')).toBeVisible();
  });

  test('should pass accessibility tests without lock', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRowShared/ReviewFieldValueWithLockMount',
      { noEditAfterStep: false }
    );
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests with lock', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewFieldRowShared/ReviewFieldValueWithLockMount',
      { noEditAfterStep: true }
    );
    await checkAccessibility({ component });
  });
});
