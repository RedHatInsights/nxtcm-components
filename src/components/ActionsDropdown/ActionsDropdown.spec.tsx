import { test, expect } from '@playwright/experimental-ct-react';
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
];

test.describe('ActionsDropdown', () => {
  test('should render the toggle button with the provided text', async ({ mount }) => {
    const component = await mount(
      <ActionsDropdown id="test-dropdown" dropdownItems={mockItems} text="My Actions" />
    );
    await expect(component.getByRole('button', { name: /My Actions/i })).toBeVisible();
  });

  test('should render as a kebab toggle when isKebab is true', async ({ mount }) => {
    const component = await mount(
      <ActionsDropdown id="test-kebab" dropdownItems={mockItems} isKebab />
    );
    await expect(component.getByRole('button', { name: /Actions/i })).toBeVisible();
  });

  test('should allow overriding the kebab aria-label', async ({ mount }) => {
    const component = await mount(
      <ActionsDropdown
        id="test-kebab"
        dropdownItems={mockItems}
        isKebab
        kebabAriaLabel="More Options"
      />
    );
    await expect(component.getByRole('button', { name: /More Options/i })).toBeVisible();
  });

  test('should render a disabled toggle when isDisabled is true', async ({ mount }) => {
    const component = await mount(
      <ActionsDropdown id="test-disabled" dropdownItems={mockItems} text="Disabled" isDisabled />
    );
    await expect(component.getByRole('button', { name: /Disabled/i })).toBeDisabled();
  });

  test('should open and close the menu on toggle click', async ({ mount }) => {
    const component = await mount(
      <ActionsDropdown id="test-toggle" dropdownItems={mockItems} text="Toggle Me" />
    );

    await expect(component.getByText('Item One')).not.toBeVisible();

    await component.getByRole('button', { name: /Toggle Me/i }).click();
    await expect(component.getByText('Item One')).toBeVisible();
    await expect(component.getByText('Item Two')).toBeVisible();

    await component.getByRole('button', { name: /Toggle Me/i }).click();
    await expect(component.getByText('Item One')).not.toBeVisible();
  });

  test('should call onSelect with the correct item id and close the menu', async ({ mount }) => {
    let selectedId: string | undefined;
    const onSelectMock = (id: string) => {
      selectedId = id;
    };

    const component = await mount(
      <ActionsDropdown
        id="test-select"
        dropdownItems={mockItems}
        text="Select Item"
        onSelect={onSelectMock}
      />
    );

    await component.getByRole('button', { name: /Select Item/i }).click();
    const menuItem = component.getByText('Item One');
    await menuItem.click();

    expect(selectedId).toBe('item1');

    await expect(component.getByText('Item One')).not.toBeVisible();
  });

  test("should call the item's specific onSelect handler", async ({ mount }) => {
    let itemSelectCalled = false;
    const itemsWithOnSelect: DropdownItem<string>[] = [
      ...mockItems,
      {
        id: 'item4',
        text: 'Item with onSelect',
        onSelect: () => {
          itemSelectCalled = true;
        },
      },
    ];

    const component = await mount(
      <ActionsDropdown
        id="test-item-select"
        dropdownItems={itemsWithOnSelect}
        text="Item Select Test"
      />
    );

    await component.getByRole('button', { name: /Item Select Test/i }).click();
    await component.getByText('Item with onSelect').click();

    expect(itemSelectCalled).toBe(true);
  });

  test('should close the menu when Escape key is pressed and focus the toggle', async ({
    mount,
  }) => {
    const component = await mount(
      <ActionsDropdown id="test-escape" dropdownItems={mockItems} text="Escape Test" />
    );
    const toggleButton = component.getByRole('button', { name: /Escape Test/i });

    await toggleButton.click();
    await expect(component.getByText('Item One')).toBeVisible();

    await component.page().keyboard.press('Escape');
    await expect(component.getByText('Item One')).not.toBeVisible();
    await expect(toggleButton).toBeFocused();
  });

  test('should close the menu on an outside click', async ({ mount, page }) => {
    const component = await mount(
      <div style={{ padding: '50px' }}>
        <ActionsDropdown id="test-outside" dropdownItems={mockItems} text="Outside Click" />
        <div style={{ marginTop: '200px', height: '50px' }}>
          <button id="outside-btn">Outside Button</button>
        </div>
      </div>
    );

    await component.getByRole('button', { name: /Outside Click/i }).click();
    await expect(component.getByText('Item One')).toBeVisible();

    // Click on a coordinate that's definitely outside the dropdown menu
    await page.mouse.click(10, 10);
    await expect(component.getByText('Item One')).not.toBeVisible();
  });

  test('should not be clickable for a disabled item', async ({ mount }) => {
    let selectCallCount = 0;
    const onSelectMock = () => {
      selectCallCount++;
    };

    const component = await mount(
      <ActionsDropdown
        id="test-disabled-item"
        dropdownItems={mockItems}
        text="Disabled Item Test"
        onSelect={onSelectMock}
      />
    );

    await component.getByRole('button', { name: /Disabled Item Test/i }).click();

    // Find the disabled menu item by role
    const disabledItem = component.getByRole('menuitem', { name: /Item Two/i });

    await expect(disabledItem).toHaveAttribute('aria-disabled', 'true');

    await disabledItem.click({ force: true });

    expect(selectCallCount).toBe(0);
    await expect(component.getByText('Item Two')).toBeVisible();
  });

  test.describe('when dealing with flyout menus', () => {
    test('should show the flyout menu on hover/click and handle selection', async ({ mount }) => {
      let selectedId: string | undefined;
      const onSelectMock = (id: string) => {
        selectedId = id;
      };

      const component = await mount(
        <ActionsDropdown
          id="test-flyout"
          dropdownItems={mockItems}
          text="Flyout Test"
          onSelect={onSelectMock}
        />
      );

      await component.getByRole('button', { name: /Flyout Test/i }).click();
      const flyoutParent = component.getByText('Flyout Menu');

      await flyoutParent.hover();

      const flyoutItem = component.getByText('Flyout Item One');
      await expect(flyoutItem).toBeVisible();

      await flyoutItem.click();

      expect(selectedId).toBe('flyout1');

      await expect(component.getByText('Flyout Menu')).not.toBeVisible();
    });

    test('should not call onSelect when a flyout parent is clicked', async ({ mount }) => {
      let selectCallCount = 0;
      const onSelectMock = () => {
        selectCallCount++;
      };

      const component = await mount(
        <ActionsDropdown
          id="test-flyout-parent"
          dropdownItems={mockItems}
          text="Flyout Parent Test"
          onSelect={onSelectMock}
        />
      );

      await component.getByRole('button', { name: /Flyout Parent Test/i }).click();

      const flyoutParent = component.getByText('Flyout Menu');
      await flyoutParent.click();

      expect(selectCallCount).toBe(0);
      await expect(component.getByText('Flyout Menu')).toBeVisible();
    });
  });

  test.describe('translation support', () => {
    test('should use default English text when no translation provider is used', async ({
      mount,
    }) => {
      const component = await mount(
        <ActionsDropdown id="test-default" dropdownItems={mockItems} isKebab />
      );
      await expect(component.getByRole('button', { name: /Actions/i })).toBeVisible();
    });

    test('should use custom translation function when provided', async ({ mount }) => {
      let translationCalled = false;
      let translatedValue = '';
      const mockTranslate = (key: string) => {
        if (key === 'Actions') {
          translationCalled = true;
          translatedValue = 'Acciones';
          return translatedValue;
        }
        return key;
      };

      const component = await mount(
        <TranslationProvider translate={mockTranslate}>
          <ActionsDropdown id="test-translated" dropdownItems={mockItems} isKebab />
        </TranslationProvider>
      );

      // Check that the button is visible
      const button = component.getByRole('button');
      await expect(button).toBeVisible();

      // Verify translation function was called
      expect(translationCalled).toBe(true);
      expect(translatedValue).toBe('Acciones');
    });

    test('should allow kebabAriaLabel to override translation', async ({ mount }) => {
      let translationCalled = false;
      const mockTranslate = (key: string) => {
        if (key === 'Actions') {
          translationCalled = true;
          return 'Acciones';
        }
        return key;
      };

      const component = await mount(
        <TranslationProvider translate={mockTranslate}>
          <ActionsDropdown
            id="test-override"
            dropdownItems={mockItems}
            isKebab
            kebabAriaLabel="Custom Label"
          />
        </TranslationProvider>
      );

      const button = component.getByRole('button', { name: /Custom Label/i });
      await expect(button).toBeVisible();
      await expect(button).toHaveAttribute('aria-label', 'Custom Label');
      // Translation should not be called when kebabAriaLabel is provided
      expect(translationCalled).toBe(false);
    });
  });
});
