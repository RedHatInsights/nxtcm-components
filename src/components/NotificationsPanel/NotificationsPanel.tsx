import {
  Button,
  EmptyState,
  EmptyStateBody,
  Panel,
  PanelHeader,
  PanelMain,
  PanelMainBody,
  Title
} from "@patternfly/react-core";
import BellIcon from "@patternfly/react-icons/dist/esm/icons/bell-icon";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React, { useState } from "react";
import styles from "./NotificationsPanel.module.scss";

export type NotificationType =
  | "Security"
  | "Advisor"
  | "Update risks"
  | "Status"
  | string;

export type NotificationItem = {
  id: string | number;
  title: string;
  type: NotificationType;
  time: string;
  onClick?: () => void;
};

export type NotificationsPanelProps = {
  notifications: NotificationItem[];
  onNotificationClick?: (notification: NotificationItem) => void;
  enablePagination?: boolean;
  itemsPerPage?: number;
};

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  onNotificationClick,
  enablePagination = true,
  itemsPerPage = 6,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = notifications.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Calculate items for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentNotifications = enablePagination
    ? notifications.slice(startIndex, endIndex)
    : notifications;

  const handleNotificationClick = (notification: NotificationItem) => {
    if (notification.onClick) {
      notification.onClick();
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Panel variant="raised">
      <PanelHeader>
        <div className={styles.header}>
          <span className={styles.headerTitle}>New notifications</span>
        </div>
        <div className={styles.headerBadge}>
          <BellIcon />&nbsp;
          {totalItems}
        </div>
      </PanelHeader>
      <PanelMain>
        <PanelMainBody>
          {currentNotifications.length > 0 ? (
            <Table variant="compact" borders={false}>
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
                    isClickable
                    onClick={() => handleNotificationClick(notification)}
                    className={styles.clickableRow}
                  >
                    <Td dataLabel="Notification">
                      <span className={styles.notificationTitle}>
                        {notification.title}
                      </span>
                    </Td>
                    <Td dataLabel="Type">{notification.type}</Td>
                    <Td dataLabel="Time">{notification.time}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <EmptyState variant="full">
              <EmptyStateBody>
                <Title headingLevel="h2" size="lg">
                  No notifications found
                </Title>
              </EmptyStateBody>
            </EmptyState>
          )}
          {enablePagination && totalPages > 1 && (
            <div className={styles.paginationContainer}>
              <span className={styles.paginationText}>
                {startIndex + 1} - {endIndex} of {totalItems}
              </span>
              <Button
                variant="plain"
                aria-label="Previous page"
                isDisabled={currentPage === 1}
                onClick={handlePrevPage}
                className={styles.paginationButton}
              >
                &#9650;
              </Button>
              <Button
                variant="plain"
                aria-label="Next page"
                isDisabled={currentPage === totalPages}
                onClick={handleNextPage}
                className={styles.paginationButton}
              >
                &#9660;
              </Button>
            </div>
          )}
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};
