import { Alert, AlertVariant, ClipboardCopy, clipboardCopyFunc, Content, ContentVariants, Title } from "@patternfly/react-core"
import { CopyInstruction } from "./CopyInstruction"
import { TabGroup } from "./TabGroup"
import PopoverHintWithTitle from "./PopoverHitWithTitle"


export const OCMRole = (props: any) => {
    return (
        <>
            <Title headingLevel="h3" className="pf-v6-u-mb-md" size="md">
                First, check if a role exists and is linked with:
            </Title>

           <CopyInstruction>
            rosa list ocm-role
           </CopyInstruction>

                 <Alert
        variant={AlertVariant.info}
        isInline
        isPlain
        title={`If there is an existing role and it's already linked to your Red Hat account, you can continue to step 2.`}
        className="pf-v6-u-mb-lg"
      />

      <Title headingLevel="h3" size="md">
        Next, is there an existing role that isn&apos;t linked?
      </Title>

 <TabGroup
        tabs={[
          {
            'data-testid': 'copy-ocm-role-tab-no',
            id: 'copy-ocm-role-tab-no-id',
            title: 'No, create new role',
            body: (
              <>
                <strong>Basic OCM role</strong>
                <CopyInstruction
                  data-testid="copy-rosa-create-ocm-role"
                  textAriaLabel="Copyable ROSA create ocm-role"
                >
                  rosa create ocm-role
                </CopyInstruction>
                <div className="pf-v6-u-mt-md pf-v6-u-mb-md">OR</div>
                <strong>Admin OCM role</strong>
                <CopyInstruction
                  data-testid="copy-rosa-create-ocm-admin-role"
                  textAriaLabel="Copyable ROSA create ocm-role --admin"
                >
                  rosa create ocm-role --admin
                </CopyInstruction>
                <PopoverHintWithTitle
                  title="Help me decide"
                  bodyContent={
                    <>
                      <Content component={ContentVariants.p} className="pf-v6-u-mb-md">
                        The <strong>basic role</strong> enables OpenShift Cluster Manager to detect
                        the AWS IAM roles and policies required by ROSA.
                      </Content>
                      <Content component={ContentVariants.p}>
                        The <strong>admin role</strong> also enables the detection of the roles and
                        policies. In addition, the admin role enables automatic deployment of the
                        cluster-specific Operator roles and OpenID Connect (OIDC) provider by using
                        OpenShift Cluster Manager.
                      </Content>
                    </>
                  }
                />
              </>
            ),
          },
          {
            'data-testid': 'copy-ocm-role-tab-yes',
            id: 'copy-ocm-role-tab-yes-id',
            title: 'Yes, link existing role',
            body: (
              <>
                <strong> If a role exists but is not linked, link it with:</strong>
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
                  title="You must have organization administrator privileges in your Red Hat account to run this command. After you link the OCM role with your Red Hat organization, it is visible for all users in the organization."
                />
              </>
            ),
          },
        ]}
      />

        </>
    )

}