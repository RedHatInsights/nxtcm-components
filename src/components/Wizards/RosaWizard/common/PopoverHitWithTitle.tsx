import React from 'react';

import { Button, Popover, PopoverProps } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';

import './PopoverHintWithTitle.css';

/**
 * Props for an inline titled control that opens a popover; supports error styling and hiding the default hint icon.
 */
interface PopoverHintProps extends Omit<PopoverProps, 'bodyContent'> {
  title: string;
  footer?: React.ReactNode;
  bodyContent?: React.ReactNode | ((hide: () => void) => React.ReactNode);
  isErrorHint?: boolean;
  displayHintIcon?: boolean;
}

/**
 * Shows a title next to a trigger that opens a popover body, using either a question icon or an inline error link style.
 */
const PopoverHintWithTitle = ({
  title,
  bodyContent,
  footer,
  isErrorHint,
  displayHintIcon,
  ...popoverProps
}: PopoverHintProps) => (
  <div className="popover-with-title-div">
    <span>
      <Popover
        bodyContent={bodyContent}
        footerContent={footer}
        aria-label="help"
        maxWidth="25rem"
        {...popoverProps}
      >
        <Button
          icon={
            <span className="popover-with-title-span">
              {isErrorHint ? (
                <Button
                  icon={<ExclamationCircleIcon className="status-icon danger" />}
                  isInline
                  variant="link"
                >
                  {` ${title}`}
                </Button>
              ) : (
                <>
                  {!displayHintIcon && <OutlinedQuestionCircleIcon />}

                  {` ${title}`}
                </>
              )}
            </span>
          }
          className="popover-with-title-button"
          aria-label={`More information on ${title}`}
          variant="plain"
          hasNoPadding
        />
      </Popover>
    </span>
  </div>
);

export default PopoverHintWithTitle;
