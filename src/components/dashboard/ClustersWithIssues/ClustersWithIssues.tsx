import {
  Button,
  Flex,
  FlexItem,
  Icon,
  Bullseye,
  Pagination,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import React, { useState } from 'react';
import styles from './ClustersWithIssues.module.scss';

const DEFAULT_PER_PAGE = 5;

const DEFAULT_TOOLTIP =
  'Clusters with critical alerts, failing operators, or resource usage above 95%.';

export type ClusterIssue = {
  /** unique cluster identifier */
  id: string;
  /** display name of the cluster */
  name: string;
  /** number of detected issues */
  issues: number;
  /** external console URL for this cluster */
  consoleUrl?: string;
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
  /** fired when the "Open console" link is clicked for a row */
  onOpenConsole?: (cluster: ClusterIssue) => void;
  /** tooltip content for the info icon next to the title */
  titleTooltip?: string;
  /** rows per page — defaults to 5 */
  perPage?: number;
};

export const ClustersWithIssues: React.FC<ClustersWithIssuesProps> = ({
  data,
  onClusterClick,
  onOpenConsole,
  titleTooltip = DEFAULT_TOOLTIP,
  perPage: initialPerPage = DEFAULT_PER_PAGE,
}) => {
  const { totalUnhealthy, clusters } = data;

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
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <Title headingLevel="h3" size="md">
              Clusters with issues
            </Title>
          </FlexItem>
          {titleTooltip && (
            <FlexItem>
              <Tooltip content={titleTooltip}>
                <Button
                  variant="plain"
                  isInline
                  aria-label="More info about clusters with issues"
                  data-testid="title-tooltip-icon"
                >
                  <OutlinedQuestionCircleIcon aria-hidden="true" />
                </Button>
              </Tooltip>
            </FlexItem>
          )}
        </Flex>
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
                  {onOpenConsole && <Th screenReaderText="Console" />}
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
                    {onOpenConsole && (
                      <Td dataLabel="Console" data-testid={`open-console-${cluster.id}`}>
                        <Button
                          variant="link"
                          isInline
                          icon={<ExternalLinkAltIcon />}
                          iconPosition="end"
                          onClick={() => onOpenConsole(cluster)}
                        >
                          Open console
                        </Button>
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
