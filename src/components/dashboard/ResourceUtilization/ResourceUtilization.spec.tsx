import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { ResourceUtilization, ResourceUtilizationData } from './ResourceUtilization';

const defaultData: ResourceUtilizationData = {
  vCPU: { used: 32, total: 128, unit: 'Cores' },
  memory: { used: 48, total: 256, unit: 'GiB' },
};

test.describe('ResourceUtilization', () => {
  test('should render the default "Resource usage" title', async ({ mount }) => {
    const component = await mount(<ResourceUtilization data={defaultData} />);
    await expect(component.getByTestId('card-title')).toHaveText('Resource usage');
  });

  test('should render a custom title when provided', async ({ mount }) => {
    const component = await mount(
      <ResourceUtilization data={defaultData} title="CPU and Memory utilization" />
    );
    await expect(component.getByTestId('card-title')).toHaveText('CPU and Memory utilization');
  });

  test('should hide the title when empty string is passed', async ({ mount }) => {
    const component = await mount(<ResourceUtilization data={defaultData} title="" />);
    await expect(component.getByTestId('card-title')).toHaveCount(0);
  });

  test('should render vCPU metric section', async ({ mount }) => {
    const component = await mount(<ResourceUtilization data={defaultData} />);
    await expect(component.getByTestId('metric-vcpu-donut')).toBeVisible();
  });

  test('should render Memory metric section', async ({ mount }) => {
    const component = await mount(<ResourceUtilization data={defaultData} />);
    await expect(component.getByTestId('metric-memory-donut')).toBeVisible();
  });

  test('should display vCPU title', async ({ mount }) => {
    const component = await mount(<ResourceUtilization data={defaultData} />);
    const vcpuSection = component.getByTestId('metric-vcpu-donut');
    await expect(vcpuSection.getByRole('heading', { name: 'vCPU' })).toBeVisible();
  });

  test('should display Memory title', async ({ mount }) => {
    const component = await mount(<ResourceUtilization data={defaultData} />);
    const memorySection = component.getByTestId('metric-memory-donut');
    await expect(memorySection.getByRole('heading', { name: 'Memory' })).toBeVisible();
  });

  test('should calculate and display vCPU percentage (25%)', async ({ mount }) => {
    const component = await mount(<ResourceUtilization data={defaultData} />);
    const vcpuSection = component.getByTestId('metric-vcpu-donut');
    await expect(vcpuSection).toContainText('25%');
  });

  test('should calculate and display Memory percentage (19%)', async ({ mount }) => {
    const component = await mount(<ResourceUtilization data={defaultData} />);
    const memorySection = component.getByTestId('metric-memory-donut');
    await expect(memorySection).toContainText('19%');
  });

  test('should display vCPU subtitle with total and unit', async ({ mount }) => {
    const component = await mount(<ResourceUtilization data={defaultData} />);
    const vcpuSection = component.getByTestId('metric-vcpu-donut');
    await expect(vcpuSection).toContainText('of 128 Cores');
  });

  test('should display Memory subtitle with total and unit', async ({ mount }) => {
    const component = await mount(<ResourceUtilization data={defaultData} />);
    const memorySection = component.getByTestId('metric-memory-donut');
    await expect(memorySection).toContainText('of 256 GiB');
  });

  test('should not render Storage when not provided', async ({ mount }) => {
    const component = await mount(<ResourceUtilization data={defaultData} />);
    await expect(component.getByTestId('metric-storage-donut')).not.toBeVisible();
  });

  test('should render Storage when provided', async ({ mount }) => {
    const dataWithStorage: ResourceUtilizationData = {
      ...defaultData,
      storage: { used: 500, total: 2048, unit: 'GiB' },
    };
    const component = await mount(<ResourceUtilization data={dataWithStorage} />);
    await expect(component.getByTestId('metric-storage-donut')).toBeVisible();
    const storageSection = component.getByTestId('metric-storage-donut');
    await expect(storageSection.getByRole('heading', { name: 'Storage' })).toBeVisible();
    await expect(storageSection).toContainText('24%');
    await expect(storageSection).toContainText('of 2,048 GiB');
  });

  test('should show View more button when onViewMore is provided', async ({ mount }) => {
    const component = await mount(<ResourceUtilization data={defaultData} onViewMore={() => {}} />);
    await expect(component.getByRole('button', { name: /View more/i })).toBeVisible();
  });

  test('should not show View more button when onViewMore is omitted', async ({ mount }) => {
    const component = await mount(<ResourceUtilization data={defaultData} />);
    await expect(component.getByRole('button', { name: /View more/i })).not.toBeVisible();
  });

  test('should call onViewMore when button is clicked', async ({ mount }) => {
    let clicked = false;
    const component = await mount(
      <ResourceUtilization
        data={defaultData}
        onViewMore={() => {
          clicked = true;
        }}
      />
    );
    await component.getByRole('button', { name: /View more/i }).click();
    expect(clicked).toBe(true);
  });

  test('should handle zero usage gracefully', async ({ mount }) => {
    const zeroData: ResourceUtilizationData = {
      vCPU: { used: 0, total: 128, unit: 'Cores' },
      memory: { used: 0, total: 256, unit: 'GiB' },
    };
    const component = await mount(<ResourceUtilization data={zeroData} />);
    const vcpuSection = component.getByTestId('metric-vcpu-donut');
    await expect(vcpuSection).toContainText('0%');
    const memorySection = component.getByTestId('metric-memory-donut');
    await expect(memorySection).toContainText('0%');
  });

  test('should handle high utilization values', async ({ mount }) => {
    const highData: ResourceUtilizationData = {
      vCPU: { used: 126, total: 128, unit: 'Cores' },
      memory: { used: 250, total: 256, unit: 'GiB' },
    };
    const component = await mount(<ResourceUtilization data={highData} />);
    const vcpuSection = component.getByTestId('metric-vcpu-donut');
    await expect(vcpuSection).toContainText('98%');
    const memorySection = component.getByTestId('metric-memory-donut');
    await expect(memorySection).toContainText('98%');
  });

  test('should handle zero total without crashing', async ({ mount }) => {
    const zeroTotal: ResourceUtilizationData = {
      vCPU: { used: 0, total: 0, unit: 'Cores' },
      memory: { used: 0, total: 0, unit: 'GiB' },
    };
    const component = await mount(<ResourceUtilization data={zeroTotal} />);
    const vcpuSection = component.getByTestId('metric-vcpu-donut');
    await expect(vcpuSection).toContainText('0%');
  });

  test('should format large total values with locale string', async ({ mount }) => {
    const largeData: ResourceUtilizationData = {
      vCPU: { used: 500, total: 10000, unit: 'Cores' },
      memory: { used: 2048, total: 8192, unit: 'GiB' },
    };
    const component = await mount(<ResourceUtilization data={largeData} />);
    const vcpuSection = component.getByTestId('metric-vcpu-donut');
    await expect(vcpuSection).toContainText('10,000');
  });
});
