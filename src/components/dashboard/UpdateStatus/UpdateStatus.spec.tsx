import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { UpdateStatus, UpdateStatusData } from './UpdateStatus';
import { checkAccessibility } from '../../../test-helpers';

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
    const component = await mount(<UpdateStatus data={defaultData} />);
    await checkAccessibility({ component });
  });

  test('should pass accessibility tests with currently updating', async ({ mount }) => {
    const component = await mount(<UpdateStatus data={dataWithUpdating} />);
    await checkAccessibility({ component });
  });

  test('should render the up-to-date count', async ({ mount }) => {
    const component = await mount(<UpdateStatus data={defaultData} />);
    await expect(component.getByTestId('up-to-date-count')).toHaveText('118');
  });

  test('should render the update available count', async ({ mount }) => {
    const component = await mount(<UpdateStatus data={defaultData} />);
    await expect(component.getByTestId('update-available-count')).toHaveText('32');
  });

  test('should render labels for both statuses', async ({ mount }) => {
    const component = await mount(<UpdateStatus data={defaultData} />);
    await expect(component.getByText('clusters up-to-date')).toBeVisible();
    await expect(component.getByText('clusters with update available')).toBeVisible();
  });

  test('should render a vertical divider', async ({ mount }) => {
    const component = await mount(<UpdateStatus data={defaultData} />);
    await expect(component.locator('hr')).toHaveCount(1);
  });

  test('should render two icons when no updating data', async ({ mount }) => {
    const component = await mount(<UpdateStatus data={defaultData} />);
    await expect(component.locator('svg')).toHaveCount(2);
  });

  test('should not show currently updating section when omitted', async ({ mount }) => {
    const component = await mount(<UpdateStatus data={defaultData} />);
    await expect(component.getByTestId('currently-updating-count')).toHaveCount(0);
  });

  test('should render currently updating section when provided', async ({ mount }) => {
    const component = await mount(<UpdateStatus data={dataWithUpdating} />);
    await expect(component.getByTestId('currently-updating-count')).toHaveText('18');
    await expect(component.getByText('currently updating')).toBeVisible();
  });

  test('should render three icons when updating data is provided', async ({ mount }) => {
    const component = await mount(<UpdateStatus data={dataWithUpdating} />);
    await expect(component.locator('svg')).toHaveCount(3);
  });

  test('should render two dividers when updating data is provided', async ({ mount }) => {
    const component = await mount(<UpdateStatus data={dataWithUpdating} />);
    await expect(component.locator('hr')).toHaveCount(2);
  });

  test('should display zero for up-to-date when all need updates', async ({ mount }) => {
    const data: UpdateStatusData = { upToDate: 0, updateAvailable: 45 };
    const component = await mount(<UpdateStatus data={data} />);
    await expect(component.getByTestId('up-to-date-count')).toHaveText('0');
  });

  test('should display zero for update available when all are current', async ({ mount }) => {
    const data: UpdateStatusData = { upToDate: 150, updateAvailable: 0 };
    const component = await mount(<UpdateStatus data={data} />);
    await expect(component.getByTestId('update-available-count')).toHaveText('0');
  });

  test('should handle both counts being zero', async ({ mount }) => {
    const data: UpdateStatusData = { upToDate: 0, updateAvailable: 0 };
    const component = await mount(<UpdateStatus data={data} />);
    await expect(component.getByTestId('up-to-date-count')).toHaveText('0');
    await expect(component.getByTestId('update-available-count')).toHaveText('0');
  });

  test('should handle large counts', async ({ mount }) => {
    const data: UpdateStatusData = {
      upToDate: 9999,
      updateAvailable: 5678,
      currentlyUpdating: 1234,
    };
    const component = await mount(<UpdateStatus data={data} />);
    await expect(component.getByTestId('up-to-date-count')).toHaveText('9999');
    await expect(component.getByTestId('update-available-count')).toHaveText('5678');
    await expect(component.getByTestId('currently-updating-count')).toHaveText('1234');
  });
});
