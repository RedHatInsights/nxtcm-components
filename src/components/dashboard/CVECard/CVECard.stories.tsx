import type { Meta, StoryObj } from '@storybook/react';
import { CVECard, CVEData } from './CVECard';

const defaultCVEData: CVEData[] = [
  {
    severity: 'critical',
    count: 24,
    label: 'Critical severity CVEs on your associated',
    onViewClick: () => console.log('View critical CVEs clicked'),
    viewLinkText: 'View critical CVEs',
  },
  {
    severity: 'important',
    count: 147,
    label: 'Important severity CVEs on your associated',
    onViewClick: () => console.log('View important CVEs clicked'),
    viewLinkText: 'View important CVEs',
  },
];

const meta: Meta<typeof CVECard> = {
  title: 'Components/CVECard',
  component: CVECard,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The title of the CVE card',
      defaultValue: 'CVEs',
    },
    description: {
      control: 'text',
      description: 'The description text shown below the title',
    },
    cveData: {
      description: 'Array of CVE data to display',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class name',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    cveData: defaultCVEData,
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'Security Vulnerabilities',
    cveData: defaultCVEData,
  },
};

export const CustomDescription: Story = {
  args: {
    description: 'Address these security vulnerabilities to ensure your clusters remain secure.',
    cveData: defaultCVEData,
  },
};

export const CriticalOnly: Story = {
  args: {
    cveData: [
      {
        severity: 'critical',
        count: 24,
        label: 'Critical severity CVEs on your associated clusters',
        onViewClick: () => console.log('View critical CVEs'),
        viewLinkText: 'View critical CVEs',
      },
    ],
  },
};

export const ImportantOnly: Story = {
  args: {
    cveData: [
      {
        severity: 'important',
        count: 147,
        label: 'Important severity CVEs on your associated clusters',
        onViewClick: () => console.log('View important CVEs'),
        viewLinkText: 'View important CVEs',
      },
    ],
  },
};

export const HighCounts: Story = {
  args: {
    cveData: [
      {
        severity: 'critical',
        count: 1245,
        label: 'Critical severity CVEs',
        onViewClick: () => console.log('View critical CVEs'),
        viewLinkText: 'View all critical',
      },
      {
        severity: 'important',
        count: 3789,
        label: 'Important severity CVEs',
        onViewClick: () => console.log('View important CVEs'),
        viewLinkText: 'View all important',
      },
    ],
  },
};

export const ZeroCounts: Story = {
  args: {
    title: 'CVE Status',
    description: 'Great news! No critical vulnerabilities detected.',
    cveData: [
      {
        severity: 'critical',
        count: 0,
        label: 'Critical severity CVEs',
        onViewClick: () => console.log('View critical CVEs'),
        viewLinkText: 'View details',
      },
      {
        severity: 'important',
        count: 0,
        label: 'Important severity CVEs',
        onViewClick: () => console.log('View important CVEs'),
        viewLinkText: 'View details',
      },
    ],
  },
};

export const WithoutLinks: Story = {
  args: {
    cveData: [
      {
        severity: 'critical',
        count: 24,
        label: 'Critical severity CVEs on your associated',
      },
      {
        severity: 'important',
        count: 147,
        label: 'Important severity CVEs on your associated',
      },
    ],
  },
};
