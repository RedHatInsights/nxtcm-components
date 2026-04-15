import {
  ClipboardCopy,
  ExpandableSection,
  FormSection,
  Grid,
  GridItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import React from 'react';
import semver from 'semver';
import PopoverHintWithTitle from '../../../common/PopoverHitWithTitle';
import { OIDCConfigHint } from '../../../common/OIDCConfigHint';
import { OIDCConfig, Resource, Role } from '../../../../types';
import { validateCustomOperatorRolesPrefix } from '../../../validators';
import { createOperatorRolesPrefix } from '../../../helpers';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useRosaWizardStrings, useRosaWizardValidators } from '../../../RosaWizardStringsContext';
import { FieldWithAPIErrorAlert } from '../../../common/FieldWithAPIErrorAlert';
import { useClusterValues, useRosaForm } from '../../../RosaFormContext';
import { FormSelect, FormTextInput, type SelectOptionItem } from '../../../../../../TanstackForm';

/** Props for IAM role sets and OIDC configuration loaded for the selected AWS account. */
type RolesAndPoliciesSubStepProps = {
  roles: Resource<Role[], [awsAccount: string]> & {
    fetch: (awsAccount: string) => Promise<void>;
  };
  oidcConfig: Resource<OIDCConfig[]>;
};

/**
 * Account roles (installer/support/worker), OIDC config, operator role prefix, and ROSA CLI copy for operator roles.
 */
