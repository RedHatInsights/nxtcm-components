import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { CVECard, CVEData } from './CVECard';

const mockCVEData: CVEData[] = [
  {
    severity: 'critical',
    count: 24,
    label: 'Critical severity CVEs on your associated',
    onViewClick: () => {},
    viewLinkText: 'View critical CVEs',
  },
  {
    severity: 'important',
    count: 147,
    label: 'Important severity CVEs on your associated',
    onViewClick: () => {},
    viewLinkText: 'View important CVEs',
  },
];

test.describe('CVECard', () => {
  test('should render the card with default title', async ({ mount }) => {
    const component = await mount(<CVECard cveData={mockCVEData} />);
    await expect(component.getByTestId('title')).toContainText('CVEs');
  });

  test('should render custom title when provided', async ({ mount }) => {
    const component = await mount(
      <CVECard cveData={mockCVEData} title="Security Vulnerabilities" />
    );
    await expect(component.getByTestId('title')).toContainText('Security Vulnerabilities');
  });

  test('should render the default description', async ({ mount }) => {
    const component = await mount(<CVECard cveData={mockCVEData} />);
    await expect(component.getByTestId('description')).toContainText(
      /Red Hat recommends addressing these CVEs/i
    );
  });

  test('should render custom description when provided', async ({ mount }) => {
    const customDescription = 'Custom CVE description';
    const component = await mount(
      <CVECard cveData={mockCVEData} description={customDescription} />
    );
    await expect(component.getByTestId('description')).toContainText(customDescription);
  });

  test('should render the correct count for critical CVEs', async ({ mount }) => {
    const component = await mount(<CVECard cveData={mockCVEData} />);
    await expect(component.getByTestId('count-critical')).toContainText('24');
  });

  test('should render the correct count for important CVEs', async ({ mount }) => {
    const component = await mount(<CVECard cveData={mockCVEData} />);
    await expect(component.getByTestId('count-important')).toContainText('147');
  });

  test('should render severity labels correctly', async ({ mount }) => {
    const component = await mount(<CVECard cveData={mockCVEData} />);
    await expect(component.getByTestId('cve-critical')).toContainText(
      'Critical severity CVEs on your associated'
    );
    await expect(component.getByTestId('cve-important')).toContainText(
      'Important severity CVEs on your associated'
    );
  });

  test('should render view links when onViewClick is provided', async ({ mount }) => {
    const component = await mount(<CVECard cveData={mockCVEData} />);
    await expect(component.getByTestId('cve-critical')).toContainText('View critical CVEs');
    await expect(component.getByTestId('cve-important')).toContainText('View important CVEs');
  });

  test('should call onViewClick when critical CVE link is clicked', async ({ mount }) => {
    let criticalOnViewClickCount = 0;
    const criticalOnViewClick = () => {
      criticalOnViewClickCount++;
    };
    const data: CVEData[] = [
      {
        severity: 'critical',
        count: 24,
        label: 'Critical severity CVEs',
        onViewClick: criticalOnViewClick,
        viewLinkText: 'View critical CVEs',
      },
    ];

    const component = await mount(<CVECard cveData={data} />);
    const criticalLink = component.getByText('View critical CVEs');
    await criticalLink.click();

    expect(criticalOnViewClickCount).toBe(1);
  });

  test('should call onViewClick when important CVE link is clicked', async ({ mount }) => {
    let importantOnViewClickCount = 0;
    const importantOnViewClick = () => {
      importantOnViewClickCount++;
    };
    const data: CVEData[] = [
      {
        severity: 'important',
        count: 147,
        label: 'Important severity CVEs',
        onViewClick: importantOnViewClick,
        viewLinkText: 'View important CVEs',
      },
    ];

    const component = await mount(<CVECard cveData={data} />);
    const importantLink = component.getByText('View important CVEs');
    await importantLink.click();

    expect(importantOnViewClickCount).toBe(1);
  });

  test('should not render view link when onViewClick is not provided', async ({ mount }) => {
    const data: CVEData[] = [
      {
        severity: 'critical',
        count: 10,
        label: 'Critical CVEs',
      },
    ];

    const component = await mount(<CVECard cveData={data} />);
    await expect(component.getByText(/View critical CVEs/i)).not.toBeVisible();
  });

  test('should render multiple CVE severities', async ({ mount }) => {
    const component = await mount(<CVECard cveData={mockCVEData} />);
    await expect(component.getByText('24')).toBeVisible();
    await expect(component.getByText('147')).toBeVisible();
  });

  test('should apply custom className when provided', async ({ mount, page }) => {
    await mount(<CVECard cveData={mockCVEData} className="custom-class" />);
    const customElement = page.locator('.custom-class');
    await expect(customElement).toBeVisible();
  });

  test('should use default view link text when not provided', async ({ mount }) => {
    let onViewClickCalled = false;
    const data: CVEData[] = [
      {
        severity: 'critical',
        count: 5,
        label: 'Critical CVEs',
        onViewClick: () => {
          onViewClickCalled = true;
        },
      },
    ];

    const component = await mount(<CVECard cveData={data} />);
    const viewLink = component.getByText('View critical CVEs');
    await expect(viewLink).toBeVisible();
    await viewLink.click();
    expect(onViewClickCalled).toBe(true);
  });

  test('should render with single CVE severity', async ({ mount }) => {
    let onViewClickCalled = false;
    const singleData: CVEData[] = [
      {
        severity: 'critical',
        count: 10,
        label: 'Critical severity CVEs',
        onViewClick: () => {
          onViewClickCalled = true;
        },
      },
    ];

    const component = await mount(<CVECard cveData={singleData} />);
    await expect(component.getByText('10')).toBeVisible();
    await expect(component.getByText('Critical severity CVEs')).toBeVisible();
    const viewLink = component.getByText('View critical CVEs');
    await expect(viewLink).toBeVisible();
    await viewLink.click();
    expect(onViewClickCalled).toBe(true);
  });
});
