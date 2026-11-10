import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import { ExpiredTrialsProps } from './ExpiredTrials';
import type { ExpiredTrialsStory, ExpiredTrialsWithActions } from './ExpiredTrials.story';

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
    const component = await mount<typeof ExpiredTrialsStory>(
      'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsStory',
      { data: defaultData }
    );
    await checkAccessibility({ component });
  });

  test('should render cluster names in the table', async ({ mount }) => {
    const component = await mount<typeof ExpiredTrialsStory>(
      'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsStory',
      { data: defaultData }
    );

    await expect(component.getByText('f4aaa179-54be-4c3e-a523-f344e76e182c')).toBeVisible();
    await expect(component.getByText('test')).toBeVisible();
    await expect(component.getByText('ss')).toBeVisible();
  });

  test('should render table header as Cluster name', async ({ mount }) => {
    const component = await mount<typeof ExpiredTrialsStory>(
      'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsStory',
      { data: defaultData }
    );
    await expect(component.getByRole('columnheader', { name: 'Cluster name' })).toBeVisible();
  });

  test('should render names as links when onTrialClick is provided', async ({ mount }) => {
    const component = await mount<typeof ExpiredTrialsStory>(
      'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsStory',
      { data: defaultData, onTrialClick: true }
    );

    await expect(component.getByTestId('trial-link-s1')).toBeVisible();
    await expect(component.getByTestId('trial-link-s2')).toBeVisible();
    await expect(component.getByTestId('trial-link-s3')).toBeVisible();
  });

  test('should call onTrialClick when a cluster name is clicked', async ({ mount }) => {
    const component = await mount<typeof ExpiredTrialsStory>(
      'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsStory',
      { data: defaultData, onTrialClick: true }
    );

    await component.getByTestId('trial-link-s2').click();
    await expect
      .poll(
        async () =>
          (
            await component
              .getByTestId('onTrialClick-calls')
              .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
          )[0]?.[0]
      )
      .toEqual({ id: 's2', name: 'test' });
  });

  test('should render names as plain text when onTrialClick is not provided', async ({ mount }) => {
    const component = await mount<typeof ExpiredTrialsStory>(
      'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsStory',
      { data: defaultData }
    );

    await expect(component.getByText('test')).toBeVisible();
    const trialButtons = component.getByTestId(/^trial-link-/);
    await expect(trialButtons).toHaveCount(0);
  });

  test('should show empty state when no trials', async ({ mount }) => {
    const component = await mount<typeof ExpiredTrialsStory>(
      'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsStory',
      { data: { trials: [], totalCount: 0, currentPage: 1, pageSize: 10 } }
    );

    await expect(component.getByTestId('empty-state')).toContainText('No expired trials');
  });

  test('should render kebab actions when rowActions is provided', async ({ mount }) => {
    const component = await mount<typeof ExpiredTrialsWithActions>(
      'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsWithActions',
      { data: defaultData }
    );

    const kebabs = component.getByRole('button', { name: 'Kebab toggle', exact: true });
    await expect(kebabs).toHaveCount(defaultData.trials.length);
  });

  test('should not render kebab column when rowActions is not provided', async ({ mount }) => {
    const component = await mount<typeof ExpiredTrialsStory>(
      'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsStory',
      { data: defaultData }
    );

    const kebabs = component.getByRole('button', { name: 'Kebab toggle', exact: true });
    await expect(kebabs).toHaveCount(0);
  });

  test('should render pagination when onPageChange is provided', async ({ mount }) => {
    const component = await mount<typeof ExpiredTrialsStory>(
      'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsStory',
      {
        data: { ...defaultData, totalCount: 25 },
        onPageChange: true,
      }
    );

    await expect(component.getByRole('navigation', { name: 'Pagination' })).toBeVisible();
  });

  test('should not render pagination when onPageChange is not provided', async ({ mount }) => {
    const component = await mount<typeof ExpiredTrialsStory>(
      'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsStory',
      { data: defaultData }
    );

    await expect(component.getByRole('navigation', { name: 'Pagination' })).toHaveCount(0);
  });

  test('should call onPageChange when next page is clicked', async ({ mount }) => {
    const component = await mount<typeof ExpiredTrialsStory>(
      'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsStory',
      {
        data: { ...defaultData, totalCount: 25 },
        onPageChange: true,
      }
    );

    await component.getByRole('button', { name: 'Go to next page' }).click();
    await expect
      .poll(
        async () =>
          (
            await component
              .getByTestId('onPageChange-calls')
              .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
          )[0]?.[0]
      )
      .toBe(2);
  });

  test('should call onPageSizeChange when per-page is changed', async ({ mount, page }) => {
    const component = await mount<typeof ExpiredTrialsStory>(
      'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsStory',
      {
        data: { ...defaultData, totalCount: 25 },
        onPageChange: true,
        onPageSizeChange: true,
      }
    );

    // pf6 portals the dropdown menu to document body, so query via page
    await component.getByRole('button', { name: '1 - 10 of 25', exact: true }).click();
    await page.getByRole('menuitem', { name: /20 per page/i }).click();
    await expect
      .poll(
        async () =>
          (
            await component
              .getByTestId('onPageSizeChange-calls')
              .evaluate((input: HTMLInputElement) => JSON.parse(input.value) as unknown[][])
          )[0]?.[0]
      )
      .toBe(20);
  });

  test('should handle single trial', async ({ mount }) => {
    const data: ExpiredTrialsProps['data'] = {
      trials: [{ id: 's1', name: 'my-expired-cluster' }],
      totalCount: 1,
      currentPage: 1,
      pageSize: 10,
    };
    const component = await mount<typeof ExpiredTrialsStory>(
      'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsStory',
      { data: data, onTrialClick: true }
    );

    await expect(component.getByTestId('trial-link-s1')).toContainText('my-expired-cluster');
  });

  test('should render skeleton when isLoading is true', async ({ mount }) => {
    const component = await mount<typeof ExpiredTrialsStory>(
      'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsStory',
      { isLoading: true }
    );
    await expect(component.getByText('Loading expired trials')).toBeVisible();
    await expect(component.getByTestId('empty-state')).toBeHidden();
  });

  test('should render skeleton when isLoading is true without data', async ({ mount }) => {
    const component = await mount<typeof ExpiredTrialsStory>(
      'nxtcm-dashboard/ExpiredTrials/ExpiredTrials/ExpiredTrialsStory',
      { isLoading: true }
    );
    await expect(component.getByText('Loading expired trials')).toBeVisible();
  });
});
