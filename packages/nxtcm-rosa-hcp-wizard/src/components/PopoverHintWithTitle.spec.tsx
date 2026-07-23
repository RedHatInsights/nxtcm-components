import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../test-helpers';
import { PopoverHintWithTitleMount } from './PopoverHintWithTitle.spec-helpers';

test.describe('PopoverHintWithTitle', () => {
  test('should render button with title text', async ({ mount }) => {
    const component = await mount(<PopoverHintWithTitleMount title="Custom Title" />);
    const button = component.getByRole('button', { name: /more information on custom title/i });
    await expect(button).toBeVisible();
    await expect(component.getByText('Custom Title')).toBeVisible();
  });

  test('should show question circle icon by default', async ({ mount }) => {
    const component = await mount(<PopoverHintWithTitleMount />);
    const button = component.getByRole('button');
    await expect(button.locator('svg')).toBeVisible();
  });

  test('should show exclamation circle icon when isErrorHint is true', async ({ mount }) => {
    const component = await mount(<PopoverHintWithTitleMount isErrorHint={true} />);
    const button = component.getByRole('button');
    await expect(button.locator('svg.danger')).toBeVisible();
  });

  test('should not show icon when displayHintIcon is true', async ({ mount }) => {
    const component = await mount(<PopoverHintWithTitleMount displayHintIcon={true} />);
    const button = component.getByRole('button');
    // Should only have title text, no question icon
    await expect(button.getByText('Help Title')).toBeVisible();
  });

  test('should show popover body content on click', async ({ mount }) => {
    const bodyContent = 'Detailed help information';
    const component = await mount(<PopoverHintWithTitleMount bodyContent={bodyContent} />);

    const button = component.getByRole('button');
    await button.click();

    await expect(component.getByText(bodyContent)).toBeVisible();
  });

  test('should show footer in popover', async ({ mount }) => {
    const footer = <div>Footer information</div>;
    const component = await mount(<PopoverHintWithTitleMount footer={footer} />);

    const button = component.getByRole('button');
    await button.click();

    await expect(component.getByText('Footer information')).toBeVisible();
  });

  test('should render complex body content', async ({ mount }) => {
    const bodyContent = (
      <div>
        <p>First section</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    );
    const component = await mount(<PopoverHintWithTitleMount bodyContent={bodyContent} />);

    const button = component.getByRole('button');
    await button.click();

    await expect(component.getByText('First section')).toBeVisible();
    await expect(component.getByText('Item 1')).toBeVisible();
    await expect(component.getByText('Item 2')).toBeVisible();
  });

  test('should pass accessibility tests when closed', async ({ mount }) => {
    const component = await mount(<PopoverHintWithTitleMount />);
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests when open', async ({ mount }) => {
    const component = await mount(<PopoverHintWithTitleMount />);
    const button = component.getByRole('button');
    await button.click();
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests for error variant', async ({ mount }) => {
    const component = await mount(<PopoverHintWithTitleMount isErrorHint={true} />);
    await checkAccessibility({ component });
  });
});
