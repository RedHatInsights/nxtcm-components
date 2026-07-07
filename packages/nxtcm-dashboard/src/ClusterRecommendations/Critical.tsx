import { Button, Content, Flex, FlexItem, Title } from '@patternfly/react-core';
import { CriticalRiskIcon } from '@patternfly/react-icons';

import styles from './Critical.module.scss';

export type CriticalProps = {
  count: number;
  onViewRecommendations: () => void;
};

export const Critical = ({ count, onViewRecommendations }: CriticalProps) => (
  <Flex direction={{ default: 'column' }} className={styles.container}>
    <FlexItem>
      <Title headingLevel="h3" size="md">
        Critical recommendations
      </Title>
    </FlexItem>
    <FlexItem>
      <Content component="p">
        Conditions that cause issues have been actively detected on your systems.
      </Content>
      <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem className={styles.danger}>
          <CriticalRiskIcon aria-hidden="true" /> {count}
        </FlexItem>
        <FlexItem>Critical recommendations</FlexItem>
        {count > 0 && (
          <FlexItem>
            <Button variant="secondary" onClick={onViewRecommendations}>
              View recommendations
            </Button>
          </FlexItem>
        )}
      </Flex>
    </FlexItem>
  </Flex>
);
