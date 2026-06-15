import type { ReactNode } from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import LockIcon from '@patternfly/react-icons/dist/esm/icons/lock-icon';

const CannotChangeAfterSubmitIcon = ({
  noEditAfterStep,
  lockedSettingsScreenReaderText,
}: {
  noEditAfterStep: boolean;
  lockedSettingsScreenReaderText: string;
}) => {
  return noEditAfterStep ? (
    <>
      <span className="pf-v6-screen-reader">{lockedSettingsScreenReaderText}</span>
      <LockIcon />
    </>
  ) : null;
};

export const ReviewFieldValueWithLock = ({
  children,
  noEditAfterStep,
  lockedSettingsScreenReaderText,
}: {
  children: ReactNode;
  noEditAfterStep: boolean;
  lockedSettingsScreenReaderText: string;
}) => (
  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
    <FlexItem>{children}</FlexItem>
    <FlexItem>
      <CannotChangeAfterSubmitIcon
        noEditAfterStep={noEditAfterStep}
        lockedSettingsScreenReaderText={lockedSettingsScreenReaderText}
      />
    </FlexItem>
  </Flex>
);
