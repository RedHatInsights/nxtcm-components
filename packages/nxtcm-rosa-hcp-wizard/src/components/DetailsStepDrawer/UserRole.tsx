import { Alert, AlertVariant, Content, ContentVariants, Title } from '@patternfly/react-core';
import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';
import { CopyInstruction } from '../CopyInstruction';
import { TabGroup } from './TabGroup';
import PopoverHint from '../PopoverHint';

export const UserRole = () => {
  const u = useRosaHcpWizardStrings().userRole;

  return (
    <>
      <Title headingLevel="h4" className="pf-v6-u-mb-md" size="md">
        {u.checkLinkedTitle}
      </Title>

      <CopyInstruction
        data-testid="copy-rosa-list-user-role"
        textAriaLabel={u.copyAriaListUserRole}
        className="pf-v6-u-mb-lg"
      >
        rosa list user-role
      </CopyInstruction>

      <Alert
        variant={AlertVariant.info}
        isInline
        isPlain
        title={u.existingLinkedInfo}
        className="pf-v6-u-mb-lg"
      />

      <Title headingLevel="h4" size="md">
        {u.unlinkedTitle}
      </Title>

      <TabGroup
        tabs={[
          {
            'data-testid': 'copy-user-role-tab-no',
            id: 'copy-user-role-tab-no-id',
            title: u.tabCreateNew,
            body: (
              <>
                <Content component={ContentVariants.p} className="pf-v6-u-font-weight-bold">
                  {u.userRoleLabel}
                  <PopoverHint bodyContent={u.userRolePopover} />
                </Content>
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
            title: u.tabLinkExisting,
            body: (
              <CopyInstruction
                data-testid="copy-rosa-link-user-role"
                textAriaLabel={u.copyAriaLinkUserRole}
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
