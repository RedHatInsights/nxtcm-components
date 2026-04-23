import React from 'react';
import { Flex, FlexItem, Title } from '@patternfly/react-core';
import { ChartDonut } from '@patternfly/react-charts/victory';
import styles from './ClusterProviders.module.scss';

export type ProviderBreakdown = {
  /** provider label (e.g. "ROSA", "ARO", "OSD") */
  label: string;
  /** number of clusters for this provider */
  count: number;
};

export type ClusterProvidersProps = {
  /** per-provider cluster breakdown */
  providers: ProviderBreakdown[];
  /** card title — defaults to "Clusters by provider" */
  title?: string;
};

const DEFAULT_TITLE = 'Clusters by provider';

// pf-t chart multi-colored tokens flip in dark mode via patternfly-charts.css overrides.
const providerColors = [
  'var(--pf-t--chart--theme--colorscales--multi-colored-ordered--colorscale--100, #06c)',
  'var(--pf-t--chart--theme--colorscales--multi-colored-ordered--colorscale--200, #4cb140)',
  'var(--pf-t--chart--theme--colorscales--multi-colored-ordered--colorscale--300, #009596)',
  'var(--pf-t--chart--theme--colorscales--multi-colored-ordered--colorscale--400, #f4c145)',
  'var(--pf-t--chart--theme--colorscales--multi-colored-ordered--colorscale--500, #ec7a08)',
  'var(--pf-t--chart--theme--colorscales--multi-colored-ordered--colorscale--600, #7d1007)',
];

export const ClusterProviders: React.FC<ClusterProvidersProps> = ({
  providers,
  title = DEFAULT_TITLE,
}) => {
  if (providers.length === 0) return null;

  const total = providers.reduce((sum, p) => sum + p.count, 0);
  const chartData = providers.map((p) => ({ x: p.label, y: p.count }));
  const colorScale = providerColors.slice(0, providers.length);

  return (
    <Flex direction={{ default: 'column' }} className={styles.container}>
      {title && (
        <FlexItem>
          <Title headingLevel="h3" size="md" data-testid="providers-title">
            {title}
          </Title>
        </FlexItem>
      )}

      <FlexItem>
        <Flex alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <div className={styles.chartContainer} data-testid="providers-chart">
              <ChartDonut
                ariaDesc="Donut chart showing cluster counts per provider"
                ariaTitle="Clusters by provider"
                constrainToVisibleArea
                data={chartData}
                colorScale={colorScale}
                labels={({ datum }) => `${datum.x}: ${datum.y}`}
                padAngle={1}
                subTitle="clusters"
                title={String(total)}
                width={160}
                height={160}
                innerRadius={45}
                padding={0}
              />
            </div>
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }}>
            <div
              className={providers.length > 6 ? styles.legendGridWide : styles.legendGrid}
              data-testid="providers-legend"
            >
              {providers.map((item, index) => (
                <div key={item.label} className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{ backgroundColor: providerColors[index] }}
                    aria-hidden="true"
                  />
                  <span className={styles.legendText}>
                    {item.label}: {item.count}
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
