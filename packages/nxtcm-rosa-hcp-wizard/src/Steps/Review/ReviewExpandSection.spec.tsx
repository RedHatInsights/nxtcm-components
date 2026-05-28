import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';

import { ReviewExpandSection } from './ReviewExpandSection';

test.describe('ReviewExpandSection', () => {
  test('shows children when initialExpanded is true', async ({ mount }) => {
    const c = await mount(
      <ReviewExpandSection label="Networking summary" initialExpanded>
        <p>subnet-a and subnet-b</p>
      </ReviewExpandSection>
    );

    const toggle = c.getByRole('button', { name: /networking summary/i });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(c.getByText('subnet-a and subnet-b')).toBeVisible();
  });

  test('hides children when initialExpanded is false', async ({ mount }) => {
    const c = await mount(
      <ReviewExpandSection label="Proxy settings" initialExpanded={false}>
        <p>http://proxy.example</p>
      </ReviewExpandSection>
    );

    const toggle = c.getByRole('button', { name: /proxy settings/i });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(c.getByText('http://proxy.example')).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(c.getByText('http://proxy.example')).toBeVisible();
  });
});
