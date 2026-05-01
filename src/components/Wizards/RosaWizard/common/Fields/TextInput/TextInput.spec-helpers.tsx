import React, { useState } from 'react';
import { Form } from '@patternfly/react-core';

import { TextInput } from './TextInput';

/** Strings shared by harness markup and Playwright assertions */
export const CLUSTER_NAME_FIELD_LABEL = 'Cluster name';
export const CLUSTER_NAME_HELPER_TEXT = 'Use letters, numbers, and hyphens.';
export const CLUSTER_NAME_PLACEHOLDER_TEXT = 'Enter the cluster name';

export const API_TOKEN_FIELD_LABEL = 'API token';
export const SHOW_PASSWORD_BUTTON_NAME = 'Show password';
export const HIDE_PASSWORD_BUTTON_NAME = 'Hide password';

export const SAMPLE_CLUSTER_NAME_VALUE = 'my-cluster';

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