export const RolesAndPoliciesSubStep: React.FunctionComponent<RolesAndPoliciesSubStepProps> = ({
  roles,
  oidcConfig,
}) => {
  const strings = useRosaWizardStrings();
  const rp = strings.rolesAndPolicies;
  const { requiredField } = strings.common;
  const v = useRosaWizardValidators();
  const form = useRosaForm();
  const cluster = useClusterValues();

  const [isOperatorRolesOpen, setIsOperatorRolesOpen] = React.useState<boolean>(true);
  const [isArnsOpen, setIsArnsOpen] = React.useState<boolean>(false);

  const selectedRole = React.useMemo(
    () => roles.data.find((roleSet) => roleSet.installerRole.value === cluster.installer_role_arn),
    [roles.data, cluster.installer_role_arn]
  );

  const supportRoleOptions: SelectOptionItem[] = React.useMemo(
    () => (selectedRole?.supportRole ?? []).map((r) => ({ value: r.value, label: r.label })),
    [selectedRole]
  );

  const workerRoleOptions: SelectOptionItem[] = React.useMemo(
    () => (selectedRole?.workerRole ?? []).map((r) => ({ value: r.value, label: r.label })),
    [selectedRole]
  );

  React.useEffect(() => {
    if (roles.isFetching || !cluster) return;

    if (cluster.installer_role_arn && !selectedRole) {
      form.setFieldValue('cluster.installer_role_arn', undefined);
      form.setFieldValue('cluster.support_role_arn', undefined);
      form.setFieldValue('cluster.worker_role_arn', undefined);
      return;
    }

    if (selectedRole) {
      if (
        cluster.support_role_arn &&
        !selectedRole.supportRole.some((opt) => opt.value === cluster.support_role_arn)
      ) {
        form.setFieldValue('cluster.support_role_arn', selectedRole.supportRole[0]?.value);
      }
      if (
        cluster.worker_role_arn &&
        !selectedRole.workerRole.some((opt) => opt.value === cluster.worker_role_arn)
      ) {
        form.setFieldValue('cluster.worker_role_arn', selectedRole.workerRole[0]?.value);
      }
    }
  }, [cluster, roles.isFetching, selectedRole, form]);

  const selectedClusterVersion = cluster.cluster_version;

  const installerRoleOptions: SelectOptionItem[] = React.useMemo(() => {
    const clusterVer =
      selectedClusterVersion && semver.valid(semver.coerce(selectedClusterVersion));
    return roles.data.map((r) => {
      const role = r.installerRole;
      if (!role.roleVersion || !clusterVer) {
        return { value: role.value, label: role.label };
      }
      const roleVer = semver.valid(semver.coerce(role.roleVersion));
      const disabled = roleVer != null && semver.lt(roleVer, clusterVer);
      return {
        value: role.value,
        label: role.label,
        isDisabled: disabled,
        tooltip: disabled ? rp.installerRoleOptionDisabledDescription : undefined,
      };
    });
  }, [roles.data, selectedClusterVersion, rp.installerRoleOptionDisabledDescription]);

  const selectedRoleIsDisabled = React.useMemo(() => {
    if (!selectedClusterVersion || !cluster.installer_role_arn) return false;
    const selected = installerRoleOptions.find((opt) => opt.value === cluster.installer_role_arn);
    return Boolean(selected?.isDisabled);
  }, [selectedClusterVersion, cluster.installer_role_arn, installerRoleOptions]);

  React.useEffect(() => {
    if (cluster.name && !cluster.custom_operator_roles_prefix) {
      form.setFieldValue(
        'cluster.custom_operator_roles_prefix',
        createOperatorRolesPrefix(cluster.name)
      );
    }
  }, [cluster.name, cluster.custom_operator_roles_prefix, form]);

  React.useEffect(() => {
    if (selectedRoleIsDisabled) {
      form.setFieldValue('cluster.installer_role_arn', undefined);
      form.setFieldValue('cluster.support_role_arn', undefined);
      form.setFieldValue('cluster.worker_role_arn', undefined);
    }
  }, [selectedRoleIsDisabled, form]);

  /** Resets or repopulates support and worker ARNs when the installer role selection changes. */
  const onInstallerRoleChange = React.useCallback(
    (installerRoleValue: string): void => {
      if (!installerRoleValue) {
        form.setFieldValue('cluster.support_role_arn', undefined);
        form.setFieldValue('cluster.worker_role_arn', undefined);
      } else {
        const role = roles.data.find((r) => r.installerRole.value === installerRoleValue);
        if (role) {
          form.setFieldValue('cluster.support_role_arn', role.supportRole[0]?.value);
          form.setFieldValue('cluster.worker_role_arn', role.workerRole[0]?.value);
        }
      }
    },
    [roles.data, form]
  );

  /** Example `rosa create operator-roles` command populated from the current wizard field values. */
  const rosaCommand = `rosa create operator-roles --prefix "${cluster.custom_operator_roles_prefix}" --oidc-config-id "${cluster.byo_oidc_config_id}" --hosted-cp --installer-role-arn ${cluster.installer_role_arn}`;

  const oidcOptions: SelectOptionItem[] = React.useMemo(
    () =>
      oidcConfig.data.map((config) => ({
        value: config.value,
        label: config.label,
        description: config.issuer_url,
      })),
    [oidcConfig.data]
  );

  return (
    <>
      <FormSection title={rp.accountRolesSection}>
        <Grid>
          <GridItem span={7}>
            <FieldWithAPIErrorAlert
              error={roles.error}
              isFetching={roles.isFetching}
              fieldName={rp.installerRoleLabel}
              retry={
                cluster.associated_aws_id
                  ? () => void roles.fetch(cluster.associated_aws_id)
                  : undefined
              }
            >
              <form.Field
                name="cluster.installer_role_arn"
                validators={{
                  onChange: ({ value }) => (!value ? requiredField : undefined),
                }}
                listeners={{
                  onChange: ({ value }) => {
                    onInstallerRoleChange(value as string);
                  },
                }}
              >
                {(field) => (
                  <FormSelect
                    field={field}
                    label={rp.installerRoleLabel}
                    placeholder={rp.installerPlaceholder}
                    labelHelp={
                      <>
                        {rp.installerHelpLead}{' '}
                        <ExternalLink href={links.ROSA_ROLES_LEARN_MORE}>
                          {rp.installerLearnMoreLink}
                        </ExternalLink>
                      </>
                    }
                    isRequired
                    isDisabled={roles.isFetching}
                    isPending={roles.isFetching}
                    options={installerRoleOptions}
                    onRefresh={
                      cluster.associated_aws_id
                        ? () => void roles.fetch(cluster.associated_aws_id)
                        : undefined
                    }
                  />
                )}
              </form.Field>
            </FieldWithAPIErrorAlert>
          </GridItem>
        </Grid>
        <ExpandableSection
          isExpanded={isArnsOpen}
          onToggle={() => setIsArnsOpen(!isArnsOpen)}
          toggleText={rp.arnsToggle}
        >
          <Grid hasGutter>
            <GridItem span={7}>
              <form.Field name="cluster.support_role_arn">
                {(field) => (
                  <FormSelect
                    key={`support-${cluster.installer_role_arn ?? 'none'}`}
                    field={field}
                    label={rp.supportRoleLabel}
                    placeholder={rp.supportPlaceholder}
                    labelHelp={rp.supportHelp}
                    isRequired
                    isDisabled
                    options={supportRoleOptions}
                  />
                )}
              </form.Field>
            </GridItem>
            <GridItem span={7}>
              <form.Field name="cluster.worker_role_arn">
                {(field) => (
                  <FormSelect
                    key={`worker-${cluster.installer_role_arn ?? 'none'}`}
                    field={field}
                    label={rp.workerRoleLabel}
                    placeholder={rp.workerPlaceholder}
                    labelHelp={rp.workerHelp}
                    isRequired
                    isDisabled
                    options={workerRoleOptions}
                  />
                )}
              </form.Field>
            </GridItem>
          </Grid>
        </ExpandableSection>
      </FormSection>

      <FormSection title={rp.operatorRolesSection}>
        <Grid>
          <GridItem span={7}>
            <Stack>
              <StackItem>
                <FieldWithAPIErrorAlert
                  error={oidcConfig.error}
                  isFetching={oidcConfig.isFetching}
                  fieldName={rp.oidcLabel}
                  retry={oidcConfig.fetch ? () => void oidcConfig.fetch?.() : undefined}
                >
                  <form.Field
                    name="cluster.byo_oidc_config_id"
                    validators={{
                      onChange: ({ value }) => (!value ? requiredField : undefined),
                    }}
                  >
                    {(field) => (
                      <FormSelect
                        field={field}
                        label={rp.oidcLabel}
                        placeholder={rp.oidcPlaceholder}
                        labelHelp={rp.oidcHelp}
                        isRequired
                        isDisabled={oidcConfig.isFetching}
                        isPending={oidcConfig.isFetching}
                        options={oidcOptions}
                        onRefresh={oidcConfig.fetch ? () => void oidcConfig.fetch?.() : undefined}
                      />
                    )}
                  </form.Field>
                </FieldWithAPIErrorAlert>
              </StackItem>
              <StackItem>
                <PopoverHintWithTitle
                  displayHintIcon
                  title={rp.oidcPopoverTitle}
                  bodyContent={<OIDCConfigHint />}
                />
              </StackItem>
            </Stack>
          </GridItem>
        </Grid>

        <ExpandableSection
          isExpanded={isOperatorRolesOpen}
          onToggle={() => setIsOperatorRolesOpen(!isOperatorRolesOpen)}
          toggleText={rp.operatorPrefixToggle}
        >
          <Grid>
            <GridItem span={4}>
              <form.Field
                name="cluster.custom_operator_roles_prefix"
                validators={{
                  onBlur: ({ value }) =>
                    validateCustomOperatorRolesPrefix(
                      value,
                      { cluster: form.getFieldValue('cluster') },
                      v.operatorRolesPrefix
                    ) || undefined,
                }}
              >
                {(field) => (
                  <FormTextInput
                    field={field}
                    label={rp.operatorPrefixLabel}
                    labelHelp={
                      <>
                        {rp.operatorPrefixHelpLead}{' '}
                        <ExternalLink href={links.ROSA_OIDC_LEARN_MORE}>
                          {rp.operatorPrefixLearnMoreLink}
                        </ExternalLink>
                      </>
                    }
                    isRequired
                    helperText={rp.operatorPrefixHelper}
                  />
                )}
              </form.Field>
            </GridItem>
          </Grid>
          <ClipboardCopy
            variant="expansion"
            copyAriaLabel={rp.clipboardCopyAria}
            isReadOnly
            hoverTip={rp.copyHover}
            clickTip={rp.copyClicked}
            style={{ marginTop: '1rem' }}
          >
            {rosaCommand}
          </ClipboardCopy>
        </ExpandableSection>
      </FormSection>
    </>
  );
};
