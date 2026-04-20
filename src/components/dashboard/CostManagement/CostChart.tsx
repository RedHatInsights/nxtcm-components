import React from 'react';
import { Flex, FlexItem, Title } from '@patternfly/react-core';
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartLegend,
  ChartThemeColor,
  getTheme,
} from '@patternfly/react-charts/victory';
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

// derive bar/legend colors from pf's multi-ordered theme so they adapt to dark mode
const multiTheme = getTheme(ChartThemeColor.multiOrdered);
const barColors = (multiTheme.chart?.colorScale?.slice(0, 3) ?? []) as string[];

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
      return currency;
    }
    if (index === ticks.length - 1) {
      return `${currency}${tick.toLocaleString()}`;
    }
    return '';
  };

  return (
    <Flex direction={{ default: 'column' }} style={{ height: '100%', padding: '1rem' }}>
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
                tickLabels: { fontSize: 10 },
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
                labels: { fontSize: 10 },
              }}
            />
          </div>
        </div>
      </FlexItem>
    </Flex>
  );
};
