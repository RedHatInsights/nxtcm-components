import { ClipboardCopy, ExpandableSection, Stack, StackItem } from '@patternfly/react-core';
import { Section } from '../../../components/Section';
import {
  FieldWrapper,
  FieldWrapperBlock,
  FieldWrapperStack,
} from '../../../components/FieldWrapper';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import React from 'react';
import PopoverHintWithTitle from '../../../components/PopoverHintWithTitle';
import { OIDCConfigHint } from '../../../components/OIDCConfigHint';
import { useWatch } from 'react-hook-form';
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
import { RolesAlert } from '../../../components/RolesErrorAlert';

type RolesAndPoliciesStepProps = Pick<ROSAHCPWizardData, 'roles' | 'oidcConfig'>;

export const RolesAndPolicies = (props: RolesAndPoliciesStepProps) => {
  const { roles, oidcConfig } = props;
  const [isArnsOpen, setIsArnsOpen] = React.useState<boolean>(false);
  const [isOperatorRolesOpen, setIsOperatorRolesOpen] = React.useState<boolean>(true);
  const rp = useRosaHcpWizardStrings().rolesAndPolicies;

  const awsInfrastructureAccount = useWatch({ name: 'associated_aws_id' });

  const installerRoleOptions = useInstallerRoleOptions(roles);
  const { supportRoleOptions, workerRoleOptions, isIncompleteRoleSet } = useDependentRoles(roles);
  useUpdateOperatorPrefix();

  const rosaCommand = useRosaCommand();

  const hasNoRoles = !roles.isFetching && !roles.error && roles.data.length === 0;
  const showMissingArnsError = hasNoRoles || isIncompleteRoleSet;

  return (
    <>
      <Section label={rp.accountRolesSection}>
        <FieldWrapperStack>
          {showMissingArnsError || roles.ocmRoleError || roles.userRoleError ? (
            <FieldWrapperBlock>
              <RolesAlert
                showMissingArnsError={showMissingArnsError}
                ocmRoleError={roles.ocmRoleError}
                userRoleError={roles.userRoleError}
              />
            </FieldWrapperBlock>
          ) : null}
          <FieldWrapper width="large">
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
          </FieldWrapper>
        </FieldWrapperStack>
        <ExpandableSection
          isExpanded={isArnsOpen}
          onToggle={() => setIsArnsOpen(!isArnsOpen)}
          toggleText={rp.arnsToggle}
          className="pf-v6-u-mb-lg"
        >
          <FieldWrapperStack>
            <FieldWrapper width="large">
              <WizSelect<ROSAHCPCluster>
                isRequired
                schema={clusterValidationSchema}
                name="support_role_arn"
                options={supportRoleOptions}
                isDisabled
              />
            </FieldWrapper>
            <FieldWrapper width="large">
              <WizSelect<ROSAHCPCluster>
                isRequired
                schema={clusterValidationSchema}
                name="worker_role_arn"
                options={workerRoleOptions}
                isDisabled
              />
            </FieldWrapper>
          </FieldWrapperStack>
        </ExpandableSection>
      </Section>
      <Section label={rp.operatorRolesSection}>
        <FieldWrapperStack>
          <FieldWrapper width="large">
            <Stack>
              <StackItem>
                <WizSelect<ROSAHCPCluster>
                  onRefresh={() => void oidcConfig.fetch(awsInfrastructureAccount)}
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
          </FieldWrapper>
        </FieldWrapperStack>

        <ExpandableSection
          isExpanded={isOperatorRolesOpen}
          onToggle={() => setIsOperatorRolesOpen(!isOperatorRolesOpen)}
          toggleText={rp.operatorPrefixToggle}
        >
          <FieldWrapper width="small">
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
          </FieldWrapper>
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
