import { Content, ContentVariants, ClipboardCopy, clipboardCopyFunc } from '@patternfly/react-core';

/** Props for read-only clipboard UI that displays a command or snippet users can copy. */
type CopyInstructionProps = {
  children: string;
  className?: string;
  textAriaLabel?: string;
  variant?: 'inline' | 'expansion' | 'inline-compact';
};

/**
 * Shows CLI or instruction text in a preformatted block with PatternFly clipboard copy behavior.
 */
export const CopyInstruction: React.FunctionComponent<CopyInstructionProps> = (props) => {
  return (
    <Content component={ContentVariants.pre}>
      <ClipboardCopy
        variant={props.variant}
        isReadOnly
        textAriaLabel={props.textAriaLabel}
        onCopy={(event, text) => {
          clipboardCopyFunc(event, text);
        }}
        {...props}
      >
        {props.children}
      </ClipboardCopy>
    </Content>
  );
};
