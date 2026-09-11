import { type FormEvent, type ReactElement } from 'react';
import {
  type Control,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
  useWatch,
} from 'react-hook-form';

import { RosaHcpWizardStringsProvider } from '../../stringsProvider/RosaHcpWizardStringsContext';

/** Playwright CT: `Wiz*` fields resolve `.meta().*Key` copy from `RosaHcpWizardStringsProvider`. */
export function withRosaCt(children: ReactElement): ReactElement {
  return <RosaHcpWizardStringsProvider>{children}</RosaHcpWizardStringsProvider>;
}

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

/** Safe unknown-to-string for {@link WizCtWatchStatus} format callbacks in test harnesses. */
export function formatWatchValue(v: unknown): string {
  if (v == null || v === '') return '(empty)';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return JSON.stringify(v);
}
