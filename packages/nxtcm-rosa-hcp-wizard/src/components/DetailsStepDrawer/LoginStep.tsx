import { RosaLoginInstruction } from '../RosaLoginInstruction';
import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';
import { DEFAULT_HOST_PRODUCT } from '../../constants';
import type { RosaLoginProduct } from '../rosaLoginCommand';

type LoginStepProps = {
  product?: RosaLoginProduct;
};

export const LoginStep = ({ product }: LoginStepProps) => {
  const a = useRosaHcpWizardStrings().associateAwsDrawer;
  const hostProduct = product ?? DEFAULT_HOST_PRODUCT;
  const instructions = hostProduct === 'acm' ? a.loginInstructionsService : a.loginInstructions;

  return (
    <RosaLoginInstruction
      product={product}
      instructions={instructions}
      textAriaLabel={a.loginCopyAriaLabel}
    />
  );
};
