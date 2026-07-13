import {
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Pagination,
  PaginationVariant,
  Panel,
  PanelHeader,
  PanelMain,
  PanelMainBody,
  Skeleton,
  Title,
} from '@patternfly/react-core';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React, { useEffect, useState } from 'react';
import styles from './NotificationsPanel.module.scss';

export type NotificationType = 'Security' | 'Advisor' | 'Update risks' | 'Status';

export type NotificationItem = {
  id: string | number;
  title: string;
  type: NotificationType;
  time: string;
  onClick?: () => void;
};

export type NotificationsPanelProps = {
  notifications?: NotificationItem[];
  onNotificationClick?: (notification: NotificationItem) => void;
  enablePagination?: boolean;
  itemsPerPage?: number;
  isLoading?: boolean;
};

const SKELETON_ROWS = 5;

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  onNotificationClick,
  enablePagination = true,
  itemsPerPage = 6,
  isLoading,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(itemsPerPage);

  const totalItems = notifications?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  useEffect(() => {
    setPerPage(itemsPerPage);
  }, [itemsPerPage]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalItems);
  const currentNotifications =
    notifications && (enablePagination ? notifications.slice(startIndex, endIndex) : notifications);

  const handleNotificationClick = (notification: NotificationItem) => {
    if (notification.onClick) {
      notification.onClick();
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  if (isLoading) {
    return (
      <Panel variant="secondary">
        <PanelHeader>
          <div className={styles.header}>
            <span className={styles.headerTitle} data-testid="header">
              New notifications
            </span>
          </div>
          <div className={styles.headerBadge}>
            <BellIcon aria-hidden="true" />
            &nbsp;
            <Skeleton width="24px" height="16px" />
          </div>
        </PanelHeader>
        <PanelMain>
          <PanelMainBody>
            <Flex direction={{ default: 'column' }}>
              <FlexItem>
                <Table variant="compact" borders={false} aria-label="Loading notifications">
                  <Thead>
                    <Tr>
                      <Th>Notification</Th>
                      <Th>Type</Th>
                      <Th>Time</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Array.from({ length: SKELETON_ROWS }, (_, i) => (
                      <Tr key={i}>
                        <Td dataLabel="Notification">
                          <Skeleton
                            width="140px"
                            fontSize="sm"
                            screenreaderText={i === 0 ? 'Loading notifications' : undefined}
                          />
                        </Td>
                        <Td dataLabel="Type">
                          <Skeleton width="80px" fontSize="sm" />
                        </Td>
                        <Td dataLabel="Time">
                          <Skeleton width="60px" fontSize="sm" />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </FlexItem>
            </Flex>
          </PanelMainBody>
        </PanelMain>
      </Panel>
    );
  }

  const renderBody = () => {
    if (currentNotifications && currentNotifications.length > 0) {
      return (
        <Table variant="compact" borders={false} aria-label="Notifications">
          <Thead>
            <Tr>
              <Th>Notification</Th>
              <Th>Type</Th>
              <Th>Time</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentNotifications.map((notification) => (
              <Tr
                key={notification.id}
                data-testid={`notification-${notification.id}`}
                isClickable
                onClick={() => handleNotificationClick(notification)}
                className={styles.clickableRow}
              >
                <Td dataLabel="Notification">
                  <span
                    className={styles.notificationTitle}
                    data-testid={`notification-title-${notification.id}`}
                  >
                    {notification.title}
                  </span>
                </Td>
                <Td dataLabel="Type" data-testid={`notification-type-${notification.id}`}>
                  {notification.type}
                </Td>
                <Td dataLabel="Time" data-testid={`notification-time-${notification.id}`}>
                  {notification.time}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      );
    }

    return (
      <EmptyState variant="full">
        <EmptyStateBody>
          <Title headingLevel="h2" size="lg">
            No notifications found
          </Title>
        </EmptyStateBody>
      </EmptyState>
    );
  };

  return (
    <Panel variant="secondary">
      <PanelHeader>
        <div className={styles.header}>
          <span className={styles.headerTitle} data-testid="header">
            New notifications
          </span>
        </div>
        <div className={styles.headerBadge}>
          <BellIcon aria-hidden="true" />
          &nbsp;
          <span data-testid="notification-count">{totalItems}</span>
        </div>
      </PanelHeader>
      <PanelMain>
        <PanelMainBody>
          {renderBody()}
          {enablePagination && totalItems > perPage && (
            <div className={styles.paginationWrapper}>
              <Pagination
                itemCount={totalItems}
                perPage={perPage}
                page={currentPage}
                onSetPage={(_evt, page) => setCurrentPage(page)}
                onPerPageSelect={(_evt, newPerPage) => {
                  setPerPage(newPerPage);
                  setCurrentPage(1);
                }}
                variant={PaginationVariant.bottom}
                isCompact
              />
            </div>
          )}
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};
