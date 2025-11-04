import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UpgradeRisks } from './UpgradeRisks';

describe('UpgradeRisks', () => {
  const defaultProps = {
    totalRisks: 45,
    criticalCount: 15,
    warningCount: 15,
    infoCount: 15,
  };

  it('renders correctly with all props', () => {
    render(<UpgradeRisks {...defaultProps} />);

    expect(screen.getByText('Upgrade risks')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('total number of upgrade risks')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('displays correct risk counts', () => {
    render(<UpgradeRisks {...defaultProps} />);

    const counts = screen.getAllByText('15');
    expect(counts).toHaveLength(3); // Critical, Warning, Info
  });

  it('renders View upgrade risks link when onViewRisks is provided', () => {
    const handleViewRisks = jest.fn();
    render(<UpgradeRisks {...defaultProps} onViewRisks={handleViewRisks} />);

    const viewLink = screen.getByText('View upgrade risks');
    expect(viewLink).toBeInTheDocument();
  });

  it('does not render View upgrade risks link when onViewRisks is not provided', () => {
    render(<UpgradeRisks {...defaultProps} />);

    expect(screen.queryByText('View upgrade risks')).not.toBeInTheDocument();
  });

  it('calls onViewRisks when link is clicked', () => {
    const handleViewRisks = jest.fn();
    render(<UpgradeRisks {...defaultProps} onViewRisks={handleViewRisks} />);

    const viewLink = screen.getByText('View upgrade risks');
    fireEvent.click(viewLink);

    expect(handleViewRisks).toHaveBeenCalledTimes(1);
  });

  it('applies custom className when provided', () => {
    const { container } = render(<UpgradeRisks {...defaultProps} className="custom-class" />);

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('displays zero counts correctly', () => {
    render(<UpgradeRisks totalRisks={0} criticalCount={0} warningCount={0} infoCount={0} />);

    const zeroCounts = screen.getAllByText('0');
    expect(zeroCounts.length).toBeGreaterThan(0);
  });

  it('displays different counts for each risk type', () => {
    render(<UpgradeRisks totalRisks={50} criticalCount={35} warningCount={10} infoCount={5} />);

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
