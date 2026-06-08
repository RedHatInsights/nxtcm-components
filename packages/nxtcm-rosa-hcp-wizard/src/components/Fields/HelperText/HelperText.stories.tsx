import type { Meta, StoryObj } from '@storybook/react';
import { HelperText } from './HelperText';

const meta: Meta<typeof HelperText> = {
  title: 'Form Elements/HelperText',
  component: HelperText,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    errorMessage: {
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
  args: {
    id: 'story-helper-text',
    helperText: 'This field accepts DNS-compliant names.',
  },
};
