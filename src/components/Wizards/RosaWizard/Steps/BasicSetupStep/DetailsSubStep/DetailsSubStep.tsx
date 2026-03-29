import {
  Section,
  WizSelect,
  WizTextInput,
  useData,
  useItem,
} from '@patternfly-labs/react-form-wizard';
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
} from '../../../../types';
import { validateClusterName } from '../../../validators';
import ExternalLink from '../../../common/ExternalLink';
import { updateOnAWSAccountChange } from '../../../hooks/updateOnAWSAccountChange';
import links from '../../../externalLinks';
import { useRosaWizardStrings } from '../../../RosaWizardStringsContext';
import { useResetFieldOnOptionsChange } from '../../../hooks/useResetFieldOnOptionsChange';
import { showSecurityGroupsSection } from '../../../helpers';
import { FieldWithAPIErrorAlert } from '../../../common/FieldWithAPIErrorAlert';

type DetailsSubStepProps = {
  clusterNameValidation: ValidationResource;
  openShiftVersions: Resource<SelectDropdownType[]> & {
    fetch: () => Promise<void>;
  };
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
  const { update } = useData();

  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState<boolean>(false);
  const drawerRef = React.useRef<HTMLSpanElement>(null);
  const onWizardExpand = () => drawerRef.current && drawerRef.current.focus();

  useResetFieldOnOptionsChange('cluster.region', regions.data);
  useResetFieldOnOptionsChange('cluster.machine_type', machineTypes.data, 'machinepools-sub-step');

  React.useEffect(() => {
    if (awsBillingAccounts.isFetching) {
      return;
    }
    const optionValues = awsBillingAccounts.data.map(({ value }) => value);
    if (optionValues.length === 1 && cluster.billing_account_id !== optionValues[0]) {
      cluster.billing_account_id = optionValues[0];
      update();
      return;
    }
    if (cluster.billing_account_id && !optionValues.includes(cluster.billing_account_id)) {
      cluster.billing_account_id = undefined;
      update();
    }
  }, [awsBillingAccounts.data, awsBillingAccounts.isFetching, cluster, update]);

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
                <FieldWithAPIErrorAlert
                  error={awsInfrastructureAccounts.error}
                  isFetching={awsInfrastructureAccounts.isFetching}
                  fieldName={d.awsInfraLabel}
                  retry={
                    awsInfrastructureAccounts.fetch
                      ? () => void awsInfrastructureAccounts.fetch?.()
                      : undefined
                  }
                >
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
            <Grid hasGutter>
              <GridItem span={4}>
                <FieldWithAPIErrorAlert
                  error={awsBillingAccounts.error}
                  isFetching={awsBillingAccounts.isFetching}
                  fieldName={d.billingLabel}
                  retry={
                    awsBillingAccounts.fetch ? () => void awsBillingAccounts.fetch?.() : undefined
                  }
                >
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
              <GridItem span={4}>
                <FieldWithAPIErrorAlert
                  error={clusterNameValidation.error}
                  isFetching={clusterNameValidation.isFetching}
                  fieldName={d.clusterNameLabel}
                  isValidation
                >
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
                </FieldWithAPIErrorAlert>
              </GridItem>
            </Grid>
          </StackItem>

          <StackItem>
            <Grid>
              <GridItem span={4}>
                <FieldWithAPIErrorAlert
                  error={openShiftVersions.error}
                  isFetching={openShiftVersions.isFetching}
                  fieldName={d.openShiftVersionLabel}
                  retry={() => void openShiftVersions.fetch()}
                >
                  <WizSelect
                    isFill
                    path="cluster.cluster_version"
                    label={d.openShiftVersionLabel}
                    placeholder={d.openShiftVersionPlaceholder}
                    options={openShiftVersions.data}
                    disabled={openShiftVersions.isFetching}
                    refreshCallback={() => void openShiftVersions.fetch()}
                    required
                    onValueChange={(_value, item) => {
                      if (_value && !showSecurityGroupsSection(_value as string)) {
                        item.cluster.security_groups_worker = undefined;
                      }
                    }}
                  />
                </FieldWithAPIErrorAlert>
              </GridItem>
            </Grid>
          </StackItem>
          <StackItem>
            <Grid>
              <GridItem span={4}>
                <FieldWithAPIErrorAlert
                  error={regions.error}
                  isFetching={regions.isFetching}
                  fieldName={d.regionLabel}
                  retry={
                    cluster?.associated_aws_id
                      ? () => void regions.fetch(cluster.associated_aws_id as string)
                      : undefined
                  }
                >
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
                </FieldWithAPIErrorAlert>
              </GridItem>
            </Grid>
          </StackItem>
        </Stack>
      </StepDrawer>
    </Section>
  );
};
