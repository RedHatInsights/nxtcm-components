import React, { useState } from 'react';

import { Form } from '@patternfly/react-core/dist/dynamic/components/Form';

import { Select } from './Select';
import type { OptionGroup } from './SelectTypes';

export interface PlainMenuHarnessProps {
  /** marks the field as required */
  isRequired?: boolean;
  /** disables the field */
  isDisabled?: boolean;
  /** shows validation feedback */
  isError?: boolean;
  /** validation feedback */
  errorMessage?: string;
  /** shows the loading state */
  isLoading?: boolean;
  /** flat options to display */
  options?: string[];
  /** grouped options to display */
  optionGroups?: OptionGroup<string>[];
  /** enables filtering through a combobox */
  isTypeAhead?: boolean;
}

export function PlainMenuHarness({
  options,
  optionGroups,
  ...fieldProps
}: PlainMenuHarnessProps = {}): React.ReactElement {
  const [value, setValue] = useState<string | number | undefined>();
  return (
    <Form>
      <Select<string>
        id="ct-menu-plain"
        label="Region"
        value={value}
        onChange={setValue}
        options={optionGroups ? undefined : (options ?? ['us-east-1', 'eu-west-1'])}
        optionGroups={optionGroups}
        {...fieldProps}
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
