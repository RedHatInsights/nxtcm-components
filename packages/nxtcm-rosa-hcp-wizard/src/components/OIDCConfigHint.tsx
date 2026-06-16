import { ClipboardCopyVariant, Content, ContentVariants } from '@patternfly/react-core';
import { CopyInstruction } from './CopyInstruction';
import { useRosaHcpWizardStrings } from '../stringsProvider/RosaHcpWizardStringsContext';

const DEFAULT_ROSA_LOGIN_COMMAND = 'rosa login --use-auth-code --url https://api.openshift.com';

export interface OIDCConfigHintProps {
  /** ROSA login command from the host application. Falls back to a built-in default when omitted. */
  loginCommand?: string;
}

export const OIDCConfigHint = ({ loginCommand }: OIDCConfigHintProps) => {
  const { oidcHint } = useRosaHcpWizardStrings();

  return (
    <>
      <Content component={ContentVariants.p}>{oidcHint.instructions}</Content>
      <CopyInstruction variant={ClipboardCopyVariant.expansion} className="pf-v6-u-text-wrap">
        {loginCommand ?? DEFAULT_ROSA_LOGIN_COMMAND}
      </CopyInstruction>
      <CopyInstruction>rosa create oidc-config</CopyInstruction>
    </>
  );
};
