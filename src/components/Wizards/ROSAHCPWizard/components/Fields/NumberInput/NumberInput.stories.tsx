import React, { type SyntheticEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Form } from '@patternfly/react-core';

import { NumberInput, type NumberInputProps } from './NumberInput';

function NumberInputDemo(args: NumberInputProps) {
  const [value, setValue] = React.useState<number | undefined>(0);
  return (
    <Form>
      <NumberInput
        {...args}
        value={value}
        onChange={(_e: SyntheticEvent, v: number | undefined) => setValue(v)}
      />
    </Form>
  );
}

const meta: Meta<typeof NumberInput> = {
  title: 'Form Elements/NumberInput',
  component: NumberInput,
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
    value: { control: false },
    children: { control: false },
    successMessage: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <NumberInputDemo {...args} />,
  args: {
    id: 'story-number-input',
    label: 'Worker node count',
    min: 0,
    max: 10,
    helperText: 'Minimum of zero for a compact test cluster.',
    isSuccess: false,
    isError: false,
    isDisabled: false,
    labelHelp: 'More information about this field',
    isRequired: true,
  },
};
