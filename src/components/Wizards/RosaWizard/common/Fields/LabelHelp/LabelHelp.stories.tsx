import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { LabelHelp } from './LabelHelp';

const meta: Meta<typeof LabelHelp> = {
  title: 'Form Elements/LabelHelp',
  component: LabelHelp,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'story-label-help',
    labelHelpTitle: 'About this field',
    labelHelp: (
      <p>Extra context for reviewers appears here. Keep it short and link out for long docs.</p>
    ),
  },
};
