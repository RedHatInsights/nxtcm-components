import React, { useState } from 'react';
import { Form } from '@patternfly/react-core';
import { Select } from './Select';

export function PlainMenuHarness() {
  const [value, setValue] = useState<string | number | undefined>();
  return (
    <Form>
      <Select
        id="ct-menu-plain"
        label="Region"
        value={value}
        onChange={setValue}
        options={['us-east-1', 'eu-west-1']}
      />
      <span data-testid="menu-val">{value === undefined ? 'none' : String(value)}</span>
    </Form>
  );
}

export function TypeaheadHarness() {
  const [value, setValue] = useState<string | number | undefined>();
  return (
    <Form>
      <Select
        id="ct-menu-ta"
        label="Subnet"
        value={value}
        onChange={setValue}
        options={['subnet-a', 'subnet-b', 'other-net']}
        isTypeAhead
      />
    </Form>
  );
}

export function RefreshHarness() {
  const [value, setValue] = useState<string | number | undefined>();
  const [refreshed, setRefreshed] = useState(0);
  return (
    <Form>
      <Select
        id="ct-menu-refresh"
        label="VPC"
        value={value}
        onChange={setValue}
        options={['vpc-1']}
        onRefresh={() => setRefreshed((n) => n + 1)}
      />
      <span data-testid="refresh-count">{refreshed}</span>
    </Form>
  );
}
