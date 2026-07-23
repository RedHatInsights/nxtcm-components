import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../test-helpers';
import { PopoverHintMount } from './PopoverHint.spec-helpers';

test.describe('PopoverHint', () => {
  test('should render popover button', async ({ mount }) => {
    const component = await mount(<PopoverHintMount />);
    await expect(component.getByRole('button', { name: /more information/i })).toBeVisible();
  });

  test('should show question circle icon by default', async ({ mount }) => {
    const component = await mount(<PopoverHintMount />);
    const button = component.getByRole('button');
    await expect(button).toBeVisible();
    // Icon should be inside the button
    await expect(button.locator('svg')).toBeVisible();
  });

  test('should show exclamation circle icon when isError is true', async ({ mount }) => {
    const component = await mount(<PopoverHintMount isError={true} />);
    const button = component.getByRole('button', { name: /error/i });
    await expect(button).toBeVisible();
  });

  test('should use custom button aria label when provided', async ({ mount }) => {
    const component = await mount(<PopoverHintMount buttonAriaLabel="Custom help button" />);
    await expect(component.getByRole('button', { name: 'Custom help button' })).toBeVisible();
  });

  test('should show popover content on click', async ({ mount }) => {
    const hint = 'Detailed help information';
    const component = await mount(<PopoverHintMount hint={hint} />);

    const button = component.getByRole('button');
    await button.click();

    await expect(component.getByText(hint)).toBeVisible();
  });

  test('should show title in popover header', async ({ mount }) => {
    const component = await mount(<PopoverHintMount title="Help Title" hint="Help content" />);

    const button = component.getByRole('button');
    await button.click();

    await expect(component.getByText('Help Title')).toBeVisible();
  });

  test('should show footer in popover', async ({ mount }) => {
    const component = await mount(
      <PopoverHintMount hint="Main content" footer={<div>Footer content</div>} />
    );

    const button = component.getByRole('button');
    await button.click();

    await expect(component.getByText('Footer content')).toBeVisible();
  });

  test('should render hint with React nodes', async ({ mount }) => {
    const complexHint = (
      <div>
        <p>First paragraph</p>
        <p>Second paragraph</p>
      </div>
    );
    const component = await mount(<PopoverHintMount hint={complexHint} />);

    const button = component.getByRole('button');
    await button.click();

    await expect(component.getByText('First paragraph')).toBeVisible();
    await expect(component.getByText('Second paragraph')).toBeVisible();
  });

  test('should pass accessibility tests when closed', async ({ mount }) => {
    const component = await mount(<PopoverHintMount />);
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests when open', async ({ mount }) => {
    const component = await mount(<PopoverHintMount hint="Help text" />);
    const button = component.getByRole('button');
    await button.click();
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests for error variant', async ({ mount }) => {
    const component = await mount(<PopoverHintMount isError={true} />);
    await checkAccessibility({ component });
  });
});
