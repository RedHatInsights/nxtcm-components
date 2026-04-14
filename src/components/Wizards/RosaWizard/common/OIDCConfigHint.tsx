import { ClipboardCopyVariant, Content, ContentVariants } from '@patternfly/react-core';
import { CopyInstruction } from './CopyInstruction';
import { useRosaWizardStrings } from '../RosaWizardStringsContext';

export const OIDCConfigHint = () => {
  const { oidcHint } = useRosaWizardStrings();

  return (
    <>
      <Content component={ContentVariants.p}>{oidcHint.instructions}</Content>
      <CopyInstruction variant={ClipboardCopyVariant.expansion} className="pf-v6-u-text-wrap">
        rosa login --use-auth-code --url https://api.stage.openshift.com
        {/* TODO: This should be at least production */}
      </CopyInstruction>
      <CopyInstruction>rosa create oidc-config</CopyInstruction>
    </>
  );
};
