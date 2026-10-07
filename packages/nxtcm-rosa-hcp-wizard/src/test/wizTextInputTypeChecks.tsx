import { createFormControl } from 'react-hook-form';

import { WizTextInput, type WizTextInputProps } from '../components/WizFields/WizTextInput';
import { FIELD_NAME } from '../constants';

type CustomFormValues = {
  profile: { notes?: string; count: number };
  status: 'ready' | 'pending';
  missing: undefined;
};

/** Compile-only API checks, verified by npm run type-check. */
export function checkWizTextInputTypes(): void {
  void (<WizTextInput name={FIELD_NAME.HTTP_PROXY_URL} />);
  void ({ name: 'name' } satisfies WizTextInputProps);

  // @ts-expect-error Default form typing must reject unknown wizard paths.
  void (<WizTextInput name="unknown_field" />);
  // @ts-expect-error A text input cannot write strings to a boolean field.
  void (<WizTextInput name={FIELD_NAME.AUTOSCALING} />);
  // @ts-expect-error A text input cannot write strings to a numeric field.
  void (<WizTextInput name={FIELD_NAME.NODES_COMPUTE} />);
  // @ts-expect-error A text input cannot replace an array with a string.
  void (<WizTextInput name={FIELD_NAME.SECURITY_GROUPS_WORKER} />);
  // @ts-expect-error Enum fields cannot accept arbitrary input text.
  void (<WizTextInput name={FIELD_NAME.CLUSTER_PRIVACY_FIELD.NAME} />);

  void (<WizTextInput<CustomFormValues> name="profile.notes" />);
  // @ts-expect-error Explicit custom forms must still reject non-string values.
  void (<WizTextInput<CustomFormValues> name="profile.count" />);
  // @ts-expect-error String literal unions cannot accept arbitrary input text.
  void (<WizTextInput<CustomFormValues> name="status" />);
  // @ts-expect-error An undefined-only field cannot accept a string.
  void (<WizTextInput<CustomFormValues> name="missing" />);

  const { control } = createFormControl<CustomFormValues>();
  void (<WizTextInput control={control} name="profile.notes" />);
  // @ts-expect-error The field name cannot widen the form inferred from control.
  void (<WizTextInput control={control} name="name" />);
}
