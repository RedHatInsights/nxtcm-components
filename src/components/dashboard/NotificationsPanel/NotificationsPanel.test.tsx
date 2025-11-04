import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('NotificationsPanel', () => {
  const user = userEvent.setup();

  it('should render the panel with notification count badge', () => {
    render(<NotificationsPanel notifications={mockNotifications} />);
    expect(screen.getByText('New notifications')).toBeVisible();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('should render empty panel when there are no notifications', () => {
    render(<NotificationsPanel notifications={[]} />);
    expect(screen.getByText('New notifications')).toBeVisible();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should display all notification items', () => {
    render(<NotificationsPanel notifications={mockNotifications} enablePagination={false} />);

    mockNotifications.forEach((notification) => {
      expect(screen.getByText(notification.title)).toBeVisible();
    });

    // Check that the unique types are visible
    expect(screen.getByText('Advisor')).toBeVisible();
    expect(screen.getByText('Update risks')).toBeVisible();
    expect(screen.getByText('Status')).toBeVisible();
    // Security appears multiple times, check with getAllByText
    expect(screen.getAllByText('Security').length).toBeGreaterThan(0);
  });

  it('should call onNotificationClick when a notification is clicked', async () => {
    const onNotificationClick = jest.fn();
    render(
      <NotificationsPanel
        notifications={mockNotifications}
        onNotificationClick={onNotificationClick}
      />
    );

    await user.click(screen.getByText('New CVE: CVE-2023-0091'));

    expect(onNotificationClick).toHaveBeenCalledWith(mockNotifications[0]);
    expect(onNotificationClick).toHaveBeenCalledTimes(1);
  });

  it("should call notification's specific onClick handler", async () => {
    const onClickMock = jest.fn();
    const notificationsWithHandler: NotificationItem[] = [
      {
        id: 1,
        title: 'Test Notification',
        type: 'Security',
        time: 'Now',
        onClick: onClickMock,
      },
    ];

    render(<NotificationsPanel notifications={notificationsWithHandler} />);

    await user.click(screen.getByText('Test Notification'));

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  describe('pagination', () => {
    const manyNotifications: NotificationItem[] = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      title: `Notification ${i + 1}`,
      type: 'Security',
      time: 'Now',
    }));

    it('should display pagination controls when enabled and there are multiple pages', () => {
      render(
        <NotificationsPanel
          notifications={manyNotifications}
          enablePagination={true}
          itemsPerPage={6}
        />
      );

      expect(screen.getByText('1 - 6 of 20')).toBeVisible();
      expect(screen.getByRole('button', { name: /Previous page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Next page/i })).toBeInTheDocument();
    });

    it('should navigate to next page when next button is clicked', async () => {
      render(
        <NotificationsPanel
          notifications={manyNotifications}
          enablePagination={true}
          itemsPerPage={6}
        />
      );

      expect(screen.getByText('Notification 1')).toBeVisible();
      expect(screen.queryByText('Notification 7')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Next page/i }));

      expect(screen.getByText('7 - 12 of 20')).toBeVisible();
      expect(screen.getByText('Notification 7')).toBeVisible();
      expect(screen.queryByText('Notification 1')).not.toBeInTheDocument();
    });

    it('should navigate to previous page when previous button is clicked', async () => {
      render(
        <NotificationsPanel
          notifications={manyNotifications}
          enablePagination={true}
          itemsPerPage={6}
        />
      );

      await user.click(screen.getByRole('button', { name: /Next page/i }));

      expect(screen.getByText('Notification 7')).toBeVisible();

      await user.click(screen.getByRole('button', { name: /Previous page/i }));

      expect(screen.getByText('1 - 6 of 20')).toBeVisible();
      expect(screen.getByText('Notification 1')).toBeVisible();
    });

    it('should disable previous button on first page', () => {
      render(
        <NotificationsPanel
          notifications={manyNotifications}
          enablePagination={true}
          itemsPerPage={6}
        />
      );

      const prevButton = screen.getByRole('button', { name: /Previous page/i });
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', async () => {
      render(
        <NotificationsPanel
          notifications={manyNotifications}
          enablePagination={true}
          itemsPerPage={6}
        />
      );

      // Navigate to last page
      const nextButton = screen.getByRole('button', { name: /Next page/i });
      // Click next until we reach the last page (20 items / 6 per page = 4 pages, so click 3 times)
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      // Now we should be on the last page and next button should be disabled
      expect(nextButton).toBeDisabled();
    });

    it('should not display pagination when disabled', () => {
      render(<NotificationsPanel notifications={manyNotifications} enablePagination={false} />);

      expect(screen.queryByText(/of 20/)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Previous page/i })).not.toBeInTheDocument();
    });
  });
});
