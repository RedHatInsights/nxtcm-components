import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionsDropdown, DropdownItem } from './ActionsDropdown';
import { TranslationProvider } from '../../context/TranslationContext';

const mockItems: DropdownItem<string>[] = [
  { id: 'item1', text: 'Item One' },
  { id: 'item2', text: 'Item Two', isDisabled: true },
  { id: 'item3', text: 'Item Three', separator: true },
  {
    id: 'flyout',
    text: 'Flyout Menu',
    flyoutMenu: [
      { id: 'flyout1', text: 'Flyout Item One' },
      { id: 'flyout2', text: 'Flyout Item Two' },
    ],
  },
  { id: 'item4', text: 'Item with onSelect', onSelect: jest.fn() },
];

describe('ActionsDropdown', () => {
  const user = userEvent.setup();

  it('should render the toggle button with the provided text', () => {
    render(<ActionsDropdown id="test-dropdown" dropdownItems={mockItems} text="My Actions" />);
    expect(screen.getByRole('button', { name: /My Actions/i })).toBeInTheDocument();
  });

  it('should render as a kebab toggle when isKebab is true', () => {
    render(<ActionsDropdown id="test-kebab" dropdownItems={mockItems} isKebab />);
    expect(screen.getByRole('button', { name: /Actions/i })).toBeInTheDocument();
  });

  it('should allow overriding the kebab aria-label', () => {
    render(
      <ActionsDropdown
        id="test-kebab"
        dropdownItems={mockItems}
        isKebab
        kebabAriaLabel="More Options"
      />
    );
    expect(screen.getByRole('button', { name: /More Options/i })).toBeInTheDocument();
  });

  it('should render a disabled toggle when isDisabled is true', () => {
    render(
      <ActionsDropdown id="test-disabled" dropdownItems={mockItems} text="Disabled" isDisabled />
    );
    expect(screen.getByRole('button', { name: /Disabled/i })).toBeDisabled();
  });

  it('should open and close the menu on toggle click', async () => {
    render(<ActionsDropdown id="test-toggle" dropdownItems={mockItems} text="Toggle Me" />);

    expect(screen.queryByText('Item One')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Toggle Me/i }));
    expect(screen.getByText('Item One')).toBeVisible();
    expect(screen.getByText('Item Two')).toBeVisible();

    await user.click(screen.getByRole('button', { name: /Toggle Me/i }));
    await waitFor(() => {
      expect(screen.queryByText('Item One')).not.toBeInTheDocument();
    });
  });

  it('should call onSelect with the correct item id and close the menu', async () => {
    const onSelectMock = jest.fn();
    render(
      <ActionsDropdown
        id="test-select"
        dropdownItems={mockItems}
        text="Select Item"
        onSelect={onSelectMock}
      />
    );

    await user.click(screen.getByRole('button', { name: /Select Item/i }));
    const menuItem = screen.getByText('Item One');
    await user.click(menuItem);

    expect(onSelectMock).toHaveBeenCalledWith('item1');
    expect(onSelectMock).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByText('Item One')).not.toBeInTheDocument();
    });
  });

  it("should call the item's specific onSelect handler", async () => {
    render(
      <ActionsDropdown id="test-item-select" dropdownItems={mockItems} text="Item Select Test" />
    );

    await user.click(screen.getByRole('button', { name: /Item Select Test/i }));
    await user.click(screen.getByText('Item with onSelect'));

    expect(mockItems.find((item) => item.id === 'item4')?.onSelect).toHaveBeenCalledTimes(1);
  });

  // Test 7: Closing on Escape
  it('should close the menu when Escape key is pressed and focus the toggle', async () => {
    render(<ActionsDropdown id="test-escape" dropdownItems={mockItems} text="Escape Test" />);
    const toggleButton = screen.getByRole('button', { name: /Escape Test/i });

    await user.click(toggleButton);
    expect(screen.getByText('Item One')).toBeVisible();

    await user.keyboard('{escape}');
    await waitFor(() => {
      expect(screen.queryByText('Item One')).not.toBeInTheDocument();
    });
    expect(toggleButton).toHaveFocus();
  });

  it('should close the menu on an outside click', async () => {
    render(
      <div>
        <ActionsDropdown id="test-outside" dropdownItems={mockItems} text="Outside Click" />
        <button>Outside Button</button>
      </div>
    );

    await user.click(screen.getByRole('button', { name: /Outside Click/i }));
    expect(screen.getByText('Item One')).toBeVisible();

    await user.click(screen.getByRole('button', { name: /Outside Button/i }));
    await waitFor(() => {
      expect(screen.queryByText('Item One')).not.toBeInTheDocument();
    });
  });

  it('should not be clickable for a disabled item', async () => {
    const onSelectMock = jest.fn();
    render(
      <ActionsDropdown
        id="test-disabled-item"
        dropdownItems={mockItems}
        text="Disabled Item Test"
        onSelect={onSelectMock}
      />
    );

    await user.click(screen.getByRole('button', { name: /Disabled Item Test/i }));
    const disabledItem = screen.getByText('Item Two');

    expect(disabledItem.closest('button')).toHaveAttribute('aria-disabled', 'true');

    await user.click(disabledItem);

    expect(onSelectMock).not.toHaveBeenCalled();
    expect(screen.getByText('Item Two')).toBeVisible();
  });

  describe('when dealing with flyout menus', () => {
    it('should show the flyout menu on hover/click and handle selection', async () => {
      const onSelectMock = jest.fn();
      render(
        <ActionsDropdown
          id="test-flyout"
          dropdownItems={mockItems}
          text="Flyout Test"
          onSelect={onSelectMock}
        />
      );

      await user.click(screen.getByRole('button', { name: /Flyout Test/i }));
      const flyoutParent = screen.getByText('Flyout Menu');

      fireEvent.mouseEnter(flyoutParent);

      const flyoutItem = await screen.findByText('Flyout Item One');
      expect(flyoutItem).toBeVisible();

      await user.click(flyoutItem);

      expect(onSelectMock).toHaveBeenCalledWith('flyout1');

      await waitFor(() => {
        expect(screen.queryByText('Flyout Menu')).not.toBeInTheDocument();
      });
    });

    it('should not call onSelect when a flyout parent is clicked', async () => {
      const onSelectMock = jest.fn();
      render(
        <ActionsDropdown
          id="test-flyout-parent"
          dropdownItems={mockItems}
          text="Flyout Parent Test"
          onSelect={onSelectMock}
        />
      );

      await user.click(screen.getByRole('button', { name: /Flyout Parent Test/i }));

      const flyoutParent = screen.getByText('Flyout Menu');
      await user.click(flyoutParent);

      expect(onSelectMock).not.toHaveBeenCalled();
      expect(screen.getByText('Flyout Menu')).toBeVisible();
    });
  });

  describe('translation support', () => {
    it('should use default English text when no translation provider is used', () => {
      render(<ActionsDropdown id="test-default" dropdownItems={mockItems} isKebab />);
      expect(screen.getByRole('button', { name: /Actions/i })).toBeInTheDocument();
    });

    it('should use custom translation function when provided', () => {
      const mockTranslate = jest.fn((key: string) => {
        if (key === 'Actions') return 'Acciones';
        return key;
      });

      render(
        <TranslationProvider translate={mockTranslate}>
          <ActionsDropdown id="test-translated" dropdownItems={mockItems} isKebab />
        </TranslationProvider>
      );

      expect(screen.getByRole('button', { name: /Acciones/i })).toBeInTheDocument();
      expect(mockTranslate).toHaveBeenCalledWith('Actions');
    });

    it('should allow kebabAriaLabel to override translation', () => {
      const mockTranslate = jest.fn((key: string) => {
        if (key === 'Actions') return 'Acciones';
        return key;
      });

      render(
        <TranslationProvider translate={mockTranslate}>
          <ActionsDropdown
            id="test-override"
            dropdownItems={mockItems}
            isKebab
            kebabAriaLabel="Custom Label"
          />
        </TranslationProvider>
      );

      expect(screen.getByRole('button', { name: /Custom Label/i })).toBeInTheDocument();
      expect(mockTranslate).not.toHaveBeenCalledWith('Actions');
    });
  });
});
