import { useState } from 'react';

import { Form } from '@patternfly/react-core/dist/dynamic/components/Form';

import type { OptionGroup } from '../Select/SelectTypes';
import { MultiSelect, type MultiSelectProps } from './MultiSelect';

export interface MultiPlainHarnessProps {
  /** shows validation feedback */
  isError?: boolean;
  /** validation feedback */
  errorMessage?: string;
  /** shows the loading state */
  isLoading?: boolean;
  /** flat options to display */
  options?: string[];
}

export function MultiPlainHarness(fieldProps: MultiPlainHarnessProps = {}): React.ReactElement {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Form>
      <MultiSelect
        id="ct-multi-plain"
        label="Zones"
        value={value}
        onChange={setValue}
        options={['a', 'b', 'c']}
        {...fieldProps}
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

export interface MultiGroupedHarnessProps {
  /** heading level for grouped option labels */
  groupHeadingLevel?: MultiSelectProps<string>['groupHeadingLevel'];
  /** adds the heading hierarchy around the grouped field */
  headingContext?: boolean;
}

export function MultiGroupedHarness({
  groupHeadingLevel,
  headingContext,
}: MultiGroupedHarnessProps = {}) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Form>
      {headingContext ? (
        <>
          <h1>Wizard</h1>
          <h2>Basic setup</h2>
          <h3>Details</h3>
        </>
      ) : null}
      <MultiSelect
        id="ct-multi-grouped"
        label="Grouped zones"
        value={value}
        onChange={setValue}
        optionGroups={GROUPED_OPTIONS}
        groupHeadingLevel={groupHeadingLevel}
      />
      <span data-testid="multi-grouped-val">{value.length === 0 ? 'none' : value.join(',')}</span>
    </Form>
  );
}

export function MultiAriaDisabledSelectedHarness(): React.ReactElement {
  const [value, setValue] = useState<string[]>(['a']);
  return (
    <Form>
      <MultiSelect
        id="ct-multi-aria-disabled"
        label="Zones"
        value={value}
        onChange={setValue}
        options={[
          { label: 'a', value: 'a', ariaDisabled: true },
          { label: 'b', value: 'b' },
        ]}
      />
      <span data-testid="multi-aria-disabled-val">{value.join(',')}</span>
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
