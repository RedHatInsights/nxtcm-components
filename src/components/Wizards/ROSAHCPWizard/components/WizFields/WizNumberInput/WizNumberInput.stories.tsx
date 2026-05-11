import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { RosaHcpWizardStringsProvider } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { WizFieldsYupStoryDebugGrid } from '../WizFieldsStorybookHelpers';
import { WizNumberInput, type WizNumberInputProps } from './WizNumberInput';

type DemoFormValues = { nodeCount?: number };

const NODE_COUNT_PATH = 'nodeCount' as const satisfies keyof DemoFormValues;

const schema: yup.ObjectSchema<DemoFormValues> = yup.object({
  nodeCount: yup
    .number()
    .typeError('Enter a whole number of nodes.')
    .integer('Use a whole number.')
    .min(1, 'Choose at least one worker node.')
    .max(10, 'Ten nodes is the maximum for this demo.')
    .required('Node count is required.')
    .meta({
      id: 'wiz-number-input-node-count',
      label: 'Worker node count',
      helperText: 'Yup validates this number on submit.',
      labelHelp: 'More information about this field',
    }),
});

function WizNumberInputFormDemo(args: WizNumberInputProps) {
  const [lastSubmit, setLastSubmit] = useState<DemoFormValues | null>(null);
  const methods = useForm<DemoFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {},
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
        <WizNumberInput {...args} name={NODE_COUNT_PATH} schema={schema} />
        <Button type="submit" className="pf-v6-u-mt-md">
          Submit
        </Button>
      </Form>
      <WizFieldsYupStoryDebugGrid
        schema={schema}
        fieldPath={NODE_COUNT_PATH}
        lastSubmit={lastSubmit}
      />
    </FormProvider>
  );
}

const meta: Meta<typeof WizNumberInput> = {
  title: 'Form Elements/Connected Form Elements/WizNumberInput',
  component: WizNumberInput,
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
  render: (args) => <WizNumberInputFormDemo {...args} />,
  args: {
    min: 1,
    max: 10,
    isDisabled: false,
  },
};
