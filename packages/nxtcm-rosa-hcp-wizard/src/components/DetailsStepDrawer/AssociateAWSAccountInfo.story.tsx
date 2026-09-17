import React from 'react';
import { withRosaCt } from '../WizFields/wizFieldCtSpecHelpers';
import { AssociateAWSAccountInfo } from './AssociateAWSAccountInfo';

export interface AssociateAWSAccountInfoMountProps {
  title?: string;
  initiallyExpanded?: boolean;
  children?: React.ReactNode;
  childVariant?: 'hidden' | 'visible' | 'expandable' | 'collapsible' | 'complex';
}

export const AssociateAWSAccountInfoMount: React.FC<AssociateAWSAccountInfoMountProps> = ({
  title = 'Test Section',
  initiallyExpanded = false,
  children = <div>Test content</div>,
  childVariant,
}) => {
  const variantChildren =
    childVariant === 'complex' ? (
      <div>
        <p>Paragraph 1</p>
        <ul>
          <li>Item 1</li>
        </ul>
      </div>
    ) : childVariant ? (
      <div>{`${childVariant[0].toUpperCase()}${childVariant.slice(1)} content`}</div>
    ) : (
      children
    );
  return withRosaCt(
    <AssociateAWSAccountInfo title={title} initiallyExpanded={initiallyExpanded}>
      {variantChildren}
    </AssociateAWSAccountInfo>
  );
};
