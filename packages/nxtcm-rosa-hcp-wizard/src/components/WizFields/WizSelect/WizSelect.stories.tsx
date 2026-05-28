import { useCallback, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { RosaHcpWizardStringsProvider } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { WizFieldsYupStoryDebugGrid } from '../WizFieldsStorybookHelpers';
import { WizSelect, type WizSelectProps } from './WizSelect';

type DemoFormValues = { region: string };

type WizSelectStoryArgs = Omit<WizSelectProps<DemoFormValues, string>, 'control' | 'name'>;

const REGION_PATH = 'region' as const satisfies keyof DemoFormValues;

const defaultSchema: yup.ObjectSchema<DemoFormValues> = yup.object({
  region: yup.string().required('Please select a region.').meta({
    id: 'wiz-select-region',
    label: 'Region',
    helperText: 'Yup validates this select on submit.',
  }),
});

const groupedSchema: yup.ObjectSchema<DemoFormValues> = yup.object({
  region: yup.string().required('Please select a region.').meta({
    id: 'wiz-select-region-grouped',
    label: 'AWS region',
    helperText: 'Regions are grouped by geography.',
  }),
});

/** Refresh demo clears the field to `""`; keep empty string invalid so Yup matches that behavior. */
const refreshSchema: yup.ObjectSchema<DemoFormValues> = yup.object({
  region: yup
    .string()
    .required('Please select a region.')
    .notOneOf([''], 'Please select a region.')
    .meta({
      id: 'wiz-select-region-refresh',
      label: 'AWS region',
      helperText: 'Press refresh to clear the selection to an empty string (and reload options).',
    }),
});

function WizSelectFormDemo(schema: yup.ObjectSchema<DemoFormValues>) {
  return function Render(args: WizSelectStoryArgs) {
    const [lastSubmit, setLastSubmit] = useState<DemoFormValues | null>(null);
    const methods = useForm<DemoFormValues>({
      resolver: yupResolver(schema),
      defaultValues: { region: undefined },
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
          <WizSelect {...args} name={REGION_PATH} schema={schema} />
          <Button type="submit" className="pf-v6-u-mt-md">
            Submit
          </Button>
        </Form>
        <WizFieldsYupStoryDebugGrid
          schema={schema}
          fieldPath={REGION_PATH}
          lastSubmit={lastSubmit}
        />
      </FormProvider>
    );
  };
}

function WizSelectRefreshFormDemo(schema: yup.ObjectSchema<DemoFormValues>) {
  return function Render(args: WizSelectStoryArgs) {
    const [lastSubmit, setLastSubmit] = useState<DemoFormValues | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const methods = useForm<DemoFormValues>({
      resolver: yupResolver(schema),
      defaultValues: { region: undefined },
      mode: 'onSubmit',
    });

    const onRefresh = useCallback(() => {
      methods.setValue(REGION_PATH, '', {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }, [methods]);

    return (
      <FormProvider {...methods}>
        <Form
          onSubmit={(e) => {
            void methods.handleSubmit((data) => {
              setLastSubmit(data);
            })(e);
          }}
        >
          <WizSelect
            {...args}
            name={REGION_PATH}
            schema={schema}
            onRefresh={onRefresh}
            isLoading={isLoading}
          />
          <Button type="submit" className="pf-v6-u-mt-md">
            Submit
          </Button>
        </Form>
        <WizFieldsYupStoryDebugGrid
          schema={schema}
          fieldPath={REGION_PATH}
          lastSubmit={lastSubmit}
        />
      </FormProvider>
    );
  };
}

const meta: Meta<typeof WizSelect> = {
  title: 'Form Elements/Connected Form Elements/WizSelect',
  component: WizSelect,
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
    options: {
      table: { disable: true },
    },
    optionGroups: {
      table: { disable: true },
    },
    onRefresh: {
      table: { disable: true },
    },
    isLoading: {
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
  render: (args) => WizSelectFormDemo(defaultSchema)(args as unknown as WizSelectStoryArgs),
  args: {
    options: ['us-east-1', 'us-west-2', { label: 'US West (N. California)', value: 'us-west-1' }],
    isDisabled: false,
    isTypeAhead: false,
  },
};

export const GroupedOptions: Story = {
  render: (args) => WizSelectFormDemo(groupedSchema)(args as unknown as WizSelectStoryArgs),
  args: {
    optionGroups: [
      {
        label: 'United States',
        options: [
          { label: 'US East (N. Virginia)', value: 'us-east-1' },
          { label: 'US West (N. California)', value: 'us-west-1' },
          { label: 'US West (Oregon)', value: 'us-west-2' },
        ],
      },
      {
        label: 'Europe',
        options: [
          { label: 'Europe (Ireland)', value: 'eu-west-1' },
          { label: 'Europe (Frankfurt)', value: 'eu-central-1' },
        ],
      },
      {
        label: 'Asia Pacific',
        options: [
          { label: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
          { label: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
        ],
      },
    ],
    isDisabled: false,
    isTypeAhead: true,
  },
};

export const Refresh: Story = {
  render: (args) => WizSelectRefreshFormDemo(refreshSchema)(args as unknown as WizSelectStoryArgs),
  args: {
    options: ['us-east-1', 'us-west-2', { label: 'US West (N. California)', value: 'us-west-1' }],
    isDisabled: false,
    isTypeAhead: true,
  },
};
