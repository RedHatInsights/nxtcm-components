import { ClipboardCopyVariant, Content, ContentVariants } from '@patternfly/react-core';
import { CopyInstruction } from './CopyInstruction';
import { useRosaHcpWizardStrings } from '../stringsProvider/RosaHcpWizardStringsContext';
import { DEFAULT_HOST_PRODUCT } from '../constants';
import { getRosaLoginCommand, type RosaLoginProduct } from './rosaLoginCommand';
import { SelectedSecret } from '../types';

export type RosaLoginInstructionProps = {
  /** The consuming product. Determines which ROSA login command is shown. Defaults to 'acm'. */
  product?: RosaLoginProduct;
  /** Overrides the default login instructions string. */
  instructions?: string;
  /** When false, only the copyable command is rendered. */
  showInstructions?: boolean;
  textAriaLabel?: string;
  selectedSecret?: SelectedSecret;
};

export const RosaLoginInstruction = ({
  product = DEFAULT_HOST_PRODUCT,
  instructions,
  showInstructions = true,
  textAriaLabel,
  selectedSecret,
}: RosaLoginInstructionProps) => {
  const { rosaLogin } = useRosaHcpWizardStrings();
  const loginCommand = getRosaLoginCommand(product, selectedSecret);
  const defaultInstructions =
    product === 'acm' ? rosaLogin.instructionsService : rosaLogin.instructions;

  return (
    <>
      {showInstructions ? (
        <Content component={ContentVariants.p}>{instructions ?? defaultInstructions}</Content>
      ) : null}
      <CopyInstruction
        variant={ClipboardCopyVariant.expansion}
        className="pf-v6-u-text-wrap"
        textAriaLabel={textAriaLabel ?? rosaLogin.copyAriaLabel}
      >
        {loginCommand}
      </CopyInstruction>
    </>
  );
};
