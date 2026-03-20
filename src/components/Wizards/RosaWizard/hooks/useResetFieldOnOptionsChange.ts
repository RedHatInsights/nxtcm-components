import get from 'get-value';
import set from 'set-value';
import React from 'react';
import { useItem } from '../../../../../packages/react-form-wizard/src/contexts/ItemContext';
import { useData } from '../../../../../packages/react-form-wizard/src/contexts/DataContext';
import { useSetStepShowValidation } from '../../../../../packages/react-form-wizard/src/contexts/StepShowValidationProvider';

type OptionWithValue = { value: string };

export function useResetFieldOnOptionsChange(
  path: string,
  options: OptionWithValue[],
  stepId?: string
) {
  const item = useItem();
  const { update } = useData();
  const setStepShowValidation = useSetStepShowValidation();

  React.useEffect(() => {
    const currentValue = get(item, path);
    if (currentValue && options.length > 0) {
      const isStillValid = options.some((o) => o.value === currentValue);
      if (!isStillValid) {
        set(item, path, undefined, { preservePaths: false });
        if (stepId) setStepShowValidation(stepId, true);
        update();
      }
    }
  }, [options, item, path, setStepShowValidation, stepId, update]);
}
