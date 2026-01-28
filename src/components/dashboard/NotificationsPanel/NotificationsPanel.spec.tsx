import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { NotificationsPanel, NotificationItem } from './NotificationsPanel';
import { checkAccessibility } from '../../../test-helpers';

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
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<NotificationsPanel notifications={mockNotifications} />);
    await checkAccessibility({ component });
  });

  test('should render the panel with notification count badge', async ({ mount }) => {
    const component = await mount(<NotificationsPanel notifications={mockNotifications} />);
    await expect(component.getByText('New notifications', { exact: true })).toBeVisible();

    // Find the notification count within a div that contains "New notifications"
    await expect(
      component.locator('div').filter({ hasText: 'New notifications' }).getByText('6')
    ).toBeVisible();
  });

  test('should render empty panel when there are no notifications', async ({ mount }) => {
    const component = await mount(<NotificationsPanel notifications={[]} />);
    await expect(component.getByText('New notifications', { exact: true })).toBeVisible();
    await expect(
      component.locator('div').filter({ hasText: 'New notifications' }).getByText('0')
    ).toBeVisible();
  });

  test.describe('should display all notification items', () => {
    for (const notification of mockNotifications) {
      test(`should display notification: ${notification.title}`, async ({ mount }) => {
        const component = await mount(
          <NotificationsPanel notifications={mockNotifications} enablePagination={false} />
        );

        // Find the table row containing this notification
        const row = component.locator('tr').filter({ hasText: notification.title });
        await expect(row).toContainText(notification.title);
        await expect(row).toContainText(notification.type);
        await expect(row).toContainText(notification.time);
      });
    }
  });

  test('should call onNotificationClick when a notification is clicked', async ({ mount }) => {
    // Create a mock function to track calls
    const mockCalls: NotificationItem[] = [];
    const onNotificationClick = (notification: NotificationItem) => {
      mockCalls.push(notification);
    };

    const component = await mount(
      <NotificationsPanel
        notifications={mockNotifications}
        onNotificationClick={onNotificationClick}
      />
    );

    // Click the first notification row
    const firstNotificationRow = component
      .locator('tr')
      .filter({ hasText: mockNotifications[0].title });
    await firstNotificationRow.click();

    expect(mockCalls).toHaveLength(1);
    expect(mockCalls[0]).toEqual(mockNotifications[0]);
  });

  test("should call notification's specific onClick handler", async ({ mount }) => {
    const mockCalls: string[] = [];
    const onClickMock = () => {
      mockCalls.push('clicked');
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

    expect(mockCalls).toHaveLength(1);
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

      await expect(component.getByText(manyNotifications[0].title, { exact: true })).toBeVisible();
      await expect(
        component.getByText(manyNotifications[6].title, { exact: true })
      ).not.toBeVisible();

      await component.getByRole('button', { name: /Next page/i }).click();

      await expect(component.getByText('7 - 12 of 20')).toBeVisible();
      await expect(component.getByText(manyNotifications[6].title, { exact: true })).toBeVisible();
      await expect(
        component.getByText(manyNotifications[0].title, { exact: true })
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

      await expect(
        component.getByText(manyNotifications[0].title, { exact: true })
      ).not.toBeVisible();
      await expect(component.getByText(manyNotifications[6].title, { exact: true })).toBeVisible();

      await component.getByRole('button', { name: /Previous page/i }).click();

      await expect(component.getByText('1 - 6 of 20')).toBeVisible();
      await expect(component.getByText(manyNotifications[0].title, { exact: true })).toBeVisible();
      await expect(
        component.getByText(manyNotifications[6].title, { exact: true })
      ).not.toBeVisible();
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

  test('should render column headers', async ({ mount }) => {
    const component = await mount(<NotificationsPanel notifications={mockNotifications} />);

    await expect(component.getByRole('columnheader', { name: 'Notification' })).toBeVisible();
    await expect(component.getByRole('columnheader', { name: 'Type' })).toBeVisible();
    await expect(component.getByRole('columnheader', { name: 'Time' })).toBeVisible();
  });

  test('should display empty state when no notifications', async ({ mount }) => {
    const component = await mount(<NotificationsPanel notifications={[]} />);

    await expect(component.getByText('No notifications found')).toBeVisible();
  });

  test('should render notification types correctly', async ({ mount }) => {
    const component = await mount(
      <NotificationsPanel notifications={mockNotifications} enablePagination={false} />
    );

    await expect(component.getByRole('gridcell', { name: 'Advisor', exact: true })).toBeVisible();
    await expect(
      component.getByRole('gridcell', { name: 'Update risks', exact: true })
    ).toBeVisible();
    await expect(component.getByRole('gridcell', { name: 'Status', exact: true })).toBeVisible();
  });

  test('should render notification times correctly', async ({ mount }) => {
    const component = await mount(
      <NotificationsPanel notifications={mockNotifications} enablePagination={false} />
    );

    const timeElements = component.getByText('Nov. 28 12:09 UTC');
    await expect(timeElements.first()).toBeVisible();
  });

  test('should call both onClick handlers when both are provided', async ({ mount }) => {
    let itemClickCalled = false;
    let panelClickCalled = false;

    const notificationsWithHandler: NotificationItem[] = [
      {
        id: 1,
        title: 'Test Notification',
        type: 'Security',
        time: 'Now',
        onClick: () => {
          itemClickCalled = true;
        },
      },
    ];

    const onNotificationClick = () => {
      panelClickCalled = true;
    };

    const component = await mount(
      <NotificationsPanel
        notifications={notificationsWithHandler}
        onNotificationClick={onNotificationClick}
      />
    );

    await component.getByText('Test Notification').click();

    expect(itemClickCalled).toBe(true);
    expect(panelClickCalled).toBe(true);
  });

  test('should render with different notification types', async ({ mount }) => {
    const mixedTypes: NotificationItem[] = [
      { id: 1, title: 'Security Alert', type: 'Security', time: 'Now' },
      { id: 2, title: 'Advisor Tip', type: 'Advisor', time: 'Now' },
      { id: 3, title: 'Risk Update', type: 'Update risks', time: 'Now' },
      { id: 4, title: 'Status Change', type: 'Status', time: 'Now' },
    ];

    const component = await mount(
      <NotificationsPanel notifications={mixedTypes} enablePagination={false} />
    );

    await expect(component.getByRole('gridcell', { name: 'Security', exact: true })).toBeVisible();
    await expect(component.getByRole('gridcell', { name: 'Advisor', exact: true })).toBeVisible();
    await expect(
      component.getByRole('gridcell', { name: 'Update risks', exact: true })
    ).toBeVisible();
    await expect(component.getByRole('gridcell', { name: 'Status', exact: true })).toBeVisible();
  });

  test('should handle notification with long title', async ({ mount }) => {
    const longTitleNotification: NotificationItem[] = [
      {
        id: 1,
        title: 'This is a very long notification title that should still be displayed correctly',
        type: 'Security',
        time: 'Now',
      },
    ];

    const component = await mount(<NotificationsPanel notifications={longTitleNotification} />);
    await expect(
      component.getByText(
        'This is a very long notification title that should still be displayed correctly'
      )
    ).toBeVisible();
  });

  test('should handle notification with special characters in title', async ({ mount }) => {
    const specialChars: NotificationItem[] = [
      {
        id: 1,
        title: 'CVE-2023-0001: Critical <script> vulnerability',
        type: 'Security',
        time: 'Now',
      },
    ];

    const component = await mount(<NotificationsPanel notifications={specialChars} />);
    await expect(
      component.getByText('CVE-2023-0001: Critical <script> vulnerability')
    ).toBeVisible();
  });

  test('should reset to first page when new notifications are loaded', async ({ mount }) => {
    const manyNotifications: NotificationItem[] = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      title: `Notification ${i + 1}`,
      type: 'Security',
      time: 'Now',
    }));

    const component = await mount(
      <NotificationsPanel
        notifications={manyNotifications}
        enablePagination={true}
        itemsPerPage={6}
      />
    );

    await component.getByRole('button', { name: /Next page/i }).click();
    await expect(component.getByText('Notification 7')).toBeVisible();
  });

  test('should render correctly with string IDs', async ({ mount }) => {
    const stringIdNotifications: NotificationItem[] = [
      { id: 'notification-1', title: 'First', type: 'Security', time: 'Now' },
      { id: 'notification-2', title: 'Second', type: 'Advisor', time: 'Now' },
    ];

    const component = await mount(
      <NotificationsPanel notifications={stringIdNotifications} enablePagination={false} />
    );

    await expect(component.getByText('First')).toBeVisible();
    await expect(component.getByText('Second')).toBeVisible();
  });

  test('should handle edge case with exactly itemsPerPage notifications', async ({ mount }) => {
    const exactCount: NotificationItem[] = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      title: `Notification ${i + 1}`,
      type: 'Security',
      time: 'Now',
    }));

    const component = await mount(
      <NotificationsPanel notifications={exactCount} enablePagination={true} itemsPerPage={6} />
    );

    await expect(component.getByRole('button', { name: /Next page/i })).not.toBeVisible();
  });

  test('should display correct count with zero notifications', async ({ mount }) => {
    const component = await mount(<NotificationsPanel notifications={[]} />);
    await expect(component.getByText('0')).toBeVisible();
  });

  test('should handle clicking same notification multiple times', async ({ mount }) => {
    let clickCount = 0;
    const notification: NotificationItem[] = [
      {
        id: 1,
        title: 'Test',
        type: 'Security',
        time: 'Now',
        onClick: () => {
          clickCount++;
        },
      },
    ];

    const component = await mount(<NotificationsPanel notifications={notification} />);

    await component.getByText('Test').click();
    await component.getByText('Test').click();
    await component.getByText('Test').click();

    expect(clickCount).toBe(3);
  });

  test('should render bell icon in header', async ({ mount }) => {
    const component = await mount(<NotificationsPanel notifications={mockNotifications} />);
    const bellIcon = component.locator('svg').first();
    await expect(bellIcon).toBeVisible();
  });

  test('should render table structure correctly', async ({ mount }) => {
    const component = await mount(<NotificationsPanel notifications={mockNotifications} />);
    const table = component.locator('table');
    await expect(table).toBeVisible();
  });

  test('should handle notifications with time in different formats', async ({ mount }) => {
    const differentTimes: NotificationItem[] = [
      { id: 1, title: 'Recent', type: 'Security', time: 'Just now' },
      { id: 2, title: 'Minutes ago', type: 'Security', time: '5 minutes ago' },
      { id: 3, title: 'Full date', type: 'Security', time: '2024-01-15 10:30 UTC' },
    ];

    const component = await mount(
      <NotificationsPanel notifications={differentTimes} enablePagination={false} />
    );

    await expect(component.getByText('Just now')).toBeVisible();
    await expect(component.getByText('5 minutes ago')).toBeVisible();
    await expect(component.getByText('2024-01-15 10:30 UTC')).toBeVisible();
  });
});
