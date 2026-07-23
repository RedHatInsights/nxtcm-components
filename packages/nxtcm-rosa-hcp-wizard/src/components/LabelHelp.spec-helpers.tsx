import React from 'react';
import { withRosaCt } from './WizFields/wizFieldCtSpecHelpers';
import { LabelHelp } from './LabelHelp';

export interface LabelHelpMountProps {
  id?: string;
  labelHelp?: React.ReactNode;
  labelHelpTitle?: string;
}

export const LabelHelpMount: React.FC<LabelHelpMountProps> = ({
  id = 'test-field',
  labelHelp,
  labelHelpTitle,
}) => {
  return withRosaCt(<LabelHelp id={id} labelHelp={labelHelp} labelHelpTitle={labelHelpTitle} />);
};
