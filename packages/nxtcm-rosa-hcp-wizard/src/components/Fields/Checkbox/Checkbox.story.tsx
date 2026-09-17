import {
  CHECKBOX_HARNESS_HELPER_TEXT,
  CHECKBOX_HARNESS_LABEL,
  CHECKBOX_HARNESS_TITLE,
} from './Checkbox.story-data';
export {
  CHECKBOX_HARNESS_HELPER_TEXT,
  CHECKBOX_HARNESS_LABEL,
  CHECKBOX_HARNESS_TITLE,
} from './Checkbox.story-data';
import React, { useState, type FormEvent } from 'react';
import { Form } from '@patternfly/react-core';
import { Checkbox } from './Checkbox';

const CHECKBOX_HARNESS_ID = 'ct-checkbox';

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

export function CheckboxErrorStory(): React.ReactElement {
  return (
    <Form>
      <Checkbox
        id="ct-checkbox-err"
        title="Terms"
        label="I agree"
        isChecked={false}
        onChange={() => {}}
        isError
        errorMessage="You must accept to continue."
      />
    </Form>
  );
}
