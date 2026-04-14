import { Button, Flex, FlexItem, Icon, Bullseye, Pagination, Title } from '@patternfly/react-core';
import { ActionsColumn, IAction, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import React, { useState } from 'react';
import styles from './ClustersWithIssues.module.scss';

const DEFAULT_PER_PAGE = 5;

export type ClusterIssue = {
  /** unique cluster identifier */
  id: string;
  /** display name of the cluster */
  name: string;
  /** number of detected issues */
  issues: number;
};

export type ClustersWithIssuesData = {
  /** total number of unhealthy clusters */
  totalUnhealthy: number;
  /** list of clusters with their issue counts */
  clusters: ClusterIssue[];
};

export type ClustersWithIssuesProps = {
  /** cluster issues data */
  data: ClustersWithIssuesData;
  /** fired when a cluster name link is clicked */
  onClusterClick?: (cluster: ClusterIssue) => void;
  /** builds the kebab actions per row; if omitted the kebab column is hidden */
  rowActions?: (cluster: ClusterIssue) => IAction[];
  /** rows per page — defaults to 5 */
  perPage?: number;
};

export const ClustersWithIssues: React.FC<ClustersWithIssuesProps> = ({
  data,
  onClusterClick,
  rowActions,
  perPage: initialPerPage = DEFAULT_PER_PAGE,
}) => {
  const { totalUnhealthy, clusters } = data;
  const hasActions = typeof rowActions === 'function';

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(Math.max(1, initialPerPage));

  const lastPage = Math.max(1, Math.ceil(clusters.length / perPage));
  const clampedPage = Math.min(page, lastPage);
  if (clampedPage !== page) setPage(clampedPage);

  const startIdx = (clampedPage - 1) * perPage;
  const visibleClusters = clusters.slice(startIdx, startIdx + perPage);

  const handleSetPage = (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handlePerPageSelect = (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPerPage: number,
    newPage: number
  ) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  return (
    <Flex direction={{ default: 'column' }} className={styles.container}>
      <FlexItem>
        <Title headingLevel="h3" size="md">
          Clusters with issues
        </Title>
      </FlexItem>

      <FlexItem className={styles.countSection}>
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <Icon status="danger" data-testid="unhealthy-icon">
              <ExclamationCircleIcon aria-hidden="true" />
            </Icon>
          </FlexItem>
          <FlexItem className={styles.count} data-testid="unhealthy-count">
            {totalUnhealthy}
          </FlexItem>
        </Flex>
      </FlexItem>

      {clusters.length > 0 ? (
        <>
          <FlexItem className={styles.tableWrapper}>
            <Table aria-label="Clusters with issues" variant="compact">
              <Thead>
                <Tr>
                  <Th>Cluster name</Th>
                  <Th>Issues</Th>
                  {hasActions && <Th screenReaderText="Actions" />}
                </Tr>
              </Thead>
              <Tbody>
                {visibleClusters.map((cluster) => (
                  <Tr key={cluster.id}>
                    <Td dataLabel="Cluster name">
                      {onClusterClick ? (
                        <Button
                          variant="link"
                          isInline
                          data-testid={`cluster-link-${cluster.id}`}
                          onClick={() => onClusterClick(cluster)}
                        >
                          {cluster.name}
                        </Button>
                      ) : (
                        cluster.name
                      )}
                    </Td>
                    <Td dataLabel="Issues" data-testid={`issues-${cluster.id}`}>
                      {cluster.issues}
                    </Td>
                    {hasActions && (
                      <Td isActionCell>
                        <ActionsColumn items={rowActions(cluster)} />
                      </Td>
                    )}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </FlexItem>

          <FlexItem className={styles.pagination}>
            <Pagination
              itemCount={clusters.length}
              perPage={perPage}
              page={page}
              onSetPage={handleSetPage}
              onPerPageSelect={handlePerPageSelect}
              variant="bottom"
            />
          </FlexItem>
        </>
      ) : (
        <FlexItem>
          <Bullseye className={styles.emptyState}>No clusters with issues</Bullseye>
        </FlexItem>
      )}
    </Flex>
  );
};
