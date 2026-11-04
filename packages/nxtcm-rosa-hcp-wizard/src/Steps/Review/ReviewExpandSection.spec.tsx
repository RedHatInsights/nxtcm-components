import { expect, test } from '@/playwright/ct-fixture';

import { checkAccessibility } from '../../test-helpers';
import type { CollapsedReviewSection, ExpandedReviewSection } from './ReviewExpandSection.story';

test.describe('ReviewExpandSection', () => {
  test('passes accessibility check when initially expanded', async ({ mount }) => {
    const component = await mount<typeof ExpandedReviewSection>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewExpandSection/ExpandedReviewSection'
    );

    await expect(component.getByText('subnet-a and subnet-b')).toBeVisible();
    await checkAccessibility({ component });
  });

  test('passes accessibility check when collapsed and after expanding and collapsing', async ({
    mount,
  }) => {
    const component = await mount<typeof CollapsedReviewSection>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewExpandSection/CollapsedReviewSection'
    );
    const toggle = component.getByRole('button', { name: 'Proxy settings', exact: true });
    const content = component.getByText('http://proxy.example');

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(content).toBeHidden();
    await checkAccessibility({ component });

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(content).toBeVisible();
    await checkAccessibility({ component });

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(content).toBeHidden();
    await checkAccessibility({ component });
  });

  test('shows children when initialExpanded is true', async ({ mount }) => {
    const c = await mount<typeof ExpandedReviewSection>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewExpandSection/ExpandedReviewSection'
    );

    const toggle = c.getByRole('button', { name: /networking summary/i });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(c.getByText('subnet-a and subnet-b')).toBeVisible();
  });

  test('hides children when initialExpanded is false', async ({ mount }) => {
    const c = await mount<typeof CollapsedReviewSection>(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewExpandSection/CollapsedReviewSection'
    );

    const toggle = c.getByRole('button', { name: /proxy settings/i });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(c.getByText('http://proxy.example')).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(c.getByText('http://proxy.example')).toBeVisible();
  });
});
