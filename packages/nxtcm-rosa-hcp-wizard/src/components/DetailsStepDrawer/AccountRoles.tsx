import { Alert, AlertVariant } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { Content, ContentVariants } from '@patternfly/react-core/dist/dynamic/components/Content';

import { awsLinks } from '../../constants/links';
import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';
import { CopyInstruction } from '../CopyInstruction';
import ExternalLink from '../ExternalLink';

export const AccountRoles = () => {
  const a = useRosaHcpWizardStrings().accountRoles;

  return (
    <>
      <Content component={ContentVariants.p} className="pf-v6-u-mb-lg">
        {a.intro}
      </Content>
      <CopyInstruction
        data-testid="copy-rosa-create-account-role"
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
            <ExternalLink href={awsLinks.AWS_CLI_GETTING_STARTED_MANUAL}>
              {a.manualInstructionsLink}
            </ExternalLink>
            .
          </>
        }
      />
    </>
  );
};
