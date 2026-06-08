import React from 'react';
import { type DropEvent, Form } from '@patternfly/react-core';
import type { Meta, StoryObj } from '@storybook/react';
import { FileUpload, type FileUploadProps } from './FileUpload';

function FileUploadDemo(args: FileUploadProps) {
  const [value, setValue] = React.useState('');
  return (
    <Form>
      <FileUpload
        {...args}
        value={value}
        onDataChange={(_e: DropEvent, data: string) => setValue(data)}
        onClearClick={() => setValue('')}
      />
    </Form>
  );
}

const meta: Meta<typeof FileUpload> = {
  title: 'Form Elements/FileUpload',
  component: FileUpload,
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
    successMessage: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <FileUploadDemo {...args} />,
  args: {
    id: 'story-file-upload',
    label: 'Pull secret',
    helperText: 'Upload a JSON pull secret file from the registry.',
    labelHelp: 'More information about this field',
    isRequired: true,
    isDisabled: false,
    isError: false,
    isSuccess: false,
    isLoading: false,
  },
};
