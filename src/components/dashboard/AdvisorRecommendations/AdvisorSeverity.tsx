import React from 'react';
import { Button, Flex, FlexItem, Label, Title } from '@patternfly/react-core';
import SeverityCriticalIcon from '@patternfly/react-icons/dist/esm/icons/severity-critical-icon';
import SeverityImportantIcon from '@patternfly/react-icons/dist/esm/icons/severity-important-icon';
import EqualsIcon from '@patternfly/react-icons/dist/esm/icons/equals-icon';
import SeverityMinorIcon from '@patternfly/react-icons/dist/esm/icons/severity-minor-icon';
import styles from './AdvisorRecommendations.module.scss';

export type SeverityCounts = {
  critical: number;
  important: number;
  moderate: number;
  low: number;
};

export type AdvisorSeverityProps = {
  /** recommendation counts by severity level */
  severity: SeverityCounts;
  /** card title — defaults to "Advisor recommendations by severity"; pass "" to hide */
  title?: string;
  /** callback when "View more in Red Hat Advisor" link is clicked */
  onViewMore?: () => void;
  /** show the "Powered by Red Hat Lightspeed" badge; defaults to true */
  showLightspeedBadge?: boolean;
};

const DEFAULT_TITLE = 'Advisor recommendations by severity';

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

export const AdvisorSeverity: React.FC<AdvisorSeverityProps> = ({
  severity,
  title = DEFAULT_TITLE,
  onViewMore,
  showLightspeedBadge = true,
}) => (
  <Flex direction={{ default: 'column' }} className={styles.container}>
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
                  <FlexItem className={styles.severityCount} data-testid={`severity-count-${key}`}>
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

    {onViewMore && (
      <FlexItem>
        <Button variant="link" isInline onClick={onViewMore} data-testid="view-more-link">
          View more in Red Hat Advisor
        </Button>
      </FlexItem>
    )}
  </Flex>
);
