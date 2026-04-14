import { Button, Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import { klona } from 'klona/json';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import semver from 'semver';
import { RosaSection, RosaSelect, RosaTextInput } from '../../../Inputs';
import { StepDrawer } from '../../../common/StepDrawer';
import {
  OpenShiftVersionsData,
  Resource,
  Role,
  RosaWizardFormData,
  SelectDropdownType,
  ValidationResource,
  Region,
  MachineTypesDropdownType,
} from '../../../../types';
import { buildOpenShiftVersionGroups } from '../../../buildOpenShiftVersionGroups';
import { validateClusterName } from '../../../validators';
import ExternalLink from '../../../common/ExternalLink';
import {
  clusterFieldPathsClearedOnAwsAccountChange,
  updateOnAWSAccountChange,
} from '../../../hooks/updateOnAWSAccountChange';
import links from '../../../externalLinks';
import { useRosaWizardStrings } from '../../../RosaWizardStringsContext';
import { useResetFieldOnOptionsChange } from '../../../hooks/useResetFieldOnOptionsChange';
import { showSecurityGroupsSection } from '../../../helpers';
import { useUniqueClusterNameCheck } from '../../../hooks/useUniqueClusterNameCheck';
import { FieldWithAPIErrorAlert } from '../../../common/FieldWithAPIErrorAlert';

type DetailsSubStepProps = {
  clusterNameValidation: ValidationResource;
  versions: Resource<OpenShiftVersionsData, []> & { fetch: () => Promise<void> };
  checkClusterNameUniqueness?: (name: string, region?: string) => void;
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
  checkClusterNameUniqueness,
}) => {
  const d = useRosaWizardStrings().details;
  const { getValues, reset, setValue, trigger } = useFormContext<RosaWizardFormData>();
  const cluster = useWatch({ name: 'cluster' });
  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState<boolean>(false);
  const drawerRef = React.useRef<HTMLSpanElement>(null);
  const onWizardExpand = () => drawerRef.current && drawerRef.current.focus();
  const { checkName, cancelCheck } = useUniqueClusterNameCheck(checkClusterNameUniqueness, 500);

  const uniqueClusterNameCheck = (value: string, region: string) => {
    const syncError = validateClusterName(value);
    if (!syncError && value) {
      checkName(value, region);
    } else {
      cancelCheck();
    }
  };

  useResetFieldOnOptionsChange('cluster.region', regions.data);
  useResetFieldOnOptionsChange('cluster.machine_type', machineTypes.data, 'machinepools-sub-step');

  React.useEffect(() => {
    if (awsBillingAccounts.isFetching) {
      return;
    }
    const optionValues = awsBillingAccounts.data.map(({ value }) => value);
    if (optionValues.length === 1 && cluster.billing_account_id !== optionValues[0]) {
      setValue('cluster.billing_account_id', optionValues[0], { shouldValidate: true });
      return;
    }
    if (cluster.billing_account_id && !optionValues.includes(cluster.billing_account_id)) {
      setValue('cluster.billing_account_id', undefined, { shouldValidate: true });
    }
  }, [awsBillingAccounts.data, awsBillingAccounts.isFetching, cluster.billing_account_id, setValue]);

  const selectedInstallerRoleVersion = React.useMemo(() => {
    const role = roles.data.find((r) => r.installerRole.value === cluster?.installer_role_arn);
    return role?.installerRole.roleVersion;
  }, [roles.data, cluster?.installer_role_arn]);

  const openShiftVersionGroups = React.useMemo(
    () =>
      versions.data ? buildOpenShiftVersionGroups(versions.data, d.openShiftVersionGroups) : [],
    [versions.data, d.openShiftVersionGroups]
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
      setValue('cluster.cluster_version', undefined, { shouldValidate: true });
    }
  }, [versions.isFetching, selectedVersionIsDisabled, cluster?.cluster_version, setValue]);

  return (
    <RosaSection label={d.sectionLabel}>
      <StepDrawer
        isDrawerExpanded={isDrawerExpanded}
        setIsDrawerExpanded={setIsDrawerExpanded}
        onWizardExpand={onWizardExpand}
      >
        <Stack hasGutter>
          <StackItem>
            <Grid>
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
                  <RosaSelect
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
                    onValueChange={(value) => {
                      const data = klona(getValues());
                      void updateOnAWSAccountChange(value as string, data, regions.fetch);
                      reset(data, { keepDefaultValues: false });
                      void trigger(clusterFieldPathsClearedOnAwsAccountChange);
                      if (value) {
                        void roles.fetch(value as string);
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
            <Grid>
              <GridItem span={4}>
                <FieldWithAPIErrorAlert
                  error={awsBillingAccounts.error}
                  isFetching={awsBillingAccounts.isFetching}
                  fieldName={d.billingLabel}
                  retry={
                    awsBillingAccounts.fetch ? () => void awsBillingAccounts.fetch?.() : undefined
                  }
                >
                  <RosaSelect
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
              <GridItem span={4} className="pf-v6-u-pr-2xl">
                <FieldWithAPIErrorAlert
                  error={clusterNameValidation.error}
                  isFetching={clusterNameValidation.isFetching}
                  fieldName={d.clusterNameLabel}
                  isValidation
                >
                  <RosaTextInput
                    validation={(name: string, item: unknown) =>
                      validateClusterName(name, item) || clusterNameValidation.error || undefined
                    }
                    onValueChange={(value) => {
                      uniqueClusterNameCheck(value as string, cluster.region as string);
                    }}
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
                  error={versions.error}
                  isFetching={versions.isFetching}
                  fieldName={d.openShiftVersionLabel}
                  retry={() => void versions.fetch()}
                >
                  <RosaSelect
                    isFill
                    path="cluster.cluster_version"
                    label={d.openShiftVersionLabel}
                    placeholder={d.openShiftVersionPlaceholder}
                    optionGroups={versionGroupsWithDisabled}
                    isPending={versions.isFetching}
                    refreshCallback={() => void versions.fetch()}
                    required
                    onValueChange={(value) => {
                      if (value && !showSecurityGroupsSection(value as string)) {
                        setValue('cluster.security_groups_worker', undefined, { shouldValidate: true });
                      }
                    }}
                  />
                </FieldWithAPIErrorAlert>
              </GridItem>
            </Grid>
          </StackItem>
          <StackItem>
            <Grid>
              <GridItem span={4} className="pf-v6-u-pr-2xl">
                <FieldWithAPIErrorAlert
                  error={regions.error}
                  isFetching={regions.isFetching}
                  fieldName={d.regionLabel}
                  retry={
                    cluster?.associated_aws_id
                      ? () => void regions.fetch(cluster.associated_aws_id)
                      : undefined
                  }
                >
                  <RosaSelect
                    isFill
                    path="cluster.region"
                    label={d.regionLabel}
                    placeholder={d.regionPlaceholder}
                    labelHelp={d.regionHelp}
                    options={regions.data}
                    disabled={regions.isFetching}
                    onValueChange={(value) => {
                      if (cluster.name) uniqueClusterNameCheck(cluster.name, value as string);
                      setValue('cluster.selected_vpc', undefined, { shouldDirty: true });
                      setValue('cluster.cluster_privacy_public_subnet_id', undefined, {
                        shouldDirty: true,
                      });
                      setValue('cluster.machine_pools_subnets', [], { shouldDirty: true });
                      if (value && machineTypes.fetch) void machineTypes.fetch(value as string);
                    }}
                    required
                  />
                </FieldWithAPIErrorAlert>
              </GridItem>
            </Grid>
          </StackItem>
        </Stack>
      </StepDrawer>
    </RosaSection>
  );
};
