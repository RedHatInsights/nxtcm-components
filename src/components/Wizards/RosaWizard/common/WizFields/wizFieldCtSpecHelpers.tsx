import { type FormEvent } from 'react';
import {
  type Control,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
  useWatch,
} from 'react-hook-form';

/** Playwright CT: runs resolver validation without a success handler (errors surface on the field). */
export function wizCtSubmitValidationPreview<T extends FieldValues>(
  methods: UseFormReturn<T>
): (event: FormEvent<HTMLFormElement>) => void {
  return (event) => {
    event.preventDefault();
    void methods.handleSubmit(() => {})(event);
  };
}

export interface WizCtWatchStatusProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  ariaLabel: string;
  format: (value: unknown) => string;
}

/**
 * Playwright CT: mirrors {@link useWatch} for assertions. Uses `role="status"` and a human-readable
 * `aria-label` so tests query the live value the way a screen reader would, without `data-testid`.
 */
export function WizCtWatchStatus<T extends FieldValues>({
  control,
  name,
  ariaLabel,
  format,
}: WizCtWatchStatusProps<T>) {
  const value = useWatch({ control, name });
  return (
    <span role="status" aria-label={ariaLabel}>
      {format(value)}
    </span>
  );
}
