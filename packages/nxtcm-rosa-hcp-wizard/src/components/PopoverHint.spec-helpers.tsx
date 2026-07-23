import React from 'react';
import { withRosaCt } from './WizFields/wizFieldCtSpecHelpers';
import PopoverHint from './PopoverHint';

export interface PopoverHintMountProps {
  hint?: React.ReactNode;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  buttonAriaLabel?: string;
  isError?: boolean;
}

export const PopoverHintMount: React.FC<PopoverHintMountProps> = ({
  hint = 'This is helpful information',
  title,
  footer,
  buttonAriaLabel,
  isError = false,
}) => {
  return withRosaCt(
    <PopoverHint
      hint={hint}
      title={title}
      footer={footer}
      buttonAriaLabel={buttonAriaLabel}
      isError={isError}
    />
  );
};
