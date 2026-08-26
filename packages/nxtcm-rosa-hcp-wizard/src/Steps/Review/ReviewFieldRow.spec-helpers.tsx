import React from 'react';
import { withRosaCt } from '../../components/WizFields/wizFieldCtSpecHelpers';
import { ReviewFieldRow } from './ReviewFieldRow';
import type { ReviewFieldRowProps } from './ReviewFieldRow';

export interface ReviewFieldRowMountProps extends Partial<ReviewFieldRowProps> {
  labelText?: string;
  value?: string;
}

export const ReviewFieldRowMount: React.FC<ReviewFieldRowMountProps> = ({
  labelText = 'Field Label',
  value = 'Field Value',
  hideInReview = false,
  collapseOnRequired = false,
  noEditAfterStep = false,
  lockedSettingsScreenReaderText = 'This setting cannot be changed after cluster creation',
}) => {
  return withRosaCt(
    <ReviewFieldRow
      labelText={labelText}
      value={value}
      hideInReview={hideInReview}
      collapseOnRequired={collapseOnRequired}
      noEditAfterStep={noEditAfterStep}
      lockedSettingsScreenReaderText={lockedSettingsScreenReaderText}
    />
  );
};
