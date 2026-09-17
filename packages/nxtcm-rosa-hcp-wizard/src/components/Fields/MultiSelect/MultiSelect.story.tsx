import { useState } from 'react';
import { Form } from '@patternfly/react-core';
import type { OptionGroup } from '../Select/SelectTypes';
import { MultiSelect } from './MultiSelect';

export function MultiPlainHarness() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Form>
      <MultiSelect
        id="ct-multi-plain"
        label="Zones"
        value={value}
        onChange={setValue}
        options={['a', 'b', 'c']}
      />
      <span data-testid="multi-val">{value.length === 0 ? 'none' : value.join(',')}</span>
    </Form>
  );
}

export function MultiRefreshHarness() {
  const [value, setValue] = useState<string[]>([]);
  const [refreshed, setRefreshed] = useState(0);
  return (
    <Form>
      <MultiSelect
        id="ct-multi-refresh"
        label="Items"
        value={value}
        onChange={setValue}
        options={['x']}
        onRefresh={() => setRefreshed((n) => n + 1)}
      />
      <span data-testid="multi-refresh-count">{refreshed}</span>
    </Form>
  );
}

const GROUPED_OPTIONS: OptionGroup<string>[] = [
  {
    label: 'Group A',
    options: ['a1', 'a2'],
  },
  {
    label: 'Group B',
    options: ['b1'],
  },
];

export function MultiGroupedHarness() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Form>
      <MultiSelect
        id="ct-multi-grouped"
        label="Grouped zones"
        value={value}
        onChange={setValue}
        optionGroups={GROUPED_OPTIONS}
      />
      <span data-testid="multi-grouped-val">{value.length === 0 ? 'none' : value.join(',')}</span>
    </Form>
  );
}

export function MultiLoadingHarness() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Form>
      <MultiSelect
        id="ct-multi-loading"
        label="Loading list"
        value={value}
        onChange={setValue}
        options={['x']}
        isLoading
      />
    </Form>
  );
}

export function MultiBadgeHarness() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Form>
      <MultiSelect
        id="ct-multi-badge"
        label="Regions"
        value={value}
        onChange={setValue}
        options={['us-east-1', 'eu-west-1']}
        badgeScreenReaderText="regions selected"
      />
    </Form>
  );
}

export function MultiLegacyToggleHarness() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Form>
      <MultiSelect
        id="ct-multi-legacy"
        label="Legacy toggle"
        value={value}
        onChange={setValue}
        options={['solo', 'pair-a', 'pair-b']}
        checkboxMenuToggle={false}
      />
      <span data-testid="multi-legacy-val">{value.length === 0 ? 'none' : value.join(',')}</span>
    </Form>
  );
}
