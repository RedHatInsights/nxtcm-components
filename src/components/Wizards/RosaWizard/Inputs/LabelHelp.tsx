import { Button, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { Fragment, ReactNode } from 'react';
import { useWizardFooterStrings } from '../wizardFooterStrings';

export function LabelHelp(props: {
  id: string;
  labelHelp?: ReactNode;
  labelHelpTitle?: string;
}): JSX.Element {
  const { moreInfo } = useWizardFooterStrings();
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
        aria-label={moreInfo}
        className="pf-v6-c-form__group-label-help"
        icon={<HelpIcon />}
      />
    </Popover>
  ) : (
    <Fragment />
  );
}
