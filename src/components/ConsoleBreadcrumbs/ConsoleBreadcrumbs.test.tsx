import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConsoleBreadcrumbs, ConsoleBreadcrumbsProps } from './ConsoleBreadcrumbs';

// Mock the LinkComponent to test props passed to it.
// It will render as a simple anchor tag for inspection.
const MockLinkComponent = ({ to, className, children, ...rest }: any) => (
  <a href={to} className={className} {...rest}>
    {children}
  </a>
);

// Define a sample data type for our tests
type SampleItem = {
  id: number;
  title: string;
  url?: string;
};

// Default props generator for cleaner tests
const getProps = (items: SampleItem[]): ConsoleBreadcrumbsProps<SampleItem> => ({
  items,
  getLabel: (item) => item.title,
  getTo: (item) => item.url,
  LinkComponent: MockLinkComponent,
});

describe('ConsoleBreadcrumbs', () => {
  it('should render null if the items array is empty', () => {
    const { container } = render(<ConsoleBreadcrumbs {...getProps([])} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render breadcrumbs with the last item as active', () => {
    const items: SampleItem[] = [
      { id: 1, title: 'Home', url: '/' },
      { id: 2, title: 'Users', url: '/users' },
      { id: 3, title: 'User Details' },
    ];
    render(<ConsoleBreadcrumbs {...getProps(items)} />);

    // Check for the navigation landmark
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');

    // The last item should be plain text and marked as active
    const lastItem = screen.getByText('User Details');
    expect(lastItem).toBeInTheDocument();
    expect(lastItem.tagName).not.toBe('A');
    expect(lastItem).toHaveAttribute('aria-current', 'page');

    // Previous items should be links
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/');

    const usersLink = screen.getByRole('link', { name: 'Users' });
    expect(usersLink).toHaveAttribute('href', '/users');
  });

  it('should use getLabel and getTo transformers correctly with complex objects', () => {
    type ComplexItem = {
      data: { name: string };
      pathConfig?: { route: string };
    };

    const items: ComplexItem[] = [
      { data: { name: 'Dashboard' }, pathConfig: { route: '/dashboard' } },
      { data: { name: 'Settings' } },
    ];

    render(
      <ConsoleBreadcrumbs<ComplexItem>
        items={items}
        getLabel={(item) => item.data.name}
        getTo={(item) => item.pathConfig?.route}
        LinkComponent={MockLinkComponent}
      />
    );

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should apply a fallback URL of "/cluster-list" for "Cluster List" item without a "to" property', () => {
    const items: SampleItem[] = [
      { id: 1, title: 'Cluster List' },
      { id: 2, title: 'Cluster Details' },
    ];

    render(<ConsoleBreadcrumbs {...getProps(items)} />);

    const clusterListLink = screen.getByRole('link', { name: 'Cluster List' });
    expect(clusterListLink).toHaveAttribute('href', '/cluster-list');
  });

  it('should apply a fallback URL of "/overview" for any other item without a "to" property', () => {
    const items: SampleItem[] = [
      { id: 1, title: 'Overview Page' }, // This item has no 'url' property
      { id: 2, title: 'Current Page' },
    ];

    render(<ConsoleBreadcrumbs {...getProps(items)} />);

    const overviewLink = screen.getByRole('link', { name: 'Overview Page' });
    expect(overviewLink).toHaveAttribute('href', '/overview');
  });

  it('should pass correct props to the custom LinkComponent', () => {
    const items: SampleItem[] = [
      { id: 1, title: 'Test Link', url: '/test' },
      { id: 2, title: 'Last' },
    ];
    render(<ConsoleBreadcrumbs {...getProps(items)} />);

    const link = screen.getByRole('link', { name: 'Test Link' });

    // Check for the label prop which we added in the component
    expect(link).toHaveAttribute('label', 'Test Link');

    // aria-current should not be passed to non-active links
    expect(link).not.toHaveAttribute('aria-current');
  });
});
