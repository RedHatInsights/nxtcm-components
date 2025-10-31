import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { NotificationsPanel, NotificationItem } from './NotificationsPanel';

const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'New CVE: CVE-2023-0091',
    type: 'Security',
    time: 'Nov. 28 12:09 UTC',
  },
  {
    id: 2,
    title: 'New recommendation: Reorganize namespaces',
    type: 'Advisor',
    time: 'Nov. 28 12:09 UTC',
  },
  {
    id: 3,
    title: 'Cluster X has 7 update risks',
    type: 'Update risks',
    time: 'Nov. 28 12:09 UTC',
  },
  {
    id: 4,
    title: 'CVE-2023-0045 newly reported',
    type: 'Security',
    time: 'Nov. 28 12:09 UTC',
  },
  {
    id: 5,
    title: 'CVE-2023-0022 newly reported',
    type: 'Security',
    time: 'Nov. 28 12:09 UTC',
  },
  {
    id: 6,
    title: '3 New stale clusters',
    type: 'Status',
    time: 'Nov. 28 12:09 UTC',
  },
];

test.describe('NotificationsPanel', () => {
  test('should render the panel with notification count badge', async ({ mount }) => {
    const component = await mount(<NotificationsPanel notifications={mockNotifications} />);
    await expect(component.getByTestId('header')).toContainText('New notifications');
    await expect(component.getByTestId('notification-count')).toContainText('6');
  });

  test('should render empty panel when there are no notifications', async ({ mount }) => {
    const component = await mount(<NotificationsPanel notifications={[]} />);
    await expect(component.getByTestId('header')).toContainText('New notifications');
    await expect(component.getByTestId('notification-count')).toContainText('0');
  });

  test('should display all notification items', async ({ mount }) => {
    const component = await mount(
      <NotificationsPanel notifications={mockNotifications} enablePagination={false} />
    );

    for (const notification of mockNotifications) {
      await expect(component.getByTestId(`notification-${notification.id}`)).toContainText(
        notification.title
      );
      await expect(component.getByTestId(`notification-type-${notification.id}`)).toContainText(
        notification.type
      );
      await expect(component.getByTestId(`notification-time-${notification.id}`)).toContainText(
        notification.time
      );
    }
  });

  test('should call onNotificationClick when a notification is clicked', async ({ mount }) => {
    let clickedNotification: NotificationItem | undefined;
    let clickCount = 0;
    const onNotificationClick = (notification: NotificationItem) => {
      clickedNotification = notification;
      clickCount++;
    };

    const component = await mount(
      <NotificationsPanel
        notifications={mockNotifications}
        onNotificationClick={onNotificationClick}
      />
    );

    await component.getByTestId(`notification-${mockNotifications[0].id}`).click();

    expect(clickedNotification).toEqual(mockNotifications[0]);
    expect(clickCount).toBe(1);
  });

  test("should call notification's specific onClick handler", async ({ mount }) => {
    let onClickCallCount = 0;
    const onClickMock = () => {
      onClickCallCount++;
    };
    const notificationsWithHandler: NotificationItem[] = [
      {
        id: 1,
        title: 'Test Notification',
        type: 'Security',
        time: 'Now',
        onClick: onClickMock,
      },
    ];

    const component = await mount(<NotificationsPanel notifications={notificationsWithHandler} />);

    await component.getByText('Test Notification').click();

    expect(onClickCallCount).toBe(1);
  });

  test.describe('pagination', () => {
    const manyNotifications: NotificationItem[] = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      title: `Notification ${i + 1}`,
      type: 'Security',
      time: 'Now',
    }));

    test('should display pagination controls when enabled and there are multiple pages', async ({
      mount,
    }) => {
      const component = await mount(
        <NotificationsPanel
          notifications={manyNotifications}
          enablePagination={true}
          itemsPerPage={6}
        />
      );

      await expect(component.getByText('1 - 6 of 20')).toBeVisible();
      await expect(component.getByRole('button', { name: /Previous page/i })).toBeVisible();
      await expect(component.getByRole('button', { name: /Next page/i })).toBeVisible();
    });

    test('should navigate to next page when next button is clicked', async ({ mount }) => {
      const component = await mount(
        <NotificationsPanel
          notifications={manyNotifications}
          enablePagination={true}
          itemsPerPage={6}
        />
      );

      await expect(component.getByTestId(`notification-${manyNotifications[0].id}`)).toBeVisible();
      await expect(
        component.getByTestId(`notification-${manyNotifications[6].id}`)
      ).not.toBeVisible();

      await component.getByRole('button', { name: /Next page/i }).click();

      await expect(component.getByText('7 - 12 of 20')).toBeVisible();
      await expect(component.getByTestId(`notification-${manyNotifications[6].id}`)).toBeVisible();
      await expect(
        component.getByTestId(`notification-${manyNotifications[0].id}`)
      ).not.toBeVisible();
    });

    test('should navigate to previous page when previous button is clicked', async ({ mount }) => {
      const component = await mount(
        <NotificationsPanel
          notifications={manyNotifications}
          enablePagination={true}
          itemsPerPage={6}
        />
      );

      await component.getByRole('button', { name: /Next page/i }).click();

      await expect(component.getByTestId(`notification-${manyNotifications[6].id}`)).toBeVisible();

      await component.getByRole('button', { name: /Previous page/i }).click();

      await expect(component.getByText('1 - 6 of 20')).toBeVisible();
      await expect(component.getByTestId(`notification-${manyNotifications[0].id}`)).toBeVisible();
    });

    test('should disable previous button on first page', async ({ mount }) => {
      const component = await mount(
        <NotificationsPanel
          notifications={manyNotifications}
          enablePagination={true}
          itemsPerPage={6}
        />
      );

      const prevButton = component.getByRole('button', { name: /Previous page/i });
      await expect(prevButton).toBeDisabled();
    });

    test('should disable next button on last page', async ({ mount }) => {
      const component = await mount(
        <NotificationsPanel
          notifications={manyNotifications}
          enablePagination={true}
          itemsPerPage={6}
        />
      );

      // Navigate to last page
      const nextButton = component.getByRole('button', { name: /Next page/i });
      // Click next until we reach the last page (20 items / 6 per page = 4 pages, so click 3 times)
      await nextButton.click();
      await nextButton.click();
      await nextButton.click();

      // Now we should be on the last page and next button should be disabled
      await expect(nextButton).toBeDisabled();
    });

    test('should not display pagination when disabled', async ({ mount }) => {
      const component = await mount(
        <NotificationsPanel notifications={manyNotifications} enablePagination={false} />
      );

      await expect(component.getByText(/of 20/)).not.toBeVisible();
      await expect(component.getByRole('button', { name: /Previous page/i })).not.toBeVisible();
    });
  });
});
