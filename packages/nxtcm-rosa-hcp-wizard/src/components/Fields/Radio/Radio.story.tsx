import {
  RADIO_HARNESS_SELECTED_STATUS_LABEL,
  RADIO_HARNESS_EAST_DESCRIPTION,
  RADIO_HARNESS_US_WEST_LABEL,
} from './Radio.story-data';
export {
  RADIO_HARNESS_VALUE_WEST,
  RADIO_HARNESS_SELECTED_STATUS_LABEL,
  RADIO_HARNESS_EAST_DESCRIPTION,
  RADIO_HARNESS_US_WEST_LABEL,
} from './Radio.story-data';
import React, { useState } from 'react';
import { Form } from '@patternfly/react-core';
import { Radio } from './Radio';
import { RadioGroupContext } from '../RadioGroup/RadioGroupContext';

/** Strings shared by `Radio.spec.tsx` and this harness */
const RADIO_HARNESS_US_EAST_LABEL = 'US East';

export function TwoRadioHarness() {
  const [value, setValue] = useState<string | undefined>('east');
  return (
    <Form>
      <RadioGroupContext.Provider
        value={{
          value,
          setValue: (v: unknown) => setValue(v as string | undefined),
          radioGroup: 'region-pick',
        }}
      >
        <Radio
          id="r-east"
          label={RADIO_HARNESS_US_EAST_LABEL}
          value="east"
          description={RADIO_HARNESS_EAST_DESCRIPTION}
        />
        <Radio id="r-west" label={RADIO_HARNESS_US_WEST_LABEL} value="west" />
      </RadioGroupContext.Provider>
      <div role="status" aria-label={RADIO_HARNESS_SELECTED_STATUS_LABEL}>
        {value ?? 'none'}
      </div>
    </Form>
  );
}
