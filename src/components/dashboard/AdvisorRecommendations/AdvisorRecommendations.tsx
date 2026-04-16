import { Divider, Flex, FlexItem, Label, Title } from '@patternfly/react-core';
import { ChartDonut } from '@patternfly/react-charts/victory';
import SeverityCriticalIcon from '@patternfly/react-icons/dist/esm/icons/severity-critical-icon';
import SeverityImportantIcon from '@patternfly/react-icons/dist/esm/icons/severity-important-icon';
import EqualsIcon from '@patternfly/react-icons/dist/esm/icons/equals-icon';
import SeverityMinorIcon from '@patternfly/react-icons/dist/esm/icons/severity-minor-icon';
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

const DEFAULT_TITLE = 'Advisor recommendations by severity';

export type AdvisorRecommendationsProps = {
  /** advisor recommendations data */
  data: AdvisorRecommendationsData;
  /** card title — defaults to "Advisor recommendations by severity"; pass "" to hide */
  title?: string;
  /** callback when "View more in Red Hat Advisor" link is clicked */
  onViewMore?: () => void;
  /** show the "Powered by Red Hat Lightspeed" badge inline with the title; defaults to true */
  showLightspeedBadge?: boolean;
};

const severityConfig = [
  { key: 'critical' as const, label: 'Critical', Icon: SeverityCriticalIcon, style: 'critical' },
  {
    key: 'important' as const,
    label: 'Important',
    Icon: SeverityImportantIcon,
    style: 'important',
  },
  { key: 'moderate' as const, label: 'Moderate', Icon: EqualsIcon, style: 'moderate' },
  { key: 'low' as const, label: 'Low', Icon: SeverityMinorIcon, style: 'low' },
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
  title = DEFAULT_TITLE,
  onViewMore,
  showLightspeedBadge = true,
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
      {/* card heading */}
      {(title || showLightspeedBadge) && (
        <FlexItem>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
          >
            {title && (
              <FlexItem>
                <Title headingLevel="h3" size="md" data-testid="card-title">
                  {title}
                </Title>
              </FlexItem>
            )}
            {showLightspeedBadge && (
              <FlexItem>
                <Label color="orange" isCompact data-testid="lightspeed-badge">
                  Powered by Red Hat Lightspeed
                </Label>
              </FlexItem>
            )}
          </Flex>
        </FlexItem>
      )}

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
        <Title
          headingLevel="h4"
          size="lg"
          className={styles.categoryTitle}
          data-testid="category-title"
        >
          Recommendations by category
        </Title>
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

      {/* footer */}
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
