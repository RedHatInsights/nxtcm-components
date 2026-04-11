import { Button, Flex, FlexItem, Title } from '@patternfly/react-core';
import { ChartDonutUtilization } from '@patternfly/react-charts/victory';
import React from 'react';
import styles from './ResourceUtilization.module.scss';

export type ResourceMetric = {
  /** amount currently in use */
  used: number;
  /** total available capacity */
  total: number;
  /** display unit (e.g. "Cores", "GiB", "TiB") */
  unit: string;
};

export type ResourceUtilizationData = {
  /** vcpu utilization */
  vCPU: ResourceMetric;
  /** memory utilization */
  memory: ResourceMetric;
  /** storage utilization (optional — API source TBD) */
  storage?: ResourceMetric;
};

export type ResourceUtilizationProps = {
  /** resource utilization metrics */
  data: ResourceUtilizationData;
  /** callback when "View more" is clicked; omit to hide the link */
  onViewMore?: () => void;
};

const formatValue = (value: number): string => {
  if (Number.isInteger(value)) return value.toLocaleString();
  return value.toFixed(1);
};

const calcPercentage = (used: number, total: number): number => {
  if (total <= 0) return 0;
  return Math.round((used / total) * 100);
};

type MetricChartProps = {
  label: string;
  metric: ResourceMetric;
  chartId: string;
};

const MetricChart: React.FC<MetricChartProps> = ({ label, metric, chartId }) => {
  const { used, total, unit } = metric;
  const pct = calcPercentage(used, total);

  return (
    <div className={styles.metricColumn} data-testid={`metric-${chartId}`}>
      <Title headingLevel="h4" size="md" className={styles.metricTitle}>
        {label}
      </Title>
      <div className={styles.chartWrapper}>
        <ChartDonutUtilization
          ariaDesc={`${label} utilization`}
          ariaTitle={`${label} utilization chart`}
          constrainToVisibleArea
          data={{ x: `${label} capacity`, y: pct }}
          height={200}
          subTitle={`of ${formatValue(total)} ${unit}`}
          title={`${pct}%`}
          width={200}
          padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
          name={chartId}
        />
      </div>
    </div>
  );
};

export const ResourceUtilization: React.FC<ResourceUtilizationProps> = ({ data, onViewMore }) => {
  const { vCPU, memory, storage } = data;

  return (
    <Flex direction={{ default: 'column' }} className={styles.container}>
      <FlexItem>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceEvenly' }}
          alignItems={{ default: 'alignItemsFlexStart' }}
          className={styles.chartsRow}
        >
          <FlexItem>
            <MetricChart label="vCPU" metric={vCPU} chartId="vcpu-donut" />
          </FlexItem>
          <FlexItem>
            <MetricChart label="Memory" metric={memory} chartId="memory-donut" />
          </FlexItem>
          {storage && (
            <FlexItem>
              <MetricChart label="Storage" metric={storage} chartId="storage-donut" />
            </FlexItem>
          )}
        </Flex>
      </FlexItem>

      {onViewMore && (
        <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} className={styles.viewLink}>
          <FlexItem>
            <Button variant="link" onClick={onViewMore} className={styles.viewMoreBtn}>
              View more
            </Button>
          </FlexItem>
        </Flex>
      )}
    </Flex>
  );
};
