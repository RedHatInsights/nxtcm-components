import type { Meta, StoryObj } from '@storybook/react';
import { ActionsDropdown, DropdownItem } from './ActionsDropdown'; // Adjust import path

const mockItems: DropdownItem<string>[] = [
  { id: 'item1', text: 'Item One' },
  { id: 'item2', text: 'Item Two' },
  { id: 'item3', text: 'Item Three', separator: true },
  { id: 'disabled_item', text: 'Disabled Item', isDisabled: true },
];

const meta: Meta<typeof ActionsDropdown> = {
  title: 'Components/ActionsDropdown',
  component: ActionsDropdown,
  tags: ['autodocs'],
  argTypes: {
    onSelect: { action: 'selected' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    id: 'primary-dropdown',
    text: 'My Actions',
    dropdownItems: mockItems,
  },
};

export const Kebab: Story = {
  args: {
    id: 'kebab-dropdown',
    isKebab: true,
    dropdownItems: mockItems,
  },
};

export const Disabled: Story = {
  args: {
    id: 'disabled-dropdown',
    text: 'Cannot Click',
    isDisabled: true,
    dropdownItems: mockItems,
  },
};

export const WithTooltip: Story = {
  args: {
    id: 'tooltip-dropdown',
    text: 'Hover Me',
    tooltip: 'This is a helpful tooltip!',
    dropdownItems: mockItems,
  },
};
