import {
  ClipboardCopy,
  ExpandableSection,
  Grid,
  GridItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Section } from '../../../components/Section';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import semver from 'semver';
import { FieldWithAPIErrorAlert } from '../../../components/FieldWithAPIErrorAlert';
import React from 'react';
import PopoverHintWithTitle from '../../../components/PopoverHintWithTitle';
import { OIDCConfigHint } from '../../../components/OIDCConfigHint';
import { useFormContext } from 'react-hook-form';
import { WizSelect } from '../../../components/WizFields/WizSelect';
import ExternalLink from '@/components/Wizards/RosaWizard/common/ExternalLink';
import links from '../../../links';
import { ROSAHCPCluster, ROSAHCPWizardData } from '../../../types';

type RolesAndPoliciesStepProps = Pick<ROSAHCPWizardData, 'roles' | 'oidcConfig'>;

export const RolesAndPolicies = (props: RolesAndPoliciesStepProps) => {
  const { roles, oidcConfig } = props;
  const [isArnsOpen, setIsArnsOpen] = React.useState<boolean>(false);
  const [isOperatorRolesOpen, setIsOperatorRolesOpen] = React.useState<boolean>(true);
  const rp = useRosaHcpWizardStrings().rolesAndPolicies;

  const { control, watch, setValue, getValues } = useFormContext<ROSAHCPCluster>();

  const selectedClusterVersion = getValues('cluster_version');
  const awsInfrastructureAccount = getValues('associated_aws_id');

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
  }, [roles, selectedClusterVersion, rp.installerRoleOptionDisabledDescription]);

  const selectedInstallerArn = watch('installer_role_arn');
  const selectedRole = React.useMemo(
    () => roles.data.find((r) => r.installerRole.value === selectedInstallerArn),
    [roles, selectedInstallerArn]
  );
  const supportRoleOptions = selectedRole?.supportRole ?? [];
  const workerRoleOptions = selectedRole?.workerRole ?? [];

  React.useEffect(() => {
    const subscription = watch((formValues, { name }) => {
      if (name !== 'installer_role_arn') return;
      const installerValue = formValues.installer_role_arn;
      if (!installerValue) {
        setValue('support_role_arn', '');
        setValue('worker_role_arn', '');
        return;
      }
      const role = roles.data.find((r) => r.installerRole.value === installerValue);
      if (role) {
        setValue('support_role_arn', role.supportRole[0]?.value ?? '');
        setValue('worker_role_arn', role.workerRole[0]?.value ?? '');
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, roles, setValue]);

  const rosaCommand = `rosa create operator-roles --prefix "custom-operator-roles-prefix" --oidc-config-id "byo-oidc-config-id" --hosted-cp --installer-role-arn "installer-role-arn`;

  return (
    <>
      <Section label={rp.accountRolesSection}>
        <Grid>
          <GridItem span={7}>
            <FieldWithAPIErrorAlert
              error={roles.error}
              isFetching={roles.isFetching}
              fieldName={rp.installerRoleLabel}
            >
              <WizSelect
                isRequired
                onRefresh={() => void roles.fetch(awsInfrastructureAccount ?? '')}
                labelHelp={
                  <>
                    {rp.installerHelpLead}{' '}
                    <ExternalLink href={links.ROSA_ROLES_LEARN_MORE}>
                      {rp.installerLearnMoreLink}
                    </ExternalLink>
                  </>
                }
                label={rp.installerRoleLabel}
                name="installer_role_arn"
                keyPath="installer_role_arn"
                control={control}
                placeholder={rp.installerPlaceholder}
                options={installerRoleOptions}
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
              <WizSelect
                isRequired
                name="support_role_arn"
                label={rp.supportRoleLabel}
                keyPath="support_role_arn"
                control={control}
                labelHelp={rp.supportHelp}
                placeholder={rp.supportPlaceholder}
                options={supportRoleOptions}
                isDisabled
              />
            </GridItem>
            <GridItem span={7}>
              <WizSelect
                isRequired
                name="worker_role_arn"
                label={rp.workerRoleLabel}
                keyPath="worker_role_arn"
                control={control}
                labelHelp={rp.workerHelp}
                placeholder={rp.workerPlaceholder}
                options={workerRoleOptions}
                isDisabled
              />
            </GridItem>
          </Grid>
        </ExpandableSection>
      </Section>
      <Section label={rp.operatorRolesSection}>
        <Grid>
          <GridItem span={7}>
            <Stack>
              <StackItem>
                <FieldWithAPIErrorAlert
                  error={oidcConfig.error}
                  isFetching={oidcConfig.isFetching}
                  fieldName={rp.oidcLabel}
                >
                  <WizSelect
                    onRefresh={oidcConfig.fetch}
                    control={control}
                    name="byo_oidc_config_id"
                    label={rp.oidcLabel}
                    isRequired
                    labelHelp={rp.oidcHelp}
                    placeholder={rp.oidcPlaceholder}
                    labelHelpTitle={rp.oidcPopoverTitle}
                    options={oidcConfig.data}
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
            <GridItem span={4}>custom_operator_roles_prefix</GridItem>
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
      </Section>
    </>
  );
};
