import { Section, WizSelect, WizTextInput } from '@patternfly-labs/react-form-wizard';
import { Button, Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import React from 'react';
import { StepDrawer } from '../../../common/StepDrawer';
import { Resource, Role, SelectDropdownType, ValidationResource } from '../../../../types';
import { validateClusterName } from '../../../validators';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useRosaWizardStrings } from '../../../RosaWizardStringsContext';

type DetailsSubStepProps = {
  clusterNameValidation: ValidationResource;
  openShiftVersions: SelectDropdownType[];
  versionsIsPending: boolean;
  refreshVersionsCallback?: () => void;
  roles: Resource<Role[], [awsAccount: string]> & {
    fetch: (awsAccount: string) => Promise<void>;
  };
  awsInfrastructureAccounts: Resource<SelectDropdownType[]>;
  awsBillingAccounts: Resource<SelectDropdownType[]>;
  regions: Resource<SelectDropdownType[]>;
};

export const DetailsSubStep: React.FunctionComponent<DetailsSubStepProps> = ({
  clusterNameValidation,
  openShiftVersions,
  versionsIsPending,
  refreshVersionsCallback,
  roles,
  awsInfrastructureAccounts,
  awsBillingAccounts,
  regions,
}) => {
  const d = useRosaWizardStrings().details;

  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState<boolean>(false);
  const drawerRef = React.useRef<HTMLSpanElement>(null);
  const onWizardExpand = () => drawerRef.current && drawerRef.current.focus();

  return (
    <Section label={d.sectionLabel}>
      <StepDrawer
        isDrawerExpanded={isDrawerExpanded}
        setIsDrawerExpanded={setIsDrawerExpanded}
        onWizardExpand={onWizardExpand}
      >
        <Stack hasGutter>
          <StackItem>
            <Grid>
              <GridItem span={4}>
                <WizTextInput
                  validation={(name: string, item: unknown) =>
                    validateClusterName(name, item) || clusterNameValidation.error || undefined
                  }
                  path="cluster.name"
                  label={d.clusterNameLabel}
                  validateOnBlur
                  placeholder={d.clusterNamePlaceholder}
                  required
                  labelHelp={d.clusterNameHelp}
                />
              </GridItem>
            </Grid>
          </StackItem>

          <StackItem>
            <Grid>
              <GridItem span={4}>
                <WizSelect
                  isFill
                  path="cluster.cluster_version"
                  label={d.openShiftVersionLabel}
                  placeholder={d.openShiftVersionPlaceholder}
                  options={openShiftVersions}
                  disabled={versionsIsPending}
                  refreshCallback={refreshVersionsCallback}
                  required
                />
              </GridItem>
            </Grid>
          </StackItem>

          <StackItem>
            <Grid hasGutter>
              <GridItem span={4}>
                <WizSelect
                  isFill
                  path="cluster.associated_aws_id"
                  label={d.awsInfraLabel}
                  placeholder={d.awsInfraPlaceholder}
                  labelHelp={d.awsInfraHelp}
                  options={awsInfrastructureAccounts.data}
                  disabled={awsInfrastructureAccounts.isFetching}
                  onValueChange={(_newAccountId, item) => {
                    item.cluster.installer_role_arn = undefined;
                    item.cluster.worker_role_arn = undefined;
                    item.cluster.support_role_arn = undefined;

                    if (_newAccountId) {
                      void roles.fetch(_newAccountId as string);
                    }
                  }}
                  required
                  refreshCallback={
                    awsInfrastructureAccounts.fetch
                      ? () => void awsInfrastructureAccounts.fetch?.()
                      : undefined
                  }
                />
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
            <Grid hasGutter>
              <GridItem span={4}>
                <WizSelect
                  isFill
                  path="cluster.billing_account_id"
                  label={d.billingLabel}
                  placeholder={d.billingPlaceholder}
                  labelHelp={d.billingHelp}
                  options={awsBillingAccounts.data}
                  disabled={awsBillingAccounts.isFetching}
                  required
                  refreshCallback={
                    awsBillingAccounts.fetch ? () => void awsBillingAccounts.fetch?.() : undefined
                  }
                />
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
              <GridItem span={4}>
                <WizSelect
                  isFill
                  path="cluster.region"
                  label={d.regionLabel}
                  placeholder={d.regionPlaceholder}
                  labelHelp={d.regionHelp}
                  options={regions.data}
                  disabled={regions.isFetching}
                  required
                />
              </GridItem>
            </Grid>
          </StackItem>
        </Stack>
      </StepDrawer>
    </Section>
  );
};
