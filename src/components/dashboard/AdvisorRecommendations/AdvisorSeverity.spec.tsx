import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { AdvisorSeverity, SeverityCounts } from './AdvisorSeverity';
import { checkAccessibility } from '../../../test-helpers';

const defaultSeverity: SeverityCounts = {
  critical: 3,
  important: 7,
  moderate: 15,
  low: 2,
};

test.describe('AdvisorSeverity', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(
      <AdvisorSeverity severity={defaultSeverity} onViewMore={() => {}} />
    );
    await checkAccessibility({ component });
  });

  test('should render all four severity counts', async ({ mount }) => {
    const component = await mount(<AdvisorSeverity severity={defaultSeverity} />);
    await expect(component.getByTestId('severity-count-critical')).toHaveText('3');
    await expect(component.getByTestId('severity-count-important')).toHaveText('7');
    await expect(component.getByTestId('severity-count-moderate')).toHaveText('15');
    await expect(component.getByTestId('severity-count-low')).toHaveText('2');
  });

  test('should render severity labels', async ({ mount }) => {
    const component = await mount(<AdvisorSeverity severity={defaultSeverity} />);
    await expect(component.getByText('Critical')).toBeVisible();
    await expect(component.getByText('Important')).toBeVisible();
    await expect(component.getByText('Moderate')).toBeVisible();
    await expect(component.getByText('Low')).toBeVisible();
  });

  test('should render severity icons', async ({ mount }) => {
    const component = await mount(<AdvisorSeverity severity={defaultSeverity} />);
    await expect(component.getByTestId('severity-icon-critical')).toBeVisible();
    await expect(component.getByTestId('severity-icon-important')).toBeVisible();
    await expect(component.getByTestId('severity-icon-moderate')).toBeVisible();
    await expect(component.getByTestId('severity-icon-low')).toBeVisible();
  });

  test('should render the view more link when onViewMore is provided', async ({ mount }) => {
    let clicked = false;
    const component = await mount(
      <AdvisorSeverity
        severity={defaultSeverity}
        onViewMore={() => {
          clicked = true;
        }}
      />
    );
    const link = component.getByTestId('view-more-link');
    await expect(link).toBeVisible();
    await expect(link).toHaveText('View more in Red Hat Advisor');
    await link.click();
    expect(clicked).toBe(true);
  });

  test('should not render the view more link when onViewMore is omitted', async ({ mount }) => {
    const component = await mount(<AdvisorSeverity severity={defaultSeverity} />);
    await expect(component.getByTestId('view-more-link')).toHaveCount(0);
  });

  test('should handle all-zero severity counts', async ({ mount }) => {
    const component = await mount(
      <AdvisorSeverity severity={{ critical: 0, important: 0, moderate: 0, low: 0 }} />
    );
    await expect(component.getByTestId('severity-count-critical')).toHaveText('0');
    await expect(component.getByTestId('severity-count-important')).toHaveText('0');
    await expect(component.getByTestId('severity-count-moderate')).toHaveText('0');
    await expect(component.getByTestId('severity-count-low')).toHaveText('0');
  });

  test('should handle large counts', async ({ mount }) => {
    const component = await mount(
      <AdvisorSeverity severity={{ critical: 500, important: 2000, moderate: 9999, low: 123 }} />
    );
    await expect(component.getByTestId('severity-count-critical')).toHaveText('500');
    await expect(component.getByTestId('severity-count-important')).toHaveText('2000');
  });

  test('should render the default card title', async ({ mount }) => {
    const component = await mount(<AdvisorSeverity severity={defaultSeverity} />);
    const title = component.getByTestId('card-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Advisor recommendations by severity');
  });

  test('should render a custom card title', async ({ mount }) => {
    const component = await mount(
      <AdvisorSeverity severity={defaultSeverity} title="Custom title" />
    );
    await expect(component.getByTestId('card-title')).toHaveText('Custom title');
  });

  test('should hide the card title when title is empty', async ({ mount }) => {
    const component = await mount(<AdvisorSeverity severity={defaultSeverity} title="" />);
    await expect(component.getByTestId('card-title')).toHaveCount(0);
  });

  test('should render the lightspeed badge by default', async ({ mount }) => {
    const component = await mount(<AdvisorSeverity severity={defaultSeverity} />);
    const badge = component.getByTestId('lightspeed-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('Powered by Red Hat Lightspeed');
  });

  test('should hide the lightspeed badge when showLightspeedBadge is false', async ({ mount }) => {
    const component = await mount(
      <AdvisorSeverity severity={defaultSeverity} showLightspeedBadge={false} />
    );
    await expect(component.getByTestId('lightspeed-badge')).toHaveCount(0);
  });
});
