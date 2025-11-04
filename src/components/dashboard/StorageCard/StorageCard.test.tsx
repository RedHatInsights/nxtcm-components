import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StorageCard, StorageCardProps } from './StorageCard';

const mockStorageData: StorageCardProps['storageData'] = {
  rosaClusters: 63.02,
  aroClusters: 2.17,
  osdClusters: 2.17,
  available: 21.89,
};

describe('StorageCard', () => {
  it('renders the component with correct title', () => {
    render(<StorageCard storageData={mockStorageData} />);
    expect(screen.getByText('Storage')).toBeInTheDocument();
  });

  it('displays the total storage used', () => {
    render(<StorageCard storageData={mockStorageData} />);
    const totalUsed = (63.02 + 2.17 + 2.17).toFixed(2);
    expect(screen.getByText(`${totalUsed} TiB`)).toBeInTheDocument();
  });

  it('displays the correct usage percentage', () => {
    render(<StorageCard storageData={mockStorageData} />);
    const totalUsed = 63.02 + 2.17 + 2.17;
    const totalStorage = totalUsed + 21.89;
    const percentage = Math.round((totalUsed / totalStorage) * 100);
    expect(screen.getByText(`${percentage}%`)).toBeInTheDocument();
  });

  it('displays ROSA clusters storage', () => {
    render(<StorageCard storageData={mockStorageData} />);
    expect(screen.getByText('ROSA clusters:')).toBeInTheDocument();
    expect(screen.getByText('63.02 TiB')).toBeInTheDocument();
  });

  it('displays ARO clusters storage', () => {
    render(<StorageCard storageData={mockStorageData} />);
    expect(screen.getByText('ARO Clusters:')).toBeInTheDocument();
    // note: aro and osd have the same value, so we check for at least one instance
    expect(screen.getAllByText('2.17 TiB').length).toBeGreaterThanOrEqual(1);
  });

  it('displays OSD clusters storage', () => {
    render(<StorageCard storageData={mockStorageData} />);
    expect(screen.getByText('OSD Clusters:')).toBeInTheDocument();
  });

  it('displays available storage', () => {
    render(<StorageCard storageData={mockStorageData} />);
    expect(screen.getByText('Available:')).toBeInTheDocument();
    expect(screen.getByText('21.89 TiB')).toBeInTheDocument();
  });

  it('does not show "View more" button when onViewMore is not provided', () => {
    render(<StorageCard storageData={mockStorageData} />);
    expect(screen.queryByText('View more')).not.toBeInTheDocument();
  });

  it('shows "View more" button when onViewMore callback is provided', () => {
    const handleViewMore = jest.fn();
    render(<StorageCard storageData={mockStorageData} onViewMore={handleViewMore} />);
    expect(screen.getByText('View more')).toBeInTheDocument();
  });

  it('calls onViewMore callback when button is clicked', () => {
    const handleViewMore = jest.fn();
    render(<StorageCard storageData={mockStorageData} onViewMore={handleViewMore} />);

    const viewMoreButton = screen.getByText('View more');
    fireEvent.click(viewMoreButton);

    expect(handleViewMore).toHaveBeenCalledTimes(1);
  });

  it('calculates percentage correctly for high usage', () => {
    const highUsageData = {
      rosaClusters: 80.5,
      aroClusters: 10.2,
      osdClusters: 5.3,
      available: 4.0,
    };
    render(<StorageCard storageData={highUsageData} />);

    const totalUsed = 80.5 + 10.2 + 5.3;
    const totalStorage = totalUsed + 4.0;
    const percentage = Math.round((totalUsed / totalStorage) * 100);

    expect(screen.getByText(`${percentage}%`)).toBeInTheDocument();
  });

  it('calculates percentage correctly for low usage', () => {
    const lowUsageData = {
      rosaClusters: 10.5,
      aroClusters: 5.2,
      osdClusters: 3.3,
      available: 81.0,
    };
    render(<StorageCard storageData={lowUsageData} />);

    const totalUsed = 10.5 + 5.2 + 3.3;
    const totalStorage = totalUsed + 81.0;
    const percentage = Math.round((totalUsed / totalStorage) * 100);

    expect(screen.getByText(`${percentage}%`)).toBeInTheDocument();
  });

  it('displays formatted numbers with two decimal places', () => {
    const preciseData = {
      rosaClusters: 123.456,
      aroClusters: 45.678,
      osdClusters: 12.345,
      available: 67.89,
    };
    render(<StorageCard storageData={preciseData} />);

    expect(screen.getByText('123.46 TiB')).toBeInTheDocument();
    expect(screen.getByText('45.68 TiB')).toBeInTheDocument();
    expect(screen.getByText('12.35 TiB')).toBeInTheDocument();
    expect(screen.getByText('67.89 TiB')).toBeInTheDocument();
  });

  it('renders SVG circular progress indicator', () => {
    const { container } = render(<StorageCard storageData={mockStorageData} />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute('width', '200');
    expect(svgElement).toHaveAttribute('height', '200');
  });

  it('displays total storage label correctly', () => {
    render(<StorageCard storageData={mockStorageData} />);
    expect(screen.getByText('Total storage used')).toBeInTheDocument();
  });
});
