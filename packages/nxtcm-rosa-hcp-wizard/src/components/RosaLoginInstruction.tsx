import { ClipboardCopyVariant, Content, ContentVariants } from '@patternfly/react-core';
import { CopyInstruction } from './CopyInstruction';
import { useRosaHcpWizardStrings } from '../stringsProvider/RosaHcpWizardStringsContext';
import { DEFAULT_HOST_PRODUCT } from '../constants';
import { getRosaLoginCommand, type RosaLoginProduct } from './rosaLoginCommand';

export type RosaLoginInstructionProps = {
  /** The consuming product. Determines which ROSA login command is shown. Defaults to 'acm'. */
  product?: RosaLoginProduct;
  /** Overrides the default login instructions string. */
  instructions?: string;
  /** When false, only the copyable command is rendered. */
  showInstructions?: boolean;
  textAriaLabel?: string;
};

export const RosaLoginInstruction = ({
  product = DEFAULT_HOST_PRODUCT,
  instructions,
  showInstructions = true,
  textAriaLabel,
}: RosaLoginInstructionProps) => {
  const { rosaLogin } = useRosaHcpWizardStrings();
  const loginCommand = getRosaLoginCommand(product);

  return (
    <>
      {showInstructions ? (
        <Content component={ContentVariants.p}>{instructions ?? rosaLogin.instructions}</Content>
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
