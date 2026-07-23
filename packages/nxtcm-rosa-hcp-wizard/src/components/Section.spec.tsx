import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../test-helpers';
import { SectionMount } from './Section.spec-helpers';

test.describe('Section', () => {
  test('should render section with label', async ({ mount }) => {
    const component = await mount(<SectionMount label="Test Section" />);
    await expect(component.getByText('Test Section')).toBeVisible();
  });

  test('should render as section element with role group', async ({ mount }) => {
    const component = await mount(<SectionMount label="Test Section" />);
    const section = component.locator('section[role="group"]');
    await expect(section).toBeVisible();
  });

  test('should generate id from label when id not provided', async ({ mount }) => {
    const component = await mount(<SectionMount label="My Test Section" />);
    const section = component.locator('#my-test-section');
    await expect(section).toBeVisible();
  });

  test('should use provided id', async ({ mount }) => {
    const component = await mount(<SectionMount id="custom-section-id" label="Test" />);
    const section = component.locator('#custom-section-id');
    await expect(section).toBeVisible();
  });

  test('should render description when provided', async ({ mount }) => {
    const component = await mount(
      <SectionMount label="Test" description="This is a description of the section" />
    );
    await expect(component.getByText('This is a description of the section')).toBeVisible();
  });

  test('should render children content', async ({ mount }) => {
    const component = await mount(
      <SectionMount label="Test">
        <div>Child content here</div>
      </SectionMount>
    );
    await expect(component.getByText('Child content here')).toBeVisible();
  });

  test('should render LabelHelp when id, labelHelpTitle, and labelHelp provided', async ({
    mount,
  }) => {
    const component = await mount(
      <SectionMount
        id="help-section"
        label="Test"
        labelHelpTitle="Help Title"
        labelHelp="Help content"
      />
    );
    // LabelHelp renders a button to open the popover
    const helpButton = component.getByRole('button', { name: /help title/i });
    await expect(helpButton).toBeVisible();
  });

  test('should not render LabelHelp when id is not provided', async ({ mount }) => {
    const component = await mount(
      <SectionMount label="Test" labelHelpTitle="Help Title" labelHelp="Help content" />
    );
    const helpButton = component.getByRole('button', { name: /help title/i });
    await expect(helpButton).not.toBeVisible();
  });

  test('should support ReactNode as label', async ({ mount }) => {
    const label = (
      <div>
        <strong>Bold Label</strong> with text
      </div>
    );
    const component = await mount(<SectionMount label={label} />);
    await expect(component.getByText('Bold Label')).toBeVisible();
    await expect(component.getByText('with text')).toBeVisible();
  });

  test('should support ReactNode as description', async ({ mount }) => {
    const description = (
      <div>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
      </div>
    );
    const component = await mount(<SectionMount label="Test" description={description} />);
    await expect(component.getByText('Paragraph 1')).toBeVisible();
    await expect(component.getByText('Paragraph 2')).toBeVisible();
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<SectionMount label="Test Section" />);
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests with description and children', async ({ mount }) => {
    const component = await mount(
      <SectionMount label="Test" description="Description text">
        <div>Child content</div>
      </SectionMount>
    );
    await checkAccessibility({ component });
  });
});
