import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { ConsoleBreadcrumbs, ConsoleBreadcrumbsProps } from './ConsoleBreadcrumbs';

// Mock LinkComponent for Storybook purposes.
// In a real application, this would be a component from a routing library like React Router.
const MockLinkComponent: React.FC<{
  to: string;
  className?: string;
  'aria-current'?: 'page';
  label: string;
}> = ({ to, className, 'aria-current': ariaCurrent, label }) => (
  <a href={to} className={className} aria-current={ariaCurrent} onClick={(e) => e.preventDefault()}>
    {label}
  </a>
);

// Define a sample data structure for the breadcrumb items.
type SampleBreadcrumbItem = {
  name: string;
  path?: string;
};

const meta: Meta<typeof ConsoleBreadcrumbs<SampleBreadcrumbItem>> = {
  title: 'Components/ConsoleBreadcrumbs',
  component: ConsoleBreadcrumbs,
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: 'An array of items to display in the breadcrumb trail.',
    },
    getLabel: {
      table: {
        disable: true,
      },
    },
    getTo: {
      table: {
        disable: true,
      },
    },
    LinkComponent: {
      table: {
        disable: true,
      },
    },
  },
  // Wrapping stories with PatternFly's Breadcrumb for correct styling context if needed.
  // In many setups, this isn't necessary if styles are globally available.
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<ConsoleBreadcrumbsProps<SampleBreadcrumbItem>>;

const defaultItems: SampleBreadcrumbItem[] = [
  { name: 'Home', path: '/' },
  { name: 'Cluster List', path: '/clusters' },
  { name: 'Cluster Details', path: '/clusters/123' },
  { name: 'Node Details' }, // This will be the active item
];

// Default story showcasing a typical breadcrumb trail.
export const Default: Story = {
  args: {
    items: defaultItems,
    getLabel: (item: SampleBreadcrumbItem) => item.name,
    getTo: (item: SampleBreadcrumbItem) => item.path,
    LinkComponent: MockLinkComponent,
  },
};

// Story for when there are no items. The component should render nothing.
export const NoItems: Story = {
  args: {
    ...Default.args,
    items: [],
  },
};

// Story for a single item, which should be displayed as the active page.
export const SingleItem: Story = {
  args: {
    ...Default.args,
    items: [{ name: 'Overview' }],
  },
};

// Story to demonstrate the specific fallback logic for 'Cluster List' when no path is provided.
export const WithClusterListFallback: Story = {
  args: {
    ...Default.args,
    items: [
      { name: 'Home', path: '/' },
      { name: 'Cluster List' }, // This item has no 'to' path, should fall back to '/cluster-list'
      { name: 'Create Cluster' }, // Active item
    ],
  },
};

// Story to demonstrate the generic fallback to '/overview'.
export const WithDefaultOverviewFallback: Story = {
  args: {
    ...Default.args,
    items: [
      { name: 'Home', path: '/' },
      { name: 'Some Other Section' }, // This item has no 'to' path, should fall back to '/overview'
      { name: 'Current Page' }, // Active item
    ],
  },
};
