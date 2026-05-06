import { Alert, AlertVariant, Content, ContentVariants, Title } from '@patternfly/react-core';
import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';
import { CopyInstruction } from '../CopyInstruction';
import { TabGroup } from '../TabGroup';
import PopoverHintWithTitle from '../PopoverHitWithTitle';

export const OCMRole = () => {
  const { ocmRole: o, associateAwsDrawer: a } = useRosaHcpWizardStrings();

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
                <Content component={ContentVariants.p} className="pf-v6-u-font-weight-bold">
                  {o.basicOcmRoleLabel}
                </Content>
                <CopyInstruction
                  data-testid="copy-rosa-create-ocm-role"
                  textAriaLabel={a.createOCMRoleAriaLabel}
                >
                  rosa create ocm-role
                </CopyInstruction>
                <div className="pf-v6-u-mt-md pf-v6-u-mb-md">{o.orDivider}</div>
                <Content component={ContentVariants.p} className="pf-v6-u-font-weight-bold">
                  {o.adminOcmRoleLabel}
                </Content>
                <CopyInstruction
                  data-testid="copy-rosa-create-ocm-admin-role"
                  textAriaLabel={a.createOCMRoleAdminAriaLabel}
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
                <Content component={ContentVariants.p} className="pf-v6-u-font-weight-bold">
                  {o.linkExistingLead}
                </Content>
                <CopyInstruction
                  data-testid="copy-rosa-link-ocm-role"
                  textAriaLabel={a.linkOCMRoleAriaLabel}
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
