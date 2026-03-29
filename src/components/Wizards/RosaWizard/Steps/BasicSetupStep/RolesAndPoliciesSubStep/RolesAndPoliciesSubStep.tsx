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
import PopoverHintWithTitle from '../../../common/PopoverHitWithTitle';
import { OIDCConfigHint } from '../../../common/OIDCConfigHint';
import { OIDCConfig, Resource, Role } from '../../../../types';
import { validateCustomOperatorRolesPrefix } from '../../../validators';
import { createOperatorRolesPrefix } from '../../../helpers';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useRosaWizardStrings, useRosaWizardValidators } from '../../../RosaWizardStringsContext';
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
  const installerRoles = roles.data.map((roleSet) => roleSet.installerRole);
  const rp = useRosaWizardStrings().rolesAndPolicies;
  const v = useRosaWizardValidators();

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

  React.useEffect(() => {
    if (cluster?.name && !cluster.custom_operator_roles_prefix) {
      cluster.custom_operator_roles_prefix = createOperatorRolesPrefix(cluster.name);
      update();
    }
  }, [cluster, update]);

  const rosaCommand = `rosa create operator-roles --prefix "${cluster?.custom_operator_roles_prefix}" --oidc-config-id "${cluster?.byo_oidc_config_id}" --hosted-cp --installer-role-arn ${cluster?.installer_role_arn}`;

  return (
    <>
      <Section label={rp.accountRolesSection}>
        <Grid>
          <GridItem span={7}>
            <FieldWithAPIErrorAlert
              error={roles.error}
              isFetching={roles.isFetching}
              fieldName={rp.installerRoleLabel}
              retry={
                cluster?.associated_aws_id
                  ? () => void roles.fetch(cluster.associated_aws_id as string)
                  : undefined
              }
            >
              <WizSelect
                isFill
                path="cluster.installer_role_arn"
                label={rp.installerRoleLabel}
                disabled={roles.isFetching}
                onValueChange={(installerRoleArn, _item) => {
                  if (installerRoleArn) {
                    const selected = roles.data.find(
                      (roleSet) => roleSet.installerRole.value === installerRoleArn
                    );
                    cluster.support_role_arn = selected?.supportRole?.[0]?.value;
                    cluster.worker_role_arn = selected?.workerRole?.[0]?.value;
                  } else {
                    cluster.support_role_arn = undefined;
                    cluster.worker_role_arn = undefined;
                  }
                  update();
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
                options={installerRoles}
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
              <WizSelect
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
              <WizSelect
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
                  retry={oidcConfig.fetch ? () => void oidcConfig.fetch?.() : undefined}
                >
                  <WizSelect
                    isFill
                    path="cluster.byo_oidc_config_id"
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
              <WizTextInput
                validation={(value, item) =>
                  validateCustomOperatorRolesPrefix(value, item, v.operatorRolesPrefix)
                }
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
      </Section>
    </>
  );
};
