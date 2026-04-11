import { Divider, Flex, FlexItem } from '@patternfly/react-core';
import { ChartDonut } from '@patternfly/react-charts/victory';
import AngleDoubleUpIcon from '@patternfly/react-icons/dist/esm/icons/angle-double-up-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import EqualsIcon from '@patternfly/react-icons/dist/esm/icons/equals-icon';
import ArrowDownIcon from '@patternfly/react-icons/dist/esm/icons/arrow-down-icon';
import React from 'react';
import styles from './AdvisorRecommendations.module.scss';

export type SeverityCounts = {
  critical: number;
  important: number;
  moderate: number;
  low: number;
};

export type CategoryCounts = {
  serviceAvailability: number;
  performance: number;
  security: number;
  faultTolerance: number;
};

export type AdvisorRecommendationsData = {
  /** recommendation counts by severity level */
  severity: SeverityCounts;
  /** recommendation counts by category */
  categories: CategoryCounts;
};

export type AdvisorRecommendationsProps = {
  /** advisor recommendations data */
  data: AdvisorRecommendationsData;
  /** callback when "View more in Red Hat Advisor" link is clicked */
  onViewMore?: () => void;
};

const severityConfig = [
  { key: 'critical' as const, label: 'Critical', Icon: AngleDoubleUpIcon, style: 'critical' },
  {
    key: 'important' as const,
    label: 'Important',
    Icon: ExclamationTriangleIcon,
    style: 'important',
  },
  { key: 'moderate' as const, label: 'Moderate', Icon: EqualsIcon, style: 'moderate' },
  { key: 'low' as const, label: 'Low', Icon: ArrowDownIcon, style: 'low' },
] as const;

const categoryLabels: Record<keyof CategoryCounts, string> = {
  serviceAvailability: 'Service availability',
  performance: 'Performance',
  security: 'Security',
  faultTolerance: 'Fault tolerance',
};

const categoryColors = ['#004080', '#0066cc', '#4394e5', '#b8d4f0'];

export const AdvisorRecommendations: React.FC<AdvisorRecommendationsProps> = ({
  data,
  onViewMore,
}) => {
  const { severity, categories } = data;

  const chartData = (Object.keys(categoryLabels) as Array<keyof CategoryCounts>).map(
    (key, index) => ({
      x: categoryLabels[key],
      y: categories[key],
      color: categoryColors[index],
    })
  );

  return (
    <Flex direction={{ default: 'column' }} className={styles.container}>
      {/* severity counts */}
      <FlexItem>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          {severityConfig.map(({ key, label, Icon, style }) => (
            <FlexItem key={key} className={styles.severityItem}>
              <Flex
                direction={{ default: 'column' }}
                alignItems={{ default: 'alignItemsCenter' }}
                spaceItems={{ default: 'spaceItemsXs' }}
              >
                <FlexItem>
                  <Flex
                    alignItems={{ default: 'alignItemsCenter' }}
                    spaceItems={{ default: 'spaceItemsXs' }}
                  >
                    <FlexItem>
                      <Icon
                        className={styles[style]}
                        aria-hidden="true"
                        data-testid={`severity-icon-${key}`}
                      />
                    </FlexItem>
                    <FlexItem
                      className={styles.severityCount}
                      data-testid={`severity-count-${key}`}
                    >
                      {severity[key]}
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem className={styles.severityLabel}>{label}</FlexItem>
              </Flex>
            </FlexItem>
          ))}
        </Flex>
      </FlexItem>

      <Divider />

      {/* recommendations by category */}
      <FlexItem>
        <div className={styles.categoryTitle} data-testid="category-title">
          Recommendations by category
        </div>
      </FlexItem>

      <FlexItem>
        <Flex alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <div className={styles.chartContainer} data-testid="category-chart">
              <ChartDonut
                ariaTitle="Recommendations by category"
                constrainToVisibleArea
                data={chartData.map((d) => ({ x: d.x, y: d.y }))}
                colorScale={categoryColors}
                labels={({ datum }) => `${datum.x}: ${datum.y}`}
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

      {/* "view more" link */}
      {onViewMore && (
        <FlexItem>
          <button
            type="button"
            className={styles.viewMoreLink}
            onClick={onViewMore}
            data-testid="view-more-link"
          >
            View more in Red Hat Advisor
          </button>
        </FlexItem>
      )}
    </Flex>
  );
};
