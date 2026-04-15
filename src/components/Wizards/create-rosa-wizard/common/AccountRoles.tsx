import { Alert, AlertVariant, Content, ContentVariants } from '@patternfly/react-core';
import { CopyInstruction } from './CopyInstruction';
import ExternalLink from './ExternalLink';
import links from '../externalLinks';
import { useRosaWizardStrings } from '../RosaWizardStringsContext';

export const AccountRoles = () => {
  const a = useRosaWizardStrings().accountRoles;

  return (
    <>
      <Content component={ContentVariants.p} className="pf-v6-u-mb-lg">
        {a.intro}
      </Content>
      <CopyInstruction
        data-testId="copy-rosa-create-account-role"
        textAriaLabel={a.copyAriaAccountRoles}
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
            {a.manualInstructionsLead}{' '}
            <ExternalLink href={links.AWS_CLI_GETTING_STARTED_MANUAL}>
              {a.manualInstructionsLink}
            </ExternalLink>
            .
          </>
        }
      />
    </>
  );
};
