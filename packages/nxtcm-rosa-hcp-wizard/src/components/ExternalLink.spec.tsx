import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../test-helpers';
import { ExternalLinkMount } from './ExternalLink.spec-helpers';

test.describe('ExternalLink', () => {
  test('should render as anchor link by default', async ({ mount }) => {
    const component = await mount(<ExternalLinkMount />);
    const link = component.getByRole('link', { name: /example link/i });
    await expect(link).toBeVisible();
  });

  test('should have correct href attribute', async ({ mount }) => {
    const component = await mount(<ExternalLinkMount href="https://test.com" />);
    const link = component.getByRole('link');
    await expect(link).toHaveAttribute('href', 'https://test.com');
  });

  test('should open in new tab by default', async ({ mount }) => {
    const component = await mount(<ExternalLinkMount />);
    const link = component.getByRole('link');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noreferrer noopener');
  });

  test('should not have target when noTarget is true', async ({ mount }) => {
    const component = await mount(<ExternalLinkMount noTarget={true} />);
    const link = component.getByRole('link');
    await expect(link).toHaveAttribute('target', '');
  });

  test('should show external link icon by default', async ({ mount }) => {
    const component = await mount(<ExternalLinkMount />);
    await expect(component.getByTestId('openInNewWindowIcon')).toBeVisible();
  });

  test('should not show icon when noIcon is true', async ({ mount }) => {
    const component = await mount(<ExternalLinkMount noIcon={true} />);
    await expect(component.getByTestId('openInNewWindowIcon')).not.toBeVisible();
  });

  test('should show screen reader text for new window', async ({ mount }) => {
    const component = await mount(<ExternalLinkMount />);
    await expect(component.getByText('(new window or tab)')).toBeVisible();
  });

  test('should not show screen reader text when noTarget is true', async ({ mount }) => {
    const component = await mount(<ExternalLinkMount noTarget={true} />);
    await expect(component.getByText('(new window or tab)')).not.toBeVisible();
  });

  test('should render as button when isButton is true', async ({ mount }) => {
    const component = await mount(<ExternalLinkMount isButton={true} />);
    const button = component.getByRole('link');
    await expect(button).toHaveClass(/pf-v6-c-button/);
  });

  test('should support data-testid attribute', async ({ mount }) => {
    const component = await mount(<ExternalLinkMount data-testid="custom-link-id" />);
    await expect(component.getByTestId('custom-link-id')).toBeVisible();
  });

  test('should render children content', async ({ mount }) => {
    const component = await mount(<ExternalLinkMount>Custom Link Text</ExternalLinkMount>);
    await expect(component.getByText('Custom Link Text')).toBeVisible();
  });

  test('should pass accessibility tests as link', async ({ mount }) => {
    const component = await mount(<ExternalLinkMount />);
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests as button', async ({ mount }) => {
    const component = await mount(<ExternalLinkMount isButton={true} />);
    await checkAccessibility({ component });
  });
});
