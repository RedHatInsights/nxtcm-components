import React from 'react';
import { Flex, FlexItem, Title } from '@patternfly/react-core';
import { Chart, ChartAxis, ChartBar, ChartLegend } from '@patternfly/react-charts/victory';
import styles from './CostChart.module.scss';

interface ClusterCostData {
  rosaClusters: number;
  osdClusters: number;
  aroClusters: number;
}

export interface CostChartProps {
  costData: ClusterCostData;
  currency?: string;
}

// pf-t multi-ordered colorscale tokens flip in dark mode via patternfly-charts.css.
// hex fallbacks cover cases where patternfly-charts.css isn't loaded.
const barColors = [
  'var(--pf-t--chart--theme--colorscales--multi-colored-ordered--colorscale--100, #0066cc)',
  'var(--pf-t--chart--theme--colorscales--multi-colored-ordered--colorscale--200, #63993d)',
  'var(--pf-t--chart--theme--colorscales--multi-colored-ordered--colorscale--300, #37a3a3)',
];

const chartLabelFill = 'var(--pf-t--chart--global--label--fill, #1f1f1f)';

export const CostChart: React.FC<CostChartProps> = ({ costData, currency = '$' }) => {
  const { rosaClusters, osdClusters, aroClusters } = costData;

  const chartData = [
    { name: 'ROSA Clusters', x: 1, y: rosaClusters },
    { name: 'OSD Clusters', x: 2, y: osdClusters },
    { name: 'ARO Clusters', x: 3, y: aroClusters },
  ];

  const legendData = [
    { name: 'ROSA Clusters', symbol: { fill: barColors[0] } },
    { name: 'OSD Clusters', symbol: { fill: barColors[1] } },
    { name: 'ARO Clusters', symbol: { fill: barColors[2] } },
  ];

  const maxValue = Math.max(rosaClusters, osdClusters, aroClusters);

  const tickFormat = (tick: number, index: number, ticks: number[]) => {
    if (tick === 0) {
      return `${currency}0`;
    }
    if (index === ticks.length - 1) {
      return `${currency}${tick.toLocaleString()}`;
    }
    return '';
  };

  return (
    <Flex
      direction={{ default: 'column' }}
      style={{ height: '100%', padding: 'var(--pf-t--global--spacer--md)' }}
    >
      <FlexItem data-testid="chart-title">
        <Title headingLevel="h3" size="md">
          Type of clusters cost
        </Title>
      </FlexItem>
      <FlexItem flex={{ default: 'flex_1' }}>
        <div className={styles.chartContainer}>
          <Chart
            ariaDesc="Horizontal bar chart showing cluster costs by type"
            ariaTitle="Cluster costs"
            height={60}
            horizontal
            padding={{ top: 10, bottom: 30, left: 10, right: 50 }}
          >
            <ChartAxis
              tickFormat={() => ''}
              style={{
                axis: { stroke: 'none' },
                ticks: { stroke: 'none' },
              }}
            />
            <ChartAxis
              dependentAxis
              showGrid
              domain={[0, maxValue]}
              tickValues={[0, maxValue]}
              tickFormat={tickFormat}
              style={{
                ticks: { stroke: 'none' },
                tickLabels: { fontSize: 10, fill: chartLabelFill },
              }}
            />
            <ChartBar
              barWidth={10}
              data={chartData}
              style={{
                data: {
                  fill: ({ datum }: { datum?: { name: string; x: number; y: number } }) => {
                    if (datum?.name === 'ROSA Clusters') return barColors[0];
                    if (datum?.name === 'OSD Clusters') return barColors[1];
                    return barColors[2];
                  },
                },
              }}
            />
          </Chart>
          <div className={styles.legendContainer}>
            <ChartLegend
              data={legendData}
              orientation="horizontal"
              gutter={20}
              height={40}
              width={600}
              style={{
                labels: { fontSize: 10, fill: chartLabelFill },
              }}
            />
          </div>
        </div>
      </FlexItem>
    </Flex>
  );
};
