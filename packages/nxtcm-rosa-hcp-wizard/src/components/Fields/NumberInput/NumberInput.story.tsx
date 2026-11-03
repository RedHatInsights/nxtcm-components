import React, { type SyntheticEvent, useState } from 'react';

import { Form } from '@patternfly/react-core/dist/dynamic/components/Form';

import { NumberInput } from './NumberInput';

const NUMBER_HARNESS_FIELD_LABEL = 'Worker count';

export interface NumberHarnessProps {
  zeroIsUndefined?: boolean;
  initial?: number;
  /** marks the field as required */
  isRequired?: boolean;
  /** shows validation feedback */
  isError?: boolean;
  /** validation feedback */
  errorMessage?: string;
}

export function NumberHarness({
  zeroIsUndefined,
  initial = 2,
  ...fieldProps
}: NumberHarnessProps = {}): React.ReactElement {
  const [value, setValue] = useState<number | undefined>(initial);
  return (
    <Form>
      <NumberInput
        id="ct-num"
        label={NUMBER_HARNESS_FIELD_LABEL}
        value={value}
        min={0}
        zeroIsUndefined={zeroIsUndefined}
        {...fieldProps}
        onChange={(_e: SyntheticEvent, v: number | undefined) => setValue(v)}
      />
    </Form>
  );
}
