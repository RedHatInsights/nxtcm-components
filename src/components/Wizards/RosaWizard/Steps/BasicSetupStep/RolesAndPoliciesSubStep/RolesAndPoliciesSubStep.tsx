import {
  Section,
  useData,
  useItem,
  WizSelect,
  WizTextInput,
} from '@patternfly-labs/react-form-wizard';
import {
  ClipboardCopy,
  ExpandableSection,
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
import { useTranslation } from '../../../../../../context/TranslationContext';
import { validateCustomOperatorRolesPrefix } from '../../../validators';
import { createOperatorRolesPrefix } from '../../../helpers';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';

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
  const { t } = useTranslation();
  const [isOperatorRolesOpen, setIsOperatorRolesOpen] = React.useState<boolean>(true);
  const [isArnsOpen, setIsArnsOpen] = React.useState<boolean>(false);
  const { cluster } = useItem();
  const { update } = useData();
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

    let hasChanges = false;

    // installer role is no longer available in the refreshed role set
    if (cluster.installer_role_arn && !selectedRole) {
      if (cluster.installer_role_arn) {
        cluster.installer_role_arn = undefined;
        hasChanges = true;
      }
      if (cluster.support_role_arn) {
        cluster.support_role_arn = undefined;
        hasChanges = true;
      }
      if (cluster.worker_role_arn) {
        cluster.worker_role_arn = undefined;
        hasChanges = true;
      }
    }

    // installer is still valid, but child role values may be stale after refresh
    if (selectedRole) {
      if (
        cluster.support_role_arn &&
        !selectedRole.supportRole.some(
          (roleOption) => roleOption.value === cluster.support_role_arn
        )
      ) {
        cluster.support_role_arn = selectedRole.supportRole[0]?.value;
        hasChanges = true;
      }
      if (
        cluster.worker_role_arn &&
        !selectedRole.workerRole.some((roleOption) => roleOption.value === cluster.worker_role_arn)
      ) {
        cluster.worker_role_arn = selectedRole.workerRole[0]?.value;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      update();
    }
  }, [cluster, roles.isFetching, selectedRole, update]);

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
            disabled: true,
            description: t('This account role does not support the selected OpenShift version.'),
          }
        : { ...role };
    });
  }, [roles.data, selectedClusterVersion, t]);

  const selectedRoleIsDisabled = React.useMemo(() => {
    if (!selectedClusterVersion || !cluster?.installer_role_arn) return false;
    const selected = installerRoleOptions.find((opt) => opt.value === cluster.installer_role_arn);
    return Boolean(selected?.disabled);
  }, [selectedClusterVersion, cluster?.installer_role_arn, installerRoleOptions]);

  React.useEffect(() => {
    if (cluster?.name && !cluster.custom_operator_roles_prefix) {
      cluster.custom_operator_roles_prefix = createOperatorRolesPrefix(cluster.name);
      update();
    }
  }, [cluster, update]);

  React.useEffect(() => {
    if (selectedRoleIsDisabled && cluster) {
      cluster.installer_role_arn = undefined;
      cluster.support_role_arn = undefined;
      cluster.worker_role_arn = undefined;
      update();
    }
  }, [selectedRoleIsDisabled, cluster, update]);

  const onInstallerRoleChange = React.useCallback(
    (
      installerRoleValue: string | null | undefined,
      itemFromForm?: { cluster?: Record<string, unknown> }
    ) => {
      const rootItem = itemFromForm ?? (cluster ? { cluster } : null);
      const targetCluster = rootItem?.cluster;
      if (!targetCluster) return;
      if (
        installerRoleValue == null ||
        installerRoleValue === '' ||
        installerRoleValue === undefined
      ) {
        targetCluster.support_role_arn = undefined;
        targetCluster.worker_role_arn = undefined;
      } else {
        const role = roles.data.find((r) => r.installerRole.value === installerRoleValue);
        if (role) {
          targetCluster.support_role_arn = role.supportRole[0]?.value ?? undefined;
          targetCluster.worker_role_arn = role.workerRole[0]?.value ?? undefined;
        }
      }
      // Always call update() so the wizard re-renders with cleared/set support and worker values
      update();
    },
    [roles.data, cluster, update]
  );

  const rosaCommand = `rosa create operator-roles --prefix "${cluster?.custom_operator_roles_prefix}" --oidc-config-id "${cluster?.byo_oidc_config_id}" --hosted-cp --installer-role-arn ${cluster?.installer_role_arn}`;

  return (
    <>
      <Section label={t('Account roles')}>
        <Grid>
          <GridItem span={7}>
            <WizSelect
              isFill
              path="cluster.installer_role_arn"
              label={t('Installer role')}
              disabled={roles.isFetching}
              onValueChange={(installerRoleValue, itemFromForm) => {
                const value =
                  installerRoleValue != null && installerRoleValue !== ''
                    ? String(installerRoleValue)
                    : null;
                onInstallerRoleChange(value, itemFromForm);
              }}
              placeholder={t('Select an Installer role')}
              labelHelp={
                <>
                  {t('An AWS IAM role used by the ROSA installer')}{' '}
                  <ExternalLink href={links.ROSA_ROLES_LEARN_MORE}>
                    Learn more about roles.
                  </ExternalLink>
                </>
              }
              options={installerRoleOptions}
              required
            />
          </GridItem>
        </Grid>
        <ExpandableSection
          isExpanded={isArnsOpen}
          onToggle={() => setIsArnsOpen(!isArnsOpen)}
          toggleText={t('Amazon Resource Names (ARNs)')}
        >
          <Grid hasGutter>
            <GridItem span={7}>
              <WizSelect
                key={`support-${cluster?.installer_role_arn ?? 'none'}`}
                isFill
                path="cluster.support_role_arn"
                label={t('Support role')}
                placeholder={t('Select a support role')}
                labelHelp={t(
                  'An IAM role used by the Red Hat Site Reliability Engineering (SRE) support team. The role is used with the corresponding policy resource to provide the Red Hat SRE support team with the permissions required to support ROSA clusters.'
                )}
                options={supportRoles}
                disabled={roles.isFetching}
                required
              />
            </GridItem>
            <GridItem span={7}>
              <WizSelect
                key={`worker-${cluster?.installer_role_arn ?? 'none'}`}
                isFill
                path="cluster.worker_role_arn"
                label={t('Worker role')}
                placeholder={t('Select a worker role')}
                labelHelp={t(
                  'An IAM role used by the ROSA compute instances. The role is used with the corresponding policy resource to provide the compute instances with the permissions required to manage their components.'
                )}
                options={workerRoles}
                disabled={roles.isFetching}
                required
              />
            </GridItem>
          </Grid>
        </ExpandableSection>
      </Section>
      <Section label="Operator roles">
        <Grid>
          <GridItem span={7}>
            <Stack>
              <StackItem>
                <WizSelect
                  isFill
                  path="cluster.byo_oidc_config_id"
                  label={t('OIDC config ID')}
                  required
                  placeholder={t('Select an OIDC config ID')}
                  labelHelp={t(
                    'The OIDC configuration ID created by running the command: rosa create oidc-config'
                  )}
                  options={oidcConfig.data.map((config) => ({
                    label: config.label,
                    value: config.value,
                    description: config.issuer_url,
                  }))}
                  disabled={oidcConfig.isFetching}
                />
              </StackItem>
              <StackItem>
                <PopoverHintWithTitle
                  displayHintIcon
                  title={t('Create a new OIDC config id')}
                  bodyContent={<OIDCConfigHint />}
                />
              </StackItem>
            </Stack>
          </GridItem>
        </Grid>

        <ExpandableSection
          isExpanded={isOperatorRolesOpen}
          onToggle={() => setIsOperatorRolesOpen(!isOperatorRolesOpen)}
          toggleText={t('Operator role prefix')}
        >
          <Grid>
            <GridItem span={4}>
              <WizTextInput
                validation={validateCustomOperatorRolesPrefix}
                path="cluster.custom_operator_roles_prefix"
                validateOnBlur
                label={t('Operator roles prefix')}
                labelHelp={
                  <>
                    {t('You can specify a custom prefix for the Operator AWS IAM roles.')}{' '}
                    <ExternalLink href={links.ROSA_OIDC_LEARN_MORE}>
                      Learn more and see examples.
                    </ExternalLink>
                  </>
                }
                helperText={t(
                  '32 characters maximum. This is autogenerated by the cluster name, but you can cahnge it.'
                )}
                required
              />
            </GridItem>
          </Grid>
          <ClipboardCopy
            variant="expansion"
            copyAriaLabel="Copy read-only example"
            isReadOnly
            hoverTip={t('Copy')}
            clickTip={t('Copied')}
            style={{ marginTop: '1rem' }}
          >
            {rosaCommand}
          </ClipboardCopy>
        </ExpandableSection>
      </Section>
    </>
  );
};
