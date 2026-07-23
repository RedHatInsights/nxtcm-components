import React, { useState } from 'react';
import { withRosaCt } from '../../WizFields/wizFieldCtSpecHelpers';
import { RadioGroupContext } from './RadioGroupContext';
import type { RadioGroupContextState } from './RadioGroupContext';

export interface RadioGroupContextMountProps {
  initialValue?: unknown;
  readonly?: boolean;
  disabled?: boolean;
  radioGroup?: string;
}

export const RadioGroupContextMount: React.FC<RadioGroupContextMountProps> = ({
  initialValue,
  readonly = false,
  disabled = false,
  radioGroup = 'test-radio-group',
}) => {
  const [value, setValue] = useState(initialValue);

  const contextValue: RadioGroupContextState = {
    value,
    setValue,
    readonly,
    disabled,
    radioGroup,
  };

  return withRosaCt(
    <RadioGroupContext.Provider value={contextValue}>
      <div>
        <div data-testid="context-value">{String(value ?? 'none')}</div>
        <div data-testid="context-readonly">{String(readonly)}</div>
        <div data-testid="context-disabled">{String(disabled)}</div>
        <div data-testid="context-radioGroup">{radioGroup}</div>
        <button onClick={() => setValue?.('new-value')} data-testid="change-value-button">
          Change Value
        </button>
      </div>
    </RadioGroupContext.Provider>
  );
};
