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
import React from 'react';
import PopoverHintWithTitle from '../../../components/PopoverHintWithTitle';
import { OIDCConfigHint } from '../../../components/OIDCConfigHint';
import { useFormContext, useWatch } from 'react-hook-form';
import { WizSelect } from '../../../components/WizFields/WizSelect';
import ExternalLink from '../../../components/ExternalLink';
import links from '../../../constants/links';
import { ROSAHCPCluster, ROSAHCPWizardData } from '../../../types';
import { useDependentRoles } from './useDependentRoles';
import { clusterValidationSchema } from '../../../yupSchemas';
import { WizTextInput } from '../../../components/WizFields/WizTextInput';
import { useUpdateOperatorPrefix } from './useUpdateOperatorPrefix';
import { useInstallerRoleOptions } from './useInstallerRoleOptions';
import { useRosaCommand } from './useRosaCommand';

type RolesAndPoliciesStepProps = Pick<ROSAHCPWizardData, 'roles' | 'oidcConfig'>;

export const RolesAndPolicies = (props: RolesAndPoliciesStepProps) => {
  const { roles, oidcConfig } = props;
  const [isArnsOpen, setIsArnsOpen] = React.useState<boolean>(false);
  const [isOperatorRolesOpen, setIsOperatorRolesOpen] = React.useState<boolean>(true);
  const rp = useRosaHcpWizardStrings().rolesAndPolicies;

  const { setValue } = useFormContext<Partial<ROSAHCPCluster>>();
  const awsInfrastructureAccount = useWatch({ name: 'associated_aws_id' });
  const selectedClusterVersion = useWatch({ name: 'cluster_version' });
  const installerRoleArn = useWatch({ name: 'installer_role_arn' });

  const installerRoleOptions = useInstallerRoleOptions(roles);
  const { supportRoleOptions, workerRoleOptions } = useDependentRoles(roles);
  useUpdateOperatorPrefix();

  const selectedRoleIsDisabled = React.useMemo(() => {
    if (!selectedClusterVersion || !installerRoleArn) return false;
    const selected = installerRoleOptions.find((opt) => opt.value === installerRoleArn);
    return Boolean(selected?.disabled || selected?.ariaDisabled);
  }, [selectedClusterVersion, installerRoleArn, installerRoleOptions]);

  React.useEffect(() => {
    if (!selectedRoleIsDisabled) return;
    setValue('installer_role_arn', '', { shouldDirty: true, shouldValidate: true });
    setValue('support_role_arn', '', { shouldDirty: true, shouldValidate: true });
    setValue('worker_role_arn', '', { shouldDirty: true, shouldValidate: true });
  }, [selectedRoleIsDisabled, setValue]);

  const rosaCommand = useRosaCommand();

  return (
    <>
      <Section label={rp.accountRolesSection}>
        <Grid>
          <GridItem span={7}>
            <WizSelect<ROSAHCPCluster>
              schema={clusterValidationSchema}
              apiError={roles.error}
              isLoading={roles.isFetching}
              onRefresh={() =>
                void (awsInfrastructureAccount && roles.fetch(awsInfrastructureAccount))
              }
              labelHelp={
                <>
                  {rp.installerHelpLead}{' '}
                  <ExternalLink href={links.ROSA_ROLES_LEARN_MORE}>
                    {rp.installerLearnMoreLink}
                  </ExternalLink>
                </>
              }
              name="installer_role_arn"
              options={installerRoleOptions}
            />
          </GridItem>
        </Grid>
        <ExpandableSection
          isExpanded={isArnsOpen}
          onToggle={() => setIsArnsOpen(!isArnsOpen)}
          toggleText={rp.arnsToggle}
          className="pf-v6-u-mb-lg"
        >
          <Grid hasGutter>
            <GridItem span={7}>
              <WizSelect<ROSAHCPCluster>
                isRequired
                schema={clusterValidationSchema}
                name="support_role_arn"
                options={supportRoleOptions}
                isDisabled
              />
            </GridItem>
            <GridItem span={7}>
              <WizSelect<ROSAHCPCluster>
                isRequired
                schema={clusterValidationSchema}
                name="worker_role_arn"
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
                <WizSelect<ROSAHCPCluster>
                  onRefresh={oidcConfig.fetch}
                  apiError={oidcConfig.error}
                  isLoading={oidcConfig.isFetching}
                  schema={clusterValidationSchema}
                  name="byo_oidc_config_id"
                  isRequired
                  options={oidcConfig.data}
                />
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
              <WizTextInput<ROSAHCPCluster>
                name="custom_operator_roles_prefix"
                schema={clusterValidationSchema}
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
      </Section>
    </>
  );
};
