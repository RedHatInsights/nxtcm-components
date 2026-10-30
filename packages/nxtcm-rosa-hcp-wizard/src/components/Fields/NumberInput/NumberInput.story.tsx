import React, { type SyntheticEvent, useState } from 'react';

import { Form } from '@patternfly/react-core/dist/dynamic/components/Form';

import { NumberInput } from './NumberInput';

const NUMBER_HARNESS_FIELD_LABEL = 'Worker count';

export interface NumberHarnessProps {
  zeroIsUndefined?: boolean;
  initial?: number;
  helperText?: string;
  errorMessage?: string;
  isError?: boolean;
}

export function NumberHarness({
  zeroIsUndefined,
  initial = 2,
  helperText,
  errorMessage,
  isError,
}: NumberHarnessProps) {
  const [value, setValue] = useState<number | undefined>(initial);
  return (
    <Form>
      <NumberInput
        id="ct-num"
        label={NUMBER_HARNESS_FIELD_LABEL}
        value={value}
        min={0}
        zeroIsUndefined={zeroIsUndefined}
        helperText={helperText}
        errorMessage={errorMessage}
        isError={isError}
        onChange={(_e: SyntheticEvent, v: number | undefined) => setValue(v)}
      />
    </Form>
  );
}
