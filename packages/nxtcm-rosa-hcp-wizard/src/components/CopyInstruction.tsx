import {
  ClipboardCopy,
  clipboardCopyFunc,
} from '@patternfly/react-core/dist/dynamic/components/ClipboardCopy';
import { Content, ContentVariants } from '@patternfly/react-core/dist/dynamic/components/Content';

type CopyInstructionProps = {
  children: string;
  className?: string;
  textAriaLabel?: string;
  variant?: 'inline' | 'expansion' | 'inline-compact';
};

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
