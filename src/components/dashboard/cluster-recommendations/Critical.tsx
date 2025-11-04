import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { CriticalRiskIcon } from '@patternfly/react-icons';

import styles from './Critical.module.scss';

export type CriticalProps = {
  count: number;
  onViewRecommendations: () => void;
};

export const Critical = ({ count, onViewRecommendations }: CriticalProps) => (
  <Flex direction={{ default: 'column' }} style={{ height: '100%', padding: '1rem' }}>
    <FlexItem>
      <h3>Critical recommendations</h3>
    </FlexItem>
    <FlexItem>
      <p>Conditions that cause issues have been detected actively detected on your systems.</p>
      <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem className={styles.danger}>
          <CriticalRiskIcon /> {count}
        </FlexItem>
        <FlexItem>Critical recommendations</FlexItem>
        <FlexItem>
          <Button variant="secondary" onClick={onViewRecommendations}>
            View recommendations
          </Button>
        </FlexItem>
      </Flex>
    </FlexItem>
  </Flex>
);
