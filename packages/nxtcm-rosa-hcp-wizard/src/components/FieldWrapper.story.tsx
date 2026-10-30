import { FieldWrapper, type FieldWrapperSize, NestedFields } from './FieldWrapper';

export interface FieldWrapperStoryProps {
  variant: 'field' | 'additional' | 'sized' | 'full' | 'footer';
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
      <FieldWrapper
        size="md"
        footer={
          variant === 'footer' ? (
            <p id="cluster-name-help">Use a unique cluster name.</p>
          ) : undefined
        }
        additionalContent={variant === 'footer' ? <a href="/help">Learn more</a> : undefined}
      >
        <label htmlFor="cluster-name">Cluster name</label>
        <input
          id="cluster-name"
          defaultValue="mycluster"
          aria-describedby={variant === 'footer' ? 'cluster-name-help' : undefined}
        />
      </FieldWrapper>
    </NestedFields>
  );
}
