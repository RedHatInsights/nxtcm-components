import React from 'react';

import { Button, ButtonProps, ButtonVariant, Icon } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

type Props = {
  href: string;
  children?: React.ReactNode;
  noIcon?: boolean;
  noTarget?: boolean;
  className?: string;
  stopClickPropagation?: boolean;
  isButton?: boolean;
  variant?: ButtonProps['variant'];
  customTrackProperties?: Record<string, unknown>;
  'data-testid'?: string;
};

const ExternalLink = ({
  href,
  children,
  noIcon,
  noTarget,
  className,
  stopClickPropagation,
  isButton,
  variant = ButtonVariant.secondary,
  'data-testid': dataTestId,
}: Props) => {
  const handleClick: React.MouseEventHandler = (event) => {
    if (stopClickPropagation) {
      event.stopPropagation();
    }
  };

  const linkProps = {
    href,
    target: noTarget ? '' : '_blank',
    rel: 'noreferrer noopener',
    className,
    onClick: handleClick,
    'data-testid': dataTestId,
  };

  const childrenComp = (
    <>
      {children}
      {noTarget ? null : <span className="pf-v6-u-screen-reader"> (new window or tab)</span>}
      {!noIcon && (
        <Icon size="md" isInline className="external-link-alt-icon">
          <ExternalLinkAltIcon data-testid="openInNewWindowIcon" />
        </Icon>
      )}
    </>
  );
  return isButton ? (
    <Button component="a" {...linkProps} variant={variant}>
      {childrenComp}
    </Button>
  ) : (
    <a {...linkProps}>{childrenComp}</a>
  );
};

export default ExternalLink;
