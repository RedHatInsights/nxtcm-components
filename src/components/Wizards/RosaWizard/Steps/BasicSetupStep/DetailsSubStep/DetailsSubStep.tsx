import {
  Section,
  useData,
  useItem,
  WizSelect,
  WizTextInput,
} from '@patternfly-labs/react-form-wizard';
import { Button, Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import React from 'react';
import semver from 'semver';
import { StepDrawer } from '../../../common/StepDrawer';
import {
  OpenShiftVersionsData,
  Resource,
  Role,
  SelectDropdownType,
  ValidationResource,
  Region,
  MachineTypesDropdownType,
} from '../../../../types';
import { buildOpenShiftVersionGroups } from '../../../buildOpenShiftVersionGroups';
import { validateClusterName } from '../../../validators';
import ExternalLink from '../../../common/ExternalLink';
import { updateOnAWSAccountChange } from '../../../hooks/updateOnAWSAccountChange';
import links from '../../../externalLinks';
import { useRosaWizardStrings } from '../../../RosaWizardStringsContext';
import { useResetFieldOnOptionsChange } from '../../../hooks/useResetFieldOnOptionsChange';
import { showSecurityGroupsSection } from '../../../helpers';

type DetailsSubStepProps = {
  clusterNameValidation: ValidationResource;
  versions: Resource<OpenShiftVersionsData, []> & { fetch: () => Promise<void> };
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
  versions,
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

  const selectedInstallerRoleVersion = React.useMemo(() => {
    const role = roles.data.find((r) => r.installerRole.value === cluster?.installer_role_arn);
    return role?.installerRole.roleVersion;
  }, [roles.data, cluster?.installer_role_arn]);

  const openShiftVersionGroups = React.useMemo(
    () => (versions.data ? buildOpenShiftVersionGroups(versions.data) : []),
    [versions.data]
  );

  const versionGroupsWithDisabled = React.useMemo(() => {
    if (openShiftVersionGroups.length === 0) return [];
    const roleVer =
      selectedInstallerRoleVersion && semver.valid(semver.coerce(selectedInstallerRoleVersion));
    if (!roleVer) return openShiftVersionGroups;
    return openShiftVersionGroups.map((group) => ({
      ...group,
      options: group.options.map((opt) => {
        const coerced = typeof opt.value === 'string' ? semver.coerce(opt.value) : null;
        const versionVal = coerced ? semver.valid(coerced) : null;
        const disabled = versionVal != null && roleVer != null && semver.gt(versionVal, roleVer);
        return disabled
          ? {
              ...opt,
              ariaDisabled: true,
              tooltipProps: { content: d.openShiftVersionOptionDisabledDescription },
            }
          : opt;
      }),
    }));
  }, [
    d.openShiftVersionOptionDisabledDescription,
    openShiftVersionGroups,
    selectedInstallerRoleVersion,
  ]);

  /** Whether `cluster.cluster_version` appears in `versionGroupsWithDisabled` and, if so, whether that option is disabled. */
  const selectedVersionIsDisabled = React.useMemo(() => {
    if (!cluster?.cluster_version) {
      return { exists: true, isDisabled: false };
    }
    if (versionGroupsWithDisabled.length === 0) {
      return { exists: false, isDisabled: false };
    }
    const versionStr = String(cluster.cluster_version);
    let matching: SelectDropdownType | undefined;
    for (const group of versionGroupsWithDisabled) {
      const opt = group.options.find((o) => String(o.value) === versionStr);
      if (opt) {
        matching = opt;
        break;
      }
    }
    if (!matching) {
      return { exists: false, isDisabled: false };
    }
    return {
      exists: true,
      isDisabled: Boolean(matching.ariaDisabled || matching.disabled),
    };
  }, [cluster?.cluster_version, versionGroupsWithDisabled]);

  React.useEffect(() => {
    if (versions.isFetching || !cluster?.cluster_version) return;
    if (!selectedVersionIsDisabled.exists || selectedVersionIsDisabled.isDisabled) {
      cluster.cluster_version = undefined;
      update();
    }
  }, [versions.isFetching, selectedVersionIsDisabled, cluster, update]);

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
                  optionGroups={versionGroupsWithDisabled}
                  isPending={versions.isFetching}
                  refreshCallback={() => void versions.fetch()}
                  required
                  onValueChange={(_value, item) => {
                    if (_value && !showSecurityGroupsSection(_value as string)) {
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
