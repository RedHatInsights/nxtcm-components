import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Form } from '@patternfly/react-core';
import { Select, type SelectProps } from './Select';

function SelectDemo(args: SelectProps) {
  const [value, setValue] = React.useState<string | undefined>();

  return (
    <Form>
      <Select
        {...args}
        value={value}
        onChange={(next) => setValue(next === undefined ? undefined : String(next))}
      />
    </Form>
  );
}

function SelectRefreshDemo(args: SelectProps) {
  const [value, setValue] = React.useState<string | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);

  const refreshMock = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Form>
      <Select
        {...args}
        value={value}
        onChange={(next) => setValue(next === undefined ? undefined : String(next))}
        isLoading={isLoading}
        onRefresh={refreshMock}
      />
    </Form>
  );
}

const meta: Meta<typeof Select> = {
  title: 'Form Elements/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    errorMessage: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
    labelHelp: {
      control: 'text',
    },
    helperText: {
      control: 'text',
    },
    value: {
      control: false,
    },
    successMessage: {
      control: 'text',
    },
    onBlur: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <SelectDemo {...args} />,
  args: {
    id: 'story-select',
    label: 'Region',
    options: ['us-east-1', 'us-west-2', { label: 'US West (N. California)', value: 'us-west-1' }],
    helperText: 'Pick the region closest to your users.',
    isRequired: true,
    isTypeAhead: false,
  },
};

export const GroupedOptions: Story = {
  render: (args) => <SelectDemo {...args} />,
  args: {
    id: 'story-select-grouped',
    label: 'AWS region',
    optionGroups: [
      {
        label: 'United States',
        options: [
          { label: 'US East (N. Virginia)', value: 'us-east-1' },
          { label: 'US West (N. California)', value: 'us-west-1' },
          { label: 'US West (Oregon)', value: 'us-west-2' },
        ],
      },
      {
        label: 'Europe',
        options: [
          { label: 'Europe (Ireland)', value: 'eu-west-1' },
          { label: 'Europe (Frankfurt)', value: 'eu-central-1' },
        ],
      },
      {
        label: 'Asia Pacific',
        options: [
          { label: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
          { label: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
        ],
      },
    ],
    helperText: 'Regions are grouped by geography.',
    isRequired: true,
    isTypeAhead: true,
  },
};

export const Refresh: Story = {
  render: (args) => <SelectRefreshDemo {...args} />,
  args: {
    id: 'story-select-refresh',
    label: 'AWS region',
    options: ['us-east-1', 'us-west-2', { label: 'US West (N. California)', value: 'us-west-1' }],
    helperText: 'Regions are grouped by geography.',
    isRequired: true,
    isTypeAhead: true,
  },
};
