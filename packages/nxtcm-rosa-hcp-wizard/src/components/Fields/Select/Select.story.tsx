import React, { useState } from 'react';

import { Form } from '@patternfly/react-core/dist/dynamic/components/Form';

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
      <span data-testid="ta-val">{value === undefined ? 'none' : String(value)}</span>
    </Form>
  );
}

export function GroupedTypeaheadHarness() {
  return (
    <Form>
      <Select
        id="ct-menu-ta-grouped"
        label="Subnet"
        value={undefined}
        onChange={() => undefined}
        optionGroups={[
          { label: 'Production', options: ['subnet-a'] },
          { label: 'Development', options: ['subnet-b'] },
        ]}
        isTypeAhead
      />
    </Form>
  );
}

export function LoadingTypeaheadHarness() {
  return (
    <Form>
      <Select
        id="ct-menu-ta-loading"
        label="Subnet"
        value={undefined}
        onChange={() => undefined}
        options={[]}
        isTypeAhead
        isLoading
      />
    </Form>
  );
}

export function PreselectedTypeaheadHarness() {
  const [value, setValue] = useState<string | number | undefined>('subnet-a');
  return (
    <Form>
      <Select
        id="ct-menu-ta-preselected"
        label="Subnet"
        value={value}
        onChange={setValue}
        options={['subnet-a', 'subnet-b', 'other-net']}
        isTypeAhead
      />
      <span data-testid="ta-preselected-val">{value === undefined ? 'none' : String(value)}</span>
    </Form>
  );
}

export function DisabledTypeaheadHarness() {
  return (
    <Form>
      <Select
        id="ct-menu-ta-disabled"
        label="Subnet"
        value=""
        onChange={() => undefined}
        options={['subnet-a']}
        isTypeAhead
        isDisabled
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
