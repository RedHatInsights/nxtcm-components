import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../test-helpers';
import { ReviewFieldValueWithLockMount } from './ReviewFieldRowShared.spec-helpers';

test.describe('ReviewFieldValueWithLock', () => {
  test('should render children content', async ({ mount }) => {
    const component = await mount(
      <ReviewFieldValueWithLockMount>Custom Value</ReviewFieldValueWithLockMount>
    );
    await expect(component.getByText('Custom Value')).toBeVisible();
  });

  test('should not show screen reader text when not locked', async ({ mount }) => {
    const srText = 'Cannot be changed';
    const component = await mount(
      <ReviewFieldValueWithLockMount
        noEditAfterStep={false}
        lockedSettingsScreenReaderText={srText}
      >
        Value
      </ReviewFieldValueWithLockMount>
    );
    await expect(component.getByText(srText)).not.toBeVisible();
    await expect(component.getByText('Value')).toBeVisible();
  });

  test('should show lock icon when noEditAfterStep is true', async ({ mount }) => {
    const component = await mount(
      <ReviewFieldValueWithLockMount noEditAfterStep={true}>Value</ReviewFieldValueWithLockMount>
    );
    // Lock icon is rendered as SVG
    const icons = component.locator('svg');
    await expect(icons.first()).toBeVisible();
  });

  test('should show screen reader text when locked', async ({ mount }) => {
    const srText = 'Cannot be changed';
    const component = await mount(
      <ReviewFieldValueWithLockMount noEditAfterStep={true} lockedSettingsScreenReaderText={srText}>
        Value
      </ReviewFieldValueWithLockMount>
    );
    await expect(component.getByText(srText)).toBeVisible();
  });

  test('should support ReactNode as children', async ({ mount }) => {
    const complexChildren = (
      <div>
        <span>Part 1</span> <strong>Part 2</strong>
      </div>
    );
    const component = await mount(
      <ReviewFieldValueWithLockMount>{complexChildren}</ReviewFieldValueWithLockMount>
    );
    await expect(component.getByText('Part 1')).toBeVisible();
    await expect(component.getByText('Part 2')).toBeVisible();
  });

  test('should pass accessibility tests without lock', async ({ mount }) => {
    const component = await mount(<ReviewFieldValueWithLockMount noEditAfterStep={false} />);
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests with lock', async ({ mount }) => {
    const component = await mount(<ReviewFieldValueWithLockMount noEditAfterStep={true} />);
    await checkAccessibility({ component });
  });
});
