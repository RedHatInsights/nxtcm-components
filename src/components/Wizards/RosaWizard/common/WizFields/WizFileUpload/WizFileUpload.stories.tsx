import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { WizFieldsYupStoryDebugGrid } from '../WizFieldsStorybookHelpers';
import { WizFileUpload, type WizFileUploadProps } from './WizFileUpload';

type DemoFormValues = { pullSecret: string };

const PULL_SECRET_PATH = 'pullSecret' as const satisfies keyof DemoFormValues;

const schema: yup.ObjectSchema<DemoFormValues> = yup.object({
  pullSecret: yup
    .string()
    .trim()
    .min(1, 'Upload a pull secret file.')
    .required('Upload a pull secret file.')
    .meta({
      id: 'wiz-file-upload-pull-secret',
      label: 'Pull secret',
      helperText: 'Upload a JSON pull secret file from the registry. Yup validates on submit.',
    }),
});

function WizFileUploadFormDemo(args: WizFileUploadProps) {
  const [lastSubmit, setLastSubmit] = useState<DemoFormValues | null>(null);
  const methods = useForm<DemoFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { pullSecret: '' },
    mode: 'onSubmit',
  });

  return (
    <FormProvider {...methods}>
      <Form
        onSubmit={(e) => {
          void methods.handleSubmit((data) => {
            setLastSubmit(data);
          })(e);
        }}
      >
        <WizFileUpload {...args} name={PULL_SECRET_PATH} schema={schema} />
        <Button type="submit" className="pf-v6-u-mt-md">
          Submit
        </Button>
      </Form>
      <WizFieldsYupStoryDebugGrid
        schema={schema}
        fieldPath={PULL_SECRET_PATH}
        lastSubmit={lastSubmit}
      />
    </FormProvider>
  );
}

const meta: Meta<typeof WizFileUpload> = {
  title: 'Form Elements/Connected Form Elements/WizFileUpload',
  component: WizFileUpload,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    isRequired: {
      table: { disable: true },
    },
    label: {
      control: 'text',
    },
    labelHelp: {
      control: 'text',
    },
    labelHelpTitle: {
      control: 'text',
    },
    helperText: {
      control: 'text',
    },
    isDisabled: { control: 'boolean' },
    isSuccess: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    name: {
      control: false,
    },
    control: {
      table: { disable: true },
    },
    schema: {
      table: { disable: true },
    },
    yupDescribeOptions: {
      table: { disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <WizFileUploadFormDemo {...args} />,
  args: {},
};
