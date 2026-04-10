import { Flex, FlexItem, Pagination, PaginationVariant } from '@patternfly/react-core';
import { ActionsColumn, IAction, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';
import styles from './ExpiredTrials.module.scss';

export type ExpiredTrial = {
  /** unique subscription / cluster identifier */
  id: string;
  /** cluster display name */
  name: string;
};

export type ExpiredTrialsData = {
  /** paginated list of expired trial clusters */
  trials: ExpiredTrial[];
  /** total count across all pages */
  totalCount: number;
  /** current page (1-based) */
  currentPage: number;
  /** items per page */
  pageSize: number;
};

export type ExpiredTrialsProps = {
  /** expired trials data */
  data: ExpiredTrialsData;
  /** fired when a cluster name is clicked */
  onTrialClick?: (trial: ExpiredTrial) => void;
  /** fired when the user changes page */
  onPageChange?: (page: number) => void;
  /** fired when the user changes page size */
  onPageSizeChange?: (size: number) => void;
  /** builds the kebab actions per row; if omitted the kebab column is hidden */
  rowActions?: (trial: ExpiredTrial) => IAction[];
};

export const ExpiredTrials: React.FC<ExpiredTrialsProps> = ({
  data,
  onTrialClick,
  onPageChange,
  onPageSizeChange,
  rowActions,
}) => {
  const { trials, totalCount, currentPage, pageSize } = data;
  const hasActions = typeof rowActions === 'function';
  const hasPagination =
    typeof onPageChange === 'function' || typeof onPageSizeChange === 'function';

  return (
    <Flex direction={{ default: 'column' }} className={styles.container}>
      {trials.length > 0 ? (
        <>
          <FlexItem className={styles.tableWrapper}>
            <Table aria-label="Expired trials" variant="compact">
              <Thead>
                <Tr>
                  <Th>Cluster name</Th>
                  {hasActions && <Th screenReaderText="Actions" />}
                </Tr>
              </Thead>
              <Tbody>
                {trials.map((trial) => (
                  <Tr key={trial.id}>
                    <Td dataLabel="Cluster name">
                      {onTrialClick ? (
                        <button
                          type="button"
                          className={styles.trialLink}
                          data-testid={`trial-link-${trial.id}`}
                          onClick={() => onTrialClick(trial)}
                        >
                          {trial.name}
                        </button>
                      ) : (
                        trial.name
                      )}
                    </Td>
                    {hasActions && (
                      <Td isActionCell>
                        <ActionsColumn items={rowActions(trial)} />
                      </Td>
                    )}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </FlexItem>

          {hasPagination && (
            <FlexItem className={styles.pagination}>
              <Pagination
                itemCount={totalCount}
                perPage={pageSize}
                page={currentPage}
                variant={PaginationVariant.bottom}
                onSetPage={(_e, page) => onPageChange?.(page)}
                onPerPageSelect={(_e, size) => onPageSizeChange?.(size)}
                isCompact
              />
            </FlexItem>
          )}
        </>
      ) : (
        <FlexItem className={styles.emptyState} data-testid="empty-state">
          No expired trials
        </FlexItem>
      )}
    </Flex>
  );
};
