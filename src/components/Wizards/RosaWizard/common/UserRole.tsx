import { Alert, AlertVariant, Title } from '@patternfly/react-core';
import { CopyInstruction } from './CopyInstruction';
import { TabGroup } from './TabGroup';
import PopoverHint from './PopoverHint';

export const UserRole = () => {
  return (
    <>
      <Title headingLevel="h3" className="pf-v6-u-mb-md" size="md">
        First, check if a role exists and is linked with:
      </Title>

      <CopyInstruction
        data-testId="copy-rosa-list-user-role"
        textAriaLabel={`Copyable ROSA rosa list user-role command`}
        className="pf-v6-u-mb-lg"
      >
        rosa list user-role
      </CopyInstruction>

      <Alert
        variant={AlertVariant.info}
        isInline
        isPlain
        title={`If there is an existing role and it's already linked to your Red Hat account, you can continue to step 3`}
        className="pf-v6-u-mb-lg"
      />

      <Title headingLevel="h3" size="md" className="pf-v6-u-mb-lg">
        Next, is there an existing role that isn&apos;t linked?
      </Title>

      <TabGroup
        tabs={[
          {
            'data-testid': 'copy-user-role-tab-no',
            id: 'copy-user-role-tab-no-id',
            title: 'No, create new role',
            body: (
              <>
                <strong>User role </strong>
                <PopoverHint bodyContent="The user role is necessary to validate that your Red Hat user account has permissions to install a cluster in the AWS account." />
                <CopyInstruction
                  data-testid="copy-rosa-create-user-role"
                  textAriaLabel="Copyable ROSA create user-role"
                >
                  rosa create user-role
                </CopyInstruction>
              </>
            ),
          },
          {
            'data-testid': 'copy-user-role-tab-yes',
            id: 'copy-user-role-tab-yes-id',
            title: 'Yes, link existing role',
            body: (
              <CopyInstruction
                data-testid="copy-rosa-link-user-role"
                textAriaLabel="Copyable ROSA link user-role --arn"
              >
                {`rosa link user-role <arn>`}
              </CopyInstruction>
            ),
          },
        ]}
      />
    </>
  );
};
