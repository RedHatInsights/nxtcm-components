import { useId, useState } from 'react';
import { ExpandableSectionToggle, Flex, FlexItem, StackItem } from '@patternfly/react-core';

import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';
import { ReviewFieldValueWithLock } from './ReviewFieldRowShared';

export type CollapsibleReviewFieldRowProps = {
  labelText: string;
  value: string;
  noEditAfterStep?: boolean;
  lockedSettingsScreenReaderText: string;
};

export const CollapsibleReviewFieldRow = ({
  labelText,
  value,
  noEditAfterStep,
  lockedSettingsScreenReaderText,
}: CollapsibleReviewFieldRowProps) => {
  const { review } = useRosaHcpWizardStrings();
  const [isExpanded, setIsExpanded] = useState(false);
  const uniqueId = useId();
  const contentId = `${uniqueId}-content`;
  const toggleId = `${uniqueId}-toggle`;

  const onToggle = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  return (
    <StackItem>
      <Flex
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        alignItems={{ default: 'alignItemsFlexStart' }}
      >
        <FlexItem>{labelText}</FlexItem>
        <FlexItem align={{ default: 'alignRight' }}>
          <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsFlexEnd' }}>
            <FlexItem>
              <ReviewFieldValueWithLock
                noEditAfterStep={noEditAfterStep ?? false}
                lockedSettingsScreenReaderText={lockedSettingsScreenReaderText}
              >
                <ExpandableSectionToggle
                  isExpanded={isExpanded}
                  isDetached
                  onToggle={onToggle}
                  toggleId={toggleId}
                  contentId={contentId}
                >
                  {isExpanded ? review.showLess : review.showMore}
                </ExpandableSectionToggle>
              </ReviewFieldValueWithLock>
            </FlexItem>
            {isExpanded && (
              <FlexItem>
                <section id={contentId} aria-labelledby={toggleId}>
                  <pre>{value}</pre>
                </section>
              </FlexItem>
            )}
          </Flex>
        </FlexItem>
      </Flex>
    </StackItem>
  );
};
