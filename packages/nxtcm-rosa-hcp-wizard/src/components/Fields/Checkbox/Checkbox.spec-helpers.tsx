import React, { useState, type FormEvent } from 'react';
import { Form } from '@patternfly/react-core';
import { Checkbox } from './Checkbox';

export const CHECKBOX_HARNESS_ID = 'ct-checkbox';
export const CHECKBOX_HARNESS_TITLE = 'Notifications';
export const CHECKBOX_HARNESS_LABEL = 'Send email when the cluster is ready';
export const CHECKBOX_HARNESS_HELPER_TEXT = 'You can change this later.';

export function CheckboxHarness() {
  const [isChecked, setIsChecked] = useState(false);
  return (
    <Form>
      <Checkbox
        id={CHECKBOX_HARNESS_ID}
        title={CHECKBOX_HARNESS_TITLE}
        label={CHECKBOX_HARNESS_LABEL}
        helperText={CHECKBOX_HARNESS_HELPER_TEXT}
        isChecked={isChecked}
        onChange={(_e: FormEvent<HTMLInputElement>, checked: boolean) => setIsChecked(checked)}
      />
    </Form>
  );
}
