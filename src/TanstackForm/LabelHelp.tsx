import { type ReactNode } from 'react';
import { Button, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

export interface LabelHelpProps {
  /** Unique id used to generate popover and button ids */
  id: string;
  /** Body content rendered inside the popover */
  labelHelp?: ReactNode;
  /** Optional header text for the popover */
  labelHelpTitle?: string;
}

/**
 * Renders a help icon button that triggers a PatternFly Popover.
 * Returns null when no labelHelp content is provided.
 */
export function LabelHelp({ id, labelHelp, labelHelpTitle }: LabelHelpProps): JSX.Element | null {
  if (!labelHelp) {
    return null;
  }

  return (
    <Popover id={`${id}-label-help-popover`} headerContent={labelHelpTitle} bodyContent={labelHelp}>
      <Button
        variant="plain"
        isInline
        id={`${id}-label-help-button`}
        aria-label="More info"
        className="pf-v6-c-form__group-label-help"
        icon={<HelpIcon />}
      />
    </Popover>
  );
}
