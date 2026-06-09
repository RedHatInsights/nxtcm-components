import React, { type FormEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Form } from '@patternfly/react-core';
import { Checkbox, type CheckboxProps } from './Checkbox';

function CheckboxDemo(args: CheckboxProps) {
  const [isChecked, setIsChecked] = React.useState(!!args.isChecked);
  return (
    <Form>
      <Checkbox
        {...args}
        isChecked={isChecked}
        onChange={(_e: FormEvent<HTMLInputElement>, checked: boolean) => setIsChecked(checked)}
      ></Checkbox>
    </Form>
  );
}

const meta: Meta<typeof Checkbox> = {
  title: 'Form Elements/Checkbox',
  component: Checkbox,
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
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <CheckboxDemo {...args} />,
  args: {
    id: 'story-checkbox',
    title: 'Notifications',
    label: 'Send email when the cluster is ready',
    helperText: 'You can change this later in cluster settings.',
    isRequired: true,
    isDisabled: false,
    labelHelp: 'More information about this field',
  },
};
