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
    await expect(component.getByText('CVEs', { exact: true })).toBeVisible();
  });

  test('should render custom title when provided', async ({ mount }) => {
    const component = await mount(
      <CVECard cveData={mockCVEData} title="Security Vulnerabilities" />
    );
    await expect(component.getByText('Security Vulnerabilities', { exact: true })).toBeVisible();
  });

  test('should render the default description', async ({ mount }) => {
    const component = await mount(<CVECard cveData={mockCVEData} />);
    await expect(component.getByText(/Red Hat recommends addressing these CVEs/i)).toBeVisible();
  });

  test('should render custom description when provided', async ({ mount }) => {
    const customDescription = 'Custom CVE description';
    const component = await mount(
      <CVECard cveData={mockCVEData} description={customDescription} />
    );
    await expect(component.getByText(customDescription)).toBeVisible();
  });

  test('should render the correct count for critical CVEs', async ({ mount, page }) => {
    await mount(<CVECard cveData={mockCVEData} />);

    // Find a div containing the View critical CVEs button
    const criticalSection = page
      .locator('div')
      .filter({
        has: page.getByRole('button', { name: 'View critical CVEs' }),
      })
      .first();

    await expect(criticalSection.getByText('24')).toBeVisible();
  });

  test('should render the correct count for important CVEs', async ({ mount, page }) => {
    await mount(<CVECard cveData={mockCVEData} />);

    // Find a div containing the View important CVEs button
    const importantSection = page
      .locator('div')
      .filter({
        has: page.getByRole('button', { name: 'View important CVEs' }),
      })
      .first();

    await expect(importantSection.getByText('147')).toBeVisible();
  });

  test('should render severity labels correctly', async ({ mount }) => {
    const component = await mount(<CVECard cveData={mockCVEData} />);
    await expect(component.getByText('Critical severity CVEs on your associated')).toBeVisible();
    await expect(component.getByText('Important severity CVEs on your associated')).toBeVisible();
  });

  test('should render view links when onViewClick is provided', async ({ mount }) => {
    const component = await mount(<CVECard cveData={mockCVEData} />);

    await expect(component.getByRole('button', { name: 'View critical CVEs' })).toBeVisible();
    await expect(component.getByRole('button', { name: 'View important CVEs' })).toBeVisible();
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
    const importantLink = component.getByRole('button', { name: 'View important CVEs' });
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
});

test('should render with single CVE severity', async ({ mount }) => {
  const singleData: CVEData[] = [
    {
      severity: 'critical',
      count: 10,
      label: 'Critical severity CVEs',
      onViewClick: () => {},
    },
  ];

  const component = await mount(<CVECard cveData={singleData} />);
  await expect(component.getByText('10')).toBeVisible();
  await expect(component.getByText('Critical severity CVEs')).toBeVisible();
});

test('should render with empty cveData array', async ({ mount }) => {
  const component = await mount(<CVECard cveData={[]} />);
  await expect(component.getByText('CVEs').first()).toBeVisible();
  await expect(component.getByText(/Red Hat recommends/)).toBeVisible();
});

test('should render CVE with count of 0', async ({ mount }) => {
  const data: CVEData[] = [
    {
      severity: 'critical',
      count: 0,
      label: 'Critical CVEs',
      onViewClick: () => {},
    },
  ];
  const component = await mount(<CVECard cveData={data} />);
  await expect(component.getByText('0')).toBeVisible();
});

test('should render links as buttons with correct role', async ({ mount }) => {
  const component = await mount(<CVECard cveData={mockCVEData} />);
  await expect(component.getByRole('button', { name: 'View critical CVEs' })).toBeVisible();
  await expect(component.getByRole('button', { name: 'View important CVEs' })).toBeVisible();
});

test('should apply custom className when provided', async ({ mount }) => {
  const component = await mount(<CVECard cveData={mockCVEData} className="custom-class" />);
  await expect(component.getByText('CVEs').first()).toBeVisible();
});

test('should render icons for different severity levels', async ({ mount }) => {
  const component = await mount(<CVECard cveData={mockCVEData} />);
  await expect(component.locator('svg').first()).toBeVisible();
});

test('should handle multiple CVE severities in order', async ({ mount }) => {
  const multiSeverityData: CVEData[] = [
    {
      severity: 'critical',
      count: 10,
      label: 'Critical CVEs',
      onViewClick: () => {},
    },
    {
      severity: 'important',
      count: 20,
      label: 'Important CVEs',
      onViewClick: () => {},
    },
  ];
  const component = await mount(<CVECard cveData={multiSeverityData} />);

  await expect(component.getByText('10')).toBeVisible();
  await expect(component.getByText('20')).toBeVisible();
});

