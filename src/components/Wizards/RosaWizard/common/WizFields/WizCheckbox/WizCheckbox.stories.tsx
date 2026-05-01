import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { WizFieldsYupStoryDebugGrid } from '../WizFieldsStorybookHelpers';
import { WizCheckbox, type WizCheckboxProps } from './WizCheckbox';

type DemoFormValues = { acceptTerms: boolean };

const ACCEPT_TERMS_PATH = 'acceptTerms' as const satisfies keyof DemoFormValues;

const schema: yup.ObjectSchema<DemoFormValues> = yup.object({
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'You must accept the terms to continue.')
    .required()
    .meta({
      id: 'wiz-checkbox-accept-terms',
      title: 'Terms',
      label: 'I accept the terms for this cluster',
      helperText: ' Yup validates this checkbox on submit.',
    }),
});

function WizCheckboxFormDemo(args: WizCheckboxProps) {
  const [lastSubmit, setLastSubmit] = useState<DemoFormValues | null>(null);
  const methods = useForm<DemoFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { acceptTerms: false },
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
        <WizCheckbox {...args} name={ACCEPT_TERMS_PATH} schema={schema} />
        <Button type="submit" className="pf-v6-u-mt-md">
          Submit
        </Button>
      </Form>
      <WizFieldsYupStoryDebugGrid
        schema={schema}
        fieldPath={ACCEPT_TERMS_PATH}
        lastSubmit={lastSubmit}
      />
    </FormProvider>
  );
}

const meta: Meta<typeof WizCheckbox> = {
  title: 'Form Elements/Connected Form Elements/WizCheckbox',
  component: WizCheckbox,
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
    helperText: {
      control: 'text',
    },
    title: { control: 'text' },
    isDisabled: { control: 'boolean' },
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
  render: (args) => <WizCheckboxFormDemo {...args} />,
  args: {},
};
