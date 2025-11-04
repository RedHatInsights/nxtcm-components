import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { ConsoleBreadcrumbs, ConsoleBreadcrumbsProps } from './ConsoleBreadcrumbs';

// Simple LinkComponent for testing
// Note: PatternFly's BreadcrumbItem render prop has limitations in Playwright CT
// so we test basic structure rather than full LinkComponent integration
const MockLinkComponent = ({ to, children, label, ...props }: any) => (
  <a href={to} {...props}>
    {children || label}
  </a>
);

type SampleItem = {
  id: number;
  title: string;
  url?: string;
};

const getProps = (items: SampleItem[]): ConsoleBreadcrumbsProps<SampleItem> => ({
  items,
  getLabel: (item) => item.title,
  getTo: (item) => item.url,
  LinkComponent: MockLinkComponent,
});

test.describe('ConsoleBreadcrumbs', () => {
  test('should render null if the items array is empty', async ({ mount }) => {
    const component = await mount(<ConsoleBreadcrumbs {...getProps([])} />);
    await expect(component).toBeEmpty();
  });

  test('should render breadcrumb navigation with correct structure', async ({ mount, page }) => {
    const items: SampleItem[] = [
      { id: 1, title: 'Home', url: '/' },
      { id: 2, title: 'Users', url: '/users' },
      { id: 3, title: 'User Details' },
    ];
    await mount(<ConsoleBreadcrumbs {...getProps(items)} />);

    // Check for the navigation landmark
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    await expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');

    // Check that breadcrumb items are rendered
    const breadcrumbList = page.locator('.pf-v6-c-breadcrumb__list');
    await expect(breadcrumbList).toBeVisible();

    // Verify we have the correct number of breadcrumb items
    const breadcrumbItems = page.locator('.pf-v6-c-breadcrumb__item');
    await expect(breadcrumbItems).toHaveCount(3);

    // The last item should be marked as active
    await expect(breadcrumbItems.last()).toHaveAttribute('aria-current', 'page');
  });

  test('should handle complex object transformation', async ({ mount, page }) => {
    type ComplexItem = {
      data: { name: string };
      pathConfig?: { route: string };
    };

    const items: ComplexItem[] = [
      { data: { name: 'Dashboard' }, pathConfig: { route: '/dashboard' } },
      { data: { name: 'Settings' } },
    ];

    await mount(
      <ConsoleBreadcrumbs<ComplexItem>
        items={items}
        getLabel={(item) => item.data.name}
        getTo={(item) => item.pathConfig?.route}
        LinkComponent={MockLinkComponent}
      />
    );

    // Verify breadcrumbs render
    const breadcrumbItems = page.locator('.pf-v6-c-breadcrumb__item');
    await expect(breadcrumbItems).toHaveCount(2);

    // Last item should be active
    await expect(breadcrumbItems.last()).toHaveAttribute('aria-current', 'page');
  });

  test('should render correct number of items for different scenarios', async ({ mount, page }) => {
    // Test with single item
    const singleItem: SampleItem[] = [{ id: 1, title: 'Home', url: '/' }];
    let component = await mount(<ConsoleBreadcrumbs {...getProps(singleItem)} />);

    let breadcrumbItems = page.locator('.pf-v6-c-breadcrumb__item');
    await expect(breadcrumbItems).toHaveCount(1);
    await expect(breadcrumbItems.first()).toHaveAttribute('aria-current', 'page');

    await component.unmount();

    // Test with multiple items
    const multipleItems: SampleItem[] = [
      { id: 1, title: 'Home', url: '/' },
      { id: 2, title: 'Section', url: '/section' },
      { id: 3, title: 'Page', url: '/page' },
      { id: 4, title: 'Current' },
    ];
    component = await mount(<ConsoleBreadcrumbs {...getProps(multipleItems)} />);

    breadcrumbItems = page.locator('.pf-v6-c-breadcrumb__item');
    await expect(breadcrumbItems).toHaveCount(4);
    await expect(breadcrumbItems.last()).toHaveAttribute('aria-current', 'page');
  });
});
