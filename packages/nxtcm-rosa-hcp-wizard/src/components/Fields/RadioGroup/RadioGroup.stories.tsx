import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Form } from '@patternfly/react-core';
import { Radio } from '../Radio';
import { RadioGroup, type RadioGroupProps } from './RadioGroup';

function RadioGroupStoryDemo(args: RadioGroupProps) {
  const [value, setValue] = React.useState<unknown>(args.value ?? 'public');
  return (
    <Form>
      <RadioGroup {...args} value={value} onChange={setValue}>
        <Radio id="story-radio-public" label="Public" value="public" />
        <Radio id="story-radio-private" label="Private" value="private" />
      </RadioGroup>
    </Form>
  );
}

const meta: Meta<typeof RadioGroup> = {
  title: 'Form Elements/RadioGroup',
  component: RadioGroup,
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
    children: { control: false },
    value: { control: false },
    successMessage: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <RadioGroupStoryDemo {...args} />,
  args: {
    id: 'story-radio-group',
    label: 'API visibility',
    helperText: 'Private endpoints restrict network access to the API server.',
    isInline: false,
    labelHelp: 'More information about this field',
    isRequired: true,
  },
};
