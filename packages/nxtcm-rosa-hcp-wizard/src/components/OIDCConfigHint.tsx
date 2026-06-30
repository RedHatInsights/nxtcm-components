import { ClipboardCopyVariant, Content, ContentVariants } from '@patternfly/react-core';
import { CopyInstruction } from './CopyInstruction';
import { useRosaHcpWizardStrings } from '../stringsProvider/RosaHcpWizardStringsContext';
import {
  DEFAULT_HOST_PRODUCT,
  ROSA_LOGIN_COMMAND_DEFAULT,
  ROSA_LOGIN_COMMAND_SERVICE,
} from '../constants';

export type OIDCConfigHintProduct = 'acm' | 'ocm' | 'oem';

const PRODUCT_LOGIN_COMMANDS: Record<OIDCConfigHintProduct, string> = {
  acm: ROSA_LOGIN_COMMAND_SERVICE,
  ocm: ROSA_LOGIN_COMMAND_DEFAULT,
  oem: ROSA_LOGIN_COMMAND_DEFAULT,
};

export interface OIDCConfigHintProps {
  /** The consuming product. Defaults to 'acm'. */
  product?: OIDCConfigHintProduct;
}

export const OIDCConfigHint = ({ product = DEFAULT_HOST_PRODUCT }: OIDCConfigHintProps) => {
  const { oidcHint } = useRosaHcpWizardStrings();
  const loginCommand = PRODUCT_LOGIN_COMMANDS[product];

  return (
    <>
      <Content component={ContentVariants.p}>{oidcHint.instructions}</Content>
      <CopyInstruction variant={ClipboardCopyVariant.expansion} className="pf-v6-u-text-wrap">
        {loginCommand}
      </CopyInstruction>
      <CopyInstruction>rosa create oidc-config</CopyInstruction>
    </>
  );
};
