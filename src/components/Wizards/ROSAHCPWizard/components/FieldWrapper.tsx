import { StackItem, Grid, GridItem, gridSpans } from '@patternfly/react-core';

export const FieldWrapper = ({
  children,
  AdditionalContent,
  span,
}: {
  children: React.ReactNode;
  AdditionalContent?: React.ReactNode;
  span?: gridSpans;
}) => {
  return (
    <StackItem>
      <Grid>
        <GridItem span={span ? span : 4}>{children}</GridItem>
      </Grid>
      {AdditionalContent}
    </StackItem>
  );
};
