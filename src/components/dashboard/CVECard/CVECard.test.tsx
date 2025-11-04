import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CVECard, CVEData } from './CVECard';

const mockCVEData: CVEData[] = [
  {
    severity: 'critical',
    count: 24,
    label: 'Critical severity CVEs on your associated',
    onViewClick: jest.fn(),
    viewLinkText: 'View critical CVEs',
  },
  {
    severity: 'important',
    count: 147,
    label: 'Important severity CVEs on your associated',
    onViewClick: jest.fn(),
    viewLinkText: 'View important CVEs',
  },
];

describe('CVECard', () => {
  const user = userEvent.setup();

  it('should render the card with default title', () => {
    render(<CVECard cveData={mockCVEData} />);
    expect(screen.getByText('CVEs')).toBeInTheDocument();
  });

  it('should render custom title when provided', () => {
    render(<CVECard cveData={mockCVEData} title="Security Vulnerabilities" />);
    expect(screen.getByText('Security Vulnerabilities')).toBeInTheDocument();
  });

  it('should render the default description', () => {
    render(<CVECard cveData={mockCVEData} />);
    expect(screen.getByText(/Red Hat recommends addressing these CVEs/i)).toBeInTheDocument();
  });

  it('should render custom description when provided', () => {
    const customDescription = 'Custom CVE description';
    render(<CVECard cveData={mockCVEData} description={customDescription} />);
    expect(screen.getByText(customDescription)).toBeInTheDocument();
  });

  it('should render the correct count for critical CVEs', () => {
    render(<CVECard cveData={mockCVEData} />);
    expect(screen.getByText('24')).toBeInTheDocument();
  });

  it('should render the correct count for important CVEs', () => {
    render(<CVECard cveData={mockCVEData} />);
    expect(screen.getByText('147')).toBeInTheDocument();
  });

  it('should render severity labels correctly', () => {
    render(<CVECard cveData={mockCVEData} />);
    expect(screen.getByText('Critical severity CVEs on your associated')).toBeInTheDocument();
    expect(screen.getByText('Important severity CVEs on your associated')).toBeInTheDocument();
  });

  it('should render view links when onViewClick is provided', () => {
    render(<CVECard cveData={mockCVEData} />);
    expect(screen.getByText('View critical CVEs')).toBeInTheDocument();
    expect(screen.getByText('View important CVEs')).toBeInTheDocument();
  });

  it('should call onViewClick when critical CVE link is clicked', async () => {
    const criticalOnViewClick = jest.fn();
    const data: CVEData[] = [
      {
        severity: 'critical',
        count: 24,
        label: 'Critical severity CVEs',
        onViewClick: criticalOnViewClick,
        viewLinkText: 'View critical CVEs',
      },
    ];

    render(<CVECard cveData={data} />);
    const criticalLink = screen.getByText('View critical CVEs');
    await user.click(criticalLink);

    expect(criticalOnViewClick).toHaveBeenCalledTimes(1);
  });

  it('should call onViewClick when important CVE link is clicked', async () => {
    const importantOnViewClick = jest.fn();
    const data: CVEData[] = [
      {
        severity: 'important',
        count: 147,
        label: 'Important severity CVEs',
        onViewClick: importantOnViewClick,
        viewLinkText: 'View important CVEs',
      },
    ];

    render(<CVECard cveData={data} />);
    const importantLink = screen.getByText('View important CVEs');
    await user.click(importantLink);

    expect(importantOnViewClick).toHaveBeenCalledTimes(1);
  });

  it('should not render view link when onViewClick is not provided', () => {
    const data: CVEData[] = [
      {
        severity: 'critical',
        count: 10,
        label: 'Critical CVEs',
      },
    ];

    render(<CVECard cveData={data} />);
    expect(screen.queryByText(/View critical CVEs/i)).not.toBeInTheDocument();
  });

  it('should render multiple CVE severities', () => {
    render(<CVECard cveData={mockCVEData} />);
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('147')).toBeInTheDocument();
  });

  it('should apply custom className when provided', () => {
    const { container } = render(<CVECard cveData={mockCVEData} className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should use default view link text when not provided', () => {
    const data: CVEData[] = [
      {
        severity: 'critical',
        count: 5,
        label: 'Critical CVEs',
        onViewClick: jest.fn(),
      },
    ];

    render(<CVECard cveData={data} />);
    expect(screen.getByText('View critical CVEs')).toBeInTheDocument();
  });

  it('should render with single CVE severity', () => {
    const singleData: CVEData[] = [
      {
        severity: 'critical',
        count: 10,
        label: 'Critical severity CVEs',
        onViewClick: jest.fn(),
      },
    ];

    render(<CVECard cveData={singleData} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Critical severity CVEs')).toBeInTheDocument();
  });
});
