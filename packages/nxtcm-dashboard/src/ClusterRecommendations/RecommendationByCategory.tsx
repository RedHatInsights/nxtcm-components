import { Button, Flex, FlexItem, Title } from '@patternfly/react-core';
import { SquareFullIcon } from '@patternfly/react-icons';
import { ChartThemeColor, getTheme } from '@patternfly/react-charts/victory';

import styles from './RecommendationByCategory.module.scss';

export type Category = 'serviceAvailability' | 'performance' | 'security' | 'faultTolerance';

export type RecommendationByCategoryProps = {
  serviceAvailability: number;
  performance: number;
  security: number;
  faultTolerance: number;
  onCategoryClick: (category: Category) => void;
};

const categories: { key: Category; label: string }[] = [
  { key: 'serviceAvailability', label: 'Service availability' },
  { key: 'performance', label: 'Performance' },
  { key: 'security', label: 'Security' },
  { key: 'faultTolerance', label: 'Fault tolerance' },
];

export const RecommendationByCategory = ({
  serviceAvailability,
  performance,
  security,
  faultTolerance,
  onCategoryClick,
}: RecommendationByCategoryProps) => {
  const counts: Record<Category, number> = {
    serviceAvailability,
    performance,
    security,
    faultTolerance,
  };
  const total = serviceAvailability + performance + security + faultTolerance;

  const blueTheme = getTheme(ChartThemeColor.blue);
  const categoryColors = (blueTheme.chart?.colorScale?.slice(0, 4) ?? []) as string[];

  return (
    <Flex direction={{ default: 'column' }} className={styles.container}>
      <FlexItem>
        <Title headingLevel="h3" size="md">
          Recommendation by Category
        </Title>
      </FlexItem>
      <FlexItem flex={{ default: 'flex_1' }}>
        <Flex className={styles.legend}>
          {categories.map((cat, idx) => (
            <FlexItem key={cat.key}>
              <SquareFullIcon style={{ color: categoryColors[idx] }} aria-hidden="true" />
              <Button onClick={() => onCategoryClick(cat.key)} variant="link" isInline>
                {cat.label}: {counts[cat.key]}
              </Button>
            </FlexItem>
          ))}
        </Flex>
        <div className={styles.bar} role="img" aria-label="Recommendation category distribution">
          {categories.map((cat, idx) => {
            const pct = total > 0 ? (counts[cat.key] / total) * 100 : 0;
            return (
              <div
                key={cat.key}
                className={styles.barSegment}
                style={{ width: `${pct}%`, backgroundColor: categoryColors[idx] }}
              >
                &nbsp;
              </div>
            );
          })}
        </div>
      </FlexItem>
    </Flex>
  );
};
