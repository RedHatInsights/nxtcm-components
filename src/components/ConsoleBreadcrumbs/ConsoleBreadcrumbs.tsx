import React from 'react';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';

export type BreadcrumbItemShape = {
  /** Breadcrumb text label */
  label: string;
  /** navigation link */
  to?: string;
};

export type ConsoleBreadcrumbsProps<T> = {
  /** Breadcrumb items  */
  items: T[];
  /** transformer function to normalize label/text  */
  getLabel: (item: T) => string;
  /** transformer function to normalize path/to */
  getTo: (item: T) => string | undefined;
  /** React router link component */
  LinkComponent: any;
};

export const ConsoleBreadcrumbs = <T,>({
  items,
  getLabel,
  getTo,
  LinkComponent,
}: ConsoleBreadcrumbsProps<T>) => {
  const normalizedItems: BreadcrumbItemShape[] = React.useMemo(
    () =>
      items.map((item) => ({
        label: getLabel(item),
        to: getTo(item),
      })),
    [items, getLabel, getTo]
  );

  if (normalizedItems.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      {normalizedItems.map((item, i) => {
        const isLastItem = i === normalizedItems.length - 1;

        if (isLastItem) {
          return (
            <BreadcrumbItem aria-current="page" key={item.label} isActive>
              {item.label}
            </BreadcrumbItem>
          );
        }

        let linkPath = item.to;
        if (item.label === 'Cluster List' && !linkPath) {
          linkPath = '/cluster-list';
        }

        const finalPath = linkPath || '/overview';

        return (
          <BreadcrumbItem
            key={item.label}
            render={({ className, ariaCurrent }) => (
              <LinkComponent
                to={finalPath}
                className={className}
                aria-current={ariaCurrent}
                label={item.label}
              >
                {item.label}
              </LinkComponent>
            )}
          />
        );
      })}
    </Breadcrumb>
  );
};
