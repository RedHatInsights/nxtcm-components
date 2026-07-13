import { Content, ContentVariants } from '@patternfly/react-core';
import { CopyInstruction } from './CopyInstruction';
import { RosaLoginInstruction } from './RosaLoginInstruction';
import { useRosaHcpWizardStrings } from '../stringsProvider/RosaHcpWizardStringsContext';
import { DEFAULT_HOST_PRODUCT } from '../constants';
import type { RosaLoginProduct } from './rosaLoginCommand';

export type OIDCConfigHintProduct = RosaLoginProduct;

export interface OIDCConfigHintProps {
  /** The consuming product. Defaults to 'acm'. */
  product?: OIDCConfigHintProduct;
}

export const OIDCConfigHint = ({ product = DEFAULT_HOST_PRODUCT }: OIDCConfigHintProps) => {
  const { oidcHint } = useRosaHcpWizardStrings();

  return (
    <>
      <Content component={ContentVariants.p}>{oidcHint.instructions}</Content>
      <RosaLoginInstruction product={product} showInstructions={false} />
      <CopyInstruction>rosa create oidc-config</CopyInstruction>
    </>
  );
};
