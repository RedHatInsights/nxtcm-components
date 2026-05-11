import { StackItem, Grid, GridItem } from '@patternfly/react-core';

export const FieldWrapper = ({
  children,
  AdditionalContent,
}: {
  children: React.ReactNode;
  AdditionalContent?: React.ReactNode;
}) => {
  return (
    <StackItem>
      <Grid>
        <GridItem span={4}>{children}</GridItem>
      </Grid>
      {AdditionalContent}
    </StackItem>
  );
};
