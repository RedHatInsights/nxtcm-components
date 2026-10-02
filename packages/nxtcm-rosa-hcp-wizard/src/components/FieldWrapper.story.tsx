// See docs/agent-rules/playwright-ct.md for Playwright component test conventions.
import { FieldWrapper, type FieldWrapperSize, NestedFields } from './FieldWrapper';

export interface FieldWrapperStoryProps {
  variant: 'field' | 'additional' | 'sized' | 'full';
  size?: FieldWrapperSize;
}

export function FieldWrapperStory({ variant, size }: FieldWrapperStoryProps): React.ReactElement {
  if (variant === 'additional') {
    return (
      <NestedFields>
        <FieldWrapper additionalContent={<a href="/help">Learn more</a>}>
          <span>Field label</span>
        </FieldWrapper>
      </NestedFields>
    );
  }
  if (variant === 'sized') {
    return (
      <FieldWrapper size={size}>
        <span>Sized field</span>
      </FieldWrapper>
    );
  }
  if (variant === 'full') {
    return (
      <NestedFields>
        <p>Intro copy</p>
        <FieldWrapper>
          <span>Field label</span>
        </FieldWrapper>
      </NestedFields>
    );
  }
  return (
    <NestedFields>
      <FieldWrapper size="md">
        <span>Cluster name</span>
      </FieldWrapper>
    </NestedFields>
  );
}
