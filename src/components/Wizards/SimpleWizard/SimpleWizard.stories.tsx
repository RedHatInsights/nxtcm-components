import type { Meta, StoryObj } from '@storybook/react';
import { WizardExpandableSteps, type WizardExpandableStepsProps } from './SimpleWizard';

const meta: Meta<WizardExpandableStepsProps> = {
  title: 'Components/Wizards/SimpleWizard',
  component: WizardExpandableSteps,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh', padding: '1rem', overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** PatternFly wizard with expandable substeps in the nav. */
export const ExpandableSteps: Story = {};
