import React from 'react';

import { Button, Content, ContentVariants, Popover, PopoverProps } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';

import './PopoverHintWithTitle.css';

interface PopoverHintProps extends Omit<PopoverProps, 'bodyContent'> {
  title: string;
  footer?: React.ReactNode;
  bodyContent?: React.ReactNode | ((hide: () => void) => React.ReactNode);
  isErrorHint?: boolean;
  displayHintIcon?: boolean;
}

const PopoverHintWithTitle = ({
  title,
  bodyContent,
  footer,
  isErrorHint,
  displayHintIcon,
  ...popoverProps
}: PopoverHintProps) => (
  <div className="popover-with-title-div">
    <Content component={ContentVariants.p}>
      <Popover
        bodyContent={bodyContent}
        footerContent={footer}
        aria-label="help"
        maxWidth='25rem'
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
                {!displayHintIcon && (
                   <OutlinedQuestionCircleIcon />
                )}
                 
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
    </Content>
  </div>
);

export default PopoverHintWithTitle;
