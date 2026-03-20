import { Section, WizSelect, WizTextInput, useItem } from '@patternfly-labs/react-form-wizard';
import { Button, Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import React from 'react';
import { StepDrawer } from '../../../common/StepDrawer';
import {   
  Resource,
  Role,
  SelectDropdownType,
  ValidationResource,
  Region,
  MachineTypesDropdownType,
  OpenShiftVersions
} from '../../../../types';
import { validateClusterName } from '../../../validators';
import ExternalLink from '../../../common/ExternalLink';
import { updateOnAWSAccountChange } from '../../../hooks/updateOnAWSAccountChange';
import links from '../../../externalLinks';
import { useRosaWizardStrings } from '../../../RosaWizardStringsContext';
import { useResetFieldOnOptionsChange } from '../../../hooks/useResetFieldOnOptionsChange';
import { showSecurityGroupsSection } from '../../../helpers';

type DetailsSubStepProps = {
  clusterNameValidation: ValidationResource;
  openShiftVersions: Resource<OpenShiftVersions[]>;
  roles: Resource<Role[], [awsAccount: string]> & {
    fetch: (awsAccount: string) => Promise<void>;
  };
  awsInfrastructureAccounts: Resource<SelectDropdownType[]>;
  awsBillingAccounts: Resource<SelectDropdownType[]>;
  regions: Resource<Region[], [awsAccount: string]> & {
    fetch: (awsAccount: string) => Promise<void>;
  };
  machineTypes: Resource<MachineTypesDropdownType[], [region: string]> & {
    fetch?: (region: string) => Promise<void>;
  };
};

export const DetailsSubStep: React.FunctionComponent<DetailsSubStepProps> = ({
  clusterNameValidation,
  openShiftVersions,
  awsInfrastructureAccounts,
  awsBillingAccounts,
  regions,
  machineTypes,
  roles,
}) => {
  const d = useRosaWizardStrings().details;
  const { cluster } = useItem();

  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState<boolean>(false);
  const drawerRef = React.useRef<HTMLSpanElement>(null);
  const onWizardExpand = () => drawerRef.current && drawerRef.current.focus();

  useResetFieldOnOptionsChange('cluster.region', regions.data);
  useResetFieldOnOptionsChange('cluster.machine_type', machineTypes.data, 'machinepools-sub-step');

  React.useEffect(() => {
    if (awsBillingAccounts.data.length === 1 && !cluster.billing_account_id) {
      cluster.billing_account_id = awsBillingAccounts.data[0].value;
    }
  }, [awsBillingAccounts, cluster]);

  return (
    <Section label={d.sectionLabel}>
      <StepDrawer
        isDrawerExpanded={isDrawerExpanded}
        setIsDrawerExpanded={setIsDrawerExpanded}
        onWizardExpand={onWizardExpand}
      >
        <Stack hasGutter>
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
                  required
                  refreshCallback={
                    awsInfrastructureAccounts.fetch
                      ? () => void awsInfrastructureAccounts.fetch?.()
                      : undefined
                  }
                  onValueChange={(_value, item) => {
                    void updateOnAWSAccountChange(_value, item, regions.fetch);
                    if (_value) {
                      void roles.fetch(_value as string);
                    }
                  }}
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
                  disabled={awsBillingAccounts.isFetching}
                  path="cluster.billing_account_id"
                  label={d.billingLabel}
                  placeholder={d.billingPlaceholder}
                  labelHelp={d.billingHelp}
                  options={awsBillingAccounts.data}
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
                  options={openShiftVersions.data}
                  disabled={openShiftVersions.isFetching}
                  refreshCallback={openShiftVersions.fetch}
                  required
                  onValueChange={(_value, item) => {
                    if (!showSecurityGroupsSection(_value as string)) {
                      item.cluster.security_groups_worker = undefined;
                    }
                  }}
                />
              </GridItem>
            </Grid>
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
                  onValueChange={(_value, item) => {
                    item.cluster.selected_vpc = undefined;
                    item.cluster.cluster_privacy_public_subnet_id = undefined;
                    if (
                      item.cluster.machine_pools_subnets &&
                      item.cluster.machine_pools_subnets.length > 0
                    ) {
                      item.cluster.machine_pools_subnets = [];
                    }
                    if (_value && machineTypes.fetch) void machineTypes.fetch(_value as string);
                  }}
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
