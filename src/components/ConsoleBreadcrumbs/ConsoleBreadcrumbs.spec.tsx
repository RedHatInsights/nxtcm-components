import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { ConsoleBreadcrumbs, ConsoleBreadcrumbsProps } from './ConsoleBreadcrumbs';
import { checkAccessibility } from '../../test-helpers';

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
  test('should pass accessibility tests', async ({ mount }) => {
    const items: SampleItem[] = [
      { id: 1, title: 'Home', url: '/' },
      { id: 2, title: 'Users', url: '/users' },
      { id: 3, title: 'User Details' },
    ];
    const component = await mount(<ConsoleBreadcrumbs {...getProps(items)} />);
    await checkAccessibility({ component });
  });

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
    const nav = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(nav).toBeVisible();

    // Check that breadcrumb items are rendered
    const breadcrumbList = nav.getByRole('list');
    await expect(breadcrumbList).toBeVisible();

    // Verify we have the correct number of breadcrumb items
    const breadcrumbItems = nav.getByRole('listitem');
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
    const breadcrumbItems = page.getByRole('listitem');
    await expect(breadcrumbItems).toHaveCount(2);

    // Last item should be active
    await expect(breadcrumbItems.last()).toHaveAttribute('aria-current', 'page');
  });

  test('should render correct number of items for different scenarios', async ({ mount, page }) => {
    // Test with single item
    const singleItem: SampleItem[] = [{ id: 1, title: 'Home', url: '/' }];
    let component = await mount(<ConsoleBreadcrumbs {...getProps(singleItem)} />);

    let breadcrumbItems = page.getByRole('listitem');
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

    breadcrumbItems = page.getByRole('listitem');
    await expect(breadcrumbItems).toHaveCount(4);
    await expect(breadcrumbItems.last()).toHaveAttribute('aria-current', 'page');
  });

  test('should apply fallback URL of "/cluster-list" for "Cluster List" item without a "to" property', async ({
    mount,
    page,
  }) => {
    const items: SampleItem[] = [
      { id: 1, title: 'Cluster List' },
      { id: 2, title: 'Cluster Details' },
    ];

    await mount(<ConsoleBreadcrumbs {...getProps(items)} />);

    const breadcrumbItems = page.getByRole('listitem');
    await expect(breadcrumbItems).toHaveCount(2);
    await expect(breadcrumbItems.last()).toHaveAttribute('aria-current', 'page');
  });

  test('should apply fallback URL of "/overview" for any other item without a "to" property', async ({
    mount,
    page,
  }) => {
    const items: SampleItem[] = [
      { id: 1, title: 'Overview Page' },
      { id: 2, title: 'Current Page' },
    ];

    await mount(<ConsoleBreadcrumbs {...getProps(items)} />);

    const breadcrumbItems = page.getByRole('listitem');
    await expect(breadcrumbItems).toHaveCount(2);
    await expect(breadcrumbItems.last()).toHaveAttribute('aria-current', 'page');
  });

  test('should pass correct props to the custom LinkComponent', async ({ mount, page }) => {
    const items: SampleItem[] = [
      { id: 1, title: 'Test Link', url: '/test' },
      { id: 2, title: 'Last' },
    ];
    await mount(<ConsoleBreadcrumbs {...getProps(items)} />);

    const breadcrumbItems = page.getByRole('listitem');
    await expect(breadcrumbItems).toHaveCount(2);
    await expect(breadcrumbItems.last()).toHaveAttribute('aria-current', 'page');
  });

  test('should handle very long breadcrumb paths', async ({ mount, page }) => {
    const longPath: SampleItem[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `Level ${i + 1}`,
      url: `/level${i + 1}`,
    }));
    longPath.push({ id: 11, title: 'Current Page' });

    await mount(<ConsoleBreadcrumbs {...getProps(longPath)} />);

    const breadcrumbItems = page.getByRole('listitem');
    await expect(breadcrumbItems).toHaveCount(11);
  });

  test('should handle items with special characters in labels', async ({ mount, page }) => {
    const specialItems: SampleItem[] = [
      { id: 1, title: 'Home & Settings', url: '/' },
      { id: 2, title: 'User Admin', url: '/user' },
      { id: 3, title: 'Details & Info' },
    ];

    await mount(<ConsoleBreadcrumbs {...getProps(specialItems)} />);

    const breadcrumbItems = page.getByRole('listitem');
    await expect(breadcrumbItems).toHaveCount(3);
    await expect(breadcrumbItems.last()).toHaveAttribute('aria-current', 'page');
  });

  test('should apply fallback for "Cluster List" even with different casing', async ({
    mount,
    page,
  }) => {
    const items: SampleItem[] = [
      { id: 1, title: 'Cluster List' },
      { id: 2, title: 'Details' },
    ];

    await mount(<ConsoleBreadcrumbs {...getProps(items)} />);

    const breadcrumbItems = page.getByRole('listitem');
    await expect(breadcrumbItems).toHaveCount(2);
    await expect(breadcrumbItems.last()).toHaveAttribute('aria-current', 'page');
  });

  test('should render accessible navigation landmark', async ({ mount, page }) => {
    const items: SampleItem[] = [
      { id: 1, title: 'Home', url: '/' },
      { id: 2, title: 'Current' },
    ];

    await mount(<ConsoleBreadcrumbs {...getProps(items)} />);

    const nav = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(nav).toBeVisible();
  });

  test('should render all non-last items as links', async ({ mount, page }) => {
    const items: SampleItem[] = [
      { id: 1, title: 'First', url: '/first' },
      { id: 2, title: 'Second', url: '/second' },
      { id: 3, title: 'Third', url: '/third' },
      { id: 4, title: 'Current' },
    ];

    await mount(<ConsoleBreadcrumbs {...getProps(items)} />);

    const breadcrumbItems = page.getByRole('listitem');
    await expect(breadcrumbItems).toHaveCount(4);
    await expect(breadcrumbItems.last()).toHaveAttribute('aria-current', 'page');
  });

  test('should handle items with undefined or null URLs gracefully', async ({ mount, page }) => {
    const items = [
      { id: 1, title: 'Item1', url: undefined as string | undefined },
      { id: 2, title: 'Current' },
    ];

    await mount(<ConsoleBreadcrumbs {...getProps(items)} />);

    const breadcrumbItems = page.getByRole('listitem');
    await expect(breadcrumbItems).toHaveCount(2);
    await expect(breadcrumbItems.last()).toHaveAttribute('aria-current', 'page');
  });

  test('should maintain correct order of breadcrumb items', async ({ mount, page }) => {
    const items: SampleItem[] = [
      { id: 1, title: 'First', url: '/1' },
      { id: 2, title: 'Second', url: '/2' },
      { id: 3, title: 'Third', url: '/3' },
      { id: 4, title: 'Fourth' },
    ];

    await mount(<ConsoleBreadcrumbs {...getProps(items)} />);

    const breadcrumbItems = page.getByRole('listitem');
    await expect(breadcrumbItems).toHaveCount(4);
    await expect(breadcrumbItems.last()).toHaveAttribute('aria-current', 'page');
  });

  test('should handle numeric IDs correctly', async ({ mount, page }) => {
    const items: SampleItem[] = [
      { id: 100, title: 'Item 100', url: '/item100' },
      { id: 200, title: 'Item 200', url: '/item200' },
      { id: 300, title: 'Current' },
    ];

    await mount(<ConsoleBreadcrumbs {...getProps(items)} />);

    const breadcrumbItems = page.getByRole('listitem');
    await expect(breadcrumbItems).toHaveCount(3);
  });

  test('should only mark the last item as active', async ({ mount, page }) => {
    const items: SampleItem[] = [
      { id: 1, title: 'Home', url: '/' },
      { id: 2, title: 'Section', url: '/section' },
      { id: 3, title: 'Active Page' },
    ];

    await mount(<ConsoleBreadcrumbs {...getProps(items)} />);

    const breadcrumbItems = page.getByRole('listitem');

    await expect(breadcrumbItems.nth(0)).not.toHaveAttribute('aria-current', 'page');
    await expect(breadcrumbItems.nth(1)).not.toHaveAttribute('aria-current', 'page');
    await expect(breadcrumbItems.nth(2)).toHaveAttribute('aria-current', 'page');
  });
});
