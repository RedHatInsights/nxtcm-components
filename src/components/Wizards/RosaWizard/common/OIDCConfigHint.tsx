import { ClipboardCopyVariant, Content, ContentVariants } from '@patternfly/react-core';
import { CopyInstruction } from './CopyInstruction';
import { useTranslation } from '../../../../context/TranslationContext';

export const OIDCConfigHint = () => {
  const { t } = useTranslation();
  return (
    <>
      <Content component={ContentVariants.p}>
        {t(
          'Create a new OIDC config ID by running the following commands in your CLI. Then, refresh and select the new config ID from the dropdown.'
        )}
      </Content>
      <CopyInstruction variant={ClipboardCopyVariant.expansion}>
        rosa login --use-auth-code --url https://api.stage.openshift.com
      </CopyInstruction>
      <CopyInstruction>rosa create oidc-config</CopyInstruction>
    </>
  );
};
