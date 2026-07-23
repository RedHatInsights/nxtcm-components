import React from 'react';
import { withRosaCt } from './WizFields/wizFieldCtSpecHelpers';
import PopoverHintWithTitle from './PopoverHintWithTitle';

export interface PopoverHintWithTitleMountProps {
  title?: string;
  bodyContent?: React.ReactNode;
  footer?: React.ReactNode;
  isErrorHint?: boolean;
  displayHintIcon?: boolean;
}

export const PopoverHintWithTitleMount: React.FC<PopoverHintWithTitleMountProps> = ({
  title = 'Help Title',
  bodyContent = 'This is the help content',
  footer,
  isErrorHint = false,
  displayHintIcon = false,
}) => {
  return withRosaCt(
    <PopoverHintWithTitle
      title={title}
      bodyContent={bodyContent}
      footer={footer}
      isErrorHint={isErrorHint}
      displayHintIcon={displayHintIcon}
    />
  );
};
