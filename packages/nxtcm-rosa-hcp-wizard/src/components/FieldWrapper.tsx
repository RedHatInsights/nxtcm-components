import { Stack, StackItem, Grid, GridItem, type gridSpans } from '@patternfly/react-core';
import type { ReactNode } from 'react';

export type FieldWrapperWidth = 'small' | 'medium' | 'large';

const FIELD_WRAPPER_WIDTH_SPANS: Record<FieldWrapperWidth, gridSpans> = {
  small: 4,
  medium: 6,
  large: 8,
};

export type FieldWrapperProps = {
  children: ReactNode;
  /** Optional content rendered below the field grid (links, actions, etc.). */
  additionalContent?: ReactNode;
  /** Semantic field width on the 12-column grid. Defaults to `small`. */
  width?: FieldWrapperWidth;
};

export const FieldWrapper = ({ children, additionalContent, width }: FieldWrapperProps) => {
  return (
    <StackItem>
      <Grid>
        <GridItem span={FIELD_WRAPPER_WIDTH_SPANS[width ?? 'small']}>{children}</GridItem>
      </Grid>
      {additionalContent}
    </StackItem>
  );
};

export type FieldWrapperStackProps = {
  children: ReactNode;
};

/** Vertical stack for wizard fields; pairs with {@link FieldWrapper}. */
export const FieldWrapperStack = ({ children }: FieldWrapperStackProps) => (
  <Stack hasGutter>{children}</Stack>
);

export type FieldWrapperBlockProps = {
  children: ReactNode;
};

/** Full-width stack row for non-field content (intro text, alerts) inside {@link FieldWrapperStack}. */
export const FieldWrapperBlock = ({ children }: FieldWrapperBlockProps) => (
  <StackItem>{children}</StackItem>
);
