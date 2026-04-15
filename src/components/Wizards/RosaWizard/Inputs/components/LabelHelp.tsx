import { Button, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { Fragment, ReactNode } from 'react';
import { useWizardFooterStrings } from '../../wizardFooterStrings';

export function LabelHelp(props: {
  id: string;
  labelHelp?: ReactNode;
  labelHelpTitle?: string;
  /** When set, used as the help button `aria-label` instead of wizard `moreInfo`. */
  helpButtonAriaLabel?: string;
}): JSX.Element {
  const { moreInfo } = useWizardFooterStrings();
  const ariaLabel = props.helpButtonAriaLabel ?? moreInfo;
  return props.labelHelp ? (
    <Popover
      id={`${props.id}-label-help-popover`}
      headerContent={props.labelHelpTitle}
      bodyContent={props.labelHelp}
    >
      <Button
        variant="plain"
        isInline
        id={`${props.id}-label-help-button`}
        aria-label={ariaLabel}
        className="pf-v6-c-form__group-label-help"
        icon={<HelpIcon />}
      />
    </Popover>
  ) : (
    <Fragment />
  );
}
