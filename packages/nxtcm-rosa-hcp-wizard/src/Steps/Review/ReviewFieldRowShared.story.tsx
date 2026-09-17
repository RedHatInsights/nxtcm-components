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

export function ReviewFieldValueWithComplexChildren(): React.ReactElement {
  return (
    <ReviewFieldValueWithLockMount>
      <div>
        <span>Part 1</span> <strong>Part 2</strong>
      </div>
    </ReviewFieldValueWithLockMount>
  );
}
