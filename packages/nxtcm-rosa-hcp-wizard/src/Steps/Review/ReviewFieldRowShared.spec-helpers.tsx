import React from 'react';
import { withRosaCt } from '../../components/WizFields/wizFieldCtSpecHelpers';
import { ReviewFieldValueWithLock } from './ReviewFieldRowShared';

export interface ReviewFieldValueWithLockMountProps {
  children?: React.ReactNode;
  noEditAfterStep?: boolean;
  lockedSettingsScreenReaderText?: string;
}

export const ReviewFieldValueWithLockMount: React.FC<ReviewFieldValueWithLockMountProps> = ({
  children = 'Test Value',
  noEditAfterStep = false,
  lockedSettingsScreenReaderText = 'This setting is locked',
}) => {
  return withRosaCt(
    <ReviewFieldValueWithLock
      noEditAfterStep={noEditAfterStep}
      lockedSettingsScreenReaderText={lockedSettingsScreenReaderText}
    >
      {children}
    </ReviewFieldValueWithLock>
  );
};
