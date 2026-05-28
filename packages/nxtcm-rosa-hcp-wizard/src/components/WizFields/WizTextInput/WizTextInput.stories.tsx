import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { RosaHcpWizardStringsProvider } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { WizFieldsYupStoryDebugGrid } from '../WizFieldsStorybookHelpers';
import { WizTextInput, type WizTextInputProps } from './WizTextInput';

type DemoFormValues = { clusterName: string };

const CLUSTER_NAME_PATH = 'clusterName' as const satisfies keyof DemoFormValues;

const schema: yup.ObjectSchema<DemoFormValues> = yup.object({
  clusterName: yup
    .string()
    .min(3, 'Cluster name must be at least 3 characters.')
    .required('Cluster name is required.')
    .meta({
      id: 'wiz-text-input-cluster-name',
      title: 'Cluster naming',
      label: 'Cluster name',
      helperText: 'Yup validates this field on submit.',
    }),
});

function WizTextInputFormDemo(args: WizTextInputProps) {
  const [lastSubmit, setLastSubmit] = useState<DemoFormValues | null>(null);
  const methods = useForm<DemoFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { clusterName: '' },
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
        <WizTextInput {...args} name={CLUSTER_NAME_PATH} schema={schema} />
        <Button type="submit" className="pf-v6-u-mt-md">
          Submit
        </Button>
      </Form>
      <WizFieldsYupStoryDebugGrid
        schema={schema}
        fieldPath={CLUSTER_NAME_PATH}
        lastSubmit={lastSubmit}
      />
    </FormProvider>
  );
}

type PasswordDemoFormValues = { adminPassword: string };

const ADMIN_PASSWORD_PATH = 'adminPassword' as const satisfies keyof PasswordDemoFormValues;

const passwordSchema: yup.ObjectSchema<PasswordDemoFormValues> = yup.object({
  adminPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .required('Password is required.')
    .meta({
      id: 'wiz-text-input-admin-password',
      label: 'Admin password',
      helperText: 'Use the eye control to show or hide the value. Yup validates on submit.',
      labelHelpTitle: 'Password policy',
      labelHelp: 'More information about this field',
    }),
});

function WizTextInputPasswordFormDemo(args: WizTextInputProps) {
  const [lastSubmit, setLastSubmit] = useState<PasswordDemoFormValues | null>(null);
  const methods = useForm<PasswordDemoFormValues>({
    resolver: yupResolver(passwordSchema),
    defaultValues: { adminPassword: '' },
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
        <WizTextInput {...args} name={ADMIN_PASSWORD_PATH} schema={passwordSchema} />
        <Button type="submit" className="pf-v6-u-mt-md">
          Submit
        </Button>
      </Form>
      <WizFieldsYupStoryDebugGrid
        schema={passwordSchema}
        fieldPath={ADMIN_PASSWORD_PATH}
        lastSubmit={lastSubmit}
      />
    </FormProvider>
  );
}

const meta: Meta<typeof WizTextInput> = {
  title: 'Form Elements/Connected Form Elements/WizTextInput',
  component: WizTextInput,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <RosaHcpWizardStringsProvider>
        <Story />
      </RosaHcpWizardStringsProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    isRequired: {
      table: { disable: true },
    },
    required: {
      table: { disable: true },
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
    labelHelpTitle: {
      control: 'text',
    },
    name: {
      control: false,
    },
    isDisabled: { control: 'boolean' },
    isSecret: { control: 'boolean' },
    showSecretButton: { control: 'boolean' },
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
  render: (args) => <WizTextInputFormDemo {...args} />,
  args: {
    isDisabled: false,
  },
};

export const Password: Story = {
  render: (args) => <WizTextInputPasswordFormDemo {...args} />,
  args: {
    isSecret: true,
    showSecretButton: true,
    isDisabled: false,
  },
};
