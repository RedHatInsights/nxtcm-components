import { Flex, FlexItem, StackItem } from '@patternfly/react-core';

import { CollapsibleReviewFieldRow } from './CollapsibleReviewFieldRow';
import { ReviewFieldValueWithLock } from './ReviewFieldRowShared';

export type ReviewFieldRowProps = {
  labelText: string;
  value: string;
  hideInReview?: boolean;
  collapseOnRequired?: boolean;
  noEditAfterStep?: boolean;
  lockedSettingsScreenReaderText: string;
};

const SimpleReviewFieldRow = ({
  labelText,
  value,
  noEditAfterStep,
  lockedSettingsScreenReaderText,
}: Pick<
  ReviewFieldRowProps,
  'labelText' | 'value' | 'noEditAfterStep' | 'lockedSettingsScreenReaderText'
>) => (
  <StackItem>
    <Flex
      justifyContent={{ default: 'justifyContentSpaceBetween' }}
      alignItems={{ default: 'alignItemsFlexStart' }}
    >
      <FlexItem>{labelText}</FlexItem>
      <FlexItem align={{ default: 'alignRight' }}>
        <ReviewFieldValueWithLock
          noEditAfterStep={noEditAfterStep ?? false}
          lockedSettingsScreenReaderText={lockedSettingsScreenReaderText}
        >
          {value}
        </ReviewFieldValueWithLock>
      </FlexItem>
    </Flex>
  </StackItem>
);

export const ReviewFieldRow = ({
  labelText,
  value,
  hideInReview,
  collapseOnRequired,
  noEditAfterStep,
  lockedSettingsScreenReaderText,
}: ReviewFieldRowProps) => {
  if (hideInReview) {
    return null;
  }

  if (collapseOnRequired) {
    return (
      <CollapsibleReviewFieldRow
        labelText={labelText}
        value={value}
        noEditAfterStep={noEditAfterStep}
        lockedSettingsScreenReaderText={lockedSettingsScreenReaderText}
      />
    );
  }

  return (
    <SimpleReviewFieldRow
      labelText={labelText}
      value={value}
      noEditAfterStep={noEditAfterStep}
      lockedSettingsScreenReaderText={lockedSettingsScreenReaderText}
    />
  );
};
