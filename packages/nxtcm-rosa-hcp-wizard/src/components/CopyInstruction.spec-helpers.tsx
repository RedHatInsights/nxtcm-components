import React from 'react';
import { withRosaCt } from './WizFields/wizFieldCtSpecHelpers';
import { CopyInstruction } from './CopyInstruction';

export interface CopyInstructionMountProps {
  children?: string;
  textAriaLabel?: string;
  variant?: 'inline' | 'expansion' | 'inline-compact';
}

export const CopyInstructionMount: React.FC<CopyInstructionMountProps> = ({
  children = 'Sample command to copy',
  textAriaLabel,
  variant,
}) => {
  return withRosaCt(
    <CopyInstruction textAriaLabel={textAriaLabel} variant={variant}>
      {children}
    </CopyInstruction>
  );
};
