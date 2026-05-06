/* Copyright Contributors to the Open Cluster Management project */
import { Button, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { Fragment, ReactNode } from 'react';

export function LabelHelp(props: {
  id: string;
  labelHelp?: ReactNode;
  labelHelpTitle?: string;
}): JSX.Element {
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
        aria-label="More info"
        className="pf-v6-c-form__group-label-help"
        icon={<HelpIcon />}
      />
    </Popover>
  ) : (
    <Fragment />
  );
}
