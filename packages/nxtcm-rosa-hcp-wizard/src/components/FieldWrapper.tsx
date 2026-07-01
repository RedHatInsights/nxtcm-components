import { Stack } from '@patternfly/react-core';
import type { ReactNode } from 'react';

export type FieldWrapperWidth = 'small' | 'medium' | 'large';

export type FieldWrapperProps = {
  children: ReactNode;
  /** Optional content rendered below the field (links, actions, etc.). */
  additionalContent?: ReactNode;
  /** Reserved for future per-field width constraints. Currently unused. */
  width?: FieldWrapperWidth;
};

export const FieldWrapper = ({ children, additionalContent }: FieldWrapperProps) => (
  <>
    {children}
    {additionalContent}
  </>
);

/** Vertical spacing for fields nested inside Drawer or ExpandableSection (not direct Form children). */
export const NestedFields = ({ children }: { children: ReactNode }) => (
  <Stack hasGutter>{children}</Stack>
);
