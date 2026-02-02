import { test, expect } from '@playwright/experimental-ct-react';
import { ActionsDropdown, DropdownItem } from './ActionsDropdown';
import { TranslationProvider } from '../../context/TranslationContext';
import { checkAccessibility } from '../../test-helpers';

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
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(
      <ActionsDropdown id="test-dropdown" dropdownItems={mockItems} text="My Actions" />
    );
    await checkAccessibility({ component });
  });

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

      const button = component.getByRole('button');
      await expect(button).toBeVisible();

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
      expect(translationCalled).toBe(false);
    });
  });

  test.describe('additional features and edge cases', () => {
    test('should render menu items with descriptions', async ({ mount }) => {
      const itemsWithDescriptions: DropdownItem<string>[] = [
        { id: 'item1', text: 'Action One', description: 'This is the first action' },
        { id: 'item2', text: 'Action Two', description: 'This is the second action' },
      ];

      const component = await mount(
        <ActionsDropdown
          id="test-descriptions"
          dropdownItems={itemsWithDescriptions}
          text="Actions"
        />
      );

      await component.getByRole('button', { name: /Actions/i }).click();
      await expect(component.getByText('This is the first action')).toBeVisible();
      await expect(component.getByText('This is the second action')).toBeVisible();
    });

    test('should render menu items with isSelected state', async ({ mount }) => {
      const itemsWithSelection: DropdownItem<string>[] = [
        { id: 'item1', text: 'Item One', isSelected: true },
        { id: 'item2', text: 'Item Two', isSelected: false },
      ];

      const component = await mount(
        <ActionsDropdown id="test-selected" dropdownItems={itemsWithSelection} text="Select" />
      );

      await component.getByRole('button', { name: /Select/i }).click();
      const selectedItem = component.getByRole('menuitem', { name: /Item One/i });
      await expect(selectedItem).toBeVisible();
    });

    test('should handle isAriaDisabled items', async ({ mount }) => {
      const itemsWithAriaDisabled: DropdownItem<string>[] = [
        { id: 'item1', text: 'Normal Item' },
        { id: 'item2', text: 'Aria Disabled Item', isAriaDisabled: true },
      ];

      let selectCallCount = 0;
      const onSelectMock = () => {
        selectCallCount++;
      };

      const component = await mount(
        <ActionsDropdown
          id="test-aria-disabled"
          dropdownItems={itemsWithAriaDisabled}
          text="Test"
          onSelect={onSelectMock}
        />
      );

      await component.getByRole('button', { name: /Test/i }).click();
      const disabledItem = component.getByRole('menuitem', { name: /Aria Disabled Item/i });
      await expect(disabledItem).toHaveAttribute('aria-disabled', 'true');

      await disabledItem.click({ force: true });
      expect(selectCallCount).toBe(0);
    });

    test('should render separators correctly', async ({ mount }) => {
      const itemsWithSeparator: DropdownItem<string>[] = [
        { id: 'item1', text: 'Group One Item' },
        { id: 'item2', text: 'Group Two Item', separator: true },
        { id: 'item3', text: 'Another Group Two Item' },
      ];

      const component = await mount(
        <ActionsDropdown id="test-separator" dropdownItems={itemsWithSeparator} text="Groups" />
      );

      await component.getByRole('button', { name: /Groups/i }).click();
      await expect(component.getByText('Group One Item')).toBeVisible();
      await expect(
        component.getByRole('menuitem', { name: 'Group Two Item', exact: true })
      ).toBeVisible();
    });

    test('should render with isPlain variant', async ({ mount }) => {
      const component = await mount(
        <ActionsDropdown id="test-plain" dropdownItems={mockItems} text="Plain Dropdown" isPlain />
      );

      const button = component.getByRole('button', { name: /Plain Dropdown/i });
      await expect(button).toBeVisible();
    });

    test('should render with isPrimary variant', async ({ mount }) => {
      const component = await mount(
        <ActionsDropdown
          id="test-primary"
          dropdownItems={mockItems}
          text="Primary Dropdown"
          isPrimary
        />
      );

      const button = component.getByRole('button', { name: /Primary Dropdown/i });
      await expect(button).toBeVisible();
    });

    test('should call onToggle callback when menu opens and closes', async ({ mount }) => {
      let toggleState: boolean | undefined;
      const onToggleMock = (isOpen?: boolean) => {
        toggleState = isOpen;
      };

      const component = await mount(
        <ActionsDropdown
          id="test-on-toggle"
          dropdownItems={mockItems}
          text="Toggle Test"
          onToggle={onToggleMock}
        />
      );

      const button = component.getByRole('button', { name: /Toggle Test/i });
      await button.click();
      expect(toggleState).toBe(true);

      await button.click();
      expect(toggleState).toBe(false);
    });

    test('should call onHover when mouse hovers over toggle', async ({ mount }) => {
      let hoverCalled = false;
      const onHoverMock = () => {
        hoverCalled = true;
      };

      const component = await mount(
        <ActionsDropdown
          id="test-hover"
          dropdownItems={mockItems}
          text="Hover Test"
          onHover={onHoverMock}
        />
      );

      const button = component.getByRole('button', { name: /Hover Test/i });
      await button.hover();

      expect(hoverCalled).toBe(true);
    });

    test('should handle empty dropdown items array', async ({ mount }) => {
      const component = await mount(
        <ActionsDropdown id="test-empty" dropdownItems={[]} text="Empty" />
      );

      const button = component.getByRole('button', { name: /Empty/i });
      await expect(button).toBeVisible();
      await button.click();
    });

    test('should handle single item in dropdown', async ({ mount }) => {
      const singleItem: DropdownItem<string>[] = [{ id: 'only', text: 'Only Item' }];

      const component = await mount(
        <ActionsDropdown id="test-single" dropdownItems={singleItem} text="Single" />
      );

      await component.getByRole('button', { name: /Single/i }).click();
      await expect(component.getByText('Only Item')).toBeVisible();
    });

    test('should handle nested flyout menus', async ({ mount }) => {
      const nestedItems: DropdownItem<string>[] = [
        {
          id: 'parent',
          text: 'Parent Menu',
          flyoutMenu: [
            {
              id: 'child',
              text: 'Child Menu',
              flyoutMenu: [{ id: 'grandchild', text: 'Grandchild Item' }],
            },
          ],
        },
      ];

      const component = await mount(
        <ActionsDropdown id="test-nested" dropdownItems={nestedItems} text="Nested" />
      );

      await component.getByRole('button', { name: /Nested/i }).click();
      await component.getByText('Parent Menu').hover();
      await expect(component.getByText('Child Menu')).toBeVisible();
    });

    test('should call both onSelect callbacks when available', async ({ mount }) => {
      let globalSelectId: string | undefined;
      let itemSelectCalled = false;

      const itemsWithBoth: DropdownItem<string>[] = [
        {
          id: 'item1',
          text: 'Item One',
          onSelect: () => {
            itemSelectCalled = true;
          },
        },
      ];

      const component = await mount(
        <ActionsDropdown
          id="test-both"
          dropdownItems={itemsWithBoth}
          text="Both Callbacks"
          onSelect={(id) => {
            globalSelectId = id;
          }}
        />
      );

      await component.getByRole('button', { name: /Both Callbacks/i }).click();
      await component.getByText('Item One').click();

      expect(itemSelectCalled).toBe(true);
      expect(globalSelectId).toBe('item1');
    });

    test('should remain open when disabled item is clicked', async ({ mount }) => {
      const component = await mount(
        <ActionsDropdown id="test-remain-open" dropdownItems={mockItems} text="Test" />
      );

      await component.getByRole('button', { name: /Test/i }).click();
      await expect(component.getByText('Item Two')).toBeVisible();

      const disabledItem = component.getByRole('menuitem', { name: /Item Two/i });
      await disabledItem.click({ force: true });

      await expect(component.getByText('Item Two')).toBeVisible();
    });

    test('should handle rapid toggle clicks', async ({ mount }) => {
      const component = await mount(
        <ActionsDropdown id="test-rapid" dropdownItems={mockItems} text="Rapid" />
      );

      const button = component.getByRole('button', { name: /Rapid/i });

      await button.click();
      await expect(component.getByText('Item One')).toBeVisible();

      await button.click();
      await expect(component.getByText('Item One')).not.toBeVisible();

      await button.click();
      await expect(component.getByText('Item One')).toBeVisible();
    });

    test('should keep menu closed when disabled toggle is clicked', async ({ mount }) => {
      const component = await mount(
        <ActionsDropdown
          id="test-disabled-toggle"
          dropdownItems={mockItems}
          text="Disabled"
          isDisabled
        />
      );

      const button = component.getByRole('button', { name: /Disabled/i });
      await button.click({ force: true });

      await expect(component.getByText('Item One')).not.toBeVisible();
    });
  });
});
