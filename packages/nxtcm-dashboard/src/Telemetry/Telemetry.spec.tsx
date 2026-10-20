import { test, expect } from '@/ct-fixture';
import React from 'react';
import { Telemetry, TelemetryData } from './Telemetry';
import { checkAccessibility } from '@/test-helpers';

const defaultData: TelemetryData = {
  connected: 142,
  disconnected: 8,
};

test.describe('Telemetry', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<Telemetry data={defaultData} />);
    await checkAccessibility({ component });
  });

  test('should display connected and disconnected cluster summaries', async ({ mount }) => {
    const component = await mount(<Telemetry data={defaultData} />);
    const connectedCount = component.getByTestId('connected-count');
    await expect(connectedCount).toHaveText('142');
    const disconnectedCount = component.getByTestId('disconnected-count');
    await expect(disconnectedCount).toHaveText('8');
    await expect(component.getByText('connected clusters')).toBeVisible();
    await expect(component.getByText('clusters not checking in')).toBeVisible();
  });

  test('should display zero for connected when none are connected', async ({ mount }) => {
    const data: TelemetryData = { connected: 0, disconnected: 15 };
    const component = await mount(<Telemetry data={data} />);
    const connectedCount = component.getByTestId('connected-count');
    await expect(connectedCount).toHaveText('0');
  });

  test('should display zero for disconnected when all are connected', async ({ mount }) => {
    const data: TelemetryData = { connected: 200, disconnected: 0 };
    const component = await mount(<Telemetry data={data} />);
    const disconnectedCount = component.getByTestId('disconnected-count');
    await expect(disconnectedCount).toHaveText('0');
  });

  test('should handle both counts being zero', async ({ mount }) => {
    const data: TelemetryData = { connected: 0, disconnected: 0 };
    const component = await mount(<Telemetry data={data} />);
    await expect(component.getByTestId('connected-count')).toHaveText('0');
    await expect(component.getByTestId('disconnected-count')).toHaveText('0');
  });

  test('should handle large counts', async ({ mount }) => {
    const data: TelemetryData = { connected: 9999, disconnected: 1234 };
    const component = await mount(<Telemetry data={data} />);
    await expect(component.getByTestId('connected-count')).toHaveText('9999');
    await expect(component.getByTestId('disconnected-count')).toHaveText('1234');
  });

  test('should render skeleton when isLoading is true', async ({ mount }) => {
    const component = await mount(<Telemetry isLoading />);
    await expect(component.getByText('Loading telemetry data')).toBeVisible();
    await expect(component.getByTestId('connected-count')).not.toBeVisible();
  });
});
