import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { ExpiredTrials, ExpiredTrialsProps } from './ExpiredTrials';
import { ExpiredTrialsWithActions } from './ExpiredTrials.spec-helpers';
import { checkAccessibility } from '../../../test-helpers';

const defaultData: ExpiredTrialsProps['data'] = {
  trials: [
    { id: 's1', name: 'f4aaa179-54be-4c3e-a523-f344e76e182c' },
    { id: 's2', name: 'test' },
    { id: 's3', name: 'ss' },
  ],
  totalCount: 3,
  currentPage: 1,
  pageSize: 10,
};

test.describe('ExpiredTrials', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<ExpiredTrials data={defaultData} />);
    await checkAccessibility({ component });
  });

  test('should render cluster names in the table', async ({ mount }) => {
    const component = await mount(<ExpiredTrials data={defaultData} />);

    await expect(component.getByText('f4aaa179-54be-4c3e-a523-f344e76e182c')).toBeVisible();
    await expect(component.getByText('test')).toBeVisible();
    await expect(component.getByText('ss')).toBeVisible();
  });

  test('should render table header as Cluster name', async ({ mount }) => {
    const component = await mount(<ExpiredTrials data={defaultData} />);
    await expect(component.getByRole('columnheader', { name: 'Cluster name' })).toBeVisible();
  });

  test('should render names as links when onTrialClick is provided', async ({ mount }) => {
    const component = await mount(<ExpiredTrials data={defaultData} onTrialClick={() => {}} />);

    await expect(component.getByTestId('trial-link-s1')).toBeVisible();
    await expect(component.getByTestId('trial-link-s2')).toBeVisible();
    await expect(component.getByTestId('trial-link-s3')).toBeVisible();
  });

  test('should call onTrialClick when a cluster name is clicked', async ({ mount }) => {
    let clickedTrial: { id: string; name: string } | null = null;
    const handleClick = (trial: { id: string; name: string }) => {
      clickedTrial = trial;
    };

    const component = await mount(<ExpiredTrials data={defaultData} onTrialClick={handleClick} />);

    await component.getByTestId('trial-link-s2').click();
    expect(clickedTrial).not.toBeNull();
    expect(clickedTrial!.id).toBe('s2');
    expect(clickedTrial!.name).toBe('test');
  });

  test('should render names as plain text when onTrialClick is not provided', async ({ mount }) => {
    const component = await mount(<ExpiredTrials data={defaultData} />);

    await expect(component.getByText('test')).toBeVisible();
    const trialButtons = component.locator('[data-testid^="trial-link-"]');
    expect(await trialButtons.count()).toBe(0);
  });

  test('should show empty state when no trials', async ({ mount }) => {
    const component = await mount(
      <ExpiredTrials data={{ trials: [], totalCount: 0, currentPage: 1, pageSize: 10 }} />
    );

    await expect(component.getByTestId('empty-state')).toContainText('No expired trials');
  });

  test('should render kebab actions when rowActions is provided', async ({ mount }) => {
    const component = await mount(<ExpiredTrialsWithActions data={defaultData} />);

    const kebabs = component.locator('[aria-label="Kebab toggle"]');
    expect(await kebabs.count()).toBe(defaultData.trials.length);
  });

  test('should not render kebab column when rowActions is not provided', async ({ mount }) => {
    const component = await mount(<ExpiredTrials data={defaultData} />);

    const kebabs = component.locator('[aria-label="Kebab toggle"]');
    expect(await kebabs.count()).toBe(0);
  });

  test('should render pagination when onPageChange is provided', async ({ mount }) => {
    const component = await mount(
      <ExpiredTrials data={{ ...defaultData, totalCount: 25 }} onPageChange={() => {}} />
    );

    await expect(component.locator('.pf-v6-c-pagination')).toBeVisible();
  });

  test('should not render pagination when onPageChange is not provided', async ({ mount }) => {
    const component = await mount(<ExpiredTrials data={defaultData} />);

    expect(await component.locator('.pf-v6-c-pagination').count()).toBe(0);
  });

  test('should call onPageChange when next page is clicked', async ({ mount }) => {
    let changedPage: number | null = null;
    const component = await mount(
      <ExpiredTrials
        data={{ ...defaultData, totalCount: 25 }}
        onPageChange={(page) => {
          changedPage = page;
        }}
      />
    );

    await component.getByRole('button', { name: 'Go to next page' }).click();
    expect(changedPage).toBe(2);
  });

  test('should call onPageSizeChange when per-page is changed', async ({ mount, page }) => {
    let changedSize: number | null = null;
    const component = await mount(
      <ExpiredTrials
        data={{ ...defaultData, totalCount: 25 }}
        onPageChange={() => {}}
        onPageSizeChange={(size) => {
          changedSize = size;
        }}
      />
    );

    // pf6 portals the dropdown menu to document body, so query via page
    await component.locator('.pf-v6-c-pagination .pf-v6-c-menu-toggle').click();
    await page.getByRole('menuitem', { name: /20 per page/i }).click();
    expect(changedSize).toBe(20);
  });

  test('should handle single trial', async ({ mount }) => {
    const data: ExpiredTrialsProps['data'] = {
      trials: [{ id: 's1', name: 'my-expired-cluster' }],
      totalCount: 1,
      currentPage: 1,
      pageSize: 10,
    };
    const component = await mount(<ExpiredTrials data={data} onTrialClick={() => {}} />);

    await expect(component.getByTestId('trial-link-s1')).toContainText('my-expired-cluster');
  });
});
