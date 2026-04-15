import { Alert, AlertVariant, Content, ContentVariants, Title } from '@patternfly/react-core';
import { CopyInstruction } from './CopyInstruction';
import { TabGroup } from './TabGroup';
import PopoverHintWithTitle from './PopoverHitWithTitle';
import { useRosaWizardStrings } from '../RosaWizardStringsContext';

/**
 * Walks the user through checking and creating or linking an OCM role, with copyable ROSA CLI commands and tabs.
 */
export const OCMRole = () => {
  const o = useRosaWizardStrings().ocmRole;

  return (
    <>
      <Title headingLevel="h3" className="pf-v6-u-mb-md" size="md">
        {o.checkLinkedTitle}
      </Title>

      <CopyInstruction>rosa list ocm-role</CopyInstruction>

      <Alert
        variant={AlertVariant.info}
        isInline
        isPlain
        title={o.existingLinkedInfo}
        className="pf-v6-u-mb-lg"
      />

      <Title headingLevel="h3" size="md">
        {o.unlinkedTitle}
      </Title>

      <TabGroup
        tabs={[
          {
            'data-testid': 'copy-ocm-role-tab-no',
            id: 'copy-ocm-role-tab-no-id',
            title: o.tabCreateNew,
            body: (
              <>
                <strong>{o.basicOcmRoleLabel}</strong>
                <CopyInstruction
                  data-testid="copy-rosa-create-ocm-role"
                  textAriaLabel="Copyable ROSA create ocm-role"
                >
                  rosa create ocm-role
                </CopyInstruction>
                <div className="pf-v6-u-mt-md pf-v6-u-mb-md">{o.orDivider}</div>
                <strong>{o.adminOcmRoleLabel}</strong>
                <CopyInstruction
                  data-testid="copy-rosa-create-ocm-admin-role"
                  textAriaLabel="Copyable ROSA create ocm-role --admin"
                >
                  rosa create ocm-role --admin
                </CopyInstruction>
                <PopoverHintWithTitle
                  title={o.helpDecideTitle}
                  bodyContent={
                    <>
                      <Content component={ContentVariants.p} className="pf-v6-u-mb-md">
                        {o.helpBasicBody}
                      </Content>
                      <Content component={ContentVariants.p}>{o.helpAdminBody}</Content>
                    </>
                  }
                />
              </>
            ),
          },
          {
            'data-testid': 'copy-ocm-role-tab-yes',
            id: 'copy-ocm-role-tab-yes-id',
            title: o.tabLinkExisting,
            body: (
              <>
                <strong>{o.linkExistingLead}</strong>
                <CopyInstruction
                  data-testid="copy-rosa-link-ocm-role"
                  textAriaLabel={`Copyable rosa link ocm-role <arn> command`}
                >
                  {`rosa link ocm-role <arn>`}
                </CopyInstruction>
                <Alert
                  variant={AlertVariant.info}
                  isInline
                  isPlain
                  className="ocm-instruction-block_alert pf-v6-u-mt-lg"
                  title={o.orgAdminInfo}
                />
              </>
            ),
          },
        ]}
      />
    </>
  );
};
