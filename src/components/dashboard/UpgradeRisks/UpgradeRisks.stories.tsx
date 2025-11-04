import type { Meta, StoryObj } from '@storybook/react';
import { UpgradeRisks } from './UpgradeRisks';

const meta: Meta<typeof UpgradeRisks> = {
  title: 'Components/Dashboard/UpgradeRisks',
  component: UpgradeRisks,
  tags: ['autodocs'],
  argTypes: {
    onViewRisks: { action: 'view risks clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    totalRisks: 45,
    criticalCount: 15,
    warningCount: 15,
    infoCount: 15,
  },
};

export const WithViewLink: Story = {
  args: {
    totalRisks: 45,
    criticalCount: 15,
    warningCount: 15,
    infoCount: 15,
    onViewRisks: () => console.log('View upgrade risks clicked'),
  },
};

export const HighCritical: Story = {
  args: {
    totalRisks: 50,
    criticalCount: 35,
    warningCount: 10,
    infoCount: 5,
    onViewRisks: () => console.log('View upgrade risks clicked'),
  },
};

export const LowRisks: Story = {
  args: {
    totalRisks: 8,
    criticalCount: 2,
    warningCount: 3,
    infoCount: 3,
    onViewRisks: () => console.log('View upgrade risks clicked'),
  },
};

export const NoRisks: Story = {
  args: {
    totalRisks: 0,
    criticalCount: 0,
    warningCount: 0,
    infoCount: 0,
    onViewRisks: () => console.log('View upgrade risks clicked'),
  },
};
