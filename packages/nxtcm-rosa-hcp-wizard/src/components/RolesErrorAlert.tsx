import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { Content, ContentVariants } from '@patternfly/react-core/dist/dynamic/components/Content';
import { Stack, StackItem } from '@patternfly/react-core/dist/dynamic/layouts/Stack';

import { useRosaHcpWizardStrings } from '../stringsProvider/RosaHcpWizardStringsContext';
import { CopyInstruction } from './CopyInstruction';

type RolesErrorAlertProps = {
  showMissingArnsError: boolean;
  ocmRoleError: string | null;
  userRoleError: string | null;
};

export const RolesAlert = (props: RolesErrorAlertProps) => {
  const { showMissingArnsError, userRoleError, ocmRoleError } = props;
  const rp = useRosaHcpWizardStrings().rolesAndPolicies;

  return (
    <Alert variant="danger" title={rp.rolesAlertTitle}>
      <Stack hasGutter>
        {showMissingArnsError ? (
          <StackItem>
            <Content component={ContentVariants.p}>{rp.accountRolesHelp}</Content>
            <CopyInstruction
              data-testid="copy-rosa-create-account-roles"
              textAriaLabel="Copyable ROSA create account-roles"
            >
              rosa create account-role --hosted-cp
            </CopyInstruction>
          </StackItem>
        ) : null}
        {userRoleError && !ocmRoleError ? (
          <StackItem>
            <Content component={ContentVariants.p}>{rp.userRolesHelp}</Content>
            <CopyInstruction
              data-testid="copy-rosa-create-user-role"
              textAriaLabel="Copyable ROSA create user-role"
            >
              rosa create user-role
            </CopyInstruction>
          </StackItem>
        ) : null}
        {ocmRoleError ? <StackItem>{ocmRoleError}</StackItem> : null}
      </Stack>
    </Alert>
  );
};
