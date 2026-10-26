import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import { UpdateStatusData } from './UpdateStatus';
import type { UpdateStatusStory } from './UpdateStatus.story';

const defaultData: UpdateStatusData = {
  upToDate: 118,
  updateAvailable: 32,
};

const dataWithUpdating: UpdateStatusData = {
  upToDate: 105,
  updateAvailable: 27,
  currentlyUpdating: 18,
};

test.describe('UpdateStatus', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount<typeof UpdateStatusStory>(
      'nxtcm-dashboard/UpdateStatus/UpdateStatus/UpdateStatusStory',
      {
        data: defaultData,
      }
    );
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests with currently updating', async ({ mount }) => {
    const component = await mount<typeof UpdateStatusStory>(
      'nxtcm-dashboard/UpdateStatus/UpdateStatus/UpdateStatusStory',
      {
        data: dataWithUpdating,
      }
    );
    await checkAccessibility({ component });
  });

  test('should display update summaries without an omitted updating count', async ({ mount }) => {
    const component = await mount<typeof UpdateStatusStory>(
      'nxtcm-dashboard/UpdateStatus/UpdateStatus/UpdateStatusStory',
      {
        data: defaultData,
      }
    );
    await expect(component.getByTestId('up-to-date-count')).toHaveText('118');
    await expect(component.getByTestId('update-available-count')).toHaveText('32');
    await expect(component.getByText('clusters up-to-date')).toBeVisible();
    await expect(component.getByText('clusters with update available')).toBeVisible();
    await expect(component.getByTestId('currently-updating-count')).toHaveCount(0);
  });

  test('should render currently updating section when provided', async ({ mount }) => {
    const component = await mount<typeof UpdateStatusStory>(
      'nxtcm-dashboard/UpdateStatus/UpdateStatus/UpdateStatusStory',
      {
        data: dataWithUpdating,
      }
    );
    await expect(component.getByTestId('currently-updating-count')).toHaveText('18');
    await expect(component.getByText('currently updating')).toBeVisible();
  });

  test('should display zero for up-to-date when all need updates', async ({ mount }) => {
    const data: UpdateStatusData = { upToDate: 0, updateAvailable: 45 };
    const component = await mount<typeof UpdateStatusStory>(
      'nxtcm-dashboard/UpdateStatus/UpdateStatus/UpdateStatusStory',
      {
        data: data,
      }
    );
    await expect(component.getByTestId('up-to-date-count')).toHaveText('0');
  });

  test('should display zero for update available when all are current', async ({ mount }) => {
    const data: UpdateStatusData = { upToDate: 150, updateAvailable: 0 };
    const component = await mount<typeof UpdateStatusStory>(
      'nxtcm-dashboard/UpdateStatus/UpdateStatus/UpdateStatusStory',
      {
        data: data,
      }
    );
    await expect(component.getByTestId('update-available-count')).toHaveText('0');
  });

  test('should handle both counts being zero', async ({ mount }) => {
    const data: UpdateStatusData = { upToDate: 0, updateAvailable: 0 };
    const component = await mount<typeof UpdateStatusStory>(
      'nxtcm-dashboard/UpdateStatus/UpdateStatus/UpdateStatusStory',
      {
        data: data,
      }
    );
    await expect(component.getByTestId('up-to-date-count')).toHaveText('0');
    await expect(component.getByTestId('update-available-count')).toHaveText('0');
  });

  test('should handle large counts', async ({ mount }) => {
    const data: UpdateStatusData = {
      upToDate: 9999,
      updateAvailable: 5678,
      currentlyUpdating: 1234,
    };
    const component = await mount<typeof UpdateStatusStory>(
      'nxtcm-dashboard/UpdateStatus/UpdateStatus/UpdateStatusStory',
      {
        data: data,
      }
    );
    await expect(component.getByTestId('up-to-date-count')).toHaveText('9999');
    await expect(component.getByTestId('update-available-count')).toHaveText('5678');
    await expect(component.getByTestId('currently-updating-count')).toHaveText('1234');
  });

  test('should render skeleton when isLoading is true', async ({ mount }) => {
    const component = await mount<typeof UpdateStatusStory>(
      'nxtcm-dashboard/UpdateStatus/UpdateStatus/UpdateStatusStory',
      {
        isLoading: true,
      }
    );
    await expect(component.getByText('Loading update status')).toBeVisible();
    await expect(component.getByTestId('up-to-date-count')).toBeHidden();
  });
});
