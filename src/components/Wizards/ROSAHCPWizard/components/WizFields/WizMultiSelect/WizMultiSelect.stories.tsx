import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { RosaHcpWizardStringsProvider } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { WizFieldsYupStoryDebugGrid } from '../WizFieldsStorybookHelpers';
import { WizMultiSelect, type WizMultiSelectProps } from './WizMultiSelect';

type DemoFormValues = { tags: string[] };

type WizMultiSelectStoryArgs = Omit<
  WizMultiSelectProps<DemoFormValues, string>,
  'control' | 'name'
>;

const TAGS_PATH = 'tags' as const satisfies keyof DemoFormValues;

const defaultSchema = yup.object({
  tags: yup.array().of(yup.string()).min(1, 'Pick at least one tag.').meta({
    id: 'wiz-multi-tags',
    label: 'Tags',
    helperText: 'Yup validates this multiselect on submit.',
  }),
}) as yup.ObjectSchema<DemoFormValues>;

function WizMultiSelectFormDemo(schema: yup.ObjectSchema<DemoFormValues>) {
  return function Render(args: WizMultiSelectStoryArgs) {
    const [lastSubmit, setLastSubmit] = useState<DemoFormValues | null>(null);
    const methods = useForm<DemoFormValues>({
      resolver: yupResolver(schema),
      defaultValues: { tags: [] },
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
          <WizMultiSelect {...args} name={TAGS_PATH} schema={schema} />
          <Button type="submit" className="pf-v6-u-mt-md">
            Submit
          </Button>
        </Form>
        <WizFieldsYupStoryDebugGrid schema={schema} fieldPath={TAGS_PATH} lastSubmit={lastSubmit} />
      </FormProvider>
    );
  };
}

const meta: Meta<typeof WizMultiSelect> = {
  title: 'Form Elements/Connected Form Elements/WizMultiSelect',
  component: WizMultiSelect,
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
    isRequired: { table: { disable: true } },
    label: { control: 'text' },
    helperText: { control: 'text' },
    options: { table: { disable: true } },
    name: { control: false },
    control: { table: { disable: true } },
    schema: { table: { disable: true } },
    yupDescribeOptions: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) =>
    WizMultiSelectFormDemo(defaultSchema)(args as unknown as WizMultiSelectStoryArgs),
  args: {
    options: ['alpha', 'bravo', 'charlie'],
    isDisabled: false,
  },
};
