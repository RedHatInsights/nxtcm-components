import { Button, Flex, FlexItem, Skeleton, Title } from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import React from 'react';
import styles from './CVECard.module.scss';

export type CVESeverity = 'critical' | 'important';

export type CVEData = {
  severity: CVESeverity;
  count: number;
  label: string;
  onViewClick?: () => void;
  viewLinkText?: string;
};

export type CVECardProps = {
  title?: string;
  description?: string;
  cveData?: CVEData[];
  className?: string;
  isLoading?: boolean;
};

const severityConfig = {
  critical: {
    icon: ExclamationCircleIcon,
    color: 'var(--pf-t--global--color--status--danger--default)',
    iconColor: 'var(--pf-t--global--icon--color--status--danger--default)',
  },
  important: {
    icon: ExclamationTriangleIcon,
    color: 'var(--pf-t--global--color--status--warning--default)',
    iconColor: 'var(--pf-t--global--icon--color--status--warning--default)',
  },
};

export const CVECard: React.FC<CVECardProps> = ({
  title = 'CVEs',
  description = 'Red Hat recommends addressing these CVEs with high priority due to lengthened link associated on your teams',
  cveData,
  className,
  isLoading,
}) => {
  const showSkeleton = !!isLoading;

  return (
    <Flex direction={{ default: 'column' }} className={`${styles.container} ${className ?? ''}`}>
      <FlexItem>
        <Title headingLevel="h3" size="md">
          {title}
        </Title>
      </FlexItem>
      <FlexItem flex={{ default: 'flex_1' }}>
        {showSkeleton ? (
          <FlexItem>
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <Skeleton width="80%" fontSize="sm" />
              <Flex
                justifyContent={{ default: 'justifyContentSpaceBetween' }}
                className={styles.content}
              >
                {[0, 1].map((col) => (
                  <FlexItem key={col} flex={{ default: 'flex_1' }}>
                    <Flex
                      direction={{ default: 'column' }}
                      spaceItems={{ default: 'spaceItemsSm' }}
                      alignItems={{ default: 'alignItemsCenter' }}
                    >
                      <FlexItem>
                        <Flex
                          alignItems={{ default: 'alignItemsCenter' }}
                          spaceItems={{ default: 'spaceItemsXs' }}
                        >
                          <Skeleton
                            shape="circle"
                            width="20px"
                            height="20px"
                            screenreaderText={col === 0 ? 'Loading CVE data' : undefined}
                          />
                          <Skeleton width="40px" height="28px" />
                        </Flex>
                      </FlexItem>
                      <FlexItem>
                        <Skeleton width="100px" fontSize="sm" />
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                ))}
              </Flex>
            </Flex>
          </FlexItem>
        ) : (
          <>
            <div className={styles.description}>{description}</div>
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              className={styles.content}
            >
              {(cveData ?? []).map((data) => {
                const config = severityConfig[data.severity];
                const Icon = config.icon;
                const countClassName =
                  data.severity === 'critical' ? styles.countCritical : styles.countImportant;

                return (
                  <FlexItem key={data.severity} flex={{ default: 'flex_1' }}>
                    <Flex
                      direction={{ default: 'column' }}
                      spaceItems={{ default: 'spaceItemsSm' }}
                      alignItems={{ default: 'alignItemsCenter' }}
                    >
                      <FlexItem>
                        <Flex
                          alignItems={{ default: 'alignItemsCenter' }}
                          spaceItems={{ default: 'spaceItemsXs' }}
                        >
                          <Icon
                            color={config.iconColor}
                            className={styles.severityIcon}
                            aria-hidden="true"
                          />
                          <span className={countClassName}>{data.count}</span>
                        </Flex>
                      </FlexItem>
                      <FlexItem>
                        <div className={styles.label}>{data.label}</div>
                      </FlexItem>
                      {data.onViewClick && (
                        <FlexItem>
                          <Button variant="link" isInline onClick={data.onViewClick}>
                            {data.viewLinkText || `View ${data.severity} CVEs`}
                          </Button>
                        </FlexItem>
                      )}
                    </Flex>
                  </FlexItem>
                );
              })}
            </Flex>
          </>
        )}
      </FlexItem>
    </Flex>
  );
};
