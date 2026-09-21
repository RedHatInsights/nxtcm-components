import { expect, test } from '@/ct-fixture';

test.describe('ReviewExpandSection', () => {
  test('shows children when initialExpanded is true', async ({ mount }) => {
    const c = await mount(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ReviewExpandSection/ExpandedReviewSection'
    );

    const toggle = c.getByRole('button', { name: /networking summary/i });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(c.getByText('subnet-a and subnet-b')).toBeVisible();
  });

  test('hides children when initialExpanded is false', async ({ mount }) => {
    const c = await mount(
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
