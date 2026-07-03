import {
  ClipboardCopyVariant,
  Content,
  ContentVariants,
  ExpandableSection,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Section } from '../../../components/Section';
import { FieldWrapper, NestedFields } from '../../../components/FieldWrapper';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import React from 'react';
import PopoverHintWithTitle from '../../../components/PopoverHintWithTitle';
import { OIDCConfigHint, OIDCConfigHintProduct } from '../../../components/OIDCConfigHint';
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
import { RosaLoginInstruction } from '../../../components/RosaLoginInstruction';
import { CopyInstruction } from '../../../components/CopyInstruction';

type RolesAndPoliciesStepProps = Pick<ROSAHCPWizardData, 'roles' | 'oidcConfig'> & {
  /** The consuming product. Determines which ROSA login command is shown. Defaults to 'acm'. */
  product?: OIDCConfigHintProduct;
};

export const RolesAndPolicies = (props: RolesAndPoliciesStepProps) => {
  const { roles, oidcConfig, product } = props;
  const [isArnsOpen, setIsArnsOpen] = React.useState<boolean>(false);
  const [isOperatorRolesOpen, setIsOperatorRolesOpen] = React.useState<boolean>(false);
  const rp = useRosaHcpWizardStrings().rolesAndPolicies;

  const oidcConfigHintContent = <OIDCConfigHint product={product} />;
  const oidcConfigHintMaxWidth = '25rem';

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
        {showMissingArnsError || roles.ocmRoleError || roles.userRoleError ? (
          <RolesAlert
            showMissingArnsError={showMissingArnsError}
            ocmRoleError={roles.ocmRoleError}
            userRoleError={roles.userRoleError}
          />
        ) : null}
        <FieldWrapper size="lg">
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
            data-testid="installer-role-select"
          />
        </FieldWrapper>
        <ExpandableSection
          isExpanded={isArnsOpen}
          onToggle={() => setIsArnsOpen(!isArnsOpen)}
          toggleText={rp.arnsToggle}
          className="pf-v6-u-mb-lg"
        >
          <NestedFields>
            <FieldWrapper size="lg">
              <WizSelect<ROSAHCPCluster>
                isRequired
                schema={clusterValidationSchema}
                name="support_role_arn"
                options={supportRoleOptions}
                isDisabled
              />
            </FieldWrapper>
            <FieldWrapper size="lg">
              <WizSelect<ROSAHCPCluster>
                isRequired
                schema={clusterValidationSchema}
                name="worker_role_arn"
                options={workerRoleOptions}
                isDisabled
              />
            </FieldWrapper>
          </NestedFields>
        </ExpandableSection>
      </Section>
      <Section label={rp.operatorRolesSection}>
        <FieldWrapper
          size="lg"
          additionalContent={
            <PopoverHintWithTitle
              displayHintIcon
              title={rp.oidcPopoverTitle}
              bodyContent={oidcConfigHintContent}
              maxWidth={oidcConfigHintMaxWidth}
            />
          }
        >
          <WizSelect<ROSAHCPCluster>
            onRefresh={() => void oidcConfig.fetch(awsInfrastructureAccount)}
            apiError={oidcConfig.error}
            isLoading={oidcConfig.isFetching}
            schema={clusterValidationSchema}
            name="byo_oidc_config_id"
            isRequired
            options={oidcConfig.data}
            labelHelp={oidcConfigHintContent}
            labelHelpMaxWidth={oidcConfigHintMaxWidth}
            data-testid="oidc-config-select"
          />
        </FieldWrapper>

        <ExpandableSection
          isExpanded={isOperatorRolesOpen}
          onToggle={() => setIsOperatorRolesOpen(!isOperatorRolesOpen)}
          toggleText={rp.operatorPrefixToggle}
          className="pf-v6-u-mb-lg"
        >
          <NestedFields>
            <FieldWrapper size="sm">
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
          </NestedFields>
        </ExpandableSection>

        <span className="pf-v6-c-form__label pf-v6-u-display-block pf-v6-u-mb-sm">
          <span className="pf-v6-c-form__label-text">{rp.operatorRolesCreateLabel}</span>
        </span>
        <Stack hasGutter>
          <StackItem>
            <Content component={ContentVariants.p}>{rp.operatorRolesCreateInstructions}</Content>
          </StackItem>
          <StackItem>
            <RosaLoginInstruction product={product} showInstructions={false} />
          </StackItem>
          <StackItem>
            <CopyInstruction
              variant={ClipboardCopyVariant.expansion}
              textAriaLabel={rp.operatorRolesCreateCommandAriaLabel}
            >
              {rosaCommand}
            </CopyInstruction>
          </StackItem>
        </Stack>
      </Section>
    </>
  );
};
