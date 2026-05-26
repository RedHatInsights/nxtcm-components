import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Form } from '@patternfly/react-core';

import { MultiSelect, type MultiSelectProps } from './MultiSelect';

function MultiSelectDemo(args: MultiSelectProps<string>) {
  const [value, setValue] = useState<string[]>([]);

  return (
    <Form>
      <MultiSelect<string> {...args} value={value} onChange={setValue} />
    </Form>
  );
}

function MultiSelectRefreshDemo(args: MultiSelectProps<string>) {
  const [value, setValue] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshMock = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  };

  return (
    <Form>
      <MultiSelect<string>
        {...args}
        value={value}
        onChange={setValue}
        isLoading={isLoading}
        onRefresh={refreshMock}
      />
    </Form>
  );
}

const meta: Meta<typeof MultiSelect> = {
  title: 'Form Elements/MultiSelect',
  component: MultiSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    onBlur: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'story-multi-select',
    label: 'Regions',
    options: ['us-east-1', 'eu-west-1', 'ap-south-1'],
  },
  render: (args) => <MultiSelectDemo {...(args as unknown as MultiSelectProps<string>)} />,
};

export const WithRefresh: Story = {
  args: {
    id: 'story-multi-select-refresh',
    label: 'VPC security groups',
    options: ['sg-a', 'sg-b'],
  },
  render: (args) => <MultiSelectRefreshDemo {...(args as unknown as MultiSelectProps<string>)} />,
};