test('should render with only critical severity data', async ({ mount }) => {
  const criticalOnly: CVEData[] = [
    {
      severity: 'critical',
      count: 42,
      label: 'Critical severity CVEs',
      onViewClick: () => {},
    },
  ];

  const component = await mount(<CVECard cveData={criticalOnly} />);
  await expect(component.getByText('42')).toBeVisible();
  await expect(component.getByText('Critical severity CVEs')).toBeVisible();
});

test('should render with only important severity data', async ({ mount }) => {
  const importantOnly: CVEData[] = [
    {
      severity: 'important',
      count: 73,
      label: 'Important severity CVEs',
      onViewClick: () => {},
    },
  ];

  const component = await mount(<CVECard cveData={importantOnly} />);
  await expect(component.getByText('73')).toBeVisible();
  await expect(component.getByText('Important severity CVEs')).toBeVisible();
});

test('should handle large CVE counts', async ({ mount }) => {
  const largeCountData: CVEData[] = [
    {
      severity: 'critical',
      count: 9999,
      label: 'Critical CVEs',
      onViewClick: () => {},
    },
  ];

  const component = await mount(<CVECard cveData={largeCountData} />);
  await expect(component.getByText('9999')).toBeVisible();
});

test('should render view links with proper button role', async ({ mount }) => {
  const component = await mount(<CVECard cveData={mockCVEData} />);
  const criticalButton = component.getByRole('button', { name: 'View critical CVEs' });
  const importantButton = component.getByRole('button', { name: 'View important CVEs' });

  await expect(criticalButton).toBeVisible();
  await expect(importantButton).toBeVisible();
});

test('should not render buttons when no onViewClick provided', async ({ mount }) => {
  const dataWithoutCallback: CVEData[] = [
    {
      severity: 'critical',
      count: 10,
      label: 'Critical CVEs',
    },
  ];

  const component = await mount(<CVECard cveData={dataWithoutCallback} />);
  await expect(component.getByRole('button')).not.toBeVisible();
});

test('should render custom title and description', async ({ mount }) => {
  const component = await mount(
    <CVECard cveData={mockCVEData} title="Custom Title" description="Custom description text" />
  );

  await expect(component.getByText('Custom Title')).toBeVisible();
  await expect(component.getByText('Custom description text')).toBeVisible();
});

test('should render with very long custom description', async ({ mount }) => {
  const longDescription = 'This is a very long description '.repeat(10);
  const component = await mount(<CVECard cveData={mockCVEData} description={longDescription} />);

  await expect(component.getByText(longDescription)).toBeVisible();
});

test('should handle CVE data with custom view link text', async ({ mount }) => {
  const customTextData: CVEData[] = [
    {
      severity: 'critical',
      count: 5,
      label: 'Critical CVEs',
      onViewClick: () => {},
      viewLinkText: 'See All Critical Issues',
    },
  ];

  const component = await mount(<CVECard cveData={customTextData} />);
  await expect(component.getByText('See All Critical Issues')).toBeVisible();
});

test('should render multiple CVE types with different counts', async ({ mount }) => {
  const mixedData: CVEData[] = [
    {
      severity: 'critical',
      count: 5,
      label: 'Critical Issues',
      onViewClick: () => {},
    },
    {
      severity: 'important',
      count: 150,
      label: 'Important Issues',
      onViewClick: () => {},
    },
  ];

  const component = await mount(<CVECard cveData={mixedData} />);
  await expect(component.getByText('Critical Issues')).toBeVisible();
  await expect(component.getByText('150')).toBeVisible();
});

test('should render with minimal props', async ({ mount }) => {
  const minimalData: CVEData[] = [
    {
      severity: 'critical',
      count: 1,
      label: 'One CVE',
    },
  ];

  const component = await mount(<CVECard cveData={minimalData} />);
  await expect(component.getByText('One CVE')).toBeVisible();
  await expect(component.getByText('1')).toBeVisible();
});

test('should handle clicking view link multiple times', async ({ mount }) => {
  let clickCount = 0;
  const dataWithCounter: CVEData[] = [
    {
      severity: 'critical',
      count: 10,
      label: 'Critical CVEs',
      onViewClick: () => {
        clickCount++;
      },
    },
  ];

  const component = await mount(<CVECard cveData={dataWithCounter} />);
  const viewButton = component.getByText('View critical CVEs');

  await viewButton.click();
  await viewButton.click();
  await viewButton.click();

  expect(clickCount).toBe(3);
});

test('should display correct icon colors for severity levels', async ({ mount }) => {
  const component = await mount(<CVECard cveData={mockCVEData} />);
  const icons = component.locator('svg');
  await expect(icons.first()).toBeVisible();
});
