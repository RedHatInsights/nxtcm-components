import React from 'react';
import { withRosaCt } from '../WizFields/wizFieldCtSpecHelpers';
import { AssociateAWSAccountInfo } from './AssociateAWSAccountInfo';

export interface AssociateAWSAccountInfoMountProps {
  title?: string;
  initiallyExpanded?: boolean;
  children?: React.ReactNode;
}

export const AssociateAWSAccountInfoMount: React.FC<AssociateAWSAccountInfoMountProps> = ({
  title = 'Test Section',
  initiallyExpanded = false,
  children = <div>Test content</div>,
}) => {
  return withRosaCt(
    <AssociateAWSAccountInfo title={title} initiallyExpanded={initiallyExpanded}>
      {children}
    </AssociateAWSAccountInfo>
  );
};
