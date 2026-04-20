import {
  ClipboardCopy,
  ExpandableSection,
  Grid,
  GridItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import semver from 'semver';
import { RosaSection, RosaSelect, RosaTextInput } from '../../../Inputs';
import PopoverHintWithTitle from '../../../common/PopoverHitWithTitle';
import { OIDCConfigHint } from '../../../common/OIDCConfigHint';
import { OIDCConfig, Resource, Role } from '../../../../types';
import { createOperatorRolesPrefix } from '../../../helpers';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useRosaWizardStrings } from '../../../RosaWizardStringsContext';
import { FieldWithAPIErrorAlert } from '../../../common/FieldWithAPIErrorAlert';

type RolesAndPoliciesSubStepProps = {
  roles: Resource<Role[], [awsAccount: string]> & {
    fetch: (awsAccount: string) => Promise<void>;
  };
  oidcConfig: Resource<OIDCConfig[]>;
};

export const RolesAndPoliciesSubStep: React.FunctionComponent<RolesAndPoliciesSubStepProps> = ({
  roles,
  oidcConfig,
}) => {
  const rp = useRosaWizardStrings().rolesAndPolicies;

  const [isOperatorRolesOpen, setIsOperatorRolesOpen] = React.useState<boolean>(true);
  const [isArnsOpen, setIsArnsOpen] = React.useState<boolean>(false);
  const { setValue } = useFormContext();
  const cluster = useWatch({ name: 'cluster' });
  const selectedRole = React.useMemo(
    () => roles.data.find((roleSet) => roleSet.installerRole.value === cluster?.installer_role_arn),
    [roles.data, cluster?.installer_role_arn]
  );

  const supportRoles = selectedRole?.supportRole ?? [];
  const workerRoles = selectedRole?.workerRole ?? [];

  React.useEffect(() => {
    if (roles.isFetching || !cluster) {
      return;
    }

    if (cluster.installer_role_arn && !selectedRole) {
      setValue('cluster.installer_role_arn', undefined, { shouldValidate: true });
      setValue('cluster.support_role_arn', undefined, { shouldValidate: true });
      setValue('cluster.worker_role_arn', undefined, { shouldValidate: true });
      return;
    }

    if (selectedRole) {
      if (
        cluster.support_role_arn &&
        !selectedRole.supportRole.some(
          (roleOption) => roleOption.value === cluster.support_role_arn
        )
      ) {
        setValue('cluster.support_role_arn', selectedRole.supportRole[0]?.value, {
          shouldValidate: true,
        });
      }
      if (
        cluster.worker_role_arn &&
        !selectedRole.workerRole.some((roleOption) => roleOption.value === cluster.worker_role_arn)
      ) {
        setValue('cluster.worker_role_arn', selectedRole.workerRole[0]?.value, {
          shouldValidate: true,
        });
      }
    }
  }, [cluster, roles.isFetching, selectedRole, setValue]);

  const selectedClusterVersion = cluster?.cluster_version;

  const installerRoleOptions = React.useMemo(() => {
    const clusterVer =
      selectedClusterVersion && semver.valid(semver.coerce(selectedClusterVersion));
    return roles.data.map((r) => {
      const role = r.installerRole;
      if (!role.roleVersion || !clusterVer) {
        return role;
      }
      const roleVer = semver.valid(semver.coerce(role.roleVersion));
      const disabled = roleVer != null && semver.lt(roleVer, clusterVer);
      return disabled
        ? {
            ...role,
            ariaDisabled: true,
            tooltipProps: { content: rp.installerRoleOptionDisabledDescription },
          }
        : { ...role };
    });
  }, [roles.data, selectedClusterVersion, rp.installerRoleOptionDisabledDescription]);

  const selectedRoleIsDisabled = React.useMemo(() => {
    if (!selectedClusterVersion || !cluster?.installer_role_arn) return false;
    const selected = installerRoleOptions.find((opt) => opt.value === cluster.installer_role_arn);
    return Boolean(selected?.disabled || selected?.ariaDisabled);
  }, [selectedClusterVersion, cluster?.installer_role_arn, installerRoleOptions]);

  React.useEffect(() => {
    if (cluster?.name && !cluster.custom_operator_roles_prefix) {
      setValue('cluster.custom_operator_roles_prefix', createOperatorRolesPrefix(cluster.name), {
        shouldValidate: true,
      });
    }
  }, [cluster?.name, cluster?.custom_operator_roles_prefix, setValue]);

  React.useEffect(() => {
    if (selectedRoleIsDisabled && cluster) {
      setValue('cluster.installer_role_arn', undefined, { shouldValidate: true });
      setValue('cluster.support_role_arn', undefined, { shouldValidate: true });
      setValue('cluster.worker_role_arn', undefined, { shouldValidate: true });
    }
  }, [selectedRoleIsDisabled, cluster, setValue]);

  const onInstallerRoleChange = React.useCallback(
    (installerRoleValue: string | null | undefined) => {
      if (
        installerRoleValue == null ||
        installerRoleValue === '' ||
        installerRoleValue === undefined
      ) {
        setValue('cluster.support_role_arn', undefined, { shouldValidate: true });
        setValue('cluster.worker_role_arn', undefined, { shouldValidate: true });
      } else {
        const role = roles.data.find((r) => r.installerRole.value === installerRoleValue);
        if (role) {
          setValue('cluster.support_role_arn', role.supportRole[0]?.value, { shouldValidate: true });
          setValue('cluster.worker_role_arn', role.workerRole[0]?.value, { shouldValidate: true });
        }
      }
    },
    [roles.data, setValue]
  );

  const rosaCommand = `rosa create operator-roles --prefix "${cluster?.custom_operator_roles_prefix}" --oidc-config-id "${cluster?.byo_oidc_config_id}" --hosted-cp --installer-role-arn ${cluster?.installer_role_arn}`;

  return (
    <>
      <RosaSection label={rp.accountRolesSection}>
        <Grid>
          <GridItem span={7}>
            <FieldWithAPIErrorAlert
              error={roles.error}
              isFetching={roles.isFetching}
              fieldName={rp.installerRoleLabel}
              retry={
                cluster?.associated_aws_id
                  ? () => void roles.fetch(cluster.associated_aws_id)
                  : undefined
              }
            >
              <RosaSelect
                isFill
                path="cluster.installer_role_arn"
                refreshCallback={
                  cluster?.associated_aws_id
                    ? () => void roles.fetch(cluster.associated_aws_id)
                    : undefined
                }
                label={rp.installerRoleLabel}
                disabled={roles.isFetching}
                onValueChange={(installerRoleValue) => {
                  const value =
                    installerRoleValue != null && installerRoleValue !== ''
                      ? String(installerRoleValue)
                      : null;
                  onInstallerRoleChange(value);
                }}
                placeholder={rp.installerPlaceholder}
                labelHelp={
                  <>
                    {rp.installerHelpLead}{' '}
                    <ExternalLink href={links.ROSA_ROLES_LEARN_MORE}>
                      {rp.installerLearnMoreLink}
                    </ExternalLink>
                  </>
                }
                options={installerRoleOptions}
                required
              />
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
              <RosaSelect
                key={`support-${cluster?.installer_role_arn ?? 'none'}`}
                isFill
                path="cluster.support_role_arn"
                label={rp.supportRoleLabel}
                placeholder={rp.supportPlaceholder}
                labelHelp={rp.supportHelp}
                options={supportRoles}
                disabled={true}
                required
              />
            </GridItem>
            <GridItem span={7}>
              <RosaSelect
                key={`worker-${cluster?.installer_role_arn ?? 'none'}`}
                isFill
                path="cluster.worker_role_arn"
                label={rp.workerRoleLabel}
                placeholder={rp.workerPlaceholder}
                labelHelp={rp.workerHelp}
                options={workerRoles}
                disabled={true}
                required
              />
            </GridItem>
          </Grid>
        </ExpandableSection>
      </RosaSection>
      <RosaSection label={rp.operatorRolesSection}>
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
                  <RosaSelect
                    isFill
                    path="cluster.byo_oidc_config_id"
                    refreshCallback={oidcConfig.fetch}
                    label={rp.oidcLabel}
                    required
                    placeholder={rp.oidcPlaceholder}
                    labelHelp={rp.oidcHelp}
                    options={oidcConfig.data.map((config) => ({
                      label: config.label,
                      value: config.value,
                      description: config.issuer_url,
                    }))}
                    disabled={oidcConfig.isFetching}
                  />
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
              <RosaTextInput
                path="cluster.custom_operator_roles_prefix"
                validateOnBlur
                label={rp.operatorPrefixLabel}
                labelHelp={
                  <>
                    {rp.operatorPrefixHelpLead}{' '}
                    <ExternalLink href={links.ROSA_OIDC_LEARN_MORE}>
                      {rp.operatorPrefixLearnMoreLink}
                    </ExternalLink>
                  </>
                }
                helperText={rp.operatorPrefixHelper}
                required
              />
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
      </RosaSection>
    </>
  );
};
