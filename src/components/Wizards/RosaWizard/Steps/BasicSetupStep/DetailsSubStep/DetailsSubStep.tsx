import { Button, FormSection, Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
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
import { useUniqueClusterNameCheck } from '../../../hooks/useUniqueClusterNameCheck';
import { FieldWithAPIErrorAlert } from '../../../common/FieldWithAPIErrorAlert';
import { useClusterValues, useRosaForm } from '../../../RosaFormContext';
import {
  FormTextInput,
  FormSelect,
  type SelectOptionItem,
  type SelectOptionGroup,
} from '../../../../../../TanstackForm';

/** Props for the cluster details step: API-backed dropdowns, validation, and account change handling. */
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

/**
 * Basic setup step for cluster identity, billing, OpenShift version, and region.
 * Keeps form fields in sync with AWS account, roles, versions, and uniqueness checks.
 */
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
  const strings = useRosaWizardStrings();
  const d = strings.details;
  const { requiredField } = strings.common;
  const form = useRosaForm();
  const cluster = useClusterValues();
  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState<boolean>(false);
  const drawerRef = React.useRef<HTMLSpanElement>(null);
  /** Moves focus to the drawer trigger when the wizard layout expands the drawer region. */
  const onWizardExpand = (): void => {
    drawerRef.current?.focus();
  };
  const accountChangeAbortRef = React.useRef<AbortController>();
  const { checkName, cancelCheck } = useUniqueClusterNameCheck(checkClusterNameUniqueness, 500);

  /** Debounces async uniqueness checks when the name is valid, or cancels when it is not. */
  const uniqueClusterNameCheck = React.useCallback(
    (value: string, region?: string): void => {
      const syncError = validateClusterName(value);
      if (!syncError && value) {
        checkName(value, region);
      } else {
        cancelCheck();
      }
    },
    [checkName, cancelCheck]
  );

  useResetFieldOnOptionsChange('cluster.region', regions.data);
  useResetFieldOnOptionsChange('cluster.machine_type', machineTypes.data);

  React.useEffect(() => {
    if (cluster.name) {
      void form.validateField('cluster.name', 'change');
    }
  }, [clusterNameValidation.error, clusterNameValidation.isFetching, form, cluster.name]);

  React.useEffect(() => {
    if (awsBillingAccounts.isFetching) return;
    const optionValues = awsBillingAccounts.data.map(({ value }) => value);
    if (optionValues.length === 1 && cluster.billing_account_id !== optionValues[0]) {
      form.setFieldValue('cluster.billing_account_id', optionValues[0]);
      return;
    }
    if (cluster.billing_account_id && !optionValues.includes(cluster.billing_account_id)) {
      form.setFieldValue('cluster.billing_account_id', undefined);
    }
  }, [awsBillingAccounts.data, awsBillingAccounts.isFetching, cluster.billing_account_id, form]);

  const selectedInstallerRoleVersion = React.useMemo(() => {
    const role = roles.data.find((r) => r.installerRole.value === cluster.installer_role_arn);
    return role?.installerRole.roleVersion;
  }, [roles.data, cluster.installer_role_arn]);

  const openShiftVersionGroups = React.useMemo(
    () =>
      versions.data ? buildOpenShiftVersionGroups(versions.data, d.openShiftVersionGroups) : [],
    [versions.data, d.openShiftVersionGroups]
  );

  const versionOptionGroups: SelectOptionGroup[] = React.useMemo(() => {
    if (openShiftVersionGroups.length === 0) return [];
    const roleVer =
      selectedInstallerRoleVersion && semver.valid(semver.coerce(selectedInstallerRoleVersion));

    return openShiftVersionGroups.map((group) => ({
      label: group.label,
      options: group.options.map((opt) => {
        const coerced = typeof opt.value === 'string' ? semver.coerce(opt.value) : null;
        const versionVal = coerced ? semver.valid(coerced) : null;
        const disabled = versionVal != null && roleVer != null && semver.gt(versionVal, roleVer);
        return {
          value: String(opt.value),
          label: opt.label,
          isDisabled: disabled,
          tooltip: disabled ? d.openShiftVersionOptionDisabledDescription : undefined,
        };
      }),
    }));
  }, [
    openShiftVersionGroups,
    selectedInstallerRoleVersion,
    d.openShiftVersionOptionDisabledDescription,
  ]);

  const flatVersionOptions = React.useMemo(
    () => versionOptionGroups.flatMap((g) => g.options),
    [versionOptionGroups]
  );

  const selectedVersionIsDisabled = React.useMemo(() => {
    if (!cluster.cluster_version) return { exists: true, isDisabled: false };
    if (flatVersionOptions.length === 0) return { exists: false, isDisabled: false };
    const matching = flatVersionOptions.find((o) => o.value === String(cluster.cluster_version));
    if (!matching) return { exists: false, isDisabled: false };
    return { exists: true, isDisabled: Boolean(matching.isDisabled) };
  }, [cluster.cluster_version, flatVersionOptions]);

  React.useEffect(() => {
    if (versions.isFetching || !cluster.cluster_version) return;
    if (!selectedVersionIsDisabled.exists || selectedVersionIsDisabled.isDisabled) {
      form.setFieldValue('cluster.cluster_version', undefined);
    }
  }, [versions.isFetching, selectedVersionIsDisabled, form, cluster.cluster_version]);

  const awsAccountOptions: SelectOptionItem[] = React.useMemo(
    () => awsInfrastructureAccounts.data.map((a) => ({ value: a.value, label: a.label })),
    [awsInfrastructureAccounts.data]
  );

  const billingOptions: SelectOptionItem[] = React.useMemo(
    () => awsBillingAccounts.data.map((a) => ({ value: a.value, label: a.label })),
    [awsBillingAccounts.data]
  );

  const regionOptions: SelectOptionItem[] = React.useMemo(
    () => regions.data.map((r) => ({ value: r.value, label: r.label })),
    [regions.data]
  );

  return (
    <FormSection title={d.sectionLabel}>
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
                  <form.Field
                    name="cluster.associated_aws_id"
                    validators={{
                      onChange: ({ value }) => (!value ? requiredField : undefined),
                    }}
                    listeners={{
                      onChange: ({ value }) => {
                        accountChangeAbortRef.current?.abort();
                        const controller = new AbortController();
                        accountChangeAbortRef.current = controller;
                        void updateOnAWSAccountChange(
                          value,
                          form,
                          value ? regions.fetch : undefined,
                          controller.signal
                        );
                        if (value) {
                          void roles.fetch(value);
                        }
                      },
                    }}
                  >
                    {(field) => (
                      <FormSelect
                        field={field}
                        label={d.awsInfraLabel}
                        placeholder={d.awsInfraPlaceholder}
                        labelHelp={d.awsInfraHelp}
                        isRequired
                        isDisabled={awsInfrastructureAccounts.isFetching}
                        isPending={awsInfrastructureAccounts.isFetching}
                        options={awsAccountOptions}
                        onRefresh={
                          awsInfrastructureAccounts.fetch
                            ? () => void awsInfrastructureAccounts.fetch?.()
                            : undefined
                        }
                      />
                    )}
                  </form.Field>
                </FieldWithAPIErrorAlert>
              </GridItem>
            </Grid>
            {!isDrawerExpanded && (
              <Button isInline variant="link" onClick={() => setIsDrawerExpanded((prev) => !prev)}>
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
                  <form.Field
                    name="cluster.billing_account_id"
                    validators={{
                      onChange: ({ value }) => (!value ? requiredField : undefined),
                    }}
                  >
                    {(field) => (
                      <FormSelect
                        field={field}
                        label={d.billingLabel}
                        placeholder={d.billingPlaceholder}
                        labelHelp={d.billingHelp}
                        isRequired
                        isDisabled={awsBillingAccounts.isFetching}
                        isPending={awsBillingAccounts.isFetching}
                        options={billingOptions}
                        onRefresh={
                          awsBillingAccounts.fetch
                            ? () => void awsBillingAccounts.fetch?.()
                            : undefined
                        }
                      />
                    )}
                  </form.Field>
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
                  <form.Field
                    name="cluster.name"
                    validators={{
                      onChange: ({ value }) => {
                        const v = value as string | undefined;
                        if (!v || !v.trim()) return d.clusterNameRequired;
                        return (
                          validateClusterName(v) ||
                          (typeof clusterNameValidation.error === 'string'
                            ? clusterNameValidation.error
                            : undefined)
                        );
                      },
                      onBlur: ({ value }) => {
                        const v = value as string | undefined;
                        if (!v || !v.trim()) return d.clusterNameRequired;
                        return (
                          validateClusterName(v) ||
                          (typeof clusterNameValidation.error === 'string'
                            ? clusterNameValidation.error
                            : undefined)
                        );
                      },
                    }}
                    listeners={{
                      onChange: ({ value }) => {
                        const currentRegion = form.getFieldValue('cluster.region') as
                          | string
                          | undefined;
                        uniqueClusterNameCheck(value as string, currentRegion);
                      },
                    }}
                  >
                    {(field) => (
                      <FormTextInput
                        field={field}
                        label={d.clusterNameLabel}
                        placeholder={d.clusterNamePlaceholder}
                        labelHelp={d.clusterNameHelp}
                        isRequired
                      />
                    )}
                  </form.Field>
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
                  <form.Field
                    name="cluster.cluster_version"
                    validators={{
                      onChange: ({ value }) => (!value ? requiredField : undefined),
                    }}
                    listeners={{
                      onChange: ({ value }) => {
                        if (value && !showSecurityGroupsSection(value)) {
                          form.setFieldValue('cluster.security_groups_worker', undefined);
                        }
                      },
                    }}
                  >
                    {(field) => (
                      <FormSelect
                        field={field}
                        label={d.openShiftVersionLabel}
                        placeholder={d.openShiftVersionPlaceholder}
                        isRequired
                        isPending={versions.isFetching}
                        optionGroups={versionOptionGroups}
                        onRefresh={() => void versions.fetch()}
                      />
                    )}
                  </form.Field>
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
                    cluster.associated_aws_id
                      ? () => void regions.fetch(cluster.associated_aws_id)
                      : undefined
                  }
                >
                  <form.Field
                    name="cluster.region"
                    validators={{
                      onChange: ({ value }) => (!value ? requiredField : undefined),
                    }}
                    listeners={{
                      onChange: ({ value }) => {
                        const currentName = form.getFieldValue('cluster.name') as
                          | string
                          | undefined;
                        if (currentName) {
                          uniqueClusterNameCheck(currentName, value as string);
                        }
                        form.setFieldValue('cluster.selected_vpc', undefined);
                        form.setFieldValue('cluster.cluster_privacy_public_subnet_id', undefined);
                        form.setFieldValue('cluster.machine_pools_subnets', []);
                        if (value && machineTypes.fetch) {
                          void machineTypes.fetch(value);
                        }
                      },
                    }}
                  >
                    {(field) => (
                      <FormSelect
                        field={field}
                        label={d.regionLabel}
                        placeholder={d.regionPlaceholder}
                        labelHelp={d.regionHelp}
                        isRequired
                        isDisabled={regions.isFetching}
                        isPending={regions.isFetching}
                        options={regionOptions}
                      />
                    )}
                  </form.Field>
                </FieldWithAPIErrorAlert>
              </GridItem>
            </Grid>
          </StackItem>
        </Stack>
      </StepDrawer>
    </FormSection>
  );
};
