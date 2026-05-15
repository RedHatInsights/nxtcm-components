import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';

import { ReviewHarness } from './Review.spec-helpers';

test.describe('Review', () => {
  test('renders review guidance and section summaries', async ({ mount }) => {
    const c = await mount(<ReviewHarness />);

    await expect(c.getByRole('button', { name: /^Details$/i })).toBeVisible();
    await expect(c.getByRole('button', { name: /^Roles and policies$/i })).toBeVisible();
    await expect(c.getByRole('button', { name: /^Networking$/i })).toBeVisible();
  });

  test('hides cluster-wide proxy when optional proxy fields match defaults', async ({ mount }) => {
    const c = await mount(<ReviewHarness />);

    await expect(c.getByRole('button', { name: /cluster-wide proxy/i })).toHaveCount(0);
  });

  test('shows cluster-wide proxy when a proxy value differs from defaults', async ({ mount }) => {
    const c = await mount(
      <ReviewHarness formOverrides={{ http_proxy_url: 'http://proxy.example.com:8080' }} />
    );

    const proxyToggle = c.getByRole('button', { name: /cluster-wide proxy/i });
    await expect(proxyToggle).toBeVisible();
    await expect(proxyToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(c.getByText('http://proxy.example.com:8080')).toBeVisible();
  });

  test('renders one Edit Step control per visible review section', async ({ mount }) => {
    const c = await mount(<ReviewHarness />);

    // Seven configured sections; cluster-wide proxy is omitted when unchanged.
    await expect(c.getByRole('button', { name: 'Edit Step' })).toHaveCount(6);
  });
});
