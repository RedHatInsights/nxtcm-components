import {
  ClipboardCopy,
  ExpandableSection,
  Grid,
  GridItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Section } from '../../../components/Section';
import {
  useRosaHcpWizardStrings,
  // useRosaHcpWizardValidators,
} from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { FieldWithAPIErrorAlert } from '../../../components/FieldWithAPIErrorAlert';
import React from 'react';
import PopoverHintWithTitle from '../../../components/PopoverHitWithTitle';
import { OIDCConfigHint } from '../../../components/OIDCConfigHint';

export const RolesAndPolicies = () => {
  const [isArnsOpen, setIsArnsOpen] = React.useState<boolean>(false);
  const [isOperatorRolesOpen, setIsOperatorRolesOpen] = React.useState<boolean>(true);

  const rp = useRosaHcpWizardStrings().rolesAndPolicies;
  // const v = useRosaHcpWizardValidators();
  const rosaCommand = `rosa create operator-roles --prefix "custom-operator-roles-prefix" --oidc-config-id "byo-oidc-config-id" --hosted-cp --installer-role-arn "installer-role-arn`;

  return (
    <>
      <Section label={rp.accountRolesSection}>
        <Grid>
          <GridItem span={7}>
            <FieldWithAPIErrorAlert error={''} isFetching={false} fieldName={rp.installerRoleLabel}>
              installer_role_arn
            </FieldWithAPIErrorAlert>
          </GridItem>
        </Grid>
        <ExpandableSection
          isExpanded={isArnsOpen}
          onToggle={() => setIsArnsOpen(!isArnsOpen)}
          toggleText={rp.arnsToggle}
        >
          <Grid hasGutter>
            <GridItem span={7}>support_role_arn</GridItem>
            <GridItem span={7}>worker_role_arn</GridItem>
          </Grid>
        </ExpandableSection>
      </Section>
      <Section label={rp.operatorRolesSection}>
        <Grid>
          <GridItem span={7}>
            <Stack>
              <StackItem>
                <FieldWithAPIErrorAlert error={''} isFetching={false} fieldName={rp.oidcLabel}>
                  byo_oidc_config_id
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
