import { Alert, AlertVariant, Content, ContentVariants } from '@patternfly/react-core';
import { CopyInstruction } from './CopyInstruction';
import ExternalLink from './ExternalLink';
import links from '../externalLinks';

export const AccountRoles = () => {
  return (
    <>
      <Content component={ContentVariants.p} className="pf-v6-u-mb-lg">
        To create the necessary account-wide roles and policies quickly, use the default auto method
        that&apos;s provided by the ROSA CLI.
      </Content>
      <CopyInstruction
        data-testId="copy-rosa-create-account-role"
        textAriaLabel={`Copyable ROSA rosa create account-roles --hosted-cp --mode auto command`}
        className="pf-v6-u-mb-lg"
      >
        rosa create account-roles --hosted-cp --mode auto
      </CopyInstruction>

      <Alert
        variant={AlertVariant.info}
        isInline
        isPlain
        className="pf-v6-u-mb-lg"
        title={
          <>
            If you would prefer to manually create the required roles and policies within your AWS
            account, then follow{' '}
            <ExternalLink href={links.AWS_CLI_GETTING_STARTED_MANUAL} noIcon>
              these instructions
            </ExternalLink>
            .
          </>
        }
      />
    </>
  );
};
