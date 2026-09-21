import {
  API_TOKEN_FIELD_LABEL,
  CLUSTER_NAME_PLACEHOLDER_TEXT,
  CLUSTER_NAME_HELPER_TEXT,
  CLUSTER_NAME_FIELD_LABEL,
} from './TextInput.story-data';
export {
  SAMPLE_CLUSTER_NAME_VALUE,
  HIDE_PASSWORD_BUTTON_NAME,
  SHOW_PASSWORD_BUTTON_NAME,
  API_TOKEN_FIELD_LABEL,
  CLUSTER_NAME_PLACEHOLDER_TEXT,
  CLUSTER_NAME_HELPER_TEXT,
  CLUSTER_NAME_FIELD_LABEL,
} from './TextInput.story-data';
import React, { useState } from 'react';
import { Form } from '@patternfly/react-core';
import { TextInput } from './TextInput';

export function TextInputHarness() {
  const [value, setValue] = useState('');
  return (
    <Form>
      <TextInput
        id="ct-text"
        name="clusterName"
        label={CLUSTER_NAME_FIELD_LABEL}
        value={value}
        onChange={(_e, v) => setValue(v)}
        helperText={CLUSTER_NAME_HELPER_TEXT}
        placeholder={CLUSTER_NAME_PLACEHOLDER_TEXT}
      />
    </Form>
  );
}

export function SecretHarness() {
  const [value, setValue] = useState('secret123');
  return (
    <Form>
      <TextInput
        id="ct-secret"
        name="token"
        label={API_TOKEN_FIELD_LABEL}
        value={value}
        onChange={(_e, v) => setValue(v)}
        isSecret
        showSecretButton
      />
    </Form>
  );
}
