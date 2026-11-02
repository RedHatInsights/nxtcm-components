import React, { type SyntheticEvent, useState } from 'react';

import { Form } from '@patternfly/react-core/dist/dynamic/components/Form';

import { NumberInput, type NumberInputProps } from './NumberInput';

const NUMBER_HARNESS_FIELD_LABEL = 'Worker count';

export interface NumberHarnessProps extends Pick<
  NumberInputProps,
  'zeroIsUndefined' | 'helperText' | 'errorMessage' | 'isError' | 'inputAriaLabel' | 'inputProps'
> {
  initial?: number;
  /** marks the field as required */
  isRequired?: boolean;
  additionalDescription?: string;
}

export function NumberHarness({
  initial = 2,
  additionalDescription,
  ...props
}: NumberHarnessProps = {}): React.ReactElement {
  const [value, setValue] = useState<number | undefined>(initial);
  return (
    <Form>
      <NumberInput
        {...props}
        id="ct-num"
        label={NUMBER_HARNESS_FIELD_LABEL}
        value={value}
        min={0}
        onChange={(_e: SyntheticEvent, v: number | undefined) => setValue(v)}
      />
      {additionalDescription && <p id="ct-num-additional-description">{additionalDescription}</p>}
    </Form>
  );
}
