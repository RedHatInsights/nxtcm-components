import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Form } from '@patternfly/react-core';

import { RadioGroup } from '../RadioGroup';
import { Radio, type RadioProps } from './Radio';

function RadioGroupDemo(args: RadioProps) {
  const [value, setValue] = React.useState<unknown>(args.value ?? 'public');
  return (
    <Form>
      <RadioGroup id="story-radio-group" value={value} onChange={setValue}>
        <Radio {...args} />
        <Radio id="story-radio-control" label="This is a control radio" value="control" />
      </RadioGroup>
    </Form>
  );
}

const meta: Meta<typeof Radio> = {
  title: 'Form Elements/Radio',
  component: Radio,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    label: {
      control: 'text',
    },
    labelHelp: {
      control: 'text',
    },
    labelHelpTitle: {
      control: 'text',
    },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <RadioGroupDemo {...args} />,
  args: {
    id: 'story-radio-demo',
    label: 'API visibility',
    value: 'public',
    description: 'Private endpoints restrict network access to the API server.',
    labelHelp: 'More information about this field',
    children: 'This is the body that is hidden/shown when checked',
  },
};
