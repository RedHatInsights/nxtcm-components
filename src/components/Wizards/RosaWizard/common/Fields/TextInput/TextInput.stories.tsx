import React, { type FormEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Form } from '@patternfly/react-core';
import { TextInput, type TextInputProps } from './TextInput';

function TextInputDemo(args: TextInputProps) {
  const [value, setValue] = React.useState(String(args.value ?? ''));
  return (
    <Form>
      <TextInput
        {...args}
        value={value}
        onChange={(_e: FormEvent<HTMLInputElement>, v: string) => setValue(String(v))}
        name="story-text-input"
        aria-label="Example text input"
      />
    </Form>
  );
}

const meta: Meta<typeof TextInput> = {
  title: 'Form Elements/TextInput',
  component: TextInput,
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
    successMessage: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <TextInputDemo {...args} />,
  args: {
    id: 'story-text-input',
    isSecret: false,
    showSecretButton: false,
    helperText: 'Use letters, numbers, and hyphens.',
    label: 'API name',
    isSuccess: false,
    isError: false,
    successMessage: 'API name updated successfully.',
    isDisabled: false,
    isLoading: false,
    labelHelp: 'More information about this field',
    isRequired: true,
  },
};

export const Password: Story = {
  render: (args) => <TextInputDemo {...args} />,
  args: {
    id: 'story-text-input',
    isSecret: true,
    showSecretButton: true,
    helperText: 'Use letters, numbers, and hyphens.',
    label: 'Secret password',
    isSuccess: false,
    isError: false,
    successMessage: 'Secret updated successfully.',
    isDisabled: false,
    isLoading: false,
    labelHelp: 'More information about this field',
    isRequired: true,
  },
};
