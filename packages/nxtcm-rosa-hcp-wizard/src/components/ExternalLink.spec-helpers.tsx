import React from 'react';
import { withRosaCt } from './WizFields/wizFieldCtSpecHelpers';
import ExternalLink from './ExternalLink';

export interface ExternalLinkMountProps {
  href?: string;
  children?: React.ReactNode;
  noIcon?: boolean;
  noTarget?: boolean;
  stopClickPropagation?: boolean;
  isButton?: boolean;
  'data-testid'?: string;
}

export const ExternalLinkMount: React.FC<ExternalLinkMountProps> = ({
  href = 'https://example.com',
  children = 'Example Link',
  noIcon = false,
  noTarget = false,
  stopClickPropagation = false,
  isButton = false,
  'data-testid': dataTestId,
}) => {
  return withRosaCt(
    <ExternalLink
      href={href}
      noIcon={noIcon}
      noTarget={noTarget}
      stopClickPropagation={stopClickPropagation}
      isButton={isButton}
      data-testid={dataTestId}
    >
      {children}
    </ExternalLink>
  );
};
