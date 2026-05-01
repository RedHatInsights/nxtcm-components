import React, { useState } from 'react';
import { Form } from '@patternfly/react-core';

import { RadioGroup, Radio } from './RadioGroup';

/** Strings shared by `RadioGroup.spec.tsx` and these harnesses */
export const RADIO_GROUP_HARNESS_MACHINE_TYPE_LABEL = 'Machine type';
export const RADIO_GROUP_HARNESS_HELPER_TEXT = 'Pick the size that matches your workload.';
export const RADIO_GROUP_HARNESS_SMALL_LABEL = 'Small';
export const RADIO_GROUP_HARNESS_LARGE_LABEL = 'Large';
export const RADIO_GROUP_HARNESS_SELECTED_STATUS_LABEL = 'Selected machine type';
export const RADIO_GROUP_HARNESS_VALUE_LARGE = 'large';
export const RADIO_GROUP_HARNESS_VALUE_SMALL = 'small';

export const RADIO_GROUP_HARNESS_PLAN_LABEL = 'Plan';
export const RADIO_GROUP_HARNESS_PLAN_A_LABEL = 'Plan A';
export const RADIO_GROUP_HARNESS_PLAN_B_LABEL = 'Plan B';
export const RADIO_GROUP_HARNESS_PLAN_A_EXTRA_DETAILS = 'Extra details for plan A.';

export function RadioGroupHarness() {
  const [value, setValue] = useState<string | undefined>(RADIO_GROUP_HARNESS_VALUE_SMALL);
  return (
    <Form>
      <RadioGroup
        id="ct-rg"
        label={RADIO_GROUP_HARNESS_MACHINE_TYPE_LABEL}
        value={value}
        onChange={(v) => setValue(v as string | undefined)}
        helperText={RADIO_GROUP_HARNESS_HELPER_TEXT}
      >
        <Radio
          id="opt-s"
          label={RADIO_GROUP_HARNESS_SMALL_LABEL}
          value={RADIO_GROUP_HARNESS_VALUE_SMALL}
        />
        <Radio
          id="opt-l"
          label={RADIO_GROUP_HARNESS_LARGE_LABEL}
          value={RADIO_GROUP_HARNESS_VALUE_LARGE}
        />
      </RadioGroup>
      <div role="status" aria-label={RADIO_GROUP_HARNESS_SELECTED_STATUS_LABEL}>
        {value ?? 'none'}
      </div>
    </Form>
  );
}

export function RadioWithChildHarness() {
  const [value, setValue] = useState<string | undefined>('a');
  return (
    <Form>
      <RadioGroup
        id="ct-rg-child"
        label={RADIO_GROUP_HARNESS_PLAN_LABEL}
        value={value}
        onChange={(v) => setValue(v as string)}
      >
        <Radio id="opt-a" label={RADIO_GROUP_HARNESS_PLAN_A_LABEL} value="a">
          <p>{RADIO_GROUP_HARNESS_PLAN_A_EXTRA_DETAILS}</p>
        </Radio>
        <Radio id="opt-b" label={RADIO_GROUP_HARNESS_PLAN_B_LABEL} value="b" />
      </RadioGroup>
    </Form>
  );
}
