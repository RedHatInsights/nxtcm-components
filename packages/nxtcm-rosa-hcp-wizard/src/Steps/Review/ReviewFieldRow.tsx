import { useId, useState } from 'react';
import { ExpandableSectionToggle, Flex, FlexItem, StackItem } from '@patternfly/react-core';

import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';
import { ReviewFieldValueWithLock } from './ReviewFieldRowShared';

import './ReviewFieldRow.css';

export type ReviewFieldRowProps = {
  labelText: string;
  value: string;
  hideInReview?: boolean;
  collapseOnRequired?: boolean;
  noEditAfterStep?: boolean;
  lockedSettingsScreenReaderText: string;
};

export const ReviewFieldRow = ({
  labelText,
  value,
  hideInReview,
  collapseOnRequired,
  noEditAfterStep,
  lockedSettingsScreenReaderText,
}: ReviewFieldRowProps) => {
  const { review } = useRosaHcpWizardStrings();
  const [isExpanded, setIsExpanded] = useState(false);
  const uniqueId = useId();
  const contentId = `${uniqueId}-content`;
  const toggleId = `${uniqueId}-toggle`;

  if (hideInReview) {
    return null;
  }

  return (
    <StackItem>
      <Flex
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        alignItems={{ default: 'alignItemsBaseline' }}
      >
        <FlexItem>{labelText}</FlexItem>
        <FlexItem align={{ default: 'alignRight' }}>
          <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsFlexEnd' }}>
            <FlexItem>
              <ReviewFieldValueWithLock
                noEditAfterStep={noEditAfterStep ?? false}
                lockedSettingsScreenReaderText={lockedSettingsScreenReaderText}
              >
                {collapseOnRequired ? (
                  <ExpandableSectionToggle
                    className="review-field-row__expandable-toggle"
                    isExpanded={isExpanded}
                    isDetached
                    onToggle={setIsExpanded}
                    toggleId={toggleId}
                    contentId={contentId}
                  >
                    {isExpanded ? review.showLess : review.showMore}
                  </ExpandableSectionToggle>
                ) : (
                  value
                )}
              </ReviewFieldValueWithLock>
            </FlexItem>
            {collapseOnRequired && isExpanded && (
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
