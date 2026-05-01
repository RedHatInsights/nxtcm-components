import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { WizFieldsYupStoryDebugGrid } from '../WizFieldsStorybookHelpers';
import { Radio } from '../../Fields/RadioGroup';
import { WizRadioGroup, type WizRadioGroupProps } from './WizRadioGroup';

type DemoFormValues = { apiVisibility: string };

const API_VISIBILITY_PATH = 'apiVisibility' as const satisfies keyof DemoFormValues;

const schema: yup.ObjectSchema<DemoFormValues> = yup.object({
  apiVisibility: yup
    .string()
    .oneOf(['public', 'private'], 'Select public or private.')
    .required('API visibility is required.')
    .meta({
      id: 'wiz-radio-group-api-visibility',
      label: 'API visibility',
      helperText: 'Private endpoints restrict network access to the API server.',
      labelHelp: 'More information about this field',
    }),
});

function WizRadioGroupFormDemo(args: WizRadioGroupProps) {
  const [lastSubmit, setLastSubmit] = useState<DemoFormValues | null>(null);
  const methods = useForm<DemoFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { apiVisibility: undefined },
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
        <WizRadioGroup {...args} name={API_VISIBILITY_PATH} schema={schema}>
          <Radio id="wiz-radio-public" label="Public" value="public" />
          <Radio id="wiz-radio-private" label="Private" value="private" />
        </WizRadioGroup>
        <Button type="submit" className="pf-v6-u-mt-md">
          Submit
        </Button>
      </Form>
      <WizFieldsYupStoryDebugGrid
        schema={schema}
        fieldPath={API_VISIBILITY_PATH}
        lastSubmit={lastSubmit}
      />
    </FormProvider>
  );
}

const meta: Meta<typeof WizRadioGroup> = {
  title: 'Form Elements/Connected Form Elements/WizRadioGroup',
  component: WizRadioGroup,
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
    children: {
      table: { disable: true },
    },
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
  render: (args) => <WizRadioGroupFormDemo {...args} />,
  args: {
    isInline: false,
    isDisabled: false,
  },
};
