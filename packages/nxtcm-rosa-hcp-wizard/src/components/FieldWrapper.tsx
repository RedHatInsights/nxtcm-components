import { Stack } from '@patternfly/react-core';
import type { ReactNode } from 'react';
import './FieldWrapper.css';

export type FieldWrapperSize = 'sm' | 'md' | 'lg' | 'full';

export type FieldWrapperProps = {
  children: ReactNode;
  /** Optional content rendered below the field (links, actions, etc.). */
  additionalContent?: ReactNode;
  /** Optional content rendered inside the field wrapper, directly below the field control. */
  footer?: ReactNode;
  /** Max width of the field. Defaults to `sm`. */
  size?: FieldWrapperSize;
};

export const FieldWrapper = ({
  children,
  additionalContent,
  footer,
  size = 'sm',
}: FieldWrapperProps) => (
  <>
    <div
      className={
        size === 'full'
          ? 'rosa-hcp-field-wrapper'
          : `rosa-hcp-field-wrapper rosa-hcp-field-wrapper--${size}`
      }
    >
      {children}
      {footer}
    </div>
    {additionalContent}
  </>
);

/** Vertical spacing for fields nested inside Drawer or ExpandableSection (not direct Form children). */
export const NestedFields = ({ children }: { children: ReactNode }) => (
  <Stack hasGutter>{children}</Stack>
);
