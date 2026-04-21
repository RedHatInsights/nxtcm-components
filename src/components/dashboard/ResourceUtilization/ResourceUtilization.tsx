import { Button, Flex, FlexItem, Title } from '@patternfly/react-core';
import { ChartDonutUtilization, ChartLabel } from '@patternfly/react-charts/victory';
import React from 'react';
import styles from './ResourceUtilization.module.scss';

const DEFAULT_TITLE = 'Resource usage';

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
  /** card title — defaults to "Resource usage"; pass "" to hide */
  title?: string;
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

// pf-t label fill token flips to white in dark mode via patternfly-charts.css.
// hex fallback covers cases where patternfly-charts.css isn't loaded.
const chartLabelFill = 'var(--pf-t--chart--global--label--fill, #1f1f1f)';

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
          titleComponent={<ChartLabel style={{ fill: chartLabelFill, fontSize: 22 }} />}
          subTitleComponent={<ChartLabel style={{ fill: chartLabelFill, fontSize: 14 }} />}
          width={200}
          padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
          name={chartId}
        />
      </div>
    </div>
  );
};

export const ResourceUtilization: React.FC<ResourceUtilizationProps> = ({
  data,
  title = DEFAULT_TITLE,
  onViewMore,
}) => {
  const { vCPU, memory, storage } = data;

  return (
    <Flex direction={{ default: 'column' }} className={styles.container}>
      {title && (
        <FlexItem>
          <Title headingLevel="h3" size="md" data-testid="card-title">
            {title}
          </Title>
        </FlexItem>
      )}
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
        <FlexItem className={styles.viewLink}>
          <Button variant="link" onClick={onViewMore} className={styles.viewMoreBtn}>
            View more
          </Button>
        </FlexItem>
      )}
    </Flex>
  );
};
