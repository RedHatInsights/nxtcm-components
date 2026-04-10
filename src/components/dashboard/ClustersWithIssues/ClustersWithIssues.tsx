import { Flex, FlexItem, Icon, Bullseye } from '@patternfly/react-core';
import { ActionsColumn, IAction, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import React from 'react';
import styles from './ClustersWithIssues.module.scss';

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
};

export const ClustersWithIssues: React.FC<ClustersWithIssuesProps> = ({
  data,
  onClusterClick,
  rowActions,
}) => {
  const { totalUnhealthy, clusters } = data;
  const hasActions = typeof rowActions === 'function';

  return (
    <Flex direction={{ default: 'column' }} className={styles.container}>
      <FlexItem>
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <Icon status="danger" data-testid="unhealthy-icon">
              <ExclamationCircleIcon />
            </Icon>
          </FlexItem>
          <FlexItem className={styles.count} data-testid="unhealthy-count">
            {totalUnhealthy}
          </FlexItem>
        </Flex>
      </FlexItem>

      {clusters.length > 0 ? (
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
              {clusters.map((cluster) => (
                <Tr key={cluster.id}>
                  <Td dataLabel="Cluster name">
                    {onClusterClick ? (
                      <button
                        type="button"
                        className={styles.clusterLink}
                        data-testid={`cluster-link-${cluster.id}`}
                        onClick={() => onClusterClick(cluster)}
                      >
                        {cluster.name}
                      </button>
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
      ) : (
        <FlexItem>
          <Bullseye className={styles.emptyState}>No clusters with issues</Bullseye>
        </FlexItem>
      )}
    </Flex>
  );
};
