import React from 'react';
import { Flex, FlexItem, Title } from '@patternfly/react-core';
import { ChartDonut } from '@patternfly/react-charts/victory';
import styles from './AdvisorRecommendations.module.scss';

export type CategoryCounts = {
  serviceAvailability: number;
  performance: number;
  security: number;
  faultTolerance: number;
};

export type AdvisorCategoriesProps = {
  /** recommendation counts by category */
  categories: CategoryCounts;
  /** card title — defaults to "Recommendations by category" */
  title?: string;
};

const DEFAULT_TITLE = 'Recommendations by category';

const categoryLabels: Record<keyof CategoryCounts, string> = {
  serviceAvailability: 'Service availability',
  performance: 'Performance',
  security: 'Security',
  faultTolerance: 'Fault tolerance',
};

// pf-t chart blue tokens flip in dark mode via patternfly-charts.css overrides.
// hex fallbacks cover cases where patternfly-charts.css isn't loaded.
const categoryColors = [
  'var(--pf-t--chart--color--blue--100, #92c5f9)',
  'var(--pf-t--chart--color--blue--200, #4394e5)',
  'var(--pf-t--chart--color--blue--300, #0066cc)',
  'var(--pf-t--chart--color--blue--400, #004d99)',
];

export const AdvisorCategories: React.FC<AdvisorCategoriesProps> = ({
  categories,
  title = DEFAULT_TITLE,
}) => {
  const chartData = (Object.keys(categoryLabels) as Array<keyof CategoryCounts>).map(
    (key, index) => ({
      x: categoryLabels[key],
      y: categories[key],
      color: categoryColors[index],
    })
  );

  return (
    <Flex direction={{ default: 'column' }} className={styles.container}>
      {title && (
        <FlexItem>
          <Title
            headingLevel="h3"
            size="md"
            className={styles.categoryTitle}
            data-testid="category-title"
          >
            {title}
          </Title>
        </FlexItem>
      )}

      <FlexItem>
        <Flex alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <div className={styles.chartContainer} data-testid="category-chart">
              <ChartDonut
                ariaDesc="Donut chart showing recommendation counts per category"
                ariaTitle="Recommendations by category"
                constrainToVisibleArea
                data={chartData.map((d) => ({ x: d.x, y: d.y }))}
                colorScale={categoryColors}
                labels={({ datum }) => `${datum.x}: ${datum.y}`}
                padAngle={1}
                width={120}
                height={120}
                innerRadius={30}
                padding={0}
              />
            </div>
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }}>
            <div className={styles.legendGrid}>
              {chartData.map((item) => (
                <div key={item.x} className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className={styles.legendText}>
                    {item.x}: {item.y}
                  </span>
                </div>
              ))}
            </div>
          </FlexItem>
        </Flex>
      </FlexItem>
    </Flex>
  );
};
