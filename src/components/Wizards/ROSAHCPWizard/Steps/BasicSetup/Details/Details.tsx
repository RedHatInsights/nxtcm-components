import { Button, Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import { DetailsStepDrawer } from '../../../components/DetailsStepDrawer/DetailsStepDrawer';
import { Section } from '../../../components/Section';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import React from 'react';
import { FieldWithAPIErrorAlert } from '../../../components/FieldWithAPIErrorAlert';
import ExternalLink from '../../../components/ExternalLink';
import links from '../../../links';

export const Details = () => {
  const d = useRosaHcpWizardStrings().details;
  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState<boolean>(false);
  const drawerRef = React.useRef<HTMLSpanElement>(null);
  const onWizardExpand = () => drawerRef.current && drawerRef.current.focus();
  return (
    <Section label={d.sectionLabel}>
      <DetailsStepDrawer
        isDrawerExpanded={isDrawerExpanded}
        setIsDrawerExpanded={setIsDrawerExpanded}
        onWizardExpand={onWizardExpand}
      >
        <Stack hasGutter>
          <StackItem>
            <Grid>
              <GridItem>
                <FieldWithAPIErrorAlert error={''} isFetching={false} fieldName={d.awsInfraLabel}>
                  associated_aws_id
                </FieldWithAPIErrorAlert>
              </GridItem>
            </Grid>
            {!isDrawerExpanded && (
              <Button
                isInline
                variant="link"
                onClick={() => setIsDrawerExpanded((prevExpanded) => !prevExpanded)}
              >
                {d.associateNewAccount}
              </Button>
            )}
          </StackItem>

          <StackItem>
            <Grid>
              <GridItem span={4}>
                <FieldWithAPIErrorAlert error={''} isFetching={false} fieldName={d.billingLabel}>
                  billing_account_id
                </FieldWithAPIErrorAlert>
              </GridItem>
            </Grid>
            <ExternalLink
              variant="secondary"
              className="pf-v6-u-mt-md"
              href={links.AWS_CONSOLE_ROSA_HOME}
            >
              {d.connectBillingLink}
            </ExternalLink>
          </StackItem>

          <StackItem>
            <Grid>
              <GridItem span={4} className="pf-v6-u-pr-2xl">
                <FieldWithAPIErrorAlert
                  error={''}
                  isFetching={false}
                  fieldName={d.clusterNameLabel}
                >
                  cluster_name_field
                </FieldWithAPIErrorAlert>
              </GridItem>
            </Grid>
          </StackItem>

          <StackItem>
            <Grid>
              <GridItem span={4}>
                <FieldWithAPIErrorAlert
                  error={''}
                  isFetching={false}
                  fieldName={d.openShiftVersionLabel}
                >
                  cluster_versions
                </FieldWithAPIErrorAlert>
              </GridItem>
            </Grid>
          </StackItem>

          <StackItem>
            <Grid>
              <GridItem span={4} className="pf-v6-u-pr-2xl">
                <FieldWithAPIErrorAlert error={''} isFetching={false} fieldName={d.regionLabel}>
                  cluster_regions
                </FieldWithAPIErrorAlert>
              </GridItem>
            </Grid>
          </StackItem>
        </Stack>
      </DetailsStepDrawer>
    </Section>
  );
};
