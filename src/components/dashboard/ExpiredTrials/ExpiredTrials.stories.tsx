import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { ExpiredTrials } from './ExpiredTrials';

const meta: Meta<typeof ExpiredTrials> = {
  title: 'Components/Dashboard/ExpiredTrials',
  component: ExpiredTrials,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExpiredTrials>;

const sampleTrials = [
  { id: 's1', name: 'f4aaa179-54be-4c3e-a523-f344e76e182c' },
  { id: 's2', name: 'test' },
  { id: 's3', name: 'ss' },
];

export const Default: Story = {
  args: {
    data: {
      trials: sampleTrials,
      totalCount: 3,
      currentPage: 1,
      pageSize: 10,
    },
  },
};

export const WithClusterClick: Story = {
  args: {
    data: {
      trials: sampleTrials,
      totalCount: 3,
      currentPage: 1,
      pageSize: 10,
    },
    onTrialClick: fn(),
  },
};

export const WithRowActions: Story = {
  args: {
    data: {
      trials: sampleTrials,
      totalCount: 3,
      currentPage: 1,
      pageSize: 10,
    },
    onTrialClick: fn(),
    rowActions: () => [
      { title: 'Edit subscription', onClick: fn() },
      { title: 'Archive cluster', onClick: fn() },
    ],
  },
};

export const WithPagination: Story = {
  args: {
    data: {
      trials: sampleTrials,
      totalCount: 25,
      currentPage: 1,
      pageSize: 10,
    },
    onTrialClick: fn(),
    onPageChange: fn(),
    onPageSizeChange: fn(),
  },
};

export const Empty: Story = {
  args: {
    data: {
      trials: [],
      totalCount: 0,
      currentPage: 1,
      pageSize: 10,
    },
  },
};

export const SingleTrial: Story = {
  args: {
    data: {
      trials: [{ id: 's1', name: 'my-expired-cluster' }],
      totalCount: 1,
      currentPage: 1,
      pageSize: 10,
    },
    onTrialClick: fn(),
    rowActions: () => [
      { title: 'Edit subscription', onClick: fn() },
      { title: 'Archive cluster', onClick: fn() },
    ],
    onPageChange: fn(),
  },
};
