import { Content, ContentVariants, ClipboardCopy, clipboardCopyFunc } from '@patternfly/react-core';
import './CopyInstruction.css';

type CopyInstructionProps = {
  children: string;
  className?: string;
  textAriaLabel?: string;
  variant?: 'inline' | 'expansion' | 'inline-compact';
};

export const CopyInstruction: React.FunctionComponent<CopyInstructionProps> = ({
  children,
  className,
  textAriaLabel,
  variant,
  ...rest
}) => {
  const contentClassName = ['copy-instruction', className].filter(Boolean).join(' ');

  return (
    <Content component={ContentVariants.pre} className={contentClassName}>
      <ClipboardCopy
        variant={variant}
        isReadOnly
        textAriaLabel={textAriaLabel}
        onCopy={(event, text) => {
          clipboardCopyFunc(event, text);
        }}
        {...rest}
      >
        {children}
      </ClipboardCopy>
    </Content>
  );
};
