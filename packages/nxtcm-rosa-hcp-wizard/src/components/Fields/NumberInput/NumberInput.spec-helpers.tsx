import React, { useState, type SyntheticEvent } from 'react';
import { Form } from '@patternfly/react-core';
import { NumberInput } from './NumberInput';

export const NUMBER_HARNESS_FIELD_LABEL = 'Worker count';

export interface NumberHarnessProps {
  zeroIsUndefined?: boolean;
  initial?: number;
}

export function NumberHarness({ zeroIsUndefined, initial = 2 }: NumberHarnessProps) {
  const [value, setValue] = useState<number | undefined>(initial);
  return (
    <Form>
      <NumberInput
        id="ct-num"
        label={NUMBER_HARNESS_FIELD_LABEL}
        value={value}
        min={0}
        zeroIsUndefined={zeroIsUndefined}
        onChange={(_e: SyntheticEvent, v: number | undefined) => setValue(v)}
      />
    </Form>
  );
}
