import { test, expect } from "@playwright/experimental-ct-react";
import { ActionsDropdown, DropdownItem } from "./ActionsDropdown";

const mockItems: DropdownItem<string>[] = [
  { id: "item1", text: "Item One" },
  { id: "item2", text: "Item Two", isDisabled: true },
  { id: "item3", text: "Item Three", separator: true },
  {
    id: "flyout",
    text: "Flyout Menu",
    flyoutMenu: [
      { id: "flyout1", text: "Flyout Item One" },
      { id: "flyout2", text: "Flyout Item Two" },
    ],
  },
];

test.describe("ActionsDropdown", () => {
  test("should render the toggle button with the provided text", async ({
    mount,
  }) => {
    const component = await mount(
      <ActionsDropdown
        id="test-dropdown"
        dropdownItems={mockItems}
        text="My Actions"
      />,
    );
    await expect(component.getByRole("button", { name: /My Actions/i })).toBeVisible();
  });

  test("should render as a kebab toggle when isKebab is true", async ({
    mount,
  }) => {
    const component = await mount(
      <ActionsDropdown id="test-kebab" dropdownItems={mockItems} isKebab />,
    );
    await expect(component.getByRole("button", { name: /Actions/i })).toBeVisible();
  });

  test("should allow overriding the kebab aria-label", async ({ mount }) => {
    const component = await mount(
      <ActionsDropdown
        id="test-kebab"
        dropdownItems={mockItems}
        isKebab
        kebabAriaLabel="More Options"
      />,
    );
    await expect(component.getByRole("button", { name: /More Options/i })).toBeVisible();
  });

  test("should render a disabled toggle when isDisabled is true", async ({
    mount,
  }) => {
    const component = await mount(
      <ActionsDropdown
        id="test-disabled"
        dropdownItems={mockItems}
        text="Disabled"
        isDisabled
      />,
    );
    await expect(component.getByRole("button", { name: /Disabled/i })).toBeDisabled();
  });

  test("should open and close the menu on toggle click", async ({ mount }) => {
    const component = await mount(
      <ActionsDropdown
        id="test-toggle"
        dropdownItems={mockItems}
        text="Toggle Me"
      />,
    );

    await expect(component.getByText("Item One")).not.toBeVisible();

    await component.getByRole("button", { name: /Toggle Me/i }).click();
    await expect(component.getByText("Item One")).toBeVisible();
    await expect(component.getByText("Item Two")).toBeVisible();

    await component.getByRole("button", { name: /Toggle Me/i }).click();
    await expect(component.getByText("Item One")).not.toBeVisible();
  });

  test("should call onSelect with the correct item id and close the menu", async ({
    mount,
  }) => {
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
      />,
    );

    await component.getByRole("button", { name: /Select Item/i }).click();
    await component.getByText("Item One").click();

    expect(selectedId).toBe("item1");
    await expect(component.getByText("Item One")).not.toBeVisible();
  });

  test("should call the item's specific onSelect handler", async ({ mount }) => {
    let itemOnSelectCalled = false;
    const itemWithOnSelect: DropdownItem<string> = {
      id: "item4",
      text: "Item with onSelect",
      onSelect: () => {
        itemOnSelectCalled = true;
      },
    };

    const component = await mount(
      <ActionsDropdown
        id="test-item-select"
        dropdownItems={[...mockItems, itemWithOnSelect]}
        text="Item Select Test"
      />,
    );

    await component.getByRole("button", { name: /Item Select Test/i }).click();
    await component.getByText("Item with onSelect").click();

    expect(itemOnSelectCalled).toBe(true);
  });

  test("should close the menu when Escape key is pressed and focus the toggle", async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <ActionsDropdown
        id="test-escape"
        dropdownItems={mockItems}
        text="Escape Test"
      />,
    );
    const toggleButton = component.getByRole("button", { name: /Escape Test/i });

    await toggleButton.click();
    await expect(component.getByText("Item One")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(component.getByText("Item One")).not.toBeVisible();
    await expect(toggleButton).toBeFocused();
  });

  test("should close the menu on an outside click", async ({ mount, page }) => {
    const component = await mount(
      <div>
        <ActionsDropdown
          id="test-outside"
          dropdownItems={mockItems}
          text="Outside Click"
        />
        <button>Outside Button</button>
      </div>,
    );

    await component.getByLabel("Outside Click").click();
    await expect(component.getByText("Item One")).toBeVisible();

    await component.getByRole("button", { name: "Outside Button" }).click();
    await expect(component.getByText("Item One")).not.toBeVisible();
  });

  test("should not be clickable for a disabled item", async ({ mount }) => {
    let onSelectCalled = false;
    const onSelectMock = () => {
      onSelectCalled = true;
    };

    const component = await mount(
      <ActionsDropdown
        id="test-disabled-item"
        dropdownItems={mockItems}
        text="Disabled Item Test"
        onSelect={onSelectMock}
      />,
    );

    await component.getByRole("button", { name: /Disabled Item Test/i }).click();
    const disabledItem = component.getByText("Item Two");

    await expect(disabledItem.locator("..")).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    await disabledItem.click({ force: true });

    expect(onSelectCalled).toBe(false);
    await expect(component.getByText("Item Two")).toBeVisible();
  });

  test.describe("when dealing with flyout menus", () => {
    test("should show the flyout menu on hover/click and handle selection", async ({
      mount,
    }) => {
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
        />,
      );

      await component.getByRole("button", { name: /Flyout Test/i }).click();
      const flyoutParent = component.getByText("Flyout Menu");

      await flyoutParent.hover();

      const flyoutItem = component.getByText("Flyout Item One");
      await expect(flyoutItem).toBeVisible();

      await flyoutItem.click();

      expect(selectedId).toBe("flyout1");
      await expect(component.getByText("Flyout Menu")).not.toBeVisible();
    });

    test("should not call onSelect when a flyout parent is clicked", async ({
      mount,
    }) => {
      let onSelectCalled = false;
      const onSelectMock = () => {
        onSelectCalled = true;
      };

      const component = await mount(
        <ActionsDropdown
          id="test-flyout-parent"
          dropdownItems={mockItems}
          text="Flyout Parent Test"
          onSelect={onSelectMock}
        />,
      );

      await component.getByRole("button", { name: /Flyout Parent Test/i }).click();

      const flyoutParent = component.getByText("Flyout Menu");
      await flyoutParent.click();

      expect(onSelectCalled).toBe(false);
      await expect(component.getByText("Flyout Menu")).toBeVisible();
    });
  });
});

