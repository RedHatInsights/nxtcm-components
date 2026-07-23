import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../test-helpers';
import { LabelHelpMount } from './LabelHelp.spec-helpers';

test.describe('LabelHelp', () => {
  test('should not render when labelHelp is not provided', async ({ mount }) => {
    const component = await mount(<LabelHelpMount />);
    await expect(component.getByRole('button', { name: /more info/i })).not.toBeVisible();
  });

  test('should render help button when labelHelp is provided', async ({ mount }) => {
    const component = await mount(<LabelHelpMount labelHelp="Help content" />);
    await expect(component.getByRole('button', { name: /more info/i })).toBeVisible();
  });

  test('should show help icon', async ({ mount }) => {
    const component = await mount(<LabelHelpMount labelHelp="Help content" />);
    const button = component.getByRole('button', { name: /more info/i });
    await expect(button.locator('svg')).toBeVisible();
  });

  test('should show popover with help content on click', async ({ mount }) => {
    const helpContent = 'Detailed help information';
    const component = await mount(<LabelHelpMount labelHelp={helpContent} />);

    const button = component.getByRole('button', { name: /more info/i });
    await button.click();

    await expect(component.getByText(helpContent)).toBeVisible();
  });

  test('should show header with labelHelpTitle', async ({ mount }) => {
    const component = await mount(
      <LabelHelpMount labelHelp="Help body" labelHelpTitle="Help Header" />
    );

    const button = component.getByRole('button', { name: /more info/i });
    await button.click();

    await expect(component.getByText('Help Header')).toBeVisible();
    await expect(component.getByText('Help body')).toBeVisible();
  });

  test('should use id for popover and button IDs', async ({ mount }) => {
    const component = await mount(<LabelHelpMount id="custom-field" labelHelp="Help content" />);

    const button = component.locator('#custom-field-label-help-button');
    await expect(button).toBeVisible();
  });

  test('should support ReactNode as labelHelp', async ({ mount }) => {
    const labelHelp = (
      <div>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
      </div>
    );
    const component = await mount(<LabelHelpMount labelHelp={labelHelp} />);

    const button = component.getByRole('button', { name: /more info/i });
    await button.click();

    await expect(component.getByText('Paragraph 1')).toBeVisible();
    await expect(component.getByText('Paragraph 2')).toBeVisible();
  });

  test('should pass accessibility tests when closed', async ({ mount }) => {
    const component = await mount(<LabelHelpMount labelHelp="Help content" />);
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests when open', async ({ mount }) => {
    const component = await mount(<LabelHelpMount labelHelp="Help content" />);
    const button = component.getByRole('button', { name: /more info/i });
    await button.click();
    await checkAccessibility({ component });
  });
});
