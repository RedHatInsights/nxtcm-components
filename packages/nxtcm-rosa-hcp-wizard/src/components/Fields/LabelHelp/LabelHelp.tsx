import { type ComponentProps, type ReactNode, useRef } from 'react';
import { Button, ButtonVariant, FormGroupLabelHelp, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type PopoverComponentProps = ComponentProps<typeof Popover>;

export interface LabelHelpProps extends Omit<
  PopoverComponentProps,
  'headerContent' | 'bodyContent' | 'children'
> {
  id: string;
  labelHelp?: ReactNode;
  labelHelpTitle?: string;
  moreInfo?: string;
  useButton?: boolean;
}

export function LabelHelp(props: LabelHelpProps): JSX.Element | null {
  const {
    moreInfo = 'More info',
    id,
    labelHelp,
    labelHelpTitle,
    useButton,
    ...popoverRest
  } = props;
  const labelHelpRef = useRef(null);
  return labelHelp ? (
    <Popover
      triggerRef={labelHelpRef}
      {...popoverRest}
      id={`${id}-label-help-popover`}
      headerContent={labelHelpTitle}
      bodyContent={labelHelp}
    >
      {useButton ? (
        <Button
          variant={ButtonVariant.plain}
          hasNoPadding
          isInline
          id={`${id}-label-help-button`}
          aria-label={moreInfo}
          className="pf-v6-c-form__group-label-help"
          icon={<HelpIcon />}
          ref={labelHelpRef}
        />
      ) : (
        <FormGroupLabelHelp ref={labelHelpRef} aria-label={moreInfo} />
      )}
    </Popover>
  ) : null;
}
