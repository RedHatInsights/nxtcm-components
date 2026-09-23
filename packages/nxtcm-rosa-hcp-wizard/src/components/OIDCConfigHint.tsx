import { Content, ContentVariants } from '@patternfly/react-core';

import { DEFAULT_HOST_PRODUCT } from '../constants';
import { useRosaHcpWizardStrings } from '../stringsProvider/RosaHcpWizardStringsContext';
import { SelectedSecret } from '../types';
import { CopyInstruction } from './CopyInstruction';
import type { RosaLoginProduct } from './rosaLoginCommand';
import { RosaLoginInstruction } from './RosaLoginInstruction';

export type OIDCConfigHintProduct = RosaLoginProduct;

export interface OIDCConfigHintProps {
  /** The consuming product. Defaults to 'acm'. */
  product?: OIDCConfigHintProduct;
  selectedSecret?: SelectedSecret;
}

export const OIDCConfigHint = ({
  product = DEFAULT_HOST_PRODUCT,
  selectedSecret,
}: OIDCConfigHintProps) => {
  const { oidcHint } = useRosaHcpWizardStrings();

  return (
    <>
      <Content component={ContentVariants.p}>{oidcHint.instructions}</Content>
      <RosaLoginInstruction
        product={product}
        showInstructions={false}
        selectedSecret={selectedSecret}
      />
      <CopyInstruction>rosa create oidc-config</CopyInstruction>
    </>
  );
};
